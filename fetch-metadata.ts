
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const contentTypes = await prisma.contentType.findMany();
  const origins = await prisma.origin.findMany();

  console.log('Content Types:', JSON.stringify(contentTypes, null, 2));
  console.log('Origins:', JSON.stringify(origins, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
