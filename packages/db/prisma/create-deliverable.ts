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
  const projectId = process.argv[2] || "cml5flljn0000osvyuelxzm35";
  const fileId = process.argv[3] || "cml5fifx80005yvvyiek61oz0";

  const video = await prisma.adVideo.findFirst({
    where: { projectId },
    select: { id: true, nomeDescritivo: true },
  });
  console.log("Video:", JSON.stringify(video));

  if (!video) {
    console.error("No video found for project:", projectId);
    process.exit(1);
  }

  const file = await prisma.file.findFirst({
    where: { id: fileId },
    select: { id: true, name: true },
  });
  console.log("File:", JSON.stringify(file));

  if (!file) {
    console.error("No file found with id:", fileId);
    process.exit(1);
  }

  const deliverable = await prisma.adDeliverable.create({
    data: {
      videoId: video.id,
      hookNumber: 1,
      fileId: file.id,
      tempo: "T30S",
      tamanho: "S9X16",
      mostraProduto: false,
      isPost: false,
      versionNumber: 1,
    },
  });
  console.log("Created deliverable:", JSON.stringify(deliverable, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
