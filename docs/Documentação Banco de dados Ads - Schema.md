# Documentação da Tabela `facebook_ads_insights`

## Click Cannabis - Base de Dados de Anúncios

**Última atualização:** Janeiro de 2026  
**Banco de dados:** PostgreSQL (Click Ads)  
**Total de registros:** ~69.245  
**Período de dados:** Julho/2024 até o presente

---

## Visão Geral

A tabela `facebook_ads_insights` armazena os dados de performance dos anúncios do Facebook/Instagram Ads da Click Cannabis. Cada registro representa as métricas de **um anúncio específico em um dia específico**.

### Hierarquia de Análise

A estrutura segue a hierarquia do Facebook Ads Manager:

```
Conta (account_id)
  └── Campanha (campaign_name)
        └── Conjunto de Anúncios (adset_name)
              └── Criativo/Anúncio (ad_name)
```

### ⭐ O Mais Importante: Análise de Conversões Customizadas

**O foco principal da análise deve ser a coluna `custom_conversion_data`**, que contém os dados de conversão (deals, pagamentos de consultoria e produtos) detalhados por:

1. **Criativo (`ad_name`)** - Para identificar quais peças criativas geram mais conversões
2. **Conjunto de Anúncios (`adset_name`)** - Para avaliar segmentações e públicos
3. **Campanha (`campaign_name`)** - Para visão estratégica de performance

---

## Contas de Anúncios

| account_id | Descrição | Período | Registros | Uso Principal |
|------------|-----------|---------|-----------|---------------|
| **1** | Conta Principal | Set/2024 - atual | 40.624 | Campanhas de Leads, RMKT, Distribuição |
| **2** | Conta de Impulsionamento | Dez/2024 - atual | 1.263 | Stories, Impulsionamentos, Distribuição |
| **3** | BM Anunciante | Jul/2024 - atual | 27.358 | Testes de Criativos, Campanhas de Cadastro |

**Observação:** A conta 2 não possui conversões customizadas rastreadas, pois é usada apenas para distribuição de conteúdo.

---

## Colunas da Tabela

### 1. Identificadores

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `id` | integer | NOT NULL | ID único auto-incremento (chave primária) |
| `ad_id` | varchar | NOT NULL | ID único do anúncio no Facebook Ads |
| `account_id` | integer | NOT NULL | ID da conta de anúncios (1, 2 ou 3) |
| `campaign_name` | varchar | NOT NULL | Nome da campanha |
| `adset_name` | varchar | NOT NULL | Nome do conjunto de anúncios |
| `ad_name` | varchar | NULL | Nome do criativo/anúncio |
| `date` | date | NOT NULL | Data do registro de métricas |

### 2. Timestamps

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `created_at` | timestamptz | NOT NULL | Data/hora de criação do registro (default: now()) |
| `updated_at` | timestamptz | NOT NULL | Data/hora da última atualização (default: now()) |

---

### 3. Métricas de Alcance e Custo

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `impressions` | integer | NOT NULL | Número de vezes que o anúncio foi exibido |
| `spend` | numeric | NOT NULL | Valor gasto em R$ (moeda brasileira) |

**Métricas derivadas:**
- **CPM (Custo por Mil Impressões):** `(spend / impressions) * 1000`

---

### 4. Métricas de Tráfego

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `link_clicks` | integer | NOT NULL | Cliques no link do anúncio (default: 0) |
| `landing_page_views` | integer | NOT NULL | Visualizações da página de destino (default: 0) |
| `video_view` | integer | NOT NULL | Visualizações de vídeo (3+ segundos) (default: 0) |

**Métricas derivadas:**
- **CTR (Click-Through Rate):** `(link_clicks / impressions) * 100`
- **CPC (Custo por Clique):** `spend / link_clicks`
- **Taxa de Conversão LP:** `(landing_page_views / link_clicks) * 100`

**Colunas redundantes (mesmo valor):**
- `omni_landing_page_view` - Pode ser ignorada, usar `landing_page_views`

---

