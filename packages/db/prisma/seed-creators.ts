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
  throw new Error("DATABASE_URL environment variable is required.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding creators and test file...\n");

  // Find superadmin user
  const superadmin = await prisma.user.findFirst({
    where: { email: "superadmin@clickcannabis.com" },
  });

  if (!superadmin) {
    throw new Error("superadmin@clickcannabis.com not found. Run main seed first.");
  }

  // Create creators
  const creatorsData = [
    { name: "Leo do Taxi", type: "UGC_CREATOR" as const, code: "LEOTX" },
    { name: "Pedro Machado", type: "UGC_CREATOR" as const, code: "PEDROM" },
    { name: "Dr. Joao", type: "EMBAIXADOR" as const, code: "DRJOAO" },
    { name: "Bruna Wright", type: "INFLUENCIADOR" as const, code: "BRUNAWT" },
    { name: "Rachel", type: "ATOR_MODELO" as const, code: "RACHEL" },
  ];

  for (const c of creatorsData) {
    const existing = await prisma.creator.findFirst({ where: { name: c.name } });
    if (existing) {
      console.log(`  Creator "${c.name}" already exists (${existing.id})`);
      continue;
    }
    const created = await prisma.creator.create({
      data: {
        name: c.name,
        type: c.type,
        responsibleId: superadmin.id,
        code: c.code,
        isActive: true,
      },
    });
    console.log(`  Created creator "${c.name}" (${created.id})`);
  }

  // Create a dummy file for deliverable testing
  const existingFile = await prisma.file.findFirst({
    where: { name: "test-video-placeholder" },
  });

  if (!existingFile) {
    const file = await prisma.file.create({
      data: {
        name: "test-video-placeholder",
        originalName: "test-video.mp4",
        url: "https://example.com/test-video.mp4",
        pathname: "test/test-video.mp4",
        size: 1024000,
        mimeType: "video/mp4",
        uploadedById: superadmin.id,
      },
    });
    console.log(`  Created placeholder file (${file.id})`);
  } else {
    console.log(`  Placeholder file already exists (${existingFile.id})`);
  }

  console.log("\nDone!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
