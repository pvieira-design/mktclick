# 4

# 🔍 PERGUNTAS COMPLEMENTARES - SISTEMA DE MARKETING CLICK CANNABIS
## CATEGORIA A: ESTRUTURA DE PRODUÇÕES E CRIATIVOS
Das suas respostas surgiu um conceito novo importante: **Uma produção pode ter vários criativos (vídeo principal + cortes)**.
**A1.** Uma "Produção" seria uma **entidade separada** no sistema, acima dos criativos? Exemplo:

```yaml
Produção "Campanha Insônia Janeiro"
├── Criativo 1: Vídeo completo 60s
├── Criativo 2: Corte 30s versão A
├── Criativo 3: Corte 15s stories
└── Criativo 4: Corte 6s bumper
```

É essa a estrutura correta?
Sim. E estrutura está certa e, alem disso, uma produção pode ter mais do que um video completo. Uma produção criada pode ter 10, 20, 50, ... videos e nao nessariamente irá seguir essa estrutura de cortes. O usuario irá imputar o numero.

**A2.** O **custo da produção** é dividido entre os criativos ou cada criativo tem seu custo individual? Como funciona a alocação de custos? Cada produção terá varios criativos e cada criativo pode ter um custo espcifico. Na hora de criar uma produção voce deve ter a opção de imputar o nome de um influenciador, o numero de criativos que o influenciador irá fazer e o custo por criativo. deve ter a opção de add varios influenciadores. Alem de custo de influenciador a produção PODE ter outros custos como catering, aluguel de casa, aluguel de camera, staff, ...

**A3.** Quando a Oslo faz uma produção, eles entregam **todos os criativos de uma vez** ou podem entregar em momentos diferentes? pode entregar em momentos diferentes
**A4.** Se um criativo (corte) é reprovado, **os outros da mesma produção** continuam o fluxo normalmente? sim
**A5.** A produção tem seu **próprio briefing** e cada criativo herda dele, ou cada criativo tem briefing separado?cada um pode ter briefing separado
* * *
## CATEGORIA B: BRUNA WRIGHT E GESTÃO DE INFLUENCERS
Você mencionou que a Bruna Wright tem uma **empresa de influencers** e é "como a Oslo" para influenciadores.
**B1.** A Bruna Wright é uma **prestadora de serviço** da Click ou funciona como **intermediária** entre Click e influencers? A bruna Wright será uma intermediaria quando se tratar de uma produção separada, mas além disso, ela terá um contrato mensal com a click para contratar e gerir diversos influencers.
**B2.** O pagamento aos influencers é feito pela **Bruna/empresa dela** ou diretamente pela **Click**? Diretamente pela click
**B3.** Os influencers têm contrato com a **Click** ou com a **empresa da Bruna**? com a click
**B4.** A Bruna é a **única responsável** por gerenciar influencers ou outras pessoas da Click também fazem isso? A bruna é responsavel por gerir os influencers que ela trouxer/fechar, mas a click tem alguns embaixadores que são geirdos internamente