### 5. Métricas de Engajamento

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `post_engagement` | integer | NOT NULL | Total de engajamentos no post (default: 0) |
| `page_engagement` | integer | NOT NULL | Total de engajamentos na página (default: 0) |
| `post_reaction` | integer | NOT NULL | Reações no post (like, love, haha, etc.) (default: 0) |
| `comment` | integer | NOT NULL | Comentários no post (default: 0) |
| `like` | integer | NOT NULL | Curtidas na **página** (não no post!) (default: 0) |
| `post` | integer | NOT NULL | Compartilhamentos do post (default: 0) |
| `onsite_conversion_post_save` | integer | NOT NULL | Saves (salvar post no Instagram) (default: 0) |

**Composição do `post_engagement`:**
```
post_engagement ≈ video_view + post_reaction + comment + post (compartilhamentos) + outros
```

**Observação sobre `page_engagement`:** É ~91% igual ao `post_engagement`. A diferença ocorre quando há interações diretas com a página (como curtir a página).

**Observação sobre `like`:** Esta coluna registra curtidas na **página do Facebook**, não no post. Curtidas no post estão incluídas em `post_reaction`.

---

### 6. Métricas de Cadastro (Registro)

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `complete_registration` | integer | NOT NULL | Cadastros completos no site (default: 0) |

**Colunas redundantes (100% mesmo valor):**
- `offsite_conversion_fb_pixel_complete_registration` - Pode ser ignorada
- `omni_complete_registration` - Pode ser ignorada

**Métricas derivadas:**
- **CPL (Custo por Lead/Cadastro):** `spend / complete_registration`
- **Taxa de Conversão:** `(complete_registration / landing_page_views) * 100`

---

### 7. Conversões Customizadas ⭐ (MAIS IMPORTANTE)

| Coluna | Tipo | Nullable | Descrição |
|--------|------|----------|-----------|
| `has_custom_conversion` | boolean | NOT NULL | Flag: houve conversão customizada? (default: false) |
| `offsite_conversion_fb_pixel_custom` | integer | NOT NULL | Contagem total de todas as conversões custom (default: 0) |
| `custom_conversion_data` | jsonb | NULL | **Array com detalhes das conversões por tipo** |
| `action_values_data` | jsonb | NULL | **Array com valores monetários das conversões** |

---

## ⭐ Estrutura do `custom_conversion_data`

Esta é a **coluna mais importante** para análise de performance. É um array JSONB onde cada elemento representa um tipo de conversão.

### Estrutura de cada objeto:

