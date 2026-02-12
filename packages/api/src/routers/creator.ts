import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db, { CreatorType, queryClickDb } from "@marketingclickcannabis/db";

import { adminProcedure, protectedProcedure, router } from "../index";

export const creatorRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.nativeEnum(CreatorType).optional(),
        responsibleId: z.string().optional(),
        isActive: z.boolean().optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(200).default(20),
      })
    )
    .query(async ({ input }) => {
      const { search, type, responsibleId, isActive, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { instagram: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(type && { type }),
        ...(responsibleId && { responsibleId }),
        ...(isActive !== undefined && { isActive }),
      };

      const [items, total] = await Promise.all([
        db.creator.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            email: true,
            phone: true,
            instagram: true,
            type: true,
            isActive: true,
            contractStartDate: true,
            contractEndDate: true,
            responsibleId: true,
            responsible: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        }),
        db.creator.count({ where }),
      ]);

      return {
        items,
        total,
        hasMore: skip + items.length < total,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const creator = await db.creator.findUnique({
        where: { id: input.id },
        include: {
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Creator not found",
        });
      }

      return creator;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        imageUrl: z.string().url().optional().or(z.literal("")),
        imageFileId: z.string().cuid().optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        instagram: z.string().optional(),
        type: z.nativeEnum(CreatorType),
        responsibleId: z.string().min(1),
        contractStartDate: z.coerce.date().optional(),
        contractEndDate: z.coerce.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const responsible = await db.user.findUnique({
        where: { id: input.responsibleId },
      });

      if (!responsible) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Responsible user not found",
        });
      }

      if (input.email) {
        const existingEmail = await db.creator.findFirst({
          where: { email: input.email },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use by another creator",
          });
        }
      }

      const creator = await db.creator.create({
        data: {
          name: input.name,
          imageUrl: input.imageUrl || null,
          email: input.email || null,
          phone: input.phone,
          instagram: input.instagram,
          type: input.type,
          responsibleId: input.responsibleId,
          contractStartDate: input.contractStartDate,
          contractEndDate: input.contractEndDate,
          notes: input.notes,
          isActive: true,
        },
        include: {
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (input.imageFileId) {
        await db.file.update({
          where: { id: input.imageFileId },
          data: { creatorId: creator.id },
        });
      }

      return creator;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(2).max(100).optional(),
        imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
        email: z.string().email().optional().or(z.literal("")).nullable(),
        phone: z.string().optional().nullable(),
        instagram: z.string().optional().nullable(),
        type: z.nativeEnum(CreatorType).optional(),
        responsibleId: z.string().min(1).optional(),
        contractStartDate: z.coerce.date().optional().nullable(),
        contractEndDate: z.coerce.date().optional().nullable(),
        notes: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, imageUrl, email, ...restData } = input;

      const creator = await db.creator.findUnique({ where: { id } });
      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Creator not found",
        });
      }

      if (restData.responsibleId) {
        const responsible = await db.user.findUnique({
          where: { id: restData.responsibleId },
        });

        if (!responsible) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Responsible user not found",
          });
        }
      }

      const normalizedEmail = email === "" ? null : email;
      if (normalizedEmail && normalizedEmail !== creator.email) {
        const existingEmail = await db.creator.findFirst({
          where: { email: normalizedEmail, id: { not: id } },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use by another creator",
          });
        }
      }

      const updateData = {
        ...restData,
        ...(imageUrl !== undefined && { imageUrl: imageUrl === "" ? null : imageUrl }),
        ...(email !== undefined && { email: normalizedEmail }),
      };

      const updated = await db.creator.update({
        where: { id },
        data: updateData,
        include: {
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const creator = await db.creator.findUnique({
        where: { id: input.id },
      });

      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Creator not found",
        });
      }

      const updated = await db.creator.update({
        where: { id: input.id },
        data: { isActive: false },
      });

      return updated;
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const creator = await db.creator.findUnique({
        where: { id: input.id },
      });

      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Creator not found",
        });
      }

      const updated = await db.creator.update({
        where: { id: input.id },
        data: { isActive: !creator.isActive },
      });

      return updated;
    }),

  getBatchLeadStages: protectedProcedure
    .input(z.object({ phones: z.array(z.string()).min(1).max(200) }))
    .query(async ({ input }) => {
      const normalized = input.phones.map((p) => {
        let clean = p.replace(/\D/g, "");
        if (!clean.startsWith("55")) clean = "55" + clean;
        return clean;
      });

      const query = `
        SELECT
          u.phone AS telefone,
          COALESCE((
            SELECT TRUE FROM deliveries d
            WHERE d.user_id = u.id AND d.status = 'Delivered' LIMIT 1
          ), FALSE) AS produto_entregue,
          COALESCE((
            SELECT TRUE FROM deliveries d
            WHERE d.user_id = u.id AND d.status != 'Draft'
              AND d.tracking_code IS NOT NULL AND d.tracking_code != '0000' LIMIT 1
          ), FALSE) AS ja_enviou_rastreio,
          COALESCE((
            SELECT TRUE FROM files f
            WHERE f.user_id = u.id
              AND f.type IN ('identidade', 'comprovante de residência',
                             'comprante de residência', 'comprovante situacao cadastral') LIMIT 1
          ), FALSE) AS ja_enviou_documentos,
          COALESCE((
            SELECT TRUE FROM files f
            WHERE f.user_id = u.id AND f.type = 'anvisa' LIMIT 1
          ), FALSE) AS ja_enviou_anvisa,
          COALESCE((
            SELECT TRUE FROM product_budgets pb
            WHERE pb.user_id = u.id AND pb.status = 'confirmed' LIMIT 1
          ), FALSE) AS ja_comprou_orcamento,
          COALESCE((
            SELECT TRUE FROM consultings c
            WHERE c.user_id = u.id AND c.completed = TRUE
              AND c.status NOT IN ('preconsulting') LIMIT 1
          ), FALSE) AS ja_fez_consulta,
          TRUE AS usuario_cadastrado
        FROM users u
        WHERE u.phone = ANY($1::text[])
      `;

      try {
        const rows = await queryClickDb(query, [normalized]);
        const stageMap: Record<string, string> = {};

        for (const row of rows) {
          const phone = row.telefone as string;
          let stage = "entrada";
          if (row.ja_fez_consulta) stage = "primeira_consulta";
          if (row.ja_comprou_orcamento) stage = "pagamento_orcamento";
          if (row.ja_enviou_anvisa) stage = "envio_anvisa";
          if (row.ja_enviou_documentos) stage = "envio_documentos";
          if (row.ja_enviou_rastreio) stage = "envio_rastreio";
          if (row.produto_entregue) stage = "produto_entregue";
          stageMap[phone] = stage;
        }

        return stageMap;
      } catch {
        return {} as Record<string, string>;
      }
    }),

  getLeadData: protectedProcedure
    .input(z.object({ phone: z.string().min(1) }))
    .query(async ({ input }) => {
      let phone = input.phone.replace(/\D/g, "");

      if (!phone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Telefone inválido",
        });
      }

      // Garante prefixo 55 (Brasil)
      if (!phone.startsWith("55")) {
        phone = "55" + phone;
      }

      const query = `
        SELECT
          u.first_name AS nome,
          u.id AS user_id,
          n.id AS negotiation_id,
          u.phone AS telefone,
          u.email,
          u.data->>'linkChat' AS link_guru,
          CONCAT('https://clickagendamento.com/pipeline/deal/', n.id, '#overview') AS link_crm,
          n.funnel_stage_id,
          fs.name AS etapa_funil_atual,
          n.pipeline_id,
          pip.name AS nome_pipeline,
          u.created_at AT TIME ZONE 'America/Sao_Paulo' AS data_entrada_usuario,
          TRUE AS usuario_cadastrado,
          (SELECT c.start::timestamptz AT TIME ZONE 'America/Sao_Paulo'
            FROM consultings c
            WHERE c.user_id = u.id AND c.completed = TRUE
              AND c.status NOT IN ('preconsulting')
            ORDER BY c.start::timestamptz ASC LIMIT 1
          ) AS data_primeira_consulta,
          COALESCE((
            SELECT TRUE FROM consultings c
            WHERE c.user_id = u.id AND c.completed = TRUE
              AND c.status NOT IN ('preconsulting') LIMIT 1
          ), FALSE) AS ja_fez_consulta,
          (SELECT pb.payment_at AT TIME ZONE 'America/Sao_Paulo'
            FROM product_budgets pb
            WHERE pb.user_id = u.id AND pb.status = 'confirmed'
            ORDER BY pb.payment_at ASC LIMIT 1
          ) AS data_pagamento_orcamento,
          COALESCE((
            SELECT TRUE FROM product_budgets pb
            WHERE pb.user_id = u.id AND pb.status = 'confirmed' LIMIT 1
          ), FALSE) AS ja_comprou_orcamento,
          (SELECT f.created_at AT TIME ZONE 'America/Sao_Paulo'
            FROM files f
            WHERE f.user_id = u.id AND f.type = 'anvisa'
            ORDER BY f.created_at ASC LIMIT 1
          ) AS data_envio_anvisa,
          COALESCE((
            SELECT TRUE FROM files f
            WHERE f.user_id = u.id AND f.type = 'anvisa' LIMIT 1
          ), FALSE) AS ja_enviou_anvisa,
          (SELECT MAX(f.created_at) AT TIME ZONE 'America/Sao_Paulo'
            FROM files f
            WHERE f.user_id = u.id
              AND f.type IN ('identidade', 'comprovante de residência',
                             'comprante de residência', 'comprovante situacao cadastral')
          ) AS data_envio_documentos,
          COALESCE((
            SELECT TRUE FROM files f
            WHERE f.user_id = u.id
              AND f.type IN ('identidade', 'comprovante de residência',
                             'comprante de residência', 'comprovante situacao cadastral') LIMIT 1
          ), FALSE) AS ja_enviou_documentos,
          (SELECT d.created_at AT TIME ZONE 'America/Sao_Paulo'
            FROM deliveries d
            WHERE d.user_id = u.id AND d.status != 'Draft'
              AND d.tracking_code IS NOT NULL AND d.tracking_code != '0000'
            ORDER BY d.created_at ASC LIMIT 1
          ) AS data_envio_rastreio,
          COALESCE((
            SELECT TRUE FROM deliveries d
            WHERE d.user_id = u.id AND d.status != 'Draft'
              AND d.tracking_code IS NOT NULL AND d.tracking_code != '0000' LIMIT 1
          ), FALSE) AS ja_enviou_rastreio,
          (SELECT d.event_date AT TIME ZONE 'America/Sao_Paulo'
            FROM deliveries d
            WHERE d.user_id = u.id AND d.status = 'Delivered'
              AND d.event_date IS NOT NULL
            ORDER BY d.event_date DESC LIMIT 1
          ) AS data_chegada_produto,
          COALESCE((
            SELECT TRUE FROM deliveries d
            WHERE d.user_id = u.id AND d.status = 'Delivered' LIMIT 1
          ), FALSE) AS produto_entregue,
          (SELECT STRING_AGG(DISTINCT p.title, ', ')
            FROM consultings c
            JOIN medical_prescriptions mp ON mp.consulting_id = c.id
            JOIN product_medical_prescriptions pmp ON pmp.medical_prescription_id = mp.id
            JOIN products p ON p.id = pmp.product_id
            WHERE c.user_id = u.id AND c.completed = TRUE
              AND c.prescription_status = 'required'
              AND c.status NOT IN ('preconsulting')
              AND c.id = (
                SELECT c2.id FROM consultings c2
                WHERE c2.user_id = u.id AND c2.completed = TRUE
                  AND c2.status NOT IN ('preconsulting')
                ORDER BY c2.start::timestamptz ASC LIMIT 1
              )
          ) AS produtos_prescritos_primeira_consulta,
          (SELECT f.url FROM consultings c
            JOIN medical_prescriptions mp ON mp.consulting_id = c.id
            JOIN files f ON f.id = mp.file_id
            WHERE c.user_id = u.id AND c.prescription_status = 'required'
              AND c.status NOT IN ('preconsulting')
            ORDER BY mp.created_at DESC LIMIT 1
          ) AS link_receita,
          (SELECT f.url FROM files f
            WHERE f.user_id = u.id AND f.type = 'anvisa'
            ORDER BY f.created_at DESC LIMIT 1
          ) AS link_anvisa,
          (SELECT f.url FROM files f
            WHERE f.user_id = u.id AND f.type = 'identidade'
            ORDER BY f.created_at DESC LIMIT 1
          ) AS link_identidade,
          (SELECT f.url FROM files f
            WHERE f.user_id = u.id
              AND f.type IN ('comprovante de residência', 'comprante de residência')
            ORDER BY f.created_at DESC LIMIT 1
          ) AS link_comp_residencia
        FROM users u
        LEFT JOIN negotiations n ON n.user_id = u.id
        LEFT JOIN funnel_stages fs ON fs.id = n.funnel_stage_id
        LEFT JOIN pipelines pip ON pip.id = n.pipeline_id
        WHERE u.phone = $1
        LIMIT 5
      `;

      try {
        const rows = await queryClickDb(query, [phone]);
        return rows;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar dados do lead no banco da Click",
        });
      }
    }),
});
