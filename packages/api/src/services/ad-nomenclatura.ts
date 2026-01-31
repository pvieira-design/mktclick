import db from "@marketingclickcannabis/db";

interface NomenclaturaInput {
  adNumber: number;
  approvalDate: Date;
  originCode: string;       // Ex: "OSLLO"
  creatorCode: string;      // Ex: "BRUNAWT", "NO1", "MULTI"
  nomeDescritivo: string;   // Ex: "ROTINACBDMUDOU"
  tema: string;             // Ex: "ANSIEDADE"
  estilo: string;           // Ex: "UGC"
  formato: string;          // Ex: "VID"
  tempo: string;            // Ex: "T30S" → "30S"
  tamanho: string;          // Ex: "S9X16" → "9X16"
  mostraProduto: boolean;
  hookNumber: number;
  versionNumber: number;
  isPost: boolean;
}

/**
 * Sanitiza nome descritivo:
 * - Maiusculas
 * - Remove acentos
 * - Remove espacos e caracteres especiais
 * - Maximo 25 chars
 */
export function sanitizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // Remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")        // Remove tudo que nao eh alfanumerico
    .slice(0, 25);
}

/**
 * Gera codigo automatico para Creator que nao tem code definido.
 * Regras:
 * 1. Se 1 palavra: primeiros 6 chars
 * 2. Se 2+ palavras: concatenar e preencher ate 6-8 chars
 * 3. Remover acentos, espacos, especiais
 */
export function generateCreatorCode(name: string): string {
  const sanitized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .trim();

  const words = sanitized.split(/\s+/).filter(Boolean);

  if (words.length === 0) return "UNKNWN";
  if (words.length === 1) return words[0]!.slice(0, 6);

  // Multiplas palavras: pegar primeiras letras + preencher
  const initials = words.map((w) => w.slice(0, 3)).join("");
  return initials.slice(0, 8);
}

/**
 * Gera nomenclatura no formato:
 * AD####_AAAAMMDD_PRODUTORA_INFLUENCER_NOME_TEMA_ESTILO_FORMATO_TEMPO_TAMANHO[_PROD][_HK#][_V#][_POST]
 */
export function generateNomenclatura(input: NomenclaturaInput): string {
  const parts: string[] = [];

  // 1. AD#### (4 digitos zero-padded)
  parts.push(`AD${String(input.adNumber).padStart(4, "0")}`);

  // 2. AAAAMMDD
  const d = input.approvalDate;
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  parts.push(dateStr);

  // 3. PRODUTORA
  parts.push(input.originCode);

  // 4. INFLUENCER
  parts.push(input.creatorCode);

  // 5. NOME (sanitizado)
  parts.push(sanitizeName(input.nomeDescritivo));

  // 6. TEMA
  parts.push(input.tema);

  // 7. ESTILO
  parts.push(input.estilo);

  // 8. FORMATO
  parts.push(input.formato);

  // 9. TEMPO (remover prefixo T do enum)
  parts.push(input.tempo.replace(/^T/, ""));

  // 10. TAMANHO (remover prefixo S do enum)
  parts.push(input.tamanho.replace(/^S/, ""));

  // Sufixos opcionais (nesta ordem)
  if (input.mostraProduto) parts.push("PROD");
  if (input.hookNumber > 1) parts.push(`HK${input.hookNumber}`);
  if (input.versionNumber > 1) parts.push(`V${input.versionNumber}`);
  if (input.isPost) parts.push("POST");

  return parts.join("_");
}

/**
 * Gera nomenclatura para todos os deliverables de um video.
 * Chamado na sub-etapa 6B (Nomenclatura).
 */
export async function generateNomenclaturaForVideo(videoId: string): Promise<void> {
  const video = await db.adVideo.findUniqueOrThrow({
    where: { id: videoId },
    include: {
      project: {
        include: { origin: true },
      },
      criador: true,
      deliverables: {
        where: { adNumber: { not: null } },
        orderBy: { hookNumber: "asc" },
      },
    },
  });

  const originCode = video.project.origin.code || "OUTRO";
  let creatorCode = "NO1";
  if (video.criador) {
    creatorCode = video.criador.code || generateCreatorCode(video.criador.name);
  }

  for (const deliverable of video.deliverables) {
    if (!deliverable.adNumber) continue;

    const nomenclatura = generateNomenclatura({
      adNumber: deliverable.adNumber,
      approvalDate: new Date(),
      originCode,
      creatorCode,
      nomeDescritivo: video.nomeDescritivo,
      tema: video.tema,
      estilo: video.estilo,
      formato: video.formato,
      tempo: deliverable.tempo,
      tamanho: deliverable.tamanho,
      mostraProduto: deliverable.mostraProduto,
      hookNumber: deliverable.hookNumber,
      versionNumber: deliverable.versionNumber,
      isPost: deliverable.isPost,
    });

    await db.adDeliverable.update({
      where: { id: deliverable.id },
      data: { nomenclaturaGerada: nomenclatura },
    });
  }
}