```json
{
  "value": 2,
  "event_id": "771031809175466",
  "event_name": "CP_Click_payment_product",
  "action_type": "offsite_conversion.custom.771031809175466",
  "monetary_value": 1110
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `value` | integer | Quantidade de conversões deste tipo |
| `event_id` | string | ID único do evento no Facebook Pixel |
| `event_name` | string | Nome legível do evento |
| `action_type` | string | Tipo de ação no formato padrão Meta |
| `monetary_value` | numeric | Receita gerada em R$ (quando aplicável) |

---

### Eventos de Conversão Rastreados

A Click Cannabis rastreia **3 tipos de eventos** de conversão:

| Evento | Nome Interno | Descrição | Etapa do Funil | Tem Valor Monetário? |
|--------|--------------|-----------|----------------|----------------------|
| **CP_Click_deal** | Deal/Negociação | Lead qualificado / Deal criado no CRM | Meio de funil | ❌ Não |
| **CP_Click_payment_consulting** | Pagamento Consultoria | Pagamento de consultoria (geralmente R$50) | Fundo de funil | ✅ Sim |
| **CP_Click_payment_product** | Pagamento Produto | Pagamento de produto (valor variável) | Fundo de funil | ✅ Sim |

---

### Mapeamento de Event IDs por Conta

Cada conta de anúncios possui seus próprios IDs de evento (pixels diferentes):

| Account | Evento | Event ID |
|---------|--------|----------|
| **1** | CP_Click_deal | 758215670017680 |
| **1** | CP_Click_payment_consulting | 724248433698593 |
| **1** | CP_Click_payment_product | 773357648684093 |
| **3** | CP_Click_deal | 730433076389578 |
| **3** | CP_Click_payment_consulting | 1980885416002406 |
| **3** | CP_Click_payment_product | 771031809175466 |

**Observação:** A conta 2 não possui eventos de conversão customizada.

---

### Exemplo Real de `custom_conversion_data`

```json
[
  {
    "value": 2,
    "event_id": "771031809175466",
    "event_name": "CP_Click_payment_product",
    "action_type": "offsite_conversion.custom.771031809175466",
    "monetary_value": 1110
  },
  {
    "value": 7,
    "event_id": "1980885416002406",
    "event_name": "CP_Click_payment_consulting",
    "action_type": "offsite_conversion.custom.1980885416002406",
    "monetary_value": 350
  },
  {
    "value": 6,
    "event_id": "730433076389578",
    "event_name": "CP_Click_deal",
    "action_type": "offsite_conversion.custom.730433076389578"
  }
]
```

**Interpretação:** Neste dia/anúncio houve:
- 2 pagamentos de produto totalizando R$ 1.110
- 7 pagamentos de consultoria totalizando R$ 350
- 6 deals criados (sem valor monetário associado)

---

## ⭐ Estrutura do `action_values_data`

Array JSONB complementar que contém os valores monetários agregados:

```json
[
  {
    "value": "1460",
    "action_type": "offsite_conversion.fb_pixel_custom"
  },
  {
    "value": "1110",
    "action_type": "offsite_conversion.custom.771031809175466"
  },
  {
    "value": "350",
    "action_type": "offsite_conversion.custom.1980885416002406"
  }
]
```

| Campo | Descrição |
|-------|-----------|
| `offsite_conversion.fb_pixel_custom` | Valor total de todas as conversões custom |
| `offsite_conversion.custom.{event_id}` | Valor específico de cada tipo de conversão |

---

## Consultas SQL Essenciais

### 1. Performance por Criativo (ad_name)

```sql
SELECT 
  ad_name,
  SUM(spend) as investimento,
  SUM(complete_registration) as cadastros,
  ROUND(SUM(spend) / NULLIF(SUM(complete_registration), 0), 2) as cpl,
  SUM((SELECT SUM((elem->>'value')::int) 
       FROM jsonb_array_elements(custom_conversion_data) elem 
       WHERE elem->>'event_name' = 'CP_Click_deal')) as deals,
  SUM((SELECT SUM((elem->>'value')::int) 
       FROM jsonb_array_elements(custom_conversion_data) elem 
       WHERE elem->>'event_name' = 'CP_Click_payment_consulting')) as pagamentos_consulting,
  SUM((SELECT SUM((elem->>'value')::int) 
       FROM jsonb_array_elements(custom_conversion_data) elem 
       WHERE elem->>'event_name' = 'CP_Click_payment_product')) as pagamentos_product,
  SUM((SELECT SUM((elem->>'monetary_value')::numeric) 
       FROM jsonb_array_elements(custom_conversion_data) elem 
       WHERE elem->>'monetary_value' IS NOT NULL)) as receita_total
FROM facebook_ads_insights
WHERE date >= '2025-01-01'
GROUP BY ad_name
ORDER BY receita_total DESC NULLS LAST;
```

### 2. Performance por Conjunto de Anúncios (adset_name)

```sql
SELECT 
  adset_name,
  SUM(spend) as investimento,
  SUM(complete_registration) as cadastros,
  ROUND(SUM(spend) / NULLIF(SUM(complete_registration), 0), 2) as cpl,
  SUM((SELECT SUM((elem->>'value')::int) 
       FROM jsonb_array_elements(custom_conversion_data) elem 
       WHERE elem->>'event_name' = 'CP_Click_deal')) as deals,
  SUM((SELECT SUM((elem->>'monetary_value')::numeric) 
       FROM jsonb_array_elements(custom_conversion_data) elem)) as receita_total,
  ROUND(SUM((SELECT SUM((elem->>'monetary_value')::numeric) 
             FROM jsonb_array_elements(custom_conversion_data) elem)) / 
        NULLIF(SUM(spend), 0), 2) as roas
