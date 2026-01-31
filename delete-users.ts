import { config } from "dotenv";
config({ path: "./apps/web/.env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./packages/db/prisma/generated/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function deleteUsers() {
  const usersToKeep = await db.user.findMany({
    where: {
      OR: [
        { email: { contains: "sfernandes" } },
        { email: { contains: "pvieira" } },
      ],
    },
    select: { id: true, email: true, name: true },
  });

  console.log("Usuários que serão MANTIDOS:");
  usersToKeep.forEach((u) => console.log(`  - ${u.email} (${u.name})`));

  const usersToDelete = await db.user.findMany({
    where: {
      AND: [
        { email: { not: { contains: "sfernandes" } } },
        { email: { not: { contains: "pvieira" } } },
      ],
    },
    select: { id: true, email: true, name: true },
  });

  console.log("\nUsuários que serão DELETADOS:");
  usersToDelete.forEach((u) => console.log(`  - ${u.email} (${u.name})`));

  if (usersToDelete.length === 0) {
    console.log("\nNenhum usuário para deletar.");
    return;
  }

  const deleteResult = await db.user.deleteMany({
    where: {
      AND: [
        { email: { not: { contains: "sfernandes" } } },
        { email: { not: { contains: "pvieira" } } },
      ],
    },
  });

  console.log(`\n${deleteResult.count} usuário(s) deletado(s) com sucesso.`);
}

deleteUsers()
  .catch(console.error)
  .finally(() => db.$disconnect());
