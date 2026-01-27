# Schema do Banco de Dados - Click Cannabis

**Banco:** PostgreSQL  
**Última atualização:** Janeiro 2026  
**Ferramentas:** Postico, Grafana, Metabase

---

## Índice

1. [Tabelas Principais (Core)](#1-tabelas-principais-core)
2. [Tabelas de Consulta Médica](#2-tabelas-de-consulta-médica)
3. [Tabelas de Pagamento e Vendas](#3-tabelas-de-pagamento-e-vendas)
4. [Tabelas de Logística](#4-tabelas-de-logística)
5. [Tabelas de CRM e Pipeline](#5-tabelas-de-crm-e-pipeline)
6. [Tabelas de Tags e Tracking](#6-tabelas-de-tags-e-tracking)
7. [Tabelas de Feedback e NPS](#7-tabelas-de-feedback-e-nps)
8. [Tabelas de Atividades e Logs](#8-tabelas-de-atividades-e-logs)
9. [Relacionamentos Principais](#9-relacionamentos-principais)
10. [Dicas e Armadilhas Comuns](#10-dicas-e-armadilhas-comuns)

---

## 1. Tabelas Principais (Core)

### 1.1 `users` - Pacientes/Usuários

A tabela central do sistema, armazena todos os pacientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `first_name` | VARCHAR | Primeiro nome |
| `last_name` | VARCHAR | Sobrenome |
| `email` | VARCHAR | Email do usuário |
| `phone` | VARCHAR | Telefone (formato: +55DXXXXXXXXX) |
| `data` | JSONB | Dados extras (inclui `linkChat` do Guru) |
| `created_at` | TIMESTAMP | Data de cadastro |
| `updated_at` | TIMESTAMP | Última atualização |

**Campos JSONB importantes:**
```sql
u.data->>'linkChat'  -- Link do Chat Guru
```

**Extrair Estado pelo DDD:**
```sql
CASE
    WHEN SUBSTR(u.phone, 3, 2) IN ('11','12','14','15','16','17','18','19') THEN 'São Paulo'
    WHEN SUBSTR(u.phone, 3, 2) = '13' THEN 'Santos'
    WHEN SUBSTR(u.phone, 3, 2) IN ('21','22','24') THEN 'Rio de Janeiro'
    WHEN SUBSTR(u.phone, 3, 2) IN ('27','28') THEN 'Espírito Santo'
    WHEN SUBSTR(u.phone, 3, 2) IN ('31','32','33','34','35','37','38') THEN 'Minas Gerais'
    WHEN SUBSTR(u.phone, 3, 2) IN ('41','42','43','44','45','46') THEN 'Paraná'
    WHEN SUBSTR(u.phone, 3, 2) IN ('47','48','49') THEN 'Santa Catarina'
    WHEN SUBSTR(u.phone, 3, 2) IN ('51','53','54','55') THEN 'Rio Grande do Sul'
    WHEN SUBSTR(u.phone, 3, 2) = '61' THEN 'Distrito Federal'
    WHEN SUBSTR(u.phone, 3, 2) IN ('62','64') THEN 'Goiás'
    WHEN SUBSTR(u.phone, 3, 2) = '63' THEN 'Tocantins'
    WHEN SUBSTR(u.phone, 3, 2) IN ('65','66') THEN 'Mato Grosso'
    WHEN SUBSTR(u.phone, 3, 2) = '67' THEN 'Mato Grosso do Sul'
    WHEN SUBSTR(u.phone, 3, 2) = '68' THEN 'Acre'
    WHEN SUBSTR(u.phone, 3, 2) = '69' THEN 'Rondônia'
    WHEN SUBSTR(u.phone, 3, 2) IN ('71','73','74','75','77') THEN 'Bahia'
    WHEN SUBSTR(u.phone, 3, 2) = '79' THEN 'Sergipe'
    WHEN SUBSTR(u.phone, 3, 2) IN ('81','87') THEN 'Pernambuco'
    WHEN SUBSTR(u.phone, 3, 2) = '82' THEN 'Alagoas'
    WHEN SUBSTR(u.phone, 3, 2) = '83' THEN 'Paraíba'
    WHEN SUBSTR(u.phone, 3, 2) = '84' THEN 'Rio Grande do Norte'
    WHEN SUBSTR(u.phone, 3, 2) IN ('85','88') THEN 'Ceará'
    WHEN SUBSTR(u.phone, 3, 2) IN ('86','89') THEN 'Piauí'
    WHEN SUBSTR(u.phone, 3, 2) IN ('91','93','94') THEN 'Pará'
    WHEN SUBSTR(u.phone, 3, 2) IN ('92','97') THEN 'Amazonas'
    WHEN SUBSTR(u.phone, 3, 2) = '95' THEN 'Roraima'
    WHEN SUBSTR(u.phone, 3, 2) = '96' THEN 'Amapá'
    WHEN SUBSTR(u.phone, 3, 2) IN ('98','99') THEN 'Maranhão'
    ELSE 'Outro'
END AS estado
```

---

### 1.2 `doctors` - Médicos

Cadastro de médicos da plataforma.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` (conta do médico) |
| `name` | VARCHAR | Nome completo |
| `crm` | VARCHAR | Número do CRM |
| `speciality` | VARCHAR | Especialidade (typo: deveria ser specialty) |
| `priority` | INTEGER | Prioridade de agendamento |
| `schedule` | JSONB | Agenda semanal configurada |
| `created_at` | TIMESTAMP | Data de cadastro |

**Relacionamento:**
```
doctors.user_id → users.id (conta do médico)
```

---

### 1.3 `negotiations` - Deals/Negociações

Representa o "deal" do paciente no CRM (pipeline).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` |
| `pipeline_id` | INTEGER | ID do pipeline (ver seção 5) |
| `funnel_stage_id` | INTEGER | FK → `funnel_stages.id` (etapa atual) |
| `delegated_to_byclico` | INTEGER | FK → `users.id` (atendente delegado) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Link CRM:**
```sql
CONCAT('https://clickagendamento.com/pipeline/deal/', n.id, '#overview') AS crm_link
```

**Pipelines:**
| ID | Nome | Descrição |
|----|------|-----------|
| 1 | Atendimento Inicial | Lead novo até pagamento de consulta |
| 2 | Consulta/Receita | Após pagar consulta até receita |
| 3 | Orçamento | Aguardando pagamento de orçamento |
| 4 | Documentação/Anvisa | Processo de documentação |
| 5 | Rastreio/Envio | Produto em trânsito |
| 6 | Orçamento/Compra | Pós primeira entrega (legacy) |
| 7 | Pós-Venda 1ª Compra | Primeira compra sem acompanhamento |
| 8 | Pós-Venda c/ Acompanhamento | Primeira compra com consulta retorno |
| 9 | Recorrente | 2+ entregas |

---

### 1.4 `funnel_stages` - Etapas do Funil

Define as etapas dentro de cada pipeline.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `name` | VARCHAR | Nome da etapa |
| `pipeline_id` | INTEGER | Pipeline ao qual pertence |

**Etapas do Pipeline 7 (Pós-Venda 1ª Compra):**
| ID | Nome | Intervalo (dias desde entrega) |
|----|------|-------------------------------|
| 32 | 15 dias | 0-22 dias |
| 33 | 23 dias | 23-29 dias |
| 34 | 30 dias | 30-44 dias |
| 35 | 45 dias | 45-69 dias |
| 36 | 70 dias | 70-89 dias |
| 37 | 90 dias | 90-179 dias |
| 38 | +180 dias | 180+ dias |

---

## 2. Tabelas de Consulta Médica

### 2.1 `consultings` - Consultas Agendadas

⚠️ **IMPORTANTE:** O campo `start` é **VARCHAR** e precisa ser convertido!

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` (paciente) |
| `doctor_id` | INTEGER | FK → `doctors.id` (médico) |
| `negotiation_id` | INTEGER | FK → `negotiations.id` |
| `start` | **VARCHAR** | ⚠️ Data/hora início - **CONVERTER:** `start::timestamptz` |
| `status` | TEXT | Status da consulta (ver abaixo) |
| `completed` | BOOLEAN | Se a consulta foi realizada |
| `prescription_status` | TEXT | Se teve receita (`'required'` ou `'not_required'`) |
| `reason_for_cancellation` | TEXT | Motivo do não comparecimento |
| `reason_for_no_prescription` | TEXT | Motivo de não prescrever |
| `meet_data` | JSONB | Dados da videochamada (participantes, duração) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Status da Consulta:**
| Status | Descrição |
|--------|-----------|
| `preconsulting` | Slot reservado sem paciente (maioria são bugs - **FILTRAR**) |
| `confirmed` | Consulta confirmada |
| `reschudeled` | Reagendada (typo: deveria ser rescheduled) |
| `cancelled` | Cancelada |

**Completed:**
| Valor | Significado |
|-------|-------------|
| `TRUE` | Consulta realizada |
| `FALSE` | Paciente não compareceu (no-show) |
| `NULL` | Pendente de processamento pelo médico |

**Filtro padrão para consultas válidas:**
```sql
WHERE c.user_id IS NOT NULL
  AND c.negotiation_id IS NOT NULL
  AND c.status NOT IN ('preconsulting')
```

**Conversão de data:**
```sql
c.start::timestamptz AT TIME ZONE 'America/Sao_Paulo'
```

---

### 2.2 `medical_prescriptions` - Receitas Médicas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `consulting_id` | INTEGER | FK → `consultings.id` |
| `file_id` | INTEGER | FK → `files.id` (PDF da receita) |
| `created_at` | TIMESTAMP | Data de criação (= envio da receita) |

---

### 2.3 `product_medical_prescriptions` - Produtos Prescritos

Tabela associativa N:N entre receitas e produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `medical_prescription_id` | INTEGER | FK → `medical_prescriptions.id` |
| `product_id` | INTEGER | FK → `products.id` |
| `quantity` | INTEGER | Quantidade prescrita |

---

### 2.4 `medical_records` - Prontuários

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `consulting_id` | INTEGER | FK → `consultings.id` |
| `content` | TEXT | Conteúdo do prontuário |
| `created_at` | TIMESTAMP | Data de criação |

---

### 2.5 `anamnese` - Formulário de Anamnese

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `consulting_id` | INTEGER | FK → `consultings.id` |
| `negotiation_id` | INTEGER | FK → `negotiations.id` |
| `status` | VARCHAR | `'pending'` ou `'completed'` |
| `data` | JSONB | Respostas do formulário (array de perguntas/respostas) |
| `created_at` | TIMESTAMP | Data de criação |

**Extrair respostas do JSONB:**
```sql
(SELECT elem->>'answer'
 FROM jsonb_array_elements(a.data::jsonb) elem
 WHERE elem->>'question' = 'Nome completo do paciente') AS nome_completo,

(SELECT elem->>'answer'
 FROM jsonb_array_elements(a.data::jsonb) elem
 WHERE elem->>'question' = 'Onde conheceu a Click Cannabis?') AS origem_click
```

**Perguntas comuns:**
- Nome completo do paciente
- Gênero do paciente
- Data de nascimento
- Peso do paciente
- Altura do paciente
- Já usou ou faz uso de Cannabis?
- Você possui alguma condição clínica?
- Como considera a qualidade do seu sono?
- Quantas horas costuma dormir por dia?
- Por que você está buscando a cannabis medicinal?
- Onde conheceu a Click Cannabis?
- Quem está preenchendo o formulário?

---

### 2.6 `request_consultings` - Solicitações de Consulta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `consulting_id` | INTEGER | FK → `consultings.id` |
| `note` | TEXT | Anotações (ex: "retorno gratuito pós") |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Identificar consulta gratuita pós-venda:**
```sql
WHERE rc.note ILIKE '%retorno gratuito pós%'
```

---

## 3. Tabelas de Pagamento e Vendas

### 3.1 `payments` - Pagamento de CONSULTA

⚠️ **IMPORTANTE:** Esta tabela é APENAS para pagamento de CONSULTA, não de orçamento!

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` (paciente) |
| `negotiation_id` | INTEGER | FK → `negotiations.id` |
| `consulting_id` | INTEGER | FK → `consultings.id` (se já agendou) |
| `status` | VARCHAR | `'confirmed'` ou `'pending'` |
| `payment_at` | TIMESTAMP | **Data do pagamento** (usar para filtros!) |
| `created_at` | TIMESTAMP | Data de criação do registro |
| `updated_by_id` | INTEGER | FK → `users.id` (atendente) |
| `access_at` | TIMESTAMP | Quando acessou o link de pagamento |
| `tax_id` | VARCHAR | CPF (se preenchido = gerou PIX) |
| `access_data` | JSONB | Dados do dispositivo |

**Regras importantes:**
- Sempre usar `payment_at` para filtrar por data de pagamento
- `created_at` é quando o registro foi criado (pode ser muito antes do pagamento)
- Sempre filtrar `status = 'confirmed'` para pagamentos efetivos

**Interação com link de pagamento:**
```sql
CASE WHEN p.access_at IS NULL THEN 'sem_interacao' ELSE 'com_interacao' END AS tipo_interacao,
CASE WHEN p.tax_id IS NULL THEN 'nao_gerou' ELSE 'gerou' END AS gerou_pix
```

---

### 3.2 `product_budgets` - Pagamento de ORÇAMENTO (Produtos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` |
| `negotiation_id` | INTEGER | FK → `negotiations.id` |
| `medical_prescription_id` | INTEGER | FK → `medical_prescriptions.id` |
| `status` | VARCHAR | `'pending'`, `'confirmed'`, `'cancelled'` |
| `value` | NUMERIC | Valor total em R$ |
| `payment_at` | TIMESTAMP | **Data do pagamento** (usar para filtros!) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |
| `updated_by_id` | INTEGER | FK → `users.id` (atendente) |
| `contacted` | BOOLEAN | Se foi contatado |
| `patient_answered` | BOOLEAN | Se respondeu |

**Regras importantes:**
- Sempre usar `payment_at` para filtrar orçamentos pagos
- `created_at` é quando o orçamento foi criado
- Sempre filtrar `status = 'confirmed'` para pagamentos efetivos

---

### 3.3 `product_budget_products` - Produtos do Orçamento

Tabela associativa N:N entre orçamentos e produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `product_budget_id` | INTEGER | FK → `product_budgets.id` |
| `product_id` | INTEGER | FK → `products.id` |
| `quantity` | INTEGER | Quantidade |

---

### 3.4 `products` - Catálogo de Produtos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `sku` | VARCHAR | Código SKU |
| `title` | VARCHAR | Nome do produto |
| `description` | TEXT | Descrição |
| `category` | VARCHAR | Marca (cbdmd, cannariver, etc) |
| `type` | VARCHAR | Tipo (oleo, gummy, creme) |
| `oleo_type` | VARCHAR | Formulação (full-spectrum, broad-spectrum, isolated) |
| `formula` | VARCHAR | Sabor (natural, mint, mango-peach) |
| `volume` | VARCHAR | Volume/quantidade |
| `price` | NUMERIC | Preço em R$ |
| `price_usd` | NUMERIC | Preço em USD |
| `quantity` | INTEGER | Estoque (-1 = sob demanda) |
| `image` | TEXT | URL da imagem |
| `is_default` | BOOLEAN | Produto padrão |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

---

### 3.5 `reference_payments` - Código de Indicação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `payment_id` | INTEGER | FK → `payments.id` |
| `user_id` | INTEGER | Quem USOU o código (indicado) |
| `referenced_by_id` | INTEGER | Quem É O DONO do código (indicador) |
| `reference_code` | VARCHAR | Código utilizado (ex: "MARIA123") |
| `status` | VARCHAR | `'pending'` = só consulta / `'confirmed'` = comprou orçamento |
| `created_at` | TIMESTAMP | Data de criação |

**Contagem de indicações válidas:**
```sql
-- Conta apenas usuários únicos que usaram o código
COUNT(DISTINCT rp.user_id) AS total_indicacoes_validas
```

---

## 4. Tabelas de Logística

### 4.1 `deliveries` - Entregas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` |
| `negotiation_id` | INTEGER | FK → `negotiations.id` |
| `product_budget_id` | INTEGER | FK → `product_budgets.id` |
| `consulting_id` | INTEGER | FK → `consultings.id` |
| `address_id` | INTEGER | FK → `addresses.id` |
| `status` | VARCHAR | Status da entrega (ver abaixo) |
| `tracking_code` | VARCHAR | Código de rastreio (`'0000'` = pendente) |
| `event_date` | TIMESTAMP | **Data da entrega** (usar para pós-venda!) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

**Status de Entrega:**
| Status | Descrição |
|--------|-----------|
| `Draft` | Rascunho |
| `Confirmed` | Confirmado |
| `Picking` | Em separação |
| `Separated` | Separado |
| `In Transit` | Em trânsito |
| `Supervisory Organ` | Na Anvisa |
| `Delivered` | Entregue ✅ |
| `Cancel` | Cancelado |

**Regras importantes:**
- `event_date` é a data da entrega efetiva
- `tracking_code = '0000'` indica código pendente
- Para pós-venda, sempre filtrar `status = 'Delivered'` e `event_date IS NOT NULL`

**Primeira entrega do usuário:**
```sql
SELECT DISTINCT ON (d.user_id)
    d.user_id,
    d.event_date AS data_primeira_entrega
FROM deliveries d
WHERE d.status = 'Delivered'
  AND d.event_date IS NOT NULL
ORDER BY d.user_id, d.event_date ASC
```

---

### 4.2 `addresses` - Endereços

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` |
| `street` | VARCHAR | Rua |
| `number` | VARCHAR | Número |
| `complement` | VARCHAR | Complemento |
| `neighborhood` | VARCHAR | Bairro |
| `city` | VARCHAR | Cidade |
| `state` | VARCHAR | Estado |
| `zip_code` | VARCHAR | CEP |
| `country` | VARCHAR | País |
| `created_at` | TIMESTAMP | Data de criação |

---

## 5. Tabelas de CRM e Pipeline

### 5.1 `pipelines` - Definição de Pipelines

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `name` | VARCHAR | Nome do pipeline |

---

## 6. Tabelas de Tags e Tracking

### 6.1 `pacient_tags` - Sistema de Tags

Tabela central para categorização e rastreamento de pacientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` |
| `negotiation_id` | INTEGER | FK → `negotiations.id` |
| `type` | VARCHAR | Categoria da tag (ver tipos abaixo) |
| `title` | VARCHAR | Identificador específico |
| `created_at` | TIMESTAMP | Data de criação |

**Principais Types de Tags:**

| Type | Descrição | Exemplo de Titles |
|------|-----------|-------------------|
| `patology` | Condição médica | Ansiedade, Insônia, Depressão, TDAH |
| `Remarketing Inicial` | Campanhas para leads novos | SI - Cumprir Promessa |
| `Remarketing Receita` | Remarketing para quem tem receita | |
| `Remarketing Respostas` | Respostas aos remarketings | Está tudo ótimo, Estou adorando! |
| `Remarketing Respostas - Text 5d` | Resposta no 5º dia | Está tudo ótimo |
| `Remarketing Respostas - Text 15d` | Resposta no 15º dia | Estou adorando! |
| `pos-venda-rmkt` | Tag de envio remarketing pós-venda | 5d pos-venda rmkt, 15d pos-venda rmkt |
| `lost-deal` | Motivo de perda do lead | Sem interesse, Preço alto |
| `UTM Source` | Origem do tráfego | google, facebook, instagram |
| `UTM Medium` | Meio de marketing | cpc, organic, social |
| `UTM Campaign` | Campanha | |
| `UTM Term` | Termo de pesquisa | |
| `UTM Content` | Conteúdo do anúncio | |
| `Device Type` | Dispositivo | mobile, desktop |
| `stageType` | Tipo de lead | Novo Lead, Recorrência |
| `payments` | Tipo de pagamento | Novo Lead, Recorrência |
| `cancel-remarketing` | Opt-out de remarketing | |
| `Análise IA Pós Venda 15d+` | Análise IA | ok - sem sequência problemática |
| `Análise IA Pós Venda 15d+ - Como está o Tratamento` | Avaliação tratamento | Tratamento - Bom, Tratamento - Médio |

**Query para consultar tags de um usuário:**
```sql
SELECT pt.type, pt.title, pt.created_at
FROM pacient_tags pt
WHERE pt.user_id = ID_DO_USUARIO
ORDER BY pt.created_at DESC;
```

**Contar tags de remarketing:**
```sql
SELECT
    n.user_id,
    COUNT(*) AS remarketing_initial_count
FROM pacient_tags pt
JOIN negotiations n ON n.id = pt.negotiation_id
WHERE pt.type = 'Remarketing Inicial'
GROUP BY n.user_id
```

---

## 7. Tabelas de Feedback e NPS

### 7.1 `nps` - Pesquisa de Satisfação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `delivery_id` | INTEGER | FK → `deliveries.id` |
| `type` | VARCHAR | Tipo (`'satisfaction'`) |
| `answers` | JSONB | Respostas (question1, question2, question3) |
| `created_at` | TIMESTAMP | Data de resposta |

**Extrair notas:**
```sql
(n.answers->>'question1')::int AS nota_geral,
(n.answers->>'question2')::int AS nota_2,
(n.answers->>'question3')::int AS nota_3
```

**NPS Alto (promotores):**
```sql
WHERE n.type = 'satisfaction'
  AND (n.answers->>'question1')::int >= 9
```

---

### 7.2 `consulting_reviews` - Avaliações de Consulta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `consulting_id` | INTEGER | FK → `consultings.id` |
| `user_id` | INTEGER | FK → `users.id` |
| `doctor_id` | INTEGER | FK → `doctors.id` |
| `consultation_rating` | INTEGER | Nota da consulta |
| `comments` | TEXT | Comentários |
| `created_at` | TIMESTAMP | Data da avaliação |

---

## 8. Tabelas de Atividades e Logs

### 8.1 `activities` - Log de Atividades

Registra movimentações do lead no funil.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` |
| `negotiation_id` | INTEGER | FK → `negotiations.id` |
| `action` | VARCHAR | Ação realizada (ver abaixo) |
| `created_at` | TIMESTAMP | Data da ação |

**Actions comuns:**
| Action | Descrição |
|--------|-----------|
| `user_created` | Usuário criado |
| `user_interacted` | Usuário interagiu |
| `user_treatment` | Etapa tratamento |
| `user_cannabis` | Etapa cannabis |
| `user_process_explanation` | Explicação do processo |
| `user_pre_payment` | Pré-pagamento |
| `user_waiting_payment` | Aguardando pagamento |
| `payment_confirmed` | Pagamento confirmado |
| `user_awaiting_consultation` | Aguardando consulta |
| `user_tracking_code_sent` | Código de rastreio enviado |
| `user_out_of_stock` | Produto sem estoque |

---

### 8.2 `user_activities` - Log de Requisições API

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Chave primária |
| `user_id` | INTEGER | FK → `users.id` |
| `method` | VARCHAR | Método HTTP (POST, PUT, etc) |
| `route` | VARCHAR | Rota da API |
| `payload` | JSONB | Dados enviados |
| `created_at` | TIMESTAMP | Data da requisição |

**Exemplo: Identificar quem criou uma delivery:**
```sql
SELECT DISTINCT ON (
    (payload::json->>'negotiationId')::int,
    (payload::json->>'productBudgetId')::int
)
    user_id,
    created_at
FROM user_activities
WHERE method = 'POST'
  AND route = '/v1/deliveries/create'
ORDER BY negotiation_id, product_budget_id, created_at
```

---

## 9. Relacionamentos Principais

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       ├──────────────────┬─────────────────┬─────────────────┐
       │                  │                 │                 │
       ▼                  ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│negotiations │    │  payments   │   │product_budgets│ │  deliveries │
└──────┬──────┘    └──────┬──────┘   └──────┬──────┘   └─────────────┘
       │                  │                 │
       │                  │                 │
       ▼                  ▼                 ▼
┌─────────────┐    ┌─────────────┐   ┌─────────────┐
│consultings  │    │reference_   │   │product_budget│
│             │    │payments     │   │_products    │
└──────┬──────┘    └─────────────┘   └─────────────┘
       │
       ├──────────────────┬─────────────────┐
       │                  │                 │
       ▼                  ▼                 ▼
┌─────────────┐    ┌─────────────┐   ┌─────────────┐
│medical_     │    │medical_     │   │  anamnese   │
│prescriptions│    │records      │   │             │
└──────┬──────┘    └─────────────┘   └─────────────┘
       │
       ▼
┌─────────────┐
│product_     │
│medical_     │
│prescriptions│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  products   │
└─────────────┘
```

**Resumo dos relacionamentos:**
```sql
-- Usuário → Negociação
negotiations.user_id → users.id

-- Negociação → Pipeline/Etapa
negotiations.pipeline_id → pipelines.id
negotiations.funnel_stage_id → funnel_stages.id

-- Consulta → Usuário/Médico/Negociação
consultings.user_id → users.id
consultings.doctor_id → doctors.id
consultings.negotiation_id → negotiations.id

-- Receita → Consulta
medical_prescriptions.consulting_id → consultings.id

-- Produtos prescritos
product_medical_prescriptions.medical_prescription_id → medical_prescriptions.id
product_medical_prescriptions.product_id → products.id

-- Pagamento de consulta
payments.user_id → users.id
payments.negotiation_id → negotiations.id
payments.consulting_id → consultings.id

-- Pagamento de orçamento
product_budgets.user_id → users.id
product_budgets.medical_prescription_id → medical_prescriptions.id

-- Entrega
deliveries.user_id → users.id
deliveries.product_budget_id → product_budgets.id

-- Tags
pacient_tags.user_id → users.id
pacient_tags.negotiation_id → negotiations.id
```

---

## 10. Dicas e Armadilhas Comuns

### ⚠️ Conversões Obrigatórias

```sql
-- Campo start de consultings é VARCHAR!
c.start::timestamptz  -- OU
c.start::timestamp AT TIME ZONE 'America/Sao_Paulo'
```

### ⚠️ Timezone

Todos os timestamps são armazenados em UTC. Para exibir no horário de São Paulo:
```sql
created_at AT TIME ZONE 'America/Sao_Paulo'
payment_at AT TIME ZONE 'America/Sao_Paulo'
```

### ⚠️ Filtros Padrão para Consultas

```sql
-- Sempre incluir para consultas válidas:
WHERE c.user_id IS NOT NULL
  AND c.negotiation_id IS NOT NULL
  AND c.status NOT IN ('preconsulting')
```

### ⚠️ Diferença entre Datas

| Tabela | Usar para Data de... | Campo |
|--------|---------------------|-------|
| `payments` | Pagamento de consulta | `payment_at` |
| `product_budgets` | Pagamento de orçamento | `payment_at` |
| `deliveries` | Entrega | `event_date` |
| `consultings` | Consulta | `start::timestamptz` |
| `medical_prescriptions` | Envio de receita | `created_at` |

### ⚠️ Confusões Comuns

| Errado | Certo |
|--------|-------|
| `payments` para orçamento | `product_budgets` para orçamento |
| `created_at` para data de pagamento | `payment_at` para data de pagamento |
| `created_at` para data de entrega | `event_date` para data de entrega |
| `start` sem conversão | `start::timestamptz` |
| `rescheduled` | `reschudeled` (typo no banco) |
| `specialty` | `speciality` (typo no banco) |

### ⚠️ Filtrar Bots no meet_data

```sql
WHERE NOT (
    r->>'display_name' ILIKE '%notetaker%' 
    OR r->>'display_name' ILIKE '%assistant%' 
    OR r->>'display_name' ILIKE '%read.ai%' 
    OR r->>'display_name' ILIKE '%fireflies%'
)
```

### 📌 Links Úteis

```sql
-- Link CRM
CONCAT('https://clickagendamento.com/pipeline/deal/', negotiation_id, '#overview') AS crm_link

-- Link Guru
u.data->>'linkChat' AS guru_link

-- Link Usuário
'https://clickagendamento.com/users/' || user_id AS link_usuario
```

---

## Changelog

| Data | Alteração |
|------|-----------|
| Jan/2026 | Criação do documento |

---

**Fim do documento**
