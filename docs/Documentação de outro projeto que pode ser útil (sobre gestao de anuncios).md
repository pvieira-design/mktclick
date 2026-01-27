# Documentação Técnica - Facebook Ads Dashboard

> Documento técnico para migração do sistema. Descreve todas as regras de negócio, schemas de banco de dados, fluxos de dados e lógica de funcionamento.

---

## 1. Arquitetura Geral

O sistema utiliza **dois bancos de dados** separados:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Dashboard   │  │  Criativos   │  │   Autenticação           │  │
│  │  (KPIs)      │  │  (Grid Ads)  │  │   (Login/Signup)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EDGE FUNCTIONS (APIs)                          │
│  ┌────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ fetch-dashboard    │  │ fetch-ads      │  │ fetch-ad-details │  │
│  └────────────────────┘  └────────────────┘  └──────────────────┘  │
│                          ┌──────────────────────┐                   │
│                          │ fetch-filter-options │                   │
│                          └──────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  BANCO EXTERNO          │     │  BANCO DA APLICAÇÃO     │
│  (PostgreSQL)           │     │  (PostgreSQL)           │
│  ─────────────────────  │     │  ─────────────────────  │
│  facebook_ads_insights  │     │  profiles               │
│  (dados do Facebook)    │     │  user_roles             │
│                         │     │  ad_media               │
└─────────────────────────┘     └─────────────────────────┘
                                              │
                                              ▼
                                ┌─────────────────────────┐
                                │  BLOB STORAGE           │
                                │  (Arquivos de mídia)    │
                                │  ─────────────────────  │
                                │  Bucket: ad-media       │
                                └─────────────────────────┘