**B5.** A Bruna terá **acesso admin** no módulo de influencers ou acesso limitado como a Oslo? acesso limitado
**B6.** Se a Bruna tem uma empresa, ela também precisa de **relatório de entregas** (como a Oslo)?sim
* * *
## CATEGORIA C: LINK PÚBLICO DO INFLUENCER
Você disse que o influencer terá um **link público** (sem login) para ver pendências.
**C1.** Esse link é **único por influencer** ou único por entrega específica? unico por influencer
**C2.** O link expira depois de algum tempo ou é **permanente**?permante
**C3.** O que exatamente o influencer vê nesse link?
*   \[ \] Lista de entregas pendentes
*   \[ \] Feedbacks recebidos
*   \[ \] Briefings
*   \[ \] Status do pagamento
*   \[ \] Histórico de entregas
*   \[ \] Métricas dos seus criativos
*   data limite para entregar os criativos
*   lista de criativos aprovados e recusados
**C4.** O influencer pode **fazer upload** de entrega por esse link ou só visualiza? só visualizar.
**C5.** Precisa de alguma **proteção** nesse link? (Ex: token temporário, expiração, limite de visualizações). nao
* * *
## CATEGORIA D: APROVAÇÃO AUTOMÁTICA
Você confirmou que pode existir **aprovação automática após X horas** sem resposta. Nao pode ter aprovação automaticA
**D1.** Quantas horas/dias para aprovação automática? É o mesmo para todas as etapas?
**D2.** A aprovação automática vale para **todas as etapas** ou só algumas? (Ex: compliance pode pular automaticamente?)
**D3.** Quando aprova automaticamente, registra como "**Aprovado automaticamente (timeout)**" ou só "Aprovado"?
**D4.** O validador recebe **aviso** antes da aprovação automática acontecer? (Ex: "Faltam 2h para aprovação automática")
**D5.** Alguém pode **desativar** a aprovação automática para um criativo específico? (Ex: criativo sensível que precisa de revisão humana obrigatória)
* * *
## CATEGORIA E: MÚLTIPLAS CAMPANHAS
Você confirmou que um criativo pode estar em **múltiplas campanhas** simultaneamente.
**E1.** Como o sistema deve mostrar isso? Uma lista de campanhas vinculadas ao criativo? sim
**E2.** As métricas devem ser mostradas **agregadas** (todas as campanhas juntas) ou **separadas por campanha**? separadas por campanha
**E3.** Quando um criativo é pausado no sistema, ele deve ser pausado em **todas as campanhas** ou o gestor de tráfego faz isso manualmente no Meta? O gestor faz isso manualmente no Meta
**E4.** Se o criativo performa bem em uma campanha e mal em outra, como visualizar isso?
* * *
## CATEGORIA F: ACESSO DA OSLO
Você disse que a Oslo pode ver métricas de **todos os criativos** (não só os deles).
**F1.** Isso significa que a Oslo vê criativos internos e de influencers também? sim, é importante eles intenderem o que funciona em termos de criativo, script copy, ....
**F2.** A Oslo pode ver **dados financeiros** (custo de produção, valores pagos a influencers)? sim
**F3.** A Oslo pode **exportar** dados ou apenas visualizar? visualizar
**F4.** Existe alguma informação que a Oslo **NÃO deve ver**? nao
* * *
## CATEGORIA G: FLUXOS POR TIPO DE CRIATIVO
Você disse que cada tipo de criativo tem seu **próprio fluxo**.
**G1.** Quais são as **diferenças** entre os fluxos? Por exemplo:
*   Vídeo UGC precisa de validação médica obrigatória? nao necessariamente
*   Carrossel pula etapa de roteiro?
*   Stories tem menos validadores?
**G2.** Você consegue listar as etapas de cada tipo?
*   Vídeo UGC: \[etapas\] Bruna Wright capta os influencer, briefa os influencer, o influencer cria o video, bruna sobe no sistema, video é aprovado ou nao pela click, se aprovado o gestor de trafego sobe no meta business. se video é recusado pela click bruna tem que enviar outro video.
*   Vídeo Institucional: \[etapas\] osllo cria o script, move pra fase de produção, uma vez produzido sobe no sistem apara aprovação da click, se click aprova, vidoe segue na esteira para o getsor de trafego subir no facebook ads.
*   Carrossel: \[etapas\]
*   Post Único: \[etapas\]
*   Stories: \[etapas\]
*   Reels: \[etapas\]
**G3.** Os fluxos são **configuráveis** nas settings ou são fixos no código? Os fluxos devem poder ser criados e configurados nas settings de forma visual e com ótima e fácil UX, de preferencia com elos de arrasta e solta
* * *
## CATEGORIA H: VINCULAÇÃO COM BANCO DE ADS
Você disse que na etapa final deve ter um local para **atrelar criativo a um ad\_name** do banco de Ads.
**H1.** Um criativo do sistema pode ser vinculado a **vários ad\_names** (ex: versões A/B no Meta)?sim
**H2.** E se o mesmo ad\_name aparecer em **múltiplos dias**? O sistema agrupa automaticamente? sim
**H3.** E se o gestor de tráfego criar um anúncio no Meta com um nome que **não existe** no sistema? Como tratar criativos "órfãos" no banco de Ads? nao pode ter, todo criativo no sistema tem que ter um par no ads.
**H4.** A vinculação pode ser **desfeita**? (Ex: vinculou errado)sim, pode ser editada
**H5.** Quando puxa a lista de ad\_names disponíveis, deve mostrar **todos** ou só os que ainda não foram vinculados?todos
* * *
## CATEGORIA I: RECEITA VÁLIDA DO INFLUENCER
Você disse que o influencer precisa ter **receita válida** antes de produzir.
**I1.** O que significa "receita válida"? Receita dentro da validade (não expirada)?isso
**I2.** O sistema deve **bloquear** o influencer de produzir se a receita expirou? Ou apenas alerta? apenas alerta
**I3.** O sistema deve **alertar** quando a receita de um influencer ativo está próxima de expirar? sim
**I4.** Se o influencer ainda não é paciente Click, o sistema deve **criar o cadastro** dele automaticamente ou só vincula depois que ele já existe? vincular depois que ja existe no sistem da click
* * *
## CATEGORIA J: IMPORTAÇÃO DE HISTÓRICO
Você disse que pode importar histórico do banco de Ads.
**J1.** Quais dados devem ser importados?
*   \[ x\] Nome do criativo (ad\_name)
*   \[ x\] Métricas históricas
*   \[x \] Data de veiculação
*   \[x \] Campanha
*   conjunto
*   Click payment consulting
*   click payment product
*   click deal
**J2.** Os criativos importados do histórico entram com status "**Encerrado**" ou outro?
sim, encerrado
**J3.** Criativos importados precisam de **briefing, roteiro, validações** preenchidos ou ficam em branco?
Ficam em branco, só a partir da implementacao do sistema
**J4.** Qual período de histórico deve ser importado? Todo o disponível (desde Jul/2024)?
todo que tiver disponivel
* * *
## CATEGORIA K: DASHBOARD DE PRODUTIVIDADE
Você confirmou que quer um dashboard de produtividade da equipe.
**K1.** Quais métricas específicas devem aparecer?
*   \[x \] Criativos produzidos por pessoa
*   \[ x\] Criativos validados por pessoa
*   \[ x\] Tempo médio de validação
*   \[x \] Taxa de aprovação de primeira
*   \[ x\] Atrasos em validação
O que voce achar que faz mais sentido

