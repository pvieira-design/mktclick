import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../../../apps/web/.env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required. Make sure apps/web/.env exists.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Seed ContentTypes
    const contentTypes = await prisma.$transaction([
      prisma.contentType.upsert({
        where: { slug: "video-ugc" },
        update: {},
        create: {
          name: "Vídeo UGC",
          slug: "video-ugc",
          icon: "Video",
          color: "#3B82F6",
          isActive: true,
        },
      }),
      prisma.contentType.upsert({
        where: { slug: "video-institucional" },
        update: {},
        create: {
          name: "Vídeo Institucional",
          slug: "video-institucional",
          icon: "VideoCamera",
          color: "#8B5CF6",
          isActive: true,
        },
      }),
      prisma.contentType.upsert({
        where: { slug: "carrossel" },
        update: {},
        create: {
          name: "Carrossel",
          slug: "carrossel",
          icon: "Images",
          color: "#10B981",
          isActive: true,
        },
      }),
      prisma.contentType.upsert({
        where: { slug: "post-unico" },
        update: {},
        create: {
          name: "Post Único",
          slug: "post-unico",
          icon: "Image",
          color: "#F59E0B",
          isActive: true,
        },
      }),
      prisma.contentType.upsert({
        where: { slug: "stories" },
        update: {},
        create: {
          name: "Stories",
          slug: "stories",
          icon: "Smartphone",
          color: "#EC4899",
          isActive: true,
        },
      }),
      prisma.contentType.upsert({
        where: { slug: "reels" },
        update: {},
        create: {
          name: "Reels",
          slug: "reels",
          icon: "Play",
          color: "#EF4444",
          isActive: true,
        },
      }),
    ]);
    console.log(`✓ Seeded ${contentTypes.length} ContentTypes`);

    // Seed Origins
    const origins = await prisma.$transaction([
      prisma.origin.upsert({
        where: { slug: "oslo" },
        update: {},
        create: {
          name: "Oslo",
          slug: "oslo",
          description: "Agência externa de produção audiovisual",
          isActive: true,
        },
      }),
      prisma.origin.upsert({
        where: { slug: "interno" },
        update: {},
        create: {
          name: "Interno",
          slug: "interno",
          description: "Equipe interna da Click Cannabis",
          isActive: true,
        },
      }),
      prisma.origin.upsert({
        where: { slug: "influencer" },
        update: {},
        create: {
          name: "Influencer",
          slug: "influencer",
          description: "Criador de conteúdo externo (UGC)",
          isActive: true,
        },
      }),
      prisma.origin.upsert({
        where: { slug: "freelancer" },
        update: {},
        create: {
          name: "Freelancer",
          slug: "freelancer",
          description: "Profissional avulso contratado",
          isActive: true,
        },
      }),
    ]);
    console.log(`✓ Seeded ${origins.length} Origins`);

    // Seed Areas
    const areas = await prisma.$transaction([
      prisma.area.upsert({
        where: { slug: "content-manager" },
        update: {},
        create: {
          name: "Content Manager",
          slug: "content-manager",
          description: "Coordenação geral de conteúdo",
          isActive: true,
        },
      }),
      prisma.area.upsert({
        where: { slug: "design" },
        update: {},
        create: {
          name: "Design",
          slug: "design",
          description: "Criação visual e branding",
          isActive: true,
        },
      }),
      prisma.area.upsert({
        where: { slug: "social-media" },
        update: {},
        create: {
          name: "Social Media",
          slug: "social-media",
          description: "Gestão de redes sociais",
          isActive: true,
        },
      }),
      prisma.area.upsert({
        where: { slug: "trafego" },
        update: {},
        create: {
          name: "Tráfego",
          slug: "trafego",
          description: "Gestão de Ads e performance",
          isActive: true,
        },
      }),
      prisma.area.upsert({
        where: { slug: "oslo" },
        update: {},
        create: {
          name: "Oslo",
          slug: "oslo",
          description: "Agência externa de produção",
          isActive: true,
        },
      }),
      prisma.area.upsert({
        where: { slug: "ugc-manager" },
        update: {},
        create: {
          name: "UGC Manager",
          slug: "ugc-manager",
          description: "Gestão de creators e influencers",
          isActive: true,
        },
      }),
    ]);
    console.log(`✓ Seeded ${areas.length} Areas`);

    console.log("\n✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
