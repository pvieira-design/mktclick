# 6

# 🖥️ PERGUNTAS: ESTRUTURA DE TELAS E INTERFACE DO SISTEMA
## SEÇÃO 1: NAVEGAÇÃO PRINCIPAL
**1.1** Como você imagina a **navegação principal**?
*   \[ \] Sidebar fixa à esquerda (estilo Notion, ClickUp)
**1.2** A navegação deve mostrar **contadores/badges**? (Ex: "Pendências (5)")
Sim
**1.3** Deve ter **busca global** no topo que pesquisa em todo o sistema?
Não precisa
**1.4** Deve ter **atalhos/favoritos** para itens frequentes?
Sim
**1.5** O usuário pode **personalizar** a ordem dos itens do menu?
Não
* * *
## SEÇÃO 2: ESTRUTURA DE MENUS/TABS PRINCIPAIS
**2.1** Liste as **seções principais** que você imagina no menu. Para cada uma, me diga se é:
*   Página única
*   Área com sub-páginas/tabs
*   Dropdown com opções
Exemplo do que imagino (corrija/complete):

```css
MENU PRINCIPAL
├── Dashboard (Home)
├── Requests (aqui abrimos a solicitação que cai para a área de redator, design, etc) (aqui posso abrir um request de video, request de produção com 5 criativos, request de artigo para blog) (no topo dela teremos filtros para facilitar a busca)
├── Criativos
│   ├── Dashboard
│   ├── Requests
│   └── Lista de criativos pendentes / andamento
...
├── Influencers
│   ├── Lista de influencers e embaixadores
│   ├── Requests
Dashboards...
├── Social Media
│   ├── ?
│   └── ?
├── Blog
│   ├── ?
│   └── ?
├── Biblioteca
│   ├── ?
│   └── ?
│   ├── ?
│   └── ?
├── Configurações
│   ├── ?
│   └── ?
└── ?
```

**2.2** A Oslo e a Bruna (influencers) devem ver o **mesmo menu** ou um menu reduzido/diferente?
Menu reduzido (nao tem por que eles verem biblioteca, configurações, blog..
**2.3** Deve ter seção de **"Minhas Pendências"** ou **"Minha Fila"** no menu?
Sim, vai depender do que está atrelado ao usuario
* * *
## SEÇÃO 3: DASHBOARD / HOME
**3.1** O que deve aparecer na **página inicial** (Dashboard)?
Marque o que faz sentido:
*   \[ \] Resumo de Requests
*   \[ \] Criativos em cada etapa (números)
*   \[ \] Entregas atrasadas
*   \[ \] Métricas de Ads (resumo)
*   \[ \] Calendário com próximos deadlines
*   \[ \] Atividade recente
*   \[ \] Gráficos de performance
*   \[ \] Tarefas do dia
*   ...
*   Vai depender do login da pessoa, admin vai ter um mais visao overall,
**3.3** Deve ter **widgets configuráveis** (usuário escolhe o que quer ver) ou layout fixo?
Nao
**3.4** Deve ter **período selecionável** no dashboard? (Hoje, 7 dias, 30 dias, custom)
Sim, usando datepicker do untitled UI
* * *
## SEÇÃO 4: ÁREA DE CRIATIVOS
**4.1** Quais **tabs/sub-páginas** devem existir dentro de "Criativos"?
Exemplo (corrija/complete):

```css
CRIATIVOS
├── Todos os Criativos (lista geral de requests de criativos com filtros por visualizacao de lista, kanban) (minhas pendencias) (etc.)
├── Métricas


```

**4.2** A **listagem de criativos** deve ter quais visualizações?
*   \[x \] Lista (tabela)
*   \[ x\] Kanban (colunas por status)
*   \[ x\] Cards/Grid (thumbnails)
*   \[x \] Calendário (por deadline)
*   \[ x\] Timeline
**4.3** Na listagem, quais **colunas/informações** devem aparecer?
*   \[ \] Thumbnail/Preview
*   \[ \] Nome
*   \[ \] Tipo
*   \[ \] Status
*   \[ \] Origem (Oslo, Interno, Influencer, outro (campo aberto))
*   \[ \] Responsável atual
*   \[ \] Patologia
*   \[ \] Deadline
*   \[ \] Dias no status atual
*   \[ \] Métricas resumidas (se no ar)
Todas acima
**4.4** Quais **filtros** são essenciais na listagem?
*   \[ \] Por status
*   \[ \] Por tipo
*   \[ \] Por origem
*   \[ \] Por patologia
*   \[ \] Por responsável
*   \[ \] Por data de criação
*   \[ \] Por deadline
*   \[ \] Por validador pendente
Todos acima

* * *
## SEÇÃO 5: PÁGINA DE DETALHE DO CRIATIVO
**5.1** Ao clicar em um criativo, abre:
*   \[ \] Modal/Drawer lateral (se clicar em ver detalhe completo abre uma página com mais detalhes)

**5.4** O **player de vídeo** deve estar embutido na página ou só link externo?
Tem que ter player embutido, como ampliar o video (e o criativo pode ser imagem também)
**5.5** Os **comentários** devem ser:
*   \[ \] Timeline única (todos os comentários juntos)

**5.6** Deve ter **comparação de versões** lado a lado? (v1 vs v2)
So se abrrir a tab de comparação
* * *