**K2.** Deve mostrar ranking comparativo entre pessoas ou só números individuais?
só entre influencers/embaixadores

**K3.** Qual período default? (Semana, mês, trimestre)
Mes atual

**K4.** Quem pode ver esse dashboard? Só heads/admins ou todos?
Admins e heads
* * *

* * *
## CATEGORIA M: EMBAIXADORES ESPECÍFICOS
Você mencionou que os embaixadores atuais são Léo Dutaxi e Pedro Machado.
**M1.** Eles já têm **contrato ativo**? Qual o período?
Nao sei o periodo, mas ja tem contrato, precisa colocar na plataforma manualmente depois
**M2.** Quais são os **entregáveis** acordados com cada um?
Varia, tem que configurar na plataforma, preciso criar um sistema que o admin possa adicionar isso tudo depois manualmente.
**M3.** Eles já têm criativos **no ar** que devemos vincular ao sistema?
Sim
**M4.** A foto deles está no site. O sistema deve gerenciar isso ou é separado?
Enviaremos manualmente
QUando fizer upload no banco de imagem de foto ou video, eu posso selecionar se tem algum influencer/embaixador atrelado, quais tags do arquivo, etc.

* * *
## CATEGORIA N: CUSTOS E FINANCEIRO
Você mencionou que cada equipe registra seus custos e o prestador pode configurar valor de cada criativo.
**N1.** O custo é registrado **por quem**? O próprio prestador (Oslo, Bruna) ou alguém da Click?
Depende, mas normalmente alguém da Oslo, bruna, Financeiro

