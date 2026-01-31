import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, FieldType, AreaPosition } from "./generated/client.js";

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
  console.log("🌱 Starting seed...\n");

  // ============================================
  // 1. CONTENT TYPES
  // ============================================
  const contentTypeData = [
    { name: "Vídeo UGC", slug: "video-ugc", icon: "Video", color: "#3B82F6", description: "Vídeo autêntico gravado por creator ou paciente" },
    { name: "Vídeo Institucional", slug: "video-institucional", icon: "VideoCamera", color: "#8B5CF6", description: "Vídeo profissional de alta qualidade (Oslo)" },
    { name: "Carrossel", slug: "carrossel", icon: "Images", color: "#10B981", description: "Sequência de imagens para feed" },
    { name: "Post Único", slug: "post-unico", icon: "Image", color: "#F59E0B", description: "Imagem única estática para feed" },
    { name: "Stories", slug: "stories", icon: "Smartphone", color: "#EC4899", description: "Conteúdo vertical efêmero (24h)" },
    { name: "Reels", slug: "reels", icon: "Play", color: "#EF4444", description: "Vídeo vertical curto e dinâmico" },
  ];

  const contentTypes: Record<string, { id: string }> = {};
  for (const ct of contentTypeData) {
    const created = await prisma.contentType.upsert({
      where: { slug: ct.slug },
      update: { description: ct.description },
      create: { ...ct, isActive: true },
    });
    contentTypes[ct.slug] = created;
  }
  console.log(`✓ Seeded ${Object.keys(contentTypes).length} ContentTypes`);

  // ============================================
  // 2. ORIGINS
  // ============================================
  const originData = [
    { name: "Oslo", slug: "oslo", description: "Agência externa de produção audiovisual (R$100k/mês)" },
    { name: "Interno", slug: "interno", description: "Equipe interna da Click Cannabis" },
    { name: "Influencer", slug: "influencer", description: "Criador de conteúdo externo (UGC Creator)" },
    { name: "Freelancer", slug: "freelancer", description: "Profissional avulso contratado por demanda" },
  ];

  for (const origin of originData) {
    await prisma.origin.upsert({
      where: { slug: origin.slug },
      update: { description: origin.description },
      create: { ...origin, isActive: true },
    });
  }
  console.log(`✓ Seeded ${originData.length} Origins`);

  // ============================================
  // 3. AREAS
  // ============================================
  const areaData = [
    { name: "Content Manager", slug: "content-manager", description: "Coordenação geral de conteúdo - Samira" },
    { name: "Design", slug: "design", description: "Criação visual e branding - Vidjai" },
    { name: "Social Media", slug: "social-media", description: "Gestão de redes sociais e publicações" },
    { name: "Tráfego", slug: "trafego", description: "Gestão de Ads e performance" },
    { name: "Oslo", slug: "oslo", description: "Agência externa de produção audiovisual" },
    { name: "UGC Manager", slug: "ugc-manager", description: "Gestão de creators e influencers - Bruna Wright" },
    { name: "Compliance", slug: "compliance", description: "Validação legal e ANVISA" },
    { name: "Médico", slug: "medico", description: "Validação médica e CFM" },
    { name: "Growth", slug: "growth", description: "Estratégia de crescimento e performance - Lucas Rouxinol" },
    { name: "Copywriting", slug: "copywriting", description: "Redação publicitária e roteiros" },
  ];

  const areas: Record<string, { id: string }> = {};
  for (const area of areaData) {
    const created = await prisma.area.upsert({
      where: { slug: area.slug },
      update: { description: area.description },
      create: { ...area, isActive: true },
    });
    areas[area.slug] = created;
  }
  console.log(`✓ Seeded ${Object.keys(areas).length} Areas`);

  // ============================================
  // 4. ORIGIN CODES
  // ============================================
  const originCodes: Record<string, string> = {
    "oslo": "OSLLO",
    "interno": "CLICK",
    "influencer": "LAGENCY",
    "freelancer": "OUTRO",
  };

  for (const [slug, code] of Object.entries(originCodes)) {
    await prisma.origin.updateMany({
      where: { slug },
      data: { code },
    });
  }

  // Adicionar origin "Chamber" se nao existir
  await prisma.origin.upsert({
    where: { slug: "chamber" },
    update: { code: "CHAMBER" },
    create: {
      name: "Chamber",
      slug: "chamber",
      description: "Agência Chamber",
      code: "CHAMBER",
      isActive: true,
    },
  });

  console.log("✓ Seeded Origin codes for nomenclatura");

  // ============================================
  // 5. TEST USERS
  // ============================================
  const now = new Date();
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@clickcannabis.com" },
    update: { role: "ADMIN" },
    create: {
      id: randomUUID(),
      email: "admin@clickcannabis.com",
      name: "Admin User",
      role: "ADMIN",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.user.upsert({
    where: { email: "superadmin@clickcannabis.com" },
    update: { role: "SUPER_ADMIN" },
    create: {
      id: randomUUID(),
      email: "superadmin@clickcannabis.com",
      name: "Super Admin User",
      role: "SUPER_ADMIN",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@clickcannabis.com" },
    update: { role: "USER" },
    create: {
      id: randomUUID(),
      email: "user@clickcannabis.com",
      name: "Regular User",
      role: "USER",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  // Create AreaMember records
  await prisma.areaMember.upsert({
    where: { userId_areaId: { userId: admin.id, areaId: areas["content-manager"]!.id } },
    update: { position: AreaPosition.HEAD },
    create: {
      userId: admin.id,
      areaId: areas["content-manager"]!.id,
      position: AreaPosition.HEAD,
    },
  });

  await prisma.areaMember.upsert({
    where: { userId_areaId: { userId: user.id, areaId: areas["social-media"]!.id } },
    update: { position: AreaPosition.STAFF },
    create: {
      userId: user.id,
      areaId: areas["social-media"]!.id,
      position: AreaPosition.STAFF,
    },
  });

  console.log("✓ Seeded 3 test users");

  // ============================================
  // 6. CREATOR CODES
  // ============================================
  const creatorCodes: Record<string, string> = {
    "Leo do Taxi": "LEOTX",
    "Pedro Machado": "PEDROM",
    "Dr. Joao": "DRJOAO",
    "Dr. Felipe": "DRFELIPE",
    "Bruna Wright": "BRUNAWT",
    "Rachel": "RACHEL",
    "Irwen": "IRWEN",
    "Babi Rosa": "BABIROSA",
  };

  for (const [name, code] of Object.entries(creatorCodes)) {
    await prisma.creator.updateMany({
      where: { name },
      data: { code },
    });
  }

  console.log("✓ Seeded Creator codes for nomenclatura");

  // ============================================
  // 7. CUSTOM FIELDS BY CONTENT TYPE
  // ============================================
  
  // Helper to create fields
  async function createField(
    contentTypeId: string,
    name: string,
    label: string,
    fieldType: FieldType,
    order: number,
    options?: {
      required?: boolean;
      placeholder?: string;
      helpText?: string;
      selectOptions?: string[];
    }
  ) {
    return prisma.contentTypeField.upsert({
      where: { contentTypeId_name: { contentTypeId, name } },
      update: { label, order, placeholder: options?.placeholder, helpText: options?.helpText, options: options?.selectOptions },
      create: {
        contentTypeId,
        name,
        label,
        fieldType,
        order,
        required: options?.required ?? false,
        placeholder: options?.placeholder,
        helpText: options?.helpText,
        options: options?.selectOptions,
        isActive: true,
      },
    });
  }

  // --- VIDEO UGC FIELDS ---
  const videoUgcId = contentTypes["video-ugc"]!.id;
  await createField(videoUgcId, "roteiro", "Roteiro / Briefing", FieldType.TEXTAREA, 0, {
    required: true,
    placeholder: "Descreva o que o creator deve falar/mostrar...",
    helpText: "Inclua pontos-chave, tom de voz e CTA",
  });
  await createField(videoUgcId, "duracao_estimada", "Duração Estimada", FieldType.SELECT, 1, {
    required: true,
    selectOptions: ["15 segundos", "30 segundos", "45 segundos", "60 segundos"],
  });
  await createField(videoUgcId, "formato", "Formato do Vídeo", FieldType.SELECT, 2, {
    required: true,
    selectOptions: ["Vertical (9:16)", "Quadrado (1:1)", "Horizontal (16:9)"],
  });
  await createField(videoUgcId, "ugc_creator", "Nome do Creator", FieldType.TEXT, 3, {
    placeholder: "Nome do UGC Creator ou paciente",
  });
  await createField(videoUgcId, "patologia_foco", "Patologia em Foco", FieldType.SELECT, 4, {
    selectOptions: ["Insônia", "Ansiedade", "Dor Crônica", "Estresse", "Inflamação", "Outro"],
    helpText: "Condição médica abordada no vídeo",
  });
  await createField(videoUgcId, "link_referencia", "Link de Referência", FieldType.URL, 5, {
    placeholder: "https://...",
    helpText: "Vídeo de referência para estilo/tom",
  });
  await createField(videoUgcId, "cta_final", "CTA Final", FieldType.TEXT, 6, {
    placeholder: "Ex: Agende sua consulta",
    helpText: "Call-to-action que o creator deve falar",
  });
  await createField(videoUgcId, "link_entrega", "Link do Vídeo Final", FieldType.URL, 7, {
    placeholder: "https://drive.google.com/...",
    helpText: "Link do vídeo entregue (Google Drive, Frame.io)",
  });

  // --- VIDEO INSTITUCIONAL FIELDS ---
  const videoInstId = contentTypes["video-institucional"]!.id;
  await createField(videoInstId, "roteiro", "Roteiro Completo", FieldType.WYSIWYG, 0, {
    required: true,
    helpText: "Roteiro detalhado com falas, cenas e direções",
  });
  await createField(videoInstId, "duracao_estimada", "Duração Estimada", FieldType.SELECT, 1, {
    required: true,
    selectOptions: ["30 segundos", "1 minuto", "2 minutos", "3+ minutos"],
  });
  await createField(videoInstId, "formato", "Formato do Vídeo", FieldType.SELECT, 2, {
    required: true,
    selectOptions: ["Horizontal (16:9)", "Vertical (9:16)", "Quadrado (1:1)"],
  });
  await createField(videoInstId, "locacao", "Local de Gravação", FieldType.TEXT, 3, {
    placeholder: "Ex: Clínica Click, Estúdio Oslo",
  });
  await createField(videoInstId, "data_gravacao", "Data Prevista de Gravação", FieldType.DATE, 4);
  await createField(videoInstId, "equipamentos", "Equipamentos Necessários", FieldType.TEXTAREA, 5, {
    placeholder: "Liste equipamentos especiais se necessário",
  });
  await createField(videoInstId, "link_referencia", "Link de Referência", FieldType.URL, 6, {
    placeholder: "https://...",
  });
  await createField(videoInstId, "link_entrega", "Link do Vídeo Final", FieldType.URL, 7, {
    placeholder: "https://frame.io/...",
    helpText: "Link do vídeo entregue pela Oslo",
  });

  // --- CARROSSEL FIELDS ---
  const carrosselId = contentTypes["carrossel"]!.id;
  await createField(carrosselId, "quantidade_slides", "Quantidade de Slides", FieldType.NUMBER, 0, {
    required: true,
    placeholder: "Ex: 7",
    helpText: "Mínimo 3, máximo 10",
  });
  await createField(carrosselId, "copy_slides", "Conteúdo dos Slides", FieldType.WYSIWYG, 1, {
    required: true,
    helpText: "Texto de cada slide (separe por slide)",
  });
  await createField(carrosselId, "estilo_visual", "Estilo Visual", FieldType.SELECT, 2, {
    required: true,
    selectOptions: ["Clean/Minimalista", "Colorido/Vibrante", "Informativo/Educativo", "Institucional"],
  });
  await createField(carrosselId, "link_referencia", "Referência Visual", FieldType.URL, 3, {
    placeholder: "https://...",
    helpText: "Post de referência para o estilo",
  });
  await createField(carrosselId, "cta_final", "CTA do Último Slide", FieldType.TEXT, 4, {
    placeholder: "Ex: Salve este post!",
  });
  await createField(carrosselId, "link_entrega", "Link dos Arquivos", FieldType.URL, 5, {
    placeholder: "https://drive.google.com/...",
  });

  // --- POST ÚNICO FIELDS ---
  const postUnicoId = contentTypes["post-unico"]!.id;
  await createField(postUnicoId, "copy", "Texto do Post", FieldType.TEXTAREA, 0, {
    required: true,
    placeholder: "Texto que acompanha a imagem",
  });
  await createField(postUnicoId, "estilo_visual", "Estilo Visual", FieldType.SELECT, 1, {
    required: true,
    selectOptions: ["Clean/Minimalista", "Colorido/Vibrante", "Comemorativo", "Informativo"],
  });
  await createField(postUnicoId, "tipo_post", "Tipo de Post", FieldType.SELECT, 2, {
    selectOptions: ["Aviso", "Quote/Frase", "Promoção", "Evento", "Feriado", "Outro"],
  });
  await createField(postUnicoId, "data_publicacao", "Data de Publicação", FieldType.DATE, 3);
  await createField(postUnicoId, "link_referencia", "Referência Visual", FieldType.URL, 4);
  await createField(postUnicoId, "link_entrega", "Link do Arquivo", FieldType.URL, 5);

  // --- STORIES FIELDS ---
  const storiesId = contentTypes["stories"]!.id;
  await createField(storiesId, "quantidade_stories", "Quantidade de Stories", FieldType.NUMBER, 0, {
    required: true,
    placeholder: "Ex: 3",
  });
  await createField(storiesId, "copy_stories", "Conteúdo dos Stories", FieldType.TEXTAREA, 1, {
    required: true,
    placeholder: "Texto/roteiro de cada story",
  });
  await createField(storiesId, "tem_link", "Tem Link (Swipe-up)?", FieldType.CHECKBOX, 2);
  await createField(storiesId, "link_destino", "URL de Destino", FieldType.URL, 3, {
    placeholder: "https://clickcannabis.com.br/agendar",
    helpText: "Link para onde o swipe-up leva",
  });
  await createField(storiesId, "estilo_visual", "Estilo Visual", FieldType.SELECT, 4, {
    selectOptions: ["Bastidores", "Promocional", "Educativo", "Interativo (Enquete)"],
  });
  await createField(storiesId, "link_entrega", "Link dos Arquivos", FieldType.URL, 5);

  // --- REELS FIELDS ---
  const reelsId = contentTypes["reels"]!.id;
  await createField(reelsId, "roteiro", "Roteiro / Ideia", FieldType.TEXTAREA, 0, {
    required: true,
    placeholder: "Descreva a ideia do Reel",
  });
  await createField(reelsId, "duracao_estimada", "Duração Estimada", FieldType.SELECT, 1, {
    required: true,
    selectOptions: ["15 segundos", "30 segundos", "60 segundos", "90 segundos"],
  });
  await createField(reelsId, "formato", "Formato", FieldType.SELECT, 2, {
    required: true,
    selectOptions: ["Vertical (9:16)"],
  });
  await createField(reelsId, "musica_referencia", "Música de Referência", FieldType.TEXT, 3, {
    placeholder: "Nome da música/áudio",
  });
  await createField(reelsId, "trend_referencia", "Link da Trend", FieldType.URL, 4, {
    placeholder: "https://instagram.com/reel/...",
    helpText: "Link do Reel de referência (trend)",
  });
  await createField(reelsId, "cta_final", "CTA Final", FieldType.TEXT, 5, {
    placeholder: "Ex: Siga para mais dicas!",
  });
  await createField(reelsId, "link_entrega", "Link do Vídeo Final", FieldType.URL, 6);

  console.log("✓ Seeded Custom Fields for all ContentTypes");

  // ============================================
  // 5. WORKFLOW STEPS
  // ============================================
  
  // Helper to create workflow steps
  async function createWorkflowStep(
    contentTypeId: string,
    name: string,
    order: number,
    options: {
      description?: string;
      approverAreaSlug?: string;
      approverPositions?: AreaPosition[];
      requiredFieldsToEnter?: string[];
      requiredFieldsToExit?: string[];
      isFinalStep?: boolean;
    }
  ) {
    const approverAreaId = options.approverAreaSlug ? areas[options.approverAreaSlug]?.id : null;
    
    const existing = await prisma.workflowStep.findFirst({
      where: { contentTypeId, order },
    });

    if (existing) {
      return prisma.workflowStep.update({
        where: { id: existing.id },
        data: {
          name,
          description: options.description,
          approverAreaId,
          approverPositions: options.approverPositions || [],
          requiredFieldsToEnter: options.requiredFieldsToEnter || [],
          requiredFieldsToExit: options.requiredFieldsToExit || [],
          isFinalStep: options.isFinalStep ?? false,
        },
      });
    }

    return prisma.workflowStep.create({
      data: {
        contentTypeId,
        name,
        order,
        description: options.description,
        approverAreaId,
        approverPositions: options.approverPositions || [],
        requiredFieldsToEnter: options.requiredFieldsToEnter || [],
        requiredFieldsToExit: options.requiredFieldsToExit || [],
        isFinalStep: options.isFinalStep ?? false,
        isActive: true,
      },
    });
  }

  // --- VIDEO UGC WORKFLOW ---
  await createWorkflowStep(videoUgcId, "Briefing", 0, {
    description: "Aprovação do briefing e roteiro inicial",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR],
    requiredFieldsToExit: ["roteiro", "duracao_estimada", "formato"],
  });
  await createWorkflowStep(videoUgcId, "Produção UGC", 1, {
    description: "Creator produz o vídeo conforme briefing",
    approverAreaSlug: "ugc-manager",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR, AreaPosition.STAFF],
    requiredFieldsToEnter: ["roteiro"],
    requiredFieldsToExit: ["link_entrega", "ugc_creator"],
  });
  await createWorkflowStep(videoUgcId, "Aprovação Final", 2, {
    description: "Validação final do vídeo entregue",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD],
    requiredFieldsToEnter: ["link_entrega"],
    isFinalStep: true,
  });

  // --- VIDEO INSTITUCIONAL WORKFLOW ---
  await createWorkflowStep(videoInstId, "Briefing", 0, {
    description: "Aprovação do roteiro e briefing",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR],
    requiredFieldsToExit: ["roteiro", "duracao_estimada", "formato"],
  });
  await createWorkflowStep(videoInstId, "Validação Oslo", 1, {
    description: "Oslo valida viabilidade técnica e orçamento",
    approverAreaSlug: "oslo",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR],
    requiredFieldsToEnter: ["roteiro"],
    requiredFieldsToExit: ["data_gravacao", "locacao"],
  });
  await createWorkflowStep(videoInstId, "Produção", 2, {
    description: "Oslo grava e edita o vídeo",
    approverAreaSlug: "oslo",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR, AreaPosition.STAFF],
    requiredFieldsToExit: ["link_entrega"],
  });
  await createWorkflowStep(videoInstId, "Aprovação Final", 3, {
    description: "Validação final do vídeo institucional",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD],
    requiredFieldsToEnter: ["link_entrega"],
    isFinalStep: true,
  });

  // --- CARROSSEL WORKFLOW ---
  await createWorkflowStep(carrosselId, "Briefing", 0, {
    description: "Aprovação do conteúdo e estrutura",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR],
    requiredFieldsToExit: ["quantidade_slides", "copy_slides", "estilo_visual"],
  });
  await createWorkflowStep(carrosselId, "Design", 1, {
    description: "Equipe de design cria os slides",
    approverAreaSlug: "design",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR, AreaPosition.STAFF],
    requiredFieldsToEnter: ["copy_slides"],
    requiredFieldsToExit: ["link_entrega"],
  });
  await createWorkflowStep(carrosselId, "Aprovação Final", 2, {
    description: "Validação final do carrossel",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD],
    requiredFieldsToEnter: ["link_entrega"],
    isFinalStep: true,
  });

  // --- POST ÚNICO WORKFLOW ---
  await createWorkflowStep(postUnicoId, "Briefing", 0, {
    description: "Aprovação do copy e direção visual",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR],
    requiredFieldsToExit: ["copy", "estilo_visual"],
  });
  await createWorkflowStep(postUnicoId, "Design", 1, {
    description: "Equipe de design cria a arte",
    approverAreaSlug: "design",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR, AreaPosition.STAFF],
    requiredFieldsToEnter: ["copy"],
    requiredFieldsToExit: ["link_entrega"],
  });
  await createWorkflowStep(postUnicoId, "Aprovação Final", 2, {
    description: "Validação final do post",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD],
    requiredFieldsToEnter: ["link_entrega"],
    isFinalStep: true,
  });

  // --- STORIES WORKFLOW ---
  await createWorkflowStep(storiesId, "Briefing", 0, {
    description: "Aprovação do conteúdo dos stories",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR],
    requiredFieldsToExit: ["quantidade_stories", "copy_stories"],
  });
  await createWorkflowStep(storiesId, "Produção", 1, {
    description: "Social Media produz os stories",
    approverAreaSlug: "social-media",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR, AreaPosition.STAFF],
    requiredFieldsToEnter: ["copy_stories"],
    requiredFieldsToExit: ["link_entrega"],
  });
  await createWorkflowStep(storiesId, "Aprovação Final", 2, {
    description: "Validação final dos stories",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD],
    requiredFieldsToEnter: ["link_entrega"],
    isFinalStep: true,
  });

  // --- REELS WORKFLOW ---
  await createWorkflowStep(reelsId, "Briefing", 0, {
    description: "Aprovação do roteiro e ideia",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR],
    requiredFieldsToExit: ["roteiro", "duracao_estimada"],
  });
  await createWorkflowStep(reelsId, "Produção", 1, {
    description: "Produção do Reel",
    approverAreaSlug: "social-media",
    approverPositions: [AreaPosition.HEAD, AreaPosition.COORDINATOR, AreaPosition.STAFF],
    requiredFieldsToEnter: ["roteiro"],
    requiredFieldsToExit: ["link_entrega"],
  });
  await createWorkflowStep(reelsId, "Aprovação Final", 2, {
    description: "Validação final do Reel",
    approverAreaSlug: "content-manager",
    approverPositions: [AreaPosition.HEAD],
    requiredFieldsToEnter: ["link_entrega"],
    isFinalStep: true,
  });

  console.log("✓ Seeded Workflow Steps for all ContentTypes");

  // ============================================
  // 6. AREA PERMISSIONS (who can create what)
  // ============================================
  
  async function setAreaPermission(contentTypeSlug: string, areaSlug: string, canCreate: boolean) {
    const contentTypeId = contentTypes[contentTypeSlug]?.id;
    const areaId = areas[areaSlug]?.id;
    if (!contentTypeId || !areaId) return;

    await prisma.contentTypeAreaPermission.upsert({
      where: { contentTypeId_areaId: { contentTypeId, areaId } },
      update: { canCreate },
      create: { contentTypeId, areaId, canCreate },
    });
  }

  // Content Manager pode criar TODOS os tipos
  for (const slug of Object.keys(contentTypes)) {
    await setAreaPermission(slug, "content-manager", true);
  }

  // UGC Manager pode criar Video UGC
  await setAreaPermission("video-ugc", "ugc-manager", true);

  // Oslo pode criar Video Institucional
  await setAreaPermission("video-institucional", "oslo", true);

  // Design pode criar Carrossel e Post Único
  await setAreaPermission("carrossel", "design", true);
  await setAreaPermission("post-unico", "design", true);

  // Social Media pode criar Stories e Reels
  await setAreaPermission("stories", "social-media", true);
  await setAreaPermission("reels", "social-media", true);

  // Tráfego pode criar Video UGC (para Ads)
  await setAreaPermission("video-ugc", "trafego", true);

  console.log("✓ Seeded Area Permissions");

  // ============================================
  // 8. AD TYPES
  // ============================================
  await prisma.adType.upsert({
    where: { slug: "video-criativo" },
    update: {},
    create: {
      name: "Video Criativo",
      slug: "video-criativo",
      description: "Video criativo para anuncios de performance (hooks, variacoes, nomenclatura)",
      icon: "Film",
      color: "#7C3AED",
      isActive: true,
    },
  });

  console.log("✓ Seeded AdType: Video Criativo");

  // ============================================
  // 9. AD COUNTER (singleton)
  // ============================================
  const existingCounter = await prisma.adCounter.findFirst();
  if (!existingCounter) {
    await prisma.adCounter.create({
      data: {
        currentValue: 730,
      },
    });
    console.log("✓ Seeded AdCounter (starting at 730)");
  } else {
    console.log(`✓ AdCounter already exists (current value: ${existingCounter.currentValue})`);
  }

  // ============================================
  // 10. PEDRO EM COMPLIANCE (HEAD)
  // ============================================
  const pedro = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN", name: { contains: "Pedro" } },
  });

  if (pedro && areas["compliance"]) {
    await prisma.areaMember.upsert({
      where: { userId_areaId: { userId: pedro.id, areaId: areas["compliance"]!.id } },
      update: { position: AreaPosition.HEAD },
      create: {
        userId: pedro.id,
        areaId: areas["compliance"]!.id,
        position: AreaPosition.HEAD,
      },
    });
    console.log("✓ Pedro added to Compliance as HEAD");
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - ${Object.keys(contentTypes).length} Content Types`);
  console.log(`   - ${originData.length} Origins (with codes)`);
  console.log(`   - ${Object.keys(areas).length} Areas`);
  console.log("   - Custom Fields for each Content Type");
  console.log("   - Workflow Steps with approval rules");
  console.log("   - Area Permissions configured");
  console.log("   - 1 AdType (Video Criativo)");
  console.log("   - AdCounter initialized at 730");
  console.log("   - Origin & Creator codes for nomenclatura");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