FROM facebook_ads_insights
WHERE date >= '2025-01-01'
GROUP BY adset_name
ORDER BY roas DESC NULLS LAST;
```

### 3. Performance por Campanha (campaign_name)

```sql
SELECT 
  campaign_name,
  SUM(spend) as investimento,
  SUM(impressions) as impressoes,
  SUM(link_clicks) as cliques,
  SUM(complete_registration) as cadastros,
  ROUND(SUM(spend) / NULLIF(SUM(complete_registration), 0), 2) as cpl,
  SUM((SELECT SUM((elem->>'value')::int) 
       FROM jsonb_array_elements(custom_conversion_data) elem 
       WHERE elem->>'event_name' = 'CP_Click_deal')) as deals,
  SUM((SELECT SUM((elem->>'value')::int) 
       FROM jsonb_array_elements(custom_conversion_data) elem 
       WHERE elem->>'event_name' LIKE '%payment%')) as pagamentos_totais,
  SUM((SELECT SUM((elem->>'monetary_value')::numeric) 
       FROM jsonb_array_elements(custom_conversion_data) elem)) as receita_total,
  ROUND(SUM((SELECT SUM((elem->>'monetary_value')::numeric) 
             FROM jsonb_array_elements(custom_conversion_data) elem)) / 
        NULLIF(SUM(spend), 0), 2) as roas
FROM facebook_ads_insights
WHERE date >= '2025-01-01'
GROUP BY campaign_name
ORDER BY receita_total DESC NULLS LAST;
```

### 4. Extrair Conversões do JSONB (Sintaxe Base)

```sql
-- Total de cada tipo de conversão
SELECT 
  elem->>'event_name' as evento,
  SUM((elem->>'value')::int) as conversoes,
  SUM((elem->>'monetary_value')::numeric) as receita
FROM facebook_ads_insights, 
     jsonb_array_elements(custom_conversion_data) as elem
WHERE date >= '2025-01-01'
GROUP BY elem->>'event_name'
ORDER BY receita DESC NULLS LAST;
```

### 5. Funil Completo por Período

```sql
SELECT 
  DATE_TRUNC('week', date) as semana,
  SUM(spend) as investimento,
  SUM(impressions) as impressoes,
  SUM(link_clicks) as cliques,
  SUM(landing_page_views) as lpv,
  SUM(complete_registration) as cadastros,
  SUM((SELECT SUM((elem->>'value')::int) 
       FROM jsonb_array_elements(custom_conversion_data) elem 
       WHERE elem->>'event_name' = 'CP_Click_deal')) as deals,
  SUM((SELECT SUM((elem->>'value')::int) 
       FROM jsonb_array_elements(custom_conversion_data) elem 
       WHERE elem->>'event_name' LIKE '%payment%')) as pagamentos,
  SUM((SELECT SUM((elem->>'monetary_value')::numeric) 
       FROM jsonb_array_elements(custom_conversion_data) elem)) as receita