**N2.** Existe **aprovação de custo** antes de registrar ou é livre?
Depende, da bruna wright /oslo / eventos com influencers atores embaixadores tem custos que precisam aprovaçao

**N3.** O sistema deve **alertar** se um custo estiver fora do padrão? (Ex: vídeo UGC normalmente custa X, mas esse está 3x maior)
Ainda nao precisa

**N4.** Precisa de **relatório financeiro** de custos por período?
Ainda nao

* * *
## CATEGORIA O: TAGS E CATEGORIZAÇÃO
Você disse que deve ter local para configurar tags no sistema.
**O1.** Além de patologia, quais outras **categorias fixas** existem?
*   \[x \] Público-alvo (Ex: 30-45 anos, mulheres)
*   \[ x\] Objetivo (Conversão, Awareness, Remarketing)
*   \[ x\] Tom (Educativo, Emocional, Direto)
*   \[x \] Plataforma (Meta, Google, TikTok)
*   Pense em outras
**O2.** As tags são **livres** (qualquer um cria) ou só admin pode criar?
Qualquer um pode criar

**O3.** Pode usar a **mesma tag** em criativos, influencers e produções?
Sim

* * *
## CATEGORIA Q: ARQUIVOS E UPLOADS
**Q1.** Qual o **tamanho máximo** de arquivo aceito? (Vídeos podem ser grandes)
depende
**Q2.** Quais **formatos** devem ser aceitos?
*   Vídeo: MP4, MOV, outros
*   Imagem: JPG, PNG, PSD, outros
*   Documentos: PDF, DOCX
**Q3.** Deve ter **preview** do arquivo no sistema ou só download?
deve ter preview
**Q4.** O arquivo deve ser **comprimido** automaticamente ou mantém original?
mantem original
* * *
## CATEGORIA R: FUNCIONALIDADES QUE NÃO FICARAM CLARAS
**R1.** O **roteiro** de um criativo é um campo de texto livre ou deve ter estrutura? (Ex: cenas, falas, legendas)
Texto livre com campo de texto avançado (text area) com h1, h2, etc. Negrito, italico.. (editor WYSIWYG)
**R2.** O **briefing** tem campos específicos ou é texto livre?
texto livre WYSIWYG
**R3.** Existe conceito de **templates de briefing** (briefing pré-preenchido para tipos específicos)?
Sim, depois podemos ter isso criado pela equipe que pode ser reutilizado, mas o campo aberto é o padrao.
**R4.** O sistema deve ter **comentários/chat** interno em cada request para discussão?
Sim
**R5.** Precisa de **menção** de pessoas nos comentários? (Ex: @samira veja isso)
Sim
**R6.** Deve ter **anexos nos comentários** ou só texto?
Pode ter anexo

* * *
## CATEGORIA S: EDGE CASES E EXCEÇÕES
**S1.** O que acontece se um criativo for **entregue mas nunca subir** em Ads? Fica em "Aprovado" para sempre?
Fica aprovado com bedge de que nunca foi testado

**S2.** E se o **mesmo vídeo** for usado para Ads e para Redes Sociais? São dois criativos ou um só?
Só um

**S3.** Se a Oslo entregar um criativo que a Click **nunca pediu** (entrega extra), como registrar?
Como entrega extra

**S4.** Se um influencer **desistir no meio** do contrato, como tratar os entregáveis pendentes?
nao sei

**S5.** Se o sistema de Ads (banco de dados) estiver **fora do ar**, o que acontece com as telas que dependem dele?
Fica carregando, aparece aviso que sistema está fora do ar
* * *
**Total: 82 perguntas organizadas em 19 categorias**
Responda as que conseguir agora, e as que não souber pode deixar para depois. O importante é termos clareza antes de começar cada feature.