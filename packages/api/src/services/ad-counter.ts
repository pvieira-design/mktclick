import db from "@marketingclickcannabis/db";

/**
 * Obtem o proximo AD number de forma atomica.
 * Usa UPDATE ... SET currentValue = currentValue + 1 RETURNING currentValue
 * para prevenir race conditions.
 *
 * DEVE ser chamado dentro de uma transacao Prisma ($transaction).
 */
export async function getNextAdNumber(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]
): Promise<number> {
  // Prisma nao suporta RETURNING diretamente, entao usamos $executeRawUnsafe + findFirst
  await tx.$executeRawUnsafe(
    `UPDATE ad_counter SET "currentValue" = "currentValue" + 1, "updatedAt" = NOW()`
  );

  const counter = await tx.adCounter.findFirstOrThrow();
  return counter.currentValue;
}

/**
 * Atribui AD numbers a todos os deliverables de um video.
 * Chamado na sub-etapa 6A (Aprovacao Final).
 *
 * @param tx - Transacao Prisma
 * @param videoId - ID do video
 * @returns Array de { deliverableId, adNumber }
 */
export async function assignAdNumbers(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  videoId: string
): Promise<Array<{ deliverableId: string; adNumber: number }>> {
  // Buscar deliverables sem AD number, ordenados por hookNumber
  const deliverables = await tx.adDeliverable.findMany({
    where: { videoId, adNumber: null },
    orderBy: { hookNumber: "asc" },
  });

  const results: Array<{ deliverableId: string; adNumber: number }> = [];

  for (const deliverable of deliverables) {
    const adNumber = await getNextAdNumber(tx);

    await tx.adDeliverable.update({
      where: { id: deliverable.id },
      data: { adNumber },
    });

    results.push({ deliverableId: deliverable.id, adNumber });
  }

  return results;
}