FROM facebook_ads_insights
WHERE date >= '2025-01-01'
GROUP BY DATE_TRUNC('week', date)
ORDER BY semana;
```

---

## Métricas Calculadas (KPIs)

### Métricas de Eficiência

| Métrica | Fórmula | Descrição |
|---------|---------|-----------|
| **CPM** | `(spend / impressions) * 1000` | Custo por mil impressões |
| **CTR** | `(link_clicks / impressions) * 100` | Taxa de cliques |
| **CPC** | `spend / link_clicks` | Custo por clique |
| **CPL** | `spend / complete_registration` | Custo por lead/cadastro |
| **CPA** | `spend / conversões` | Custo por aquisição |
| **ROAS** | `receita / spend` | Retorno sobre investimento em anúncios |

### Taxas de Conversão do Funil

| Etapa | Fórmula | Descrição |
|-------|---------|-----------|
| **Clique → LP** | `(landing_page_views / link_clicks) * 100` | Taxa de chegada na LP |
| **LP → Cadastro** | `(complete_registration / landing_page_views) * 100` | Taxa de conversão da LP |
| **Cadastro → Deal** | `(deals / complete_registration) * 100` | Taxa de qualificação |
| **Deal → Pagamento** | `(pagamentos / deals) * 100` | Taxa de fechamento |

---

## Dados Históricos Consolidados

### Resumo por Conta (Todo o Período)

| Métrica | Account 1 | Account 3 | Total |
|---------|-----------|-----------|-------|
| Deals | 82.249 | 42.420 | **124.669** |
| Pagamentos Consulting | 28.276 | 26.124 | **54.400** |
| Pagamentos Product | 9.324 | 8.971 | **18.295** |
| Receita Consulting | R$ 1,12M | R$ 1,03M | **R$ 2,15M** |
| Receita Product | R$ 6,56M | R$ 6,31M | **R$ 12,88M** |
| **Receita Total** | R$ 7,68M | R$ 7,34M | **R$ 15,03M** |

---

## Observações Importantes

### Colunas que Podem Ser Ignoradas (Redundantes)

As seguintes colunas são redundantes e podem ser desconsideradas nas análises:

- `offsite_conversion_fb_pixel_complete_registration` → usar `complete_registration`
- `omni_complete_registration` → usar `complete_registration`
- `omni_landing_page_view` → usar `landing_page_views`

### Sobre `offsite_conversion_fb_pixel_custom`

Esta coluna contém a contagem **total** de todas as conversões customizadas do pixel, porém **não é igual** à soma dos valores em `custom_conversion_data`. Isso ocorre porque:

1. O `offsite_conversion_fb_pixel_custom` inclui TODOS os eventos custom do pixel
2. O `custom_conversion_data` detalha apenas os 3 eventos principais (deal, consulting, product)

**Recomendação:** Use sempre `custom_conversion_data` para análises detalhadas.

### Palavras Reservadas no SQL

As seguintes colunas são palavras reservadas no PostgreSQL e precisam de aspas duplas:

- `"like"` 
- `"comment"`
- `"post"`

Exemplo:
```sql
SELECT "like", "comment", "post" FROM facebook_ads_insights;
```

---

## Nomenclatura das Campanhas

As campanhas seguem um padrão de nomenclatura que indica seu objetivo:

| Prefixo | Significado |
|---------|-------------|
| `[F]` | Funil / Campanha de conversão |
| `[DIST]` | Distribuição / Alcance |
| `[RAC]` | Remarketing de Alcance |
| `[RMKT]` | Remarketing |
| `[CADASTRO]` | Campanha de cadastro |
| `[LEADS]` | Campanha de geração de leads |
| `[VENDAS]` | Campanha de vendas |
| `[IMPULSIONAR]` | Impulsionamento de post |
| `[TRÁFEGO]` | Campanha de tráfego |

### Sufixos Comuns

| Sufixo | Significado |
|--------|-------------|
| `[SITE]` | Direciona para o site |
| `[CBO]` | Campaign Budget Optimization |
| `[ABO]` | Ad Set Budget Optimization |
| `[R$50]` | Orçamento diário de R$50 |
| `click_payment_consulting` | Otimizado para pagamento de consultoria |
| `click_payment_product` | Otimizado para pagamento de produto |

---

## Workflow de Acesso aos Dados

### Via n8n (Claude Ads)

**Workflow ID:** `WQN60q9rd0iOGH4m`  
**Nome:** Claude Ads  
**Endpoint:** POST `/webhook/claude-ads`

**Payload:**
```json
{
  "query": "SELECT * FROM facebook_ads_insights LIMIT 10;"
}
```

---

## Contato e Suporte

Para dúvidas sobre a estrutura de dados ou implementação de novas métricas, consulte a equipe de dados da Click Cannabis.

---

*Documento gerado em Janeiro de 2026*