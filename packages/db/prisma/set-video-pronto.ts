import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../../../apps/web/.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const projectId = process.argv[2];
  const status = process.argv[3] || "PRONTO";

  if (!projectId) {
    console.error("Usage: tsx set-video-pronto.ts <projectId> [status]");
    process.exit(1);
  }

  const result = await prisma.adVideo.updateMany({
    where: { projectId },
    data: { phaseStatus: status as any },
  });

  console.log(`Updated ${result.count} videos to ${status}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
