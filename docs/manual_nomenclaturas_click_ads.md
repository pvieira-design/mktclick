# 📋 MANUAL DE NOMENCLATURAS
## Facebook & Instagram Ads — Click Cannabis

**Versão 2.0** | Janeiro 2026  
**Base de dados:** ~69.245 registros | Julho/2024 - Janeiro/2026

---

# ÍNDICE

1. [Visão Geral da Estrutura](#1-visão-geral-da-estrutura)
2. [Contas de Anúncios](#2-contas-de-anúncios)
3. [Nomenclatura de Campanhas](#3-nomenclatura-de-campanhas)
4. [Nomenclatura de Conjuntos de Anúncios](#4-nomenclatura-de-conjuntos-de-anúncios)
5. [Nomenclatura de Criativos](#5-nomenclatura-de-criativos)
6. [Embaixadores e Produtores](#6-embaixadores-e-produtores)
7. [Séries de Conteúdo](#7-séries-de-conteúdo)
8. [Temas Médicos e Nichos](#8-temas-médicos-e-nichos)
9. [Guia de Identificação Rápida](#9-guia-de-identificação-rápida)
10. [Exemplos Práticos Completos](#10-exemplos-práticos-completos)
11. [Checklist de Criação](#11-checklist-de-criação)

---

# 1. VISÃO GERAL DA ESTRUTURA

A Click Cannabis utiliza uma estrutura hierárquica de nomenclaturas para organizar e rastrear todas as campanhas de anúncios pagos no Facebook e Instagram Ads.

## 1.1 Hierarquia do Facebook Ads Manager

```
Conta (account_id)
  └── Campanha (campaign_name)
        └── Conjunto de Anúncios (adset_name)
              └── Criativo/Anúncio (ad_name)
```

## 1.2 Propósito das Nomenclaturas

| Nível | Função Principal | Informações Codificadas |
|-------|------------------|------------------------|
| **Campanha** | Estratégia e objetivo macro | Objetivo, otimização, orçamento, tipo de campanha |
| **Conjunto** | Segmentação e entrega | Público, temperatura, formato, região, otimização |
| **Criativo** | Identificação do asset | ID, tipo de mídia, produtor, tema, duração, embaixador |

## 1.3 Evolução das Nomenclaturas

A nomenclatura evoluiu ao longo do tempo:

| Período | Formato | Exemplo |
|---------|---------|---------|
| **Legado (AD 01-200)** | `AD XX - [FORMATO] Descrição - EMBAIXADOR` | `AD 91 - [VID] Dr. João Responde - Insônia` |
| **Transição (AD 200-450)** | `AD XXX \| FORMATO \| Descrição EMBAIXADOR` | `AD 419 \| VID \| OVRL \| STORY \| LEOTX - Bom dia` |
| **Moderno (AD 450+)** | `ADXXX_DATA_OBJETIVO_PRODUTOR_TEMA_QUALIDADE_FORMATO_DURAÇÃO` | `AD598_LEAD_OSLLO_UNBOXINGINSONIA_MED_VID_45S` |

---

# 2. CONTAS DE ANÚNCIOS

## 2.1 Visão Geral das Contas

| ID | Nome | Uso Principal | Período | Registros | Conversões |
|----|------|---------------|---------|-----------|------------|
| **1** | Conta Principal | Leads, RMKT, Distribuição | Set/2024 - atual | 40.624 | ✅ Sim |
| **2** | Impulsionamento | Stories, Boost, Distribuição | Dez/2024 - atual | 1.263 | ❌ Não |
| **3** | BM Anunciante | Testes, Cadastro | Jul/2024 - atual | 27.358 | ✅ Sim |

## 2.2 Eventos de Conversão Customizada

### Conta 1 (Principal)
| Evento | Event ID | Descrição |
|--------|----------|-----------|
| `CP_Click_deal` | 758215670017680 | Lead qualificado/Deal criado |
| `CP_Click_payment_consulting` | 724248433698593 | Pagamento de consultoria |
| `CP_Click_payment_product` | 773357648684093 | Pagamento de produto |

### Conta 3 (BM Anunciante)
| Evento | Event ID | Descrição |
|--------|----------|-----------|
| `CP_Click_deal` | 730433076389578 | Lead qualificado/Deal criado |
| `CP_Click_payment_consulting` | 1980885416002406 | Pagamento de consultoria |
| `CP_Click_payment_product` | 771031809175466 | Pagamento de produto |

> ⚠️ **Nota:** A Conta 2 não possui eventos de conversão customizada pois é usada apenas para distribuição de conteúdo.

---

# 3. NOMENCLATURA DE CAMPANHAS

## 3.1 Estrutura Padrão

```
[OBJETIVO] [TIPO] [CONFIGURAÇÃO] [EVENTO_OTIMIZAÇÃO] [BUDGET] [DESTINO]
```

**Exemplo:**
```
[F] [LEADS] [R$50] [BESTADS] [click_payment_consulting] [CBO] [SITE]
```

## 3.2 Prefixos de Objetivo

| Tag | Significado | Descrição | Temperatura |
|-----|-------------|-----------|-------------|
| `[F]` | Funil | Campanha de conversão principal | Frio/Morno |
| `[DIST]` | Distribuição | Campanhas de alcance e awareness | Frio |
| `[RMKT]` | Remarketing | Retargeting de públicos quentes | Quente |
| `[RAC]` | Remarketing Alcance | Remarketing com objetivo de alcance | Quente |
| `[CADASTRO]` | Cadastro | Foco em complete registration | Frio |
| `[LEADS]` | Leads | Geração de leads qualificados | Frio/Morno |
| `[VENDAS]` | Vendas | Campanhas de conversão de venda | Quente |
| `[IMPULSIONAR]` | Impulsionamento | Boost de publicações orgânicas | Frio |
| `[TRÁFEGO]` | Tráfego | Direcionamento para o site | Frio |
| `ADV+` | Advantage+ | Campanhas com IA do Meta | Variável |
| `Story` | Stories | Campanhas de stories orgânicos | Frio |

## 3.3 Sufixos de Configuração de Orçamento

| Tag | Significado | Descrição |
|-----|-------------|-----------|
| `[CBO]` | Campaign Budget Optimization | Orçamento otimizado pela campanha |
| `[ABO]` | Ad Set Budget Optimization | Orçamento definido por conjunto |
| `[R$30]` | Orçamento R$30 | Orçamento diário de R$30 (testes) |
| `[R$50]` | Orçamento R$50 | Orçamento diário de R$50 (escala) |
| `[R$100]` | Orçamento R$100 | Orçamento diário de R$100 |
| `[R$150]` | Orçamento R$150 | Orçamento diário de R$150 |
| `ESCALA` | Escala | Campanha em fase de escala |

## 3.4 Sufixos de Evento de Otimização

| Tag | Evento | Funil |
|-----|--------|-------|
| `click_payment_consulting` | Pagamento de consultoria | Fundo |
| `click_payment_product` | Pagamento de produto | Fundo |
| `click_deal` | Criação de deal | Meio |
| `complete_registration` | Cadastro completo | Topo |

## 3.5 Sufixos de Configuração

| Tag | Significado | Descrição |
|-----|-------------|-----------|
| `[SITE]` | Destino Site | Direciona para o site da Click |
| `[TESTE DE CRIATIVOS]` | Teste | Campanha de teste de criativos |
| `[BESTADS]` | Best Ads | Criativos campeões escalados |
| `[IG]` | Instagram | Específico para Instagram |
| `[FB]` | Facebook | Específico para Facebook |

## 3.6 Exemplos de Campanhas Completas

```
✅ [F] [LEADS] [TESTE DE CRIATIVOS] [click_payment_consulting] [ABO] [SITE]
   → Funil de leads, teste de criativos, otimizado para consultoria, ABO

✅ [F] [LEADS] [R$50] [BESTADS] [click_payment_consulting] [CBO] [SITE]
   → Funil de leads, best ads escalados R$50, CBO

✅ [RMKT] [LEADS] [click_payment_consulting] [ABO] [SITE]
   → Remarketing de leads, otimizado para consultoria

✅ [DIST] RECONHECIMENTO [IG] DISTRIBUICAO PARA O PERFIL
   → Distribuição de reconhecimento no Instagram

✅ ADV+ [CADASTRO] [SITE]
   → Advantage+ otimizado para cadastro
```

---

# 4. NOMENCLATURA DE CONJUNTOS DE ANÚNCIOS

## 4.1 Estrutura Padrão

```
[ADVANTAGE] [TEMPERATURA] [REGIÃO] [ORÇAMENTO] [FORMATO] [DESCRIÇÃO] - [EVENTO] — [IDADE]
```

**Exemplo:**
```
ADV+ [ABERTO] [R$50] [STORY] Best ads - LEODOTAXI - click_payment_consulting — 25+
```

## 4.2 Temperatura do Público

| Tag | Temperatura | Descrição | Uso |
|-----|-------------|-----------|-----|
| `ABERTO` | 🔵 Frio | Público aberto sem segmentação | Prospecção |
| `ADV+ [ABERTO]` | 🔵 Frio | Público aberto com Advantage+ | Prospecção otimizada |
| `[RMKT]` | 🔴 Quente | Público de remarketing | Retargeting |
| `ADV+ [RMKT]` | 🔴 Quente | Remarketing com Advantage+ | Retargeting otimizado |
| `LLK 1%` | 🟡 Morno | Lookalike 1% (mais similar) | Expansão qualificada |
| `LLK 2%` | 🟡 Morno | Lookalike 2% | Expansão |
| `LLK 3%` | 🟡 Morno | Lookalike 3% | Expansão ampla |
| `INTERESSE` | 🔵 Frio | Segmentação por interesses | Prospecção segmentada |

## 4.3 Segmentação Geográfica

| Tag | Região | Cobertura |
|-----|--------|-----------|
| `BR` / `BRASIL` | Nacional | Brasil inteiro |
| `RJ` / `RIO` | Rio de Janeiro | Estado do RJ |
| `SP` / `SAO PAULO` | São Paulo | Estado de SP |
| `SANTOS` | Santos | Cidade de Santos - SP |
| `BH` | Belo Horizonte | Cidade de BH - MG |
| `SUDESTE` | Sudeste | SP, RJ, MG, ES |
| `SUL` | Sul | PR, SC, RS |

## 4.4 Segmentação Demográfica

| Tag | Significado | Descrição |
|-----|-------------|-----------|
| `[H]` | Homens | Apenas público masculino |
| `[M]` | Mulheres | Apenas público feminino |
| `25+` | Idade 25+ | Idade mínima 25 anos |
| `35+` | Idade 35+ | Idade mínima 35 anos |
| `18+` | Idade 18+ | Idade mínima 18 anos |
| `45+` | Idade 45+ | Idade mínima 45 anos |
| `[25-50]` | Faixa 25-50 | Faixa etária 25 a 50 anos |
| `[35-65]` | Faixa 35-65 | Faixa etária 35 a 65 anos |
| `[45-65]` | Faixa 45-65 | Faixa etária 45 a 65 anos |

## 4.5 Eventos de Otimização

| Tag | Evento | Descrição |
|-----|--------|-----------|
| `click_payment_consulting` | Consultoria | Otimizado para pagamento de consultoria |
| `click_payment_product` | Produto | Otimizado para pagamento de produto |
| `CLICK DEAL` | Deal | Otimizado para criação de deal |
| `BOTAO SITE` | Clique | Otimizado para clique no site |
| `COMPLETE REGISTRATION` | Cadastro | Otimizado para cadastro |
| `Visita ao perfil` | Perfil | Otimizado para visita ao perfil |
| `[ENGAJAMENTO]` | Engajamento | Otimizado para engajamento |
| `[RECONHECIMENTO]` | Reconhecimento | Otimizado para awareness |

## 4.6 Posicionamentos (Placements)

| Tag | Posicionamento | Formato |
|-----|----------------|---------|
| `[STORY]` / `Stories` | Stories | Vertical 9:16 |
| `[FEED]` / `POST FEED` | Feed | Quadrado/Vertical |
| `[CARROSSEL]` | Carrossel | Múltiplas imagens |
| `[POST]` | Post | Publicação padrão |
| `[REELS]` | Reels | Vídeo vertical curto |
| `[REACTSTORY]` | React Story | Reação em stories |
| `ABERTOSTORY` | Story Aberto | Story formato aberto |

## 4.7 Segmentação por Interesse/Nicho

| Tag | Nicho | Público-alvo |
|-----|-------|--------------|
| `[CORRIDA]` | Corrida | Corredores, maratonistas |
| `[LUTAS]` | Lutas | MMA, Jiu-Jitsu, Boxe |
| `[ESPORTES]` | Esportes | Atletas em geral |
| `SURF` | Surf | Surfistas |
| `[CROSSFIT]` | CrossFit | Praticantes de CrossFit |
| `[DORMIR]` / `INSONIA` | Sono | Pessoas com insônia |
| `[TRABALHO]` | Trabalho | Profissionais, executivos |
| `Festa` / `tabaco` | Social | Festas, fumantes |
| `CURSOS DE ESQUERDA` | Universitários | Estudantes de humanas |
| `MÃES` / `MATERNIDADE` | Maternidade | Mães e gestantes |
| `[ANSIEDADE]` | Saúde Mental | Pessoas com ansiedade |
| `[DOR]` | Dor Crônica | Pessoas com dores |

## 4.8 Públicos de Remarketing

### Públicos de Inclusão
| Tag | Público | Janela |
|-----|---------|--------|
| `PageView 60D` | Visitantes do site | 60 dias |
| `PageView 180D` | Visitantes do site | 180 dias |
| `VIDEO VIEW 75% 365D` | Assistiram 75% do vídeo | 365 dias |
| `VIDEO VIEW 50% 180D` | Assistiram 50% do vídeo | 180 dias |
| `Engajamento [IG] 60D` | Engajaram no Instagram | 60 dias |
| `Engajamento [FB] 60D` | Engajaram no Facebook | 60 dias |
| `Seguidores` | Seguidores do perfil | Atual |
| `Complete registration 15D` | Cadastraram recentemente | 15 dias |
| `[Entrou Wpp]` | Clicaram no WhatsApp | Variável |
| `LISTA QUENTE` | Leads quentes do CRM | Atual |

### Públicos de Exclusão
| Tag | Público | Propósito |
|-----|---------|-----------|
| `> Cadastrados 15D` | Cadastrados recentemente | Evitar duplicidade |
| `-> Purchase 15D` | Compraram recentemente | Evitar saturação |
| `Excluir clientes` | Clientes ativos | Foco em novos leads |

## 4.9 Exemplos de Conjuntos Completos

```
✅ ADV+ [ABERTO] [R$30] [STORY] Teste de criativos 20.10.25 - LEODOTAXI - click_payment_consulting — 25+
   → Advantage+ aberto, R$30/dia, stories, teste, Leo do Taxi, consultoria, 25+

✅ ADV+ [ABERTO] [R$50] [STORY] Best ads - LEODOTAXI - click_payment_consulting — 25+
   → Advantage+ aberto, R$50/dia, stories, best ads escalados, Leo do Taxi, 25+

✅ 00 - [ADV+] [RMKT BRASIL] - PageView 60D + VIDEO VIEW 75% 365D - click_payment_consulting
   → Remarketing Brasil, PageView + Video View, otimizado consultoria

✅ ADV+ Visita ao perfil — Nem tudo é oq parece ep.12
   → Advantage+ otimizado para visita ao perfil, série específica

✅ LLK 1% - Pagantes - BRASIL - 25+ - click_payment_product
   → Lookalike 1% de pagantes, Brasil, 25+, otimizado produto
```

---

# 5. NOMENCLATURA DE CRIATIVOS

## 5.1 Formato Moderno (AD 450+)

```
ADXXX_YYYYMMDD_OBJETIVO_PRODUTOR_TEMA_QUALIDADE_FORMATO_DURAÇÃO_NICHO
```

### Componentes

| Posição | Campo | Valores | Obrigatório |
|---------|-------|---------|-------------|
| 1 | ID | AD001-AD999 | ✅ |
| 2 | Data | YYYYMMDD (ex: 20251215) | ⚪ Opcional |
| 3 | Objetivo | LEAD, ALL, RTG, MOTIONS | ✅ |
| 4 | Produtor | OSLLO, CLICK, OUTRO | ✅ |
| 5 | Tema | Descrição do conteúdo | ✅ |
| 6 | Qualidade | HIGH, MED, LOW | ✅ |
| 7 | Formato | VID, IMG, CARROSSEL | ✅ |
| 8 | Duração | 15S, 30S, 45S, 60S, 90S | ⚪ Vídeos |
| 9 | Nicho | SONO, THCV, IMPOTENCIA | ⚪ Opcional |

### Exemplo Completo Decodificado:
```
AD598_20251210_LEAD_OSLLO_UNBOXINGINSONIA_MED_VID_45S_SONO

AD598          → ID do criativo: 598
20251210       → Data: 10 de Dezembro de 2025
LEAD           → Objetivo: Geração de leads
OSLLO          → Produtor: Oslo (produtora principal)
UNBOXINGINSONIA → Tema: Vídeo de unboxing sobre insônia
MED            → Qualidade: Média
VID            → Formato: Vídeo
45S            → Duração: 45 segundos
SONO           → Nicho: Sono/Insônia
```

## 5.2 Formato Legado (AD 01-200)

```
AD XX - [FORMATO] Descrição - VARIAÇÃO — EMBAIXADOR
```

### Exemplos:
```
AD 91 - Dr. João Responde - Vídeo 14 Insônia_V2_SEM MUSICA — DRJOAO
AD 97 - [IMG] Foto 2 senhoras - FT 290
AD XX - [VID] After Movie — Cópia
```

## 5.3 Formato de Transição (AD 200-450)

```
AD XXX | FORMATO | OVERLAY | PLACEMENT | Descrição — EMBAIXADOR
```

### Exemplos:
```
AD 419 | VID | OVRL | STORY | LEOTX - Bom dia
AD 456 | VID | OVRL | STORY | Leo do taxi - Cashback - 10.10.25 LEOTX
```

## 5.4 Objetivos do Criativo

| Tag | Objetivo | Uso |
|-----|----------|-----|
| `LEAD` | Geração de leads | Campanhas de conversão frias |
| `ALL` | Uso geral | Distribuição e awareness |
| `RTG` | Retargeting | Campanhas de remarketing |
| `MOTIONS` | Motion graphics | Animações sazonais/institucionais |
| `OVRL` | Overlay | Vídeo com overlay de texto |

## 5.5 Produtores

| Tag | Produtor | Tipo de Conteúdo |
|-----|----------|------------------|
| `OSLLO` | Oslo Produções | Conteúdo profissional HIGH/MED |
| `CLICK` | Click Cannabis | Conteúdo interno |
| `OUTRO` | Terceiros/UGC | User Generated Content |

## 5.6 Níveis de Qualidade

| Tag | Qualidade | Descrição | Uso |
|-----|-----------|-----------|-----|
| `HIGH` | Alta | Produção profissional, iluminação, som | Hero content, institucionais |
| `MED` | Média | Boa qualidade, semi-profissional | Conteúdo regular |
| `LOW` | Baixa | UGC, celular, orgânico | Testes, autenticidade |

## 5.7 Formatos de Mídia

| Tag | Formato | Especificação |
|-----|---------|---------------|
| `VID` | Vídeo | Vídeo padrão |
| `IMG` | Imagem | Imagem estática |
| `CARROSSEL` | Carrossel | Múltiplas imagens/vídeos |
| `[MOTION]` / `MOTION` | Motion Graphics | Animação gráfica |
| `[REELS]` | Reels | Vídeo vertical curto |

## 5.8 Posicionamentos no Criativo

| Tag | Posicionamento | Aspect Ratio |
|-----|----------------|--------------|
| `POST FEED` / `[FEED]` | Feed | 1:1 ou 4:5 |
| `POST STORY` / `[STORY]` | Stories | 9:16 |
| `VERTICAL` | Vertical | 9:16 |
| `HORIZONTAL` | Horizontal | 16:9 |
| `SQUARE` | Quadrado | 1:1 |

## 5.9 Durações

| Tag | Duração | Uso Recomendado |
|-----|---------|-----------------|
| `15S` | 15 segundos | Stories, teasers, trends |
| `30S` | 30 segundos | Ads padrão, awareness |
| `45S` | 45 segundos | Conteúdo educativo curto |
| `60S` | 60 segundos | Storytelling, depoimentos |
| `90S` | 90 segundos | Conteúdo aprofundado |
| `120S` | 2 minutos | Documentários curtos |
| `150S` | 2:30 minutos | Conteúdo longo |
| `180S` | 3 minutos | Hero content |

## 5.10 Sufixos Especiais

| Sufixo | Significado | Descrição |
|--------|-------------|-----------|
| `— Cópia` | Duplicação | Anúncio copiado para outro conjunto |
| `COPYNOVA` | Nova copy | Mesma mídia, texto diferente |
| `V2`, `V3` | Versão | Versão do criativo |
| `_MUSICA` | Com música | Versão com trilha sonora |
| `_SEM MUSICA` | Sem música | Versão sem trilha |
| `[LEG]` | Legendado | Vídeo com legendas |
| `— Principal` | Principal | Versão principal do criativo |

---

# 6. EMBAIXADORES E PRODUTORES

## 6.1 Embaixadores Ativos

| Tag | Nome | Tipo | Conteúdo Principal |
|-----|------|------|-------------------|
| `DRJOAO` | Dr. João | Médico parceiro | Educativo, Q&A, Caixinha |
| `LEOTX` / `LEODOTAXI` / `LEODOTAXI` | Leo do Taxi | Influenciador | Lifestyle, Stories diários |
| `PEDROM` / `PEDRO_MACHADO` | Pedro Machado | Lutador | Esportes, performance |
| `RACHEL` | Rachel Apollonio | Atleta | Corrida, performance |
| `IRWEN` | Irwen | Taxista | Depoimento, lifestyle |
| `BRUNA` / `BRUNAWT` | Bruna | Influenciadora | Lifestyle, bem-estar |
| `GUI VAZ` / `GUIVAZ` | Gui Vaz | Atleta | Esportes, eventos |
| `BABIROSA` | Babi Rosa | UGC Creator | Conteúdo autêntico |
| `GIOROSSI` | Gio Rossi | UGC Creator | Bem-estar, saúde mental |
| `LUCALDI` | Luca Ldi | UGC Creator | Fitness, treino |
| `BRUNOT` | Bruno T | UGC Creator | Lifestyle masculino |
| `TAMIRESB` | Tamires B | UGC Creator | Bem-estar feminino |
| `ANACLARAW` | Ana Clara W | UGC Creator | Lifestyle |

## 6.2 Produtores de Conteúdo

| Tag | Produtor | Especialidade |
|-----|----------|---------------|
| `OSLLO` | Oslo Produções | Vídeos profissionais, podcasts, vlogs |
| `CLICK` | Click Cannabis | Conteúdo interno, institucional |
| `OUTRO` | Diversos | UGC, terceiros |
| `FELIPEARCHER` | Felipe Archer | Fotografia |

## 6.3 Tipos de Conteúdo por Embaixador

### Dr. João (DRJOAO)
- `Dr. João Responde` — Série de Q&A
- `Caixinha de Perguntas` — Perguntas do público
- `Mito ou Verdade` — Conteúdo educativo

### Leo do Taxi (LEOTX)
- `Baseado em Verdades` — Série principal
- `Bom dia` — Stories matinais
- `Gotinhas mágicas` — Lifestyle CBD

### Oslo (OSLLO)
- `Podcast` — Cortes de podcast
- `Vlog` — Vlogs de pacientes
- `Unboxing` — Unboxing de produtos
- `Trend` / `React` — Trends e reacts

---

# 7. SÉRIES DE CONTEÚDO

## 7.1 Séries Principais

| Série | Descrição | Formato | Embaixador |
|-------|-----------|---------|------------|
| **Nem tudo é o que parece** | Série de awareness ep. 1-14+ | Vídeo storytelling | Geral |
| **Baseado em Verdades** | Série com Leo do Taxi ep. 1-7+ | Stories, lifestyle | LEOTX |
| **Mito ou Verdade** | Educativo com Dr. João | Q&A, educativo | DRJOAO |
| **Além da consulta** | Depoimentos de pacientes ep. 1-2+ | Depoimentos | Pacientes |
| **Caixinha de Perguntas** | Q&A do Instagram | Stories Q&A | DRJOAO |
| **Dr. João Responde** | Respostas educativas | Vídeo educativo | DRJOAO |
| **PÍLULA** | Conteúdo educativo curto | 15-30s | Variado |
| **HERO** | Conteúdos hero/institucionais | Alta produção | Variado |

## 7.2 Formatos de Série no Nome

```
Nem tudo é oq parece ep 12 - 06.11.25
Baseado em Verdades, ep. 5 - 15.10.25
Além da consulta ep.1 - 12.11.24
Dr. João Responde - Vídeo 14 Insônia
Caixinha 3 - Ansiedade e depre - 22.09.24
PÍLULA 04
HERO_01
```

---

# 8. TEMAS MÉDICOS E NICHOS

## 8.1 Condições de Saúde

| Tag | Condição | Público-alvo |
|-----|----------|--------------|
| `INSONIA` / `SONO` / `DORMIR` | Insônia | Pessoas com dificuldade para dormir |
| `ANSIEDADE` / `ANSIEDA` | Ansiedade | Pessoas com transtorno de ansiedade |
| `DEPRE` / `DEPRESSAO` | Depressão | Pessoas com depressão |
| `DOR` / `DORES` | Dor crônica | Pessoas com dores crônicas |
| `FIBROMIALGIA` | Fibromialgia | Pacientes com fibromialgia |
| `AUTISMO` | Autismo | Famílias com autistas |
| `ENXAQUECA` | Enxaqueca | Pessoas com enxaquecas |
| `IMPOTENCIA` / `IMPOTÊNCIA` | Impotência | Saúde sexual masculina |
| `ALCOOLISMO` | Alcoolismo | Dependência de álcool |
| `TABAGISMO` | Tabagismo | Fumantes querendo parar |

## 8.2 Canabinoides Específicos

| Tag | Canabinoide | Indicação Principal |
|-----|-------------|---------------------|
| `CBD` | Canabidiol | Ansiedade, inflamação |
| `THC` | Tetrahidrocanabinol | Dor, apetite |
| `THCV` | Tetraidrocanabivarina | Emagrecimento, energia |
| `CBG` | Canabigerol | Foco, concentração |
| `CBN` | Canabinol | Sono |
| `CAMA` | CBD para ansiedade | Ansiedade específica |

## 8.3 Nichos de Estilo de Vida

| Tag | Nicho | Conteúdo |
|-----|-------|----------|
| `OZEMPIC` | Emagrecimento | Alternativa ao Ozempic |
| `CORRIDA` | Runners | Performance, recuperação |
| `LUTAS` | Lutadores | MMA, recuperação, foco |
| `SURF` | Surfistas | Lifestyle, performance |
| `TREINO` / `FOCARNOTREINO` | Fitness | Academia, performance |
| `TRABALHO` | Profissionais | Estresse, foco |
| `MATERNIDADE` | Mães | Bem-estar maternal |

---

# 9. GUIA DE IDENTIFICAÇÃO RÁPIDA

## 9.1 Identificar Público Frio

✅ **Campanha:** `[F]` ou `[CADASTRO]` ou `[LEADS]`  
✅ **Conjunto:** `ABERTO` ou `ADV+ [ABERTO]` ou `INTERESSE`  
✅ **Sem tags de remarketing**

```
Exemplo:
Campanha: [F] [LEADS] [TESTE DE CRIATIVOS] [click_payment_consulting] [ABO] [SITE]
Conjunto: ADV+ [ABERTO] [R$30] [STORY] Teste de criativos - click_payment_consulting — 25+
```

## 9.2 Identificar Público Quente (Remarketing)

✅ **Campanha:** `[RMKT]` ou `[RAC]`  
✅ **Conjunto:** `[RMKT]` ou `PageView` ou `VIDEO VIEW` ou `Engajamento`  

```
Exemplo:
Campanha: [RMKT] [LEADS] [click_payment_consulting] [ABO] [SITE]
Conjunto: 00 - [ADV+] [RMKT BRASIL] - PageView 60D + VIDEO VIEW 75% 365D - click_payment_consulting
```

## 9.3 Identificar Campanha de Distribuição

✅ **Campanha:** `[DIST]` ou `[IMPULSIONAR]` ou `Story`  
✅ **Conjunto:** `Visita ao perfil` ou `[ENGAJAMENTO]` ou `[RECONHECIMENTO]`  

```
Exemplo:
Campanha: [DIST] RECONHECIMENTO [IG] DISTRIBUICAO PARA O PERFIL
Conjunto: ADV+ Visita ao perfil — Nem tudo é oq parece ep.12
```

## 9.4 Identificar Teste de Criativo

✅ **Campanha:** `[TESTE DE CRIATIVOS]` ou `[ABO]`  
✅ **Conjunto:** `[R$30]` (orçamento baixo para teste)  

```
Exemplo:
Campanha: [F] [LEADS] [TESTE DE CRIATIVOS] [click_payment_consulting] [ABO] [SITE]
Conjunto: ADV+ [ABERTO] [R$30] [STORY] Teste de criativos 20.10.25 - click_payment_consulting — 25+
```

## 9.5 Identificar Criativos Escalados (Winners)

✅ **Campanha:** `[BESTADS]` ou `ESCALA`  
✅ **Conjunto:** `Best ads` ou `[R$50]` (orçamento maior)  
✅ **Criativo:** `[R$50]` no prefixo

```
Exemplo:
Campanha: [F] [LEADS] [R$50] [BESTADS] [click_payment_consulting] [CBO] [SITE]
Conjunto: ADV+ [ABERTO] [R$50] [STORY] Best ads - LEODOTAXI - click_payment_consulting — 25+
Criativo: [R$50] AD 460 | VID | OVRL | STORY | Leo do taxi - Uso Diário
```

## 9.6 Identificar Conteúdo por Embaixador

| Buscar por | Embaixador |
|------------|------------|
| `DRJOAO`, `Dr. João`, `Dr João` | Dr. João |
| `LEOTX`, `LEODOTAXI`, `Leo do taxi` | Leo do Taxi |
| `PEDROM`, `PEDRO_MACHADO`, `Pedro Machado` | Pedro Machado |
| `RACHEL`, `Rachel Apollonio` | Rachel |
| `OSLLO`, `Oslo` | Produtora Oslo |

---

# 10. EXEMPLOS PRÁTICOS COMPLETOS

## 10.1 Teste de Criativo Novo

```
📁 CAMPANHA
[F] [LEADS] [TESTE DE CRIATIVOS] [click_payment_consulting] [ABO] [SITE]

📂 CONJUNTO
ADV+ [ABERTO] [R$30] [STORY] Teste de criativos 20.10.25 - LEODOTAXI - click_payment_consulting — 25+

📄 CRIATIVO
AD 419 [R$30] | VID | OVRL | STORY | Leo do taxi - Bom dia — LEOTX
```

**Decodificação:**
- Funil de leads, teste de criativos, otimizado para consultoria, ABO
- Advantage+ aberto, R$30/dia, stories, 25+
- Vídeo com overlay, story, Leo do Taxi, tema "Bom dia"

---

## 10.2 Escala de Winner

```
📁 CAMPANHA
[F] [LEADS] [R$50] [BESTADS] [click_payment_consulting] [CBO] [SITE]

📂 CONJUNTO
ADV+ [ABERTO] [R$50] [STORY] Best ads - LEODOTAXI - click_payment_consulting — 25+

📄 CRIATIVO
[R$50] AD 460 | VID | OVRL | STORY | Leo do taxi - Uso Diário - LEOTX
```

**Decodificação:**
- Funil de leads, best ads escalados, R$50/dia, CBO
- Advantage+ aberto, R$50/dia (escala), best ads
- Criativo campeão escalado, vídeo com overlay

---

## 10.3 Remarketing

```
📁 CAMPANHA
[RMKT] [LEADS] [click_payment_consulting] [ABO] [SITE]

📂 CONJUNTO
00 - [ADV+] [RMKT BRASIL] - PageView 60D + VIDEO VIEW 75% 365D - click_payment_consulting

📄 CRIATIVO
AD 395 [R$50] | VID | Caixinha de Perguntas DRJOAO | Pergunta 05
```

**Decodificação:**
- Remarketing de leads, otimizado para consultoria
- Público: visitantes do site (60D) + viewers de vídeo (365D)
- Série Caixinha de Perguntas com Dr. João

---

## 10.4 Distribuição/Awareness

```
📁 CAMPANHA
[DIST] RECONHECIMENTO [IG] DISTRIBUICAO PARA O PERFIL

📂 CONJUNTO
ADV+ Visita ao perfil — Nem tudo é oq parece ep.12

📄 CRIATIVO
AD571_20251126_ALL_OSLLO_TEMGENTEQUESURTA_HIGH_VID_60S
```

**Decodificação:**
- Distribuição para reconhecimento no Instagram
- Otimizado para visita ao perfil, série específica
- Vídeo Oslo, alta qualidade, 60 segundos, tema awareness

---

## 10.5 Criativo UGC Moderno

```
📁 CAMPANHA
[F] [LEADS] [click_payment_consulting] [ABO] [SITE]

📂 CONJUNTO
ADV+ [ABERTO] [R$30] [STORY] Teste UGC - click_payment_consulting — 25+

📄 CRIATIVO
AD590_LEAD_OUTRO_EUSEIQUEVCTACANSADA3461_GIOROSSI_LOW_VID_60S_SONO
```

**Decodificação:**
- AD590: ID 590
- LEAD: Objetivo de geração de leads
- OUTRO: Produtor terceiro/UGC
- EUSEIQUEVCTACANSADA: Tema "Eu sei que você tá cansada"
- 3461: Código interno do conteúdo
- GIOROSSI: Creator Gio Rossi
- LOW: Qualidade UGC
- VID: Vídeo
- 60S: 60 segundos
- SONO: Nicho sono/insônia

---

# 11. CHECKLIST DE CRIAÇÃO

## 11.1 Checklist de Campanha

- [ ] Prefixo de objetivo definido: `[F]`, `[DIST]`, `[RMKT]`, `[CADASTRO]`, `[LEADS]`
- [ ] Tipo de campanha: `[LEADS]`, `[VENDAS]`, etc.
- [ ] Configuração de orçamento: `[CBO]` ou `[ABO]`
- [ ] Tag de orçamento se aplicável: `[R$30]`, `[R$50]`
- [ ] Evento de otimização: `click_payment_consulting`, `click_payment_product`
- [ ] Destino: `[SITE]`
- [ ] Flag de teste se aplicável: `[TESTE DE CRIATIVOS]`, `[BESTADS]`

## 11.2 Checklist de Conjunto

- [ ] Advantage+ se aplicável: `ADV+`
- [ ] Temperatura do público: `[ABERTO]`, `[RMKT]`, `LLK X%`
- [ ] Orçamento diário: `[R$30]`, `[R$50]`
- [ ] Posicionamento: `[STORY]`, `[FEED]`
- [ ] Descrição/tema do conteúdo
- [ ] Embaixador se aplicável
- [ ] Evento de otimização
- [ ] Idade mínima: `25+`, `35+`

## 11.3 Checklist de Criativo (Formato Moderno)

- [ ] ID sequencial: `AD598`
- [ ] Data se aplicável: `20251210`
- [ ] Objetivo: `LEAD`, `ALL`, `RTG`, `MOTIONS`
- [ ] Produtor: `OSLLO`, `CLICK`, `OUTRO`
- [ ] Tema descritivo sem espaços
- [ ] Qualidade: `HIGH`, `MED`, `LOW`
- [ ] Formato: `VID`, `IMG`, `CARROSSEL`
- [ ] Duração para vídeos: `15S`, `30S`, `45S`, `60S`
- [ ] Nicho se específico: `SONO`, `THCV`, `IMPOTENCIA`

---

# APÊNDICE: TAGS RÁPIDAS

## Tags de Campanha
```
[F] [DIST] [RMKT] [RAC] [CADASTRO] [LEADS] [VENDAS] [IMPULSIONAR] [TRÁFEGO]
[CBO] [ABO] [R$30] [R$50] [R$100] [SITE] [TESTE DE CRIATIVOS] [BESTADS]
click_payment_consulting click_payment_product
```

## Tags de Conjunto
```
ABERTO ADV+ [RMKT] LLK INTERESSE
BR RJ SP SANTOS BH SUDESTE SUL
[H] [M] 25+ 35+ 18+ 45+ [25-50] [35-65]
[STORY] [FEED] [CARROSSEL] [POST] [REELS]
PageView VIDEO VIEW Engajamento Seguidores
```

## Tags de Criativo
```
LEAD ALL RTG MOTIONS
OSLLO CLICK OUTRO
HIGH MED LOW
VID IMG CARROSSEL MOTION
15S 30S 45S 60S 90S 120S 150S 180S
SONO THCV IMPOTENCIA ANSIEDADE DOR CBD CBG CBN
```

## Embaixadores
```
DRJOAO LEOTX LEODOTAXI PEDROM RACHEL IRWEN BRUNA BRUNAWT
GUIVAZ BABIROSA GIOROSSI LUCALDI BRUNOT TAMIRESB ANACLARAW
```

---

**Documento criado em:** Janeiro 2026  
**Última atualização:** 22/01/2026  
**Base de dados:** ~69.245 registros (Julho/2024 - Janeiro/2026)  
**Versão:** 2.0
