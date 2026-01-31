import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db, { queryAdsDb } from "@marketingclickcannabis/db";
import { protectedProcedure, router } from "../index";

// Account ID to label mapping
const ACCOUNT_LABELS: Record<number, string> = {
  1: "Conta Principal",
  2: "Impulsionamento",
  3: "BM Anunciante",
};

const listInputSchema = z.object({
  dateFrom: z.string(),
  dateTo: z.string(),
  accountId: z.number().optional(),
  campaignName: z.string().optional(),
  adsetName: z.string().optional(),
  adNameSearch: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(24),
});

interface AdRow {
  ad_id: string;
  ad_name: string;
  campaign_name: string;
  adset_name: string;
  account_id: string;
  spend: string;
  impressions: number;
  link_clicks: number;
  registrations: number;
  deals: number;
  consulting_payments: number;
  product_payments: number;
  consulting_revenue: string;
  product_revenue: string;
  revenue: string;
  first_date: string;
  last_date: string;
}

interface CountRow {
  count: string;
}

function buildWhereClause(input: z.infer<typeof listInputSchema>) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  conditions.push(`f.date BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
  params.push(input.dateFrom, input.dateTo);
  paramIndex += 2;

  if (input.accountId !== undefined) {
    conditions.push(`f.account_id = $${paramIndex}`);
    params.push(input.accountId);
    paramIndex += 1;
  }

  if (input.campaignName) {
    conditions.push(`f.campaign_name ILIKE $${paramIndex}`);
    params.push(`%${input.campaignName}%`);
    paramIndex += 1;
  }

  if (input.adsetName) {
    conditions.push(`f.adset_name ILIKE $${paramIndex}`);
    params.push(`%${input.adsetName}%`);
    paramIndex += 1;
  }

  if (input.adNameSearch) {
    conditions.push(`f.ad_name ILIKE $${paramIndex}`);
    params.push(`%${input.adNameSearch}%`);
    paramIndex += 1;
  }

  return {
    whereClause: conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "",
    params,
    nextParamIndex: paramIndex,
  };
}

const filterOptionsInputSchema = z.object({
  accountId: z.number().int().optional(),
  campaignName: z.string().optional(),
});

const getByIdInputSchema = z.object({
  adId: z.string(),
  campaignName: z.string(),
  adsetName: z.string(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

/**
 * Extracts the AD prefix from an ad name.
 * Handles all naming formats:
 *   - Legacy: "AD 91 - [VID] Dr. Joao..."
 *   - Transition: "AD 419 | VID | OVRL..."
 *   - Modern: "AD598_LEAD_OSLLO..."
 *   - With bracket prefix: "[R$50] AD 460"
 *
 * Returns normalized prefix like "AD602", "AD91", etc.
 */
function extractAdPrefix(adName: string): string | null {
  const match = adName.match(/AD\s*(\d+)/i);
  if (!match || !match[1]) return null;
  return `AD${match[1]}`;
}

/**
 * Builds the PostgreSQL regex pattern for matching ad names by prefix number.
 * Ensures AD6 does NOT match AD60 (requires non-digit after number or end of string).
 * Handles optional bracket prefix like [R$50].
 *
 * Pattern: ^(\[.*\]\s*)?AD\s*{N}[^0-9]|^(\[.*\]\s*)?AD\s*{N}$
 */
function buildAdPrefixRegex(prefixNumber: string): string {
  return `^(\\[.*\\]\\s*)?AD\\s*${prefixNumber}[^0-9]|^(\\[.*\\]\\s*)?AD\\s*${prefixNumber}$`;
}

export const adsRouter = router({
  filterOptions: protectedProcedure
    .input(filterOptionsInputSchema)
    .query(async ({ input }) => {
      const { accountId, campaignName } = input;

      try {
        // Execute 3 queries in parallel for performance
        const [accountsResult, campaignsResult, adsetsResult, dateRangeResult] =
          await Promise.all([
            // Query 1: Get distinct account IDs
            queryAdsDb(
              "SELECT DISTINCT account_id FROM facebook_ads_insights ORDER BY account_id"
            ),

            // Query 2: Get distinct campaign names filtered by accountId if provided
            campaignName
              ? Promise.resolve([]) // If campaignName is provided, we don't need to fetch campaigns
              : queryAdsDb(
                  accountId
                    ? "SELECT DISTINCT campaign_name FROM facebook_ads_insights WHERE account_id = $1 ORDER BY campaign_name"
                    : "SELECT DISTINCT campaign_name FROM facebook_ads_insights ORDER BY campaign_name",
                  accountId ? [accountId] : undefined
                ),

            // Query 3: Get distinct adset names filtered by accountId and campaignName if provided
            queryAdsDb(
              accountId && campaignName
                ? "SELECT DISTINCT adset_name FROM facebook_ads_insights WHERE account_id = $1 AND campaign_name = $2 ORDER BY adset_name"
                : accountId
                  ? "SELECT DISTINCT adset_name FROM facebook_ads_insights WHERE account_id = $1 ORDER BY adset_name"
                  : "SELECT DISTINCT adset_name FROM facebook_ads_insights ORDER BY adset_name",
              accountId && campaignName
                ? [accountId, campaignName]
                : accountId
                  ? [accountId]
                  : undefined
            ),

            // Query 4: Get date range (min and max dates)
            queryAdsDb(
              "SELECT MIN(date) as min_date, MAX(date) as max_date FROM facebook_ads_insights"
            ),
          ]);

        // Map account IDs to labels
        const accounts = accountsResult
          .map((row: any) => ({
            id: row.account_id,
            label: ACCOUNT_LABELS[row.account_id] || `Conta ${row.account_id}`,
          }))
          .sort((a, b) => a.id - b.id);

        // Extract campaign names
        const campaigns = campaignsResult.map((row: any) => row.campaign_name);

        // Extract adset names
        const adsets = adsetsResult.map((row: any) => row.adset_name);

        // Extract date range
        const dateRange = dateRangeResult[0]
          ? {
              minDate: dateRangeResult[0].min_date,
              maxDate: dateRangeResult[0].max_date,
            }
          : {
              minDate: null,
              maxDate: null,
            };

        return {
          accounts,
          campaigns,
          adsets,
          dateRange,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Nao foi possivel carregar opcoes de filtro",
        });
      }
    }),

  getById: protectedProcedure
    .input(getByIdInputSchema)
    .query(async ({ input }) => {
      const { adId, campaignName, adsetName, dateFrom, dateTo } = input;

      // Use provided dates or default to a reasonable range
      const from = dateFrom || "2024-01-01";
      const to = dateTo || new Date().toISOString().split("T")[0];

      const query = `
        SELECT 
          f.ad_id,
          f.ad_name,
          f.campaign_name,
          f.adset_name,
          f.account_id,
          SUM(f.spend)::numeric as spend,
          SUM(f.impressions)::int as impressions,
          SUM(f.link_clicks)::int as link_clicks,
          SUM(f.landing_page_views)::int as landing_page_views,
          SUM(f.video_view)::int as video_view,
          SUM(f.post_engagement)::int as post_engagement,
          SUM(f.page_engagement)::int as page_engagement,
          SUM(f.post_reaction)::int as post_reaction,
          SUM(f."comment")::int as comment,
          SUM(f."like")::int as like,
          SUM(f."post")::int as post,
          SUM(f.onsite_conversion_post_save)::int as onsite_conversion_post_save,
          SUM(f.complete_registration)::int as registrations,
          MIN(f.date) as first_date,
          MAX(f.date) as last_date,
          COUNT(DISTINCT f.date)::int as dias_ativos,
          COALESCE(SUM(cd.deals), 0)::int as deals,
          COALESCE(SUM(cd.consulting_count), 0)::int as consulting_count,
          COALESCE(SUM(cd.product_count), 0)::int as product_count,
          COALESCE(SUM(cd.consulting_revenue), 0)::numeric as consulting_revenue,
          COALESCE(SUM(cd.product_revenue), 0)::numeric as product_revenue,
          COALESCE(SUM(cd.revenue), 0)::numeric as revenue
        FROM facebook_ads_insights f
        LEFT JOIN LATERAL (
          SELECT 
            SUM(CASE WHEN elem->>'event_name' = 'CP_Click_deal' THEN (elem->>'value')::int ELSE 0 END) as deals,
            SUM(CASE WHEN elem->>'event_name' = 'CP_Click_payment_consulting' THEN (elem->>'value')::int ELSE 0 END) as consulting_count,
            SUM(CASE WHEN elem->>'event_name' = 'CP_Click_payment_product' THEN (elem->>'value')::int ELSE 0 END) as product_count,
            SUM(CASE WHEN elem->>'event_name' = 'CP_Click_payment_consulting' THEN COALESCE((elem->>'monetary_value')::numeric, 0) ELSE 0 END) as consulting_revenue,
            SUM(CASE WHEN elem->>'event_name' = 'CP_Click_payment_product' THEN COALESCE((elem->>'monetary_value')::numeric, 0) ELSE 0 END) as product_revenue,
            SUM(COALESCE((elem->>'monetary_value')::numeric, 0)) as revenue
          FROM jsonb_array_elements(f.custom_conversion_data) as elem
        ) cd ON f.custom_conversion_data IS NOT NULL
        WHERE f.ad_id = $1 
          AND f.campaign_name = $2 
          AND f.adset_name = $3
          AND f.date BETWEEN $4 AND $5
        GROUP BY f.ad_id, f.ad_name, f.campaign_name, f.adset_name, f.account_id
      `;

      try {
        const rows = await queryAdsDb(query, [adId, campaignName, adsetName, from, to]) as any[];

        if (rows.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Anúncio não encontrado",
          });
        }

        const row = rows[0];

        // Fetch linked media
        const media = await db.adCreativeMedia.findUnique({
          where: { adId },
          include: {
            file: {
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                mimeType: true,
                name: true,
              },
            },
          },
        });

        // Parse numeric values
        const spend = parseFloat(row.spend) || 0;
        const revenue = parseFloat(row.revenue) || 0;
        const registrations = Number(row.registrations) || 0;
        const impressions = Number(row.impressions) || 0;
        const linkClicks = Number(row.link_clicks) || 0;

        // Calculate derived metrics
        const cpc = linkClicks > 0 ? spend / linkClicks : 0;
        const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
        const ctr = impressions > 0 ? (linkClicks / impressions) * 100 : 0;
        const cpl = registrations > 0 ? spend / registrations : 0;
        const roas = spend > 0 ? revenue / spend : 0;

        return {
          adId: row.ad_id,
          adName: row.ad_name,
          campaignName: row.campaign_name,
          adsetName: row.adset_name,
          accountId: row.account_id,
          // Metrics
          spend,
          impressions,
          linkClicks,
          landingPageViews: Number(row.landing_page_views) || 0,
          videoView: Number(row.video_view) || 0,
          postEngagement: Number(row.post_engagement) || 0,
          pageEngagement: Number(row.page_engagement) || 0,
          postReaction: Number(row.post_reaction) || 0,
          comment: Number(row.comment) || 0,
          like: Number(row.like) || 0,
          post: Number(row.post) || 0,
          onsiteConversionPostSave: Number(row.onsite_conversion_post_save) || 0,
          registrations,
          deals: Number(row.deals) || 0,
          consultingPayments: Number(row.consulting_count) || 0,
          productPayments: Number(row.product_count) || 0,
          consultingRevenue: parseFloat(row.consulting_revenue) || 0,
          productRevenue: parseFloat(row.product_revenue) || 0,
          revenue,
          // Dates
          firstDate: row.first_date,
          lastDate: row.last_date,
          diasAtivos: Number(row.dias_ativos) || 0,
          // Calculated metrics
          roas,
          cpl,
          cpc,
          cpm,
          ctr,
          // Media
          media: media
            ? {
                id: media.id,
                adId: media.adId,
                file: {
                  id: media.file.id,
                  url: media.file.url,
                  thumbnailUrl: media.file.thumbnailUrl,
                  mimeType: media.file.mimeType,
                  name: media.file.name,
                },
              }
            : null,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao consultar detalhes do anúncio. Verifique a conexao com o banco externo.",
          cause: error,
        });
      }
    }),

  list: protectedProcedure.input(listInputSchema).query(async ({ input }) => {
    const { page, pageSize } = input;
    const offset = (page - 1) * pageSize;

    const { whereClause, params, nextParamIndex } = buildWhereClause(input);

    const baseQuery = `
      FROM facebook_ads_insights f
      LEFT JOIN LATERAL (
        SELECT 
          SUM(CASE WHEN elem->>'event_name' = 'CP_Click_deal' THEN (elem->>'value')::int ELSE 0 END) as deals,
          SUM(CASE WHEN elem->>'event_name' = 'CP_Click_payment_consulting' THEN (elem->>'value')::int ELSE 0 END) as consulting_count,
          SUM(CASE WHEN elem->>'event_name' = 'CP_Click_payment_product' THEN (elem->>'value')::int ELSE 0 END) as product_count,
          SUM(CASE WHEN elem->>'event_name' = 'CP_Click_payment_consulting' THEN COALESCE((elem->>'monetary_value')::numeric, 0) ELSE 0 END) as consulting_revenue,
          SUM(CASE WHEN elem->>'event_name' = 'CP_Click_payment_product' THEN COALESCE((elem->>'monetary_value')::numeric, 0) ELSE 0 END) as product_revenue,
          SUM(COALESCE((elem->>'monetary_value')::numeric, 0)) as revenue
        FROM jsonb_array_elements(f.custom_conversion_data) as elem
      ) cd ON f.custom_conversion_data IS NOT NULL
      ${whereClause}
    `;

    const groupByClause = "GROUP BY f.ad_id, f.ad_name, f.campaign_name, f.adset_name, f.account_id";

    const selectQuery = `
      SELECT 
        f.ad_id, 
        COALESCE(f.ad_name, 'Sem nome') as ad_name,
        f.campaign_name, f.adset_name, f.account_id,
        SUM(f.spend)::numeric as spend,
        SUM(f.impressions)::int as impressions,
        SUM(f.link_clicks)::int as link_clicks,
        SUM(f.complete_registration)::int as registrations,
        COALESCE(SUM(cd.deals), 0)::int as deals,
        COALESCE(SUM(cd.consulting_count), 0)::int as consulting_payments,
        COALESCE(SUM(cd.product_count), 0)::int as product_payments,
        COALESCE(SUM(cd.consulting_revenue), 0)::numeric as consulting_revenue,
        COALESCE(SUM(cd.product_revenue), 0)::numeric as product_revenue,
        COALESCE(SUM(cd.revenue), 0)::numeric as revenue,
        MIN(f.date) as first_date,
        MAX(f.date) as last_date
      ${baseQuery}
      ${groupByClause}
      ORDER BY spend DESC
      LIMIT $${nextParamIndex} OFFSET $${nextParamIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as count FROM (
        SELECT f.ad_id
        ${baseQuery}
        ${groupByClause}
      ) sub
    `;

    try {
      const [rows, countRows] = await Promise.all([
        queryAdsDb(selectQuery, [...params, pageSize, offset]) as Promise<AdRow[]>,
        queryAdsDb(countQuery, params) as Promise<CountRow[]>,
      ]);

      const total = parseInt(countRows[0]?.count ?? "0", 10);
      const adIds = rows.map((r) => r.ad_id);

      const mediaRecords =
        adIds.length > 0
          ? await db.adCreativeMedia.findMany({
              where: { adId: { in: adIds } },
              include: {
                file: {
                  select: {
                    id: true,
                    url: true,
                    thumbnailUrl: true,
                    mimeType: true,
                    name: true,
                  },
                },
              },
            })
          : [];

      const mediaByAdId = new Map(
        mediaRecords.map((m) => [
          m.adId,
          {
            url: m.file.url,
            thumbnailUrl: m.file.thumbnailUrl,
            mimeType: m.file.mimeType,
            fileName: m.file.name,
          },
        ])
      );

      const items = rows.map((row) => {
        const spend = parseFloat(row.spend) || 0;
        const revenue = parseFloat(row.revenue) || 0;
        const registrations = Number(row.registrations) || 0;

        return {
          adId: row.ad_id,
          adName: row.ad_name,
          campaignName: row.campaign_name,
          adsetName: row.adset_name,
          accountId: row.account_id,
          spend,
          impressions: Number(row.impressions) || 0,
          linkClicks: Number(row.link_clicks) || 0,
          registrations,
          deals: Number(row.deals) || 0,
          consultingPayments: Number(row.consulting_payments) || 0,
          productPayments: Number(row.product_payments) || 0,
          consultingRevenue: parseFloat(row.consulting_revenue) || 0,
          productRevenue: parseFloat(row.product_revenue) || 0,
          revenue,
          firstDate: row.first_date,
          lastDate: row.last_date,
          roas: revenue > 0 && spend > 0 ? revenue / spend : 0,
          cpl: registrations > 0 && spend > 0 ? spend / registrations : 0,
          media: mediaByAdId.get(row.ad_id) ?? null,
        };
      });

      return {
        items,
        total,
        page,
        pageSize,
        hasMore: offset + items.length < total,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao consultar banco de dados de anuncios. Verifique a conexao com o banco externo.",
        cause: error,
      });
    }
  }),

  linkMedia: protectedProcedure
    .input(
      z.object({
        adId: z.string(),
        adName: z.string(),
        fileId: z.string(),
        propagate: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { adId, adName, fileId, propagate } = input;
      const userId = ctx.session.user.id;

      const adPrefix = extractAdPrefix(adName);
      if (!adPrefix) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Nao foi possivel extrair prefixo AD do nome: "${adName}"`,
        });
      }

      const prefixNumber = adPrefix.replace("AD", "");

      if (!propagate) {
        await db.adCreativeMedia.upsert({
          where: { adId },
          create: {
            adId,
            adPrefix,
            fileId,
            linkedById: userId,
          },
          update: {
            adPrefix,
            fileId,
            linkedById: userId,
          },
        });

        return { linked: 1, adPrefix };
      }

      try {
        const matchingAds = await queryAdsDb(
          "SELECT DISTINCT ad_id FROM facebook_ads_insights WHERE ad_name ~* $1",
          [buildAdPrefixRegex(prefixNumber)]
        );

        const adIds: string[] = matchingAds.map(
          (row: { ad_id: string }) => row.ad_id
        );

        if (!adIds.includes(adId)) {
          adIds.push(adId);
        }

        await db.$transaction(
          adIds.map((id: string) =>
            db.adCreativeMedia.upsert({
              where: { adId: id },
              create: {
                adId: id,
                adPrefix,
                fileId,
                linkedById: userId,
              },
              update: {
                adPrefix,
                fileId,
                linkedById: userId,
              },
            })
          )
        );

        return { linked: adIds.length, adPrefix };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Nao foi possivel propagar a media para anuncios com mesmo prefixo",
        });
      }
    }),

  getLinkedAdsCount: protectedProcedure
    .input(
      z.object({
        adName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { adName } = input;

      const adPrefix = extractAdPrefix(adName);
      if (!adPrefix) {
        return { count: 0, prefix: "" };
      }

      const prefixNumber = adPrefix.replace("AD", "");

      try {
        const result = await queryAdsDb(
          "SELECT COUNT(DISTINCT ad_id) as count FROM facebook_ads_insights WHERE ad_name ~* $1",
          [buildAdPrefixRegex(prefixNumber)]
        );

        const count = result[0]?.count ? parseInt(result[0].count, 10) : 0;
        return { count, prefix: adPrefix };
      } catch {
        return { count: 0, prefix: adPrefix };
      }
    }),

  unlinkMedia: protectedProcedure
    .input(
      z.object({
        adId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { adId } = input;

      try {
        await db.adCreativeMedia.delete({
          where: { adId },
        });
        return { success: true };
      } catch {
        return { success: true };
      }
    }),
});