```

### 1.1 Resumo dos Componentes

| Componente | Descrição |
|------------|-----------|
| **Banco Externo** | PostgreSQL com dados de performance do Facebook Ads (importados via pipeline externo) |
| **Banco da Aplicação** | PostgreSQL para autenticação, perfis, roles e referências de mídia |
| **Blob Storage** | Armazenamento de imagens/vídeos dos criativos |
| **Edge Functions** | APIs serverless que conectam frontend aos bancos de dados |

---

## 2. Banco de Dados Externo (Facebook Ads)

### 2.1 Variável de Conexão

```
EXTERNAL_DATABASE_URL = "postgresql://user:password@host:port/database"
```

### 2.2 Tabela: `facebook_ads_insights`

Esta tabela contém os dados de performance importados diretamente da API do Facebook Ads.

> ⚠️ **IMPORTANTE**: O nome da tabela é `facebook_ads_insights` (com "s" após "ads")

#### Schema Completo

```sql
CREATE TABLE facebook_ads_insights (
  id SERIAL PRIMARY KEY,
  ad_id VARCHAR NOT NULL,              -- ID único do anúncio no Facebook
  account_id BIGINT NOT NULL,          -- ID da conta de anúncios
  campaign_name VARCHAR,               -- Nome da campanha
  adset_name VARCHAR,                  -- Nome do conjunto de anúncios
  ad_name VARCHAR,                     -- Nome do anúncio
  date DATE NOT NULL,                  -- Data do registro

  -- Métricas de Alcance
  impressions INTEGER DEFAULT 0,       -- Impressões
  
  -- Métricas de Engajamento
  link_clicks INTEGER DEFAULT 0,       -- Cliques no link
  landing_page_views INTEGER DEFAULT 0, -- Visualizações da landing page
  video_view INTEGER DEFAULT 0,        -- Visualizações de vídeo
  post_engagement INTEGER DEFAULT 0,   -- Engajamento em posts
  page_engagement INTEGER DEFAULT 0,   -- Engajamento na página
  post_reaction INTEGER DEFAULT 0,     -- Reações em posts
  comment INTEGER DEFAULT 0,           -- Comentários
  "like" INTEGER DEFAULT 0,            -- Curtidas (usar aspas por ser palavra reservada)
  post INTEGER DEFAULT 0,              -- Posts
  onsite_conversion_post_save INTEGER DEFAULT 0, -- Posts salvos

  -- Métricas de Conversão
  complete_registration INTEGER DEFAULT 0, -- Registros/Cadastros completos

  -- Financeiro
  spend NUMERIC(12,2) DEFAULT 0,       -- Valor gasto em R$

  -- Conversões Customizadas (JSONB)
  custom_conversion_data JSONB,        -- Array de objetos de conversão

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices recomendados
CREATE INDEX idx_facebook_ads_date ON facebook_ads_insights(date);
CREATE INDEX idx_facebook_ads_ad_id ON facebook_ads_insights(ad_id);
CREATE INDEX idx_facebook_ads_account_id ON facebook_ads_insights(account_id);
CREATE INDEX idx_facebook_ads_campaign ON facebook_ads_insights(campaign_name);
```

### 2.3 Coluna `custom_conversion_data` (JSONB)

Esta coluna armazena um **array de objetos** com conversões customizadas do Facebook.

#### Estrutura do Array

```json
[
  {
    "event_name": "CP_Click_deal",
    "value": 5,
    "monetary_value": 0
  },
  {
    "event_name": "CP_Click_payment_consulting",
    "value": 2,
    "monetary_value": 100.00
  },
  {
    "event_name": "CP_Click_payment_product",
    "value": 1,
    "monetary_value": 750.00
  }
]
```

#### Campos de Cada Objeto

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `event_name` | string | Identificador do evento de conversão |
| `value` | integer | Quantidade de conversões |
| `monetary_value` | numeric | Valor monetário em R$ |

### 2.4 Eventos de Conversão

| Evento (event_name) | Nome no Dashboard | Descrição |
|---------------------|-------------------|-----------|
| `CP_Click_deal` | Deals | Usuário clicou para ir ao WhatsApp |
| `CP_Click_payment_consulting` | Consultas Pagas | Pagamento de consulta realizado |
| `CP_Click_payment_product` | Orçamentos Pagos | Pagamento de orçamento/produto |

### 2.5 Query para Extrair Conversões do JSONB

```sql
-- Contar quantidade de Deals
SELECT 
  COALESCE(
    SUM(
      CASE 
        WHEN custom_conversion_data IS NOT NULL THEN
          (SELECT COALESCE(SUM((elem->>'value')::numeric), 0)
           FROM jsonb_array_elements(custom_conversion_data) elem
           WHERE elem->>'event_name' = 'CP_Click_deal')
        ELSE 0
      END
    ), 0
  ) as total_deals
FROM facebook_ads_insights;

-- Somar valor monetário (receita)
SELECT 
  COALESCE(
    SUM(
      CASE 
        WHEN custom_conversion_data IS NOT NULL THEN
          (SELECT COALESCE(SUM((elem->>'monetary_value')::numeric), 0)
           FROM jsonb_array_elements(custom_conversion_data) elem
           WHERE elem->>'event_name' IN ('CP_Click_payment_consulting', 'CP_Click_payment_product'))
        ELSE 0
      END
    ), 0
  ) as total_revenue
FROM facebook_ads_insights;
```

---

## 3. Banco de Dados da Aplicação

### 3.1 Tabela: `profiles`

Armazena informações adicionais dos usuários autenticados.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,        -- Referência ao usuário autenticado
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 3.2 Tabela: `user_roles`

Define as permissões de cada usuário no sistema.

```sql
CREATE TYPE app_role AS ENUM ('admin', 'viewer');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Função auxiliar para verificar roles (evita recursão em RLS)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 3.3 Tabela: `ad_media`

Armazena as **referências** às mídias (imagens/vídeos) dos criativos.

> ⚠️ **IMPORTANTE**: Esta tabela NÃO armazena os arquivos, apenas URLs para o Blob Storage.

```sql
CREATE TABLE ad_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id VARCHAR NOT NULL,              -- ID do anúncio (mesmo do facebook_ads_insights)
  file_url TEXT NOT NULL,              -- URL pública do arquivo no Blob Storage
  file_type VARCHAR NOT NULL,          -- 'image' ou 'video'
  file_name TEXT,                      -- Nome original do arquivo
  thumbnail_url TEXT,                  -- URL da thumbnail (para vídeos)
  uploaded_by UUID,                    -- ID do usuário que fez upload
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por ad_id
CREATE INDEX idx_ad_media_ad_id ON ad_media(ad_id);

-- RLS Policies
ALTER TABLE ad_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all ad media"
  ON ad_media FOR SELECT USING (true);

CREATE POLICY "Admins can insert ad media"
  ON ad_media FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ad media"
  ON ad_media FOR UPDATE USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ad media"
  ON ad_media FOR DELETE USING (has_role(auth.uid(), 'admin'));
```

### 3.4 Trigger para Auto-Criar Perfil

Quando um usuário se registra, seu perfil é criado automaticamente.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cria perfil
  INSERT INTO profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Atribui role padrão (viewer)
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 4. Sistema de Armazenamento de Arquivos (Blob Storage)

### 4.1 Bucket: `ad-media`

Configuração do bucket para armazenar mídias dos criativos:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-media', 'ad-media', true);

-- Políticas de acesso
CREATE POLICY "Anyone can view ad media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ad-media');

CREATE POLICY "Admins can upload ad media files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ad-media' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update ad media files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'ad-media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ad media files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'ad-media' AND has_role(auth.uid(), 'admin'));
```

### 4.2 Estrutura de Pastas

```
ad-media/
├── {ad_id ou prefixo}/
│   ├── {timestamp}.jpg          # Imagem do criativo
│   ├── {timestamp}.mp4          # Vídeo do criativo
│   └── thumbnail_{timestamp}.jpg # Thumbnail do vídeo
```

### 4.3 Fluxo de Upload

```typescript
// 1. Upload do arquivo para o Blob Storage
const fileName = `${adId}/${Date.now()}.${fileExt}`;
await storage.from('ad-media').upload(fileName, file);

// 2. Obter URL pública
const { data } = storage.from('ad-media').getPublicUrl(fileName);
const publicUrl = data.publicUrl;

// 3. Salvar referência no banco de dados
await db.from('ad_media').insert({
  ad_id: adId,
  file_url: publicUrl,
  file_type: 'image' | 'video',
  file_name: file.name,
  uploaded_by: userId
});
```

### 4.4 Propagação de Mídia (Feature Especial)

Quando um criativo é carregado, ele pode ser **automaticamente aplicado** a todos os anúncios com o mesmo prefixo.

#### Lógica de Extração do Prefixo

```typescript
// Regex para extrair prefixo do nome do anúncio
// Exemplo: "AD602 - Variação 1" → "AD602"
export function extractAdPrefix(adName: string | null): string | null {
  if (!adName) return null;
  const match = adName.match(/^(AD\d+)/i);
  return match ? match[1].toUpperCase() : null;
}
```

#### Fluxo de Propagação

```
1. Usuário faz upload de mídia para "AD602 - Variação 1"
2. Sistema extrai prefixo: "AD602"
3. Sistema busca todos os anúncios que começam com "AD602"
4. Para cada anúncio encontrado:
   - Verifica se já existe registro em ad_media
   - Se existe: UPDATE com nova URL
   - Se não existe: INSERT com nova URL
5. Toast mostra: "Mídia aplicada a X anúncios com prefixo AD602"
```

---

## 5. Edge Functions (APIs)

### 5.1 `fetch-dashboard-data`

Retorna KPIs agregados, dados diários, funil de conversão e top campanhas.

#### Parâmetros de Entrada

```typescript
interface DashboardRequest {
  dateFrom: string;      // "2024-01-01"
  dateTo: string;        // "2024-01-31"
  accountId?: number;    // Filtro opcional por conta
  campaignName?: string; // Filtro opcional por campanha
}
```

#### Resposta

```typescript
interface DashboardResponse {
  kpis: {
    total_spend: number;
    total_impressions: number;
    total_clicks: number;
    total_landing_page_views: number;
    total_registrations: number;
    total_deals: number;
    total_consulting_payments: number;
    total_product_payments: number;
    total_consulting_revenue: number;
    total_product_revenue: number;
    total_revenue: number;
    cpl: number;
    cpm: number;
    ctr: number;
    cpc: number;
    roas: number;
  };
  previous_kpis: DashboardKPIs | null;  // Período anterior para comparação
  daily_data: DailyData[];              // Dados diários para gráficos
  funnel: FunnelData;                   // Dados do funil
  top_campaigns: TopCampaign[];         // Top 10 campanhas
  top_adsets: TopAdset[];               // Top 10 adsets
}
```

#### Lógica de Comparação com Período Anterior

Se o usuário seleciona 01/Jan a 31/Jan (30 dias):
- Período atual: 01/Jan a 31/Jan
- Período anterior: 02/Dez a 31/Dez (30 dias antes)

```typescript
const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
const prevToDate = fromDate - 1 day;
const prevFromDate = prevToDate - daysDiff days;
```

### 5.2 `fetch-ads`

Retorna lista de anúncios agregados com métricas.

#### Parâmetros de Entrada

```typescript
interface FetchAdsRequest {
  filters: {
    dateFrom: string;
    dateTo: string;
    accountId?: number;
    campaignName?: string;
    adsetName?: string;
    adName?: string;
    sortBy: 'spend' | 'roas' | 'revenue' | 'deals' | 'registrations';
    sortOrder: 'asc' | 'desc';
  };
}
```

#### Lógica de Agregação

A query agrupa por `ad_id` e calcula métricas agregadas:

```sql
SELECT 
  ad_id,
  MAX(ad_name) as ad_name,
  MAX(campaign_name) as campaign_name,
  MAX(adset_name) as adset_name,
  SUM(spend) as total_spend,
  SUM(impressions) as total_impressions,
  -- ... demais agregações
  
  -- Métricas calculadas
  CASE WHEN total_spend > 0 THEN total_revenue / total_spend ELSE 0 END as roas,
  CASE WHEN total_registrations > 0 THEN total_spend / total_registrations ELSE 0 END as cpl

FROM facebook_ads_insights
WHERE date BETWEEN $1 AND $2
GROUP BY ad_id
ORDER BY total_spend DESC
LIMIT 100
```

### 5.3 `fetch-ad-details`

Retorna detalhes completos de um anúncio específico.

#### Parâmetros

```typescript
interface FetchAdDetailsRequest {
  adId: string;
  dateFrom?: string;
  dateTo?: string;
}
```

#### Resposta Adicional

Inclui:
- Todas as métricas de engajamento (video_view, likes, comments, etc.)
- Lista de todas as conversões customizadas encontradas
- Dados diários do anúncio
- Primeiro e último dia de veiculação
- Dias ativos

### 5.4 `fetch-filter-options`

Retorna opções para os dropdowns de filtro.

#### Resposta

```typescript
interface FilterOptionsResponse {
  accounts: number[];           // IDs de contas disponíveis
  campaigns: string[];          // Nomes de campanhas
  adsets: string[];            // Nomes de adsets
  dateRange: {
    minDate: string;           // Data mais antiga
    maxDate: string;           // Data mais recente
  };
  totalAds: number;            // Total de anúncios únicos
}
```

#### Lógica de Filtro em Cascata

Quando uma conta é selecionada, as campanhas são filtradas:

```sql
SELECT DISTINCT campaign_name 
FROM facebook_ads_insights 
WHERE account_id = $1
ORDER BY campaign_name
```

Quando uma campanha é selecionada, os adsets são filtrados:

```sql
SELECT DISTINCT adset_name 
FROM facebook_ads_insights 
WHERE account_id = $1 AND campaign_name = $2
ORDER BY adset_name
```

---

## 6. Dashboard - Regras de Negócio

### 6.1 KPIs Exibidos

| KPI | Descrição | Fórmula |
|-----|-----------|---------|
| Investimento Total | Soma de todo spend | `SUM(spend)` |
| Total de Registros | Cadastros completos | `SUM(complete_registration)` |
| Custo por Lead (CPL) | Custo por registro | `spend / registrations` |
| ROAS | Retorno sobre investimento | `revenue / spend` |
| Receita Total | Soma das receitas | `consulting_revenue + product_revenue` |
| Total de Deals | Cliques para WhatsApp | Soma do evento `CP_Click_deal` |
| Consultas Pagas | Pagamentos de consulta | Soma do evento `CP_Click_payment_consulting` |
| Orçamentos Pagos | Pagamentos de produto | Soma do evento `CP_Click_payment_product` |

### 6.2 Gráfico de Performance Diária

Exibe evolução diária de:
- Spend (investimento)
- Revenue (receita)
- CPL (custo por lead)
- ROAS

**Fonte dos dados**: Query `daily_data` da edge function `fetch-dashboard-data`

### 6.3 Funil de Conversão

```
Impressões → Cliques → LP Views → Registros → Deals → Pagamentos
```

Cada etapa mostra:
- Quantidade absoluta
- Taxa de conversão para próxima etapa

### 6.4 Top Campanhas e Adsets

Top 10 ordenados por `spend DESC`, exibindo:
- Nome
- Spend
- Registrations
- Deals
- Revenue
- CPL
- ROAS

---

## 7. Grid de Criativos - Regras de Negócio

### 7.1 Filtros Disponíveis

| Filtro | Tipo | Comportamento |
|--------|------|---------------|
| Date Range | Date picker | Obrigatório, default = última semana |
| Account | Select | Opcional, limpa campaign/adset quando muda |
| Campaign | Select | Opcional, filtrado por account |
| Adset | Select | Opcional, filtrado por campaign |
| Ad Name | Text | Busca parcial (ILIKE) |
| Media Type | Select | all/image/video/none |
| Sort By | Select | spend/roas/revenue/deals/registrations |
| Sort Order | Select | asc/desc |

### 7.2 Filtro em Cascata

Quando o usuário muda a conta:
1. Limpa campanha selecionada
2. Limpa adset selecionado
3. Recarrega lista de campanhas para nova conta

Quando o usuário muda a campanha:
1. Limpa adset selecionado
2. Recarrega lista de adsets para nova campanha

### 7.3 Card do Anúncio

Cada card exibe:
- **Mídia**: Imagem, thumbnail do vídeo, ou placeholder
- **Nome**: Nome do anúncio
- **Campanha**: Nome da campanha
- **Métricas principais**:
  - Spend
  - Revenue
  - ROAS
  - Registrations
  - Deals

### 7.4 Modal de Detalhes

Ao clicar no card, abre modal com:
- Mídia em tamanho maior
- Botão de upload de mídia (apenas admins)
- Todas as métricas detalhadas
- Funil de conversão do anúncio
- Taxas de conversão entre etapas
- Custo por conversão de cada tipo
- Ticket médio

---

## 8. Fórmulas e Métricas

### 8.1 Métricas Básicas

| Métrica | Fórmula | Descrição |
|---------|---------|-----------|
| **CPL** | `spend / registrations` | Custo por Lead/Registro |
| **CPC** | `spend / link_clicks` | Custo por Clique |
| **CPM** | `(spend / impressions) * 1000` | Custo por Mil Impressões |
| **CTR** | `(link_clicks / impressions) * 100` | Taxa de Clique (%) |
| **ROAS** | `revenue / spend` | Retorno sobre Investimento em Ads |

### 8.2 Taxas de Conversão do Funil

| Métrica | Fórmula |
|---------|---------|
| Click → LP | `(landing_page_views / link_clicks) * 100` |
| LP → Registration | `(registrations / landing_page_views) * 100` |
| Registration → Deal | `(deals / registrations) * 100` |
| Deal → Consulting | `(consulting_payments / deals) * 100` |
| Deal → Product | `(product_payments / deals) * 100` |

### 8.3 Custo por Conversão

| Métrica | Fórmula |
|---------|---------|
| Custo por Registro | `spend / registrations` |
| Custo por Deal | `spend / deals` |
| Custo por Consulta | `spend / consulting_payments` |
| Custo por Orçamento | `spend / product_payments` |

### 8.4 Ticket Médio

| Métrica | Fórmula |
|---------|---------|
| Ticket Consultas | `consulting_revenue / consulting_payments` |
| Ticket Orçamentos | `product_revenue / product_payments` |

---

## 9. Sistema de Autenticação

### 9.1 Fluxo de Login

```
1. Usuário acessa /auth
2. Insere email e senha
3. Sistema autentica via JWT
4. Se sucesso:
   - Redireciona para /criativos
5. Se falha:
   - Exibe mensagem de erro
```

### 9.2 Fluxo de Registro

```
1. Usuário acessa /auth
2. Seleciona tab "Register"
3. Insere email, senha e nome
4. Sistema cria usuário
5. Trigger cria perfil e atribui role "viewer"
6. Redireciona para /criativos
```

### 9.3 Proteção de Rotas

```typescript
// Em cada página protegida
useEffect(() => {
  if (!authLoading && !user) {
    navigate('/auth');
  }
}, [user, authLoading, navigate]);
```

### 9.4 Permissões por Role

| Ação | viewer | admin |
|------|--------|-------|
| Ver dashboard | ✅ | ✅ |
| Ver criativos | ✅ | ✅ |
| Upload de mídia | ❌ | ✅ |
| Deletar mídia | ❌ | ✅ |
| Gerenciar roles | ❌ | ✅ |

---

## 10. Guia de Migração

### 10.1 Componentes para Recriar

1. **Banco Externo (Neon/PostgreSQL)**
   - Tabela `facebook_ads_insights` com schema descrito
   - Índices para performance

2. **Banco da Aplicação (Neon/PostgreSQL)**
   - Tabelas: `profiles`, `user_roles`, `ad_media`
   - Funções: `has_role()`, `handle_new_user()`
   - Enum: `app_role`

3. **Blob Storage (Vercel Blob)**
   - Bucket público para mídias
   - Estrutura de pastas por ad_id

4. **APIs (Vercel Serverless Functions)**
   - `fetch-dashboard-data`
   - `fetch-ads`
   - `fetch-ad-details`
   - `fetch-filter-options`

5. **Autenticação**
   - Implementar JWT ou usar serviço como Auth.js/NextAuth

### 10.2 Variáveis de Ambiente Necessárias

```env
# Conexão com banco externo (Facebook Ads data)
EXTERNAL_DATABASE_URL=postgresql://...

# Conexão com banco da aplicação
DATABASE_URL=postgresql://...

# Blob Storage
BLOB_READ_WRITE_TOKEN=...

# Auth (se usar serviço externo)
AUTH_SECRET=...
```

### 10.3 Checklist de Migração

- [ ] Criar banco externo e importar dados do Facebook
- [ ] Criar banco da aplicação com schema completo
- [ ] Configurar Blob Storage
- [ ] Migrar Edge Functions para Serverless Functions
- [ ] Implementar autenticação
- [ ] Configurar RLS/Permissões
- [ ] Testar upload de mídia
- [ ] Testar propagação de mídia
- [ ] Testar todos os filtros
- [ ] Testar comparação de períodos

---

## 11. Anexos

### 11.1 Exemplo de Registro em `facebook_ads_insights`

```json
{
  "id": 12345,
  "ad_id": "23854789632140",
  "account_id": 1234567890,
  "campaign_name": "[CADASTRO] CLICK - BM ANUNCIANTE [SITE]",
  "adset_name": "ABERTO BR — Click_consulting",
  "ad_name": "AD602 - Variação 1",
  "date": "2024-01-15",
  "impressions": 15000,
  "link_clicks": 250,
  "landing_page_views": 180,
  "complete_registration": 45,
  "spend": 520.50,
  "video_view": 3200,
  "post_engagement": 890,
  "custom_conversion_data": [
    {"event_name": "CP_Click_deal", "value": 25, "monetary_value": 0},
    {"event_name": "CP_Click_payment_consulting", "value": 8, "monetary_value": 400.00},
    {"event_name": "CP_Click_payment_product", "value": 3, "monetary_value": 2250.00}
  ]
}
```

### 11.2 Exemplo de Registro em `ad_media`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ad_id": "23854789632140",
  "file_url": "https://storage.example.com/ad-media/AD602/1705312800000.jpg",
  "file_type": "image",
  "file_name": "criativo-janeiro.jpg",
  "thumbnail_url": null,
  "uploaded_by": "user-uuid-here",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```
