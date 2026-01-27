# 5

# 🔄 PERGUNTAS: SISTEMA DE FLUXOS DE APROVAÇÃO
## SEÇÃO 1: CONCEITO GERAL DE FLUXOS
**1.1** O sistema terá um **editor visual de fluxos** (tipo arrastar e soltar etapas) ou será configurado via formulário/lista?
Sim, nas configurações

**1.2** Quem pode **criar e editar** fluxos de aprovação? Só Super Admin ou outros níveis também?
super admin

**1.3** Um fluxo pode ser **duplicado** para criar variações? (Ex: copiar fluxo de "Vídeo UGC" para criar "Vídeo UGC Urgente")
Sim

**1.4** Fluxos podem ser **versionados**? (Ex: se mudar o fluxo, criativos antigos continuam no fluxo antigo ou migram?)
Migram

**1.5** Pode existir **fluxo padrão** que se aplica quando nenhum específico é definido?
não precisa, pois só vai dar para criar requests de itens que estão configurados os fluxos

* * *
## SEÇÃO 2: TIPOS DE REQUESTS/CONTEÚDOS
**2.1** Liste todos os **tipos de requests** que precisam de fluxo de aprovação:

| Tipo | Precisa de Fluxo? | Observação |
| ---| ---| --- |
| Criativo - Vídeo UGC | ? |  |
| Criativo - Vídeo Institucional | ? |  |
| Criativo - Carrossel | ? |  |
| Criativo - Post Único | ? |  |
| Criativo - Stories | ? |  |
| Criativo - Reels | ? |  |
| Click Educa - Vídeo YouTube | ? |  |
| Social Media - Post Feed | ? |  |
| Social Media - Stories | ? |  |
| Social Media - Reels | ? |  |
| Blog - Artigo | ? |  |
| Influencer - Contrato | ? |  |
| Influencer - Entrega | ? |  |
| Proposta/Parceria | ? |  |
| Copy/Texto | ? |  |
| Outros? | ? |  |

OBS: Posso criar um request de produção - Nela vamos falar quantas entregas de cada tipo de item acima vai ter. Ou podemos ter os requests sozinhos, só de um video, só de uma copy,

**2.2** Existem tipos de request que **NÃO precisam** de aprovação (fluxo direto)?
Não

**2.3** O mesmo tipo de criativo pode ter **fluxos diferentes** dependendo de algum critério? (Ex: Vídeo UGC de influencer vs Vídeo UGC interno)
Sim

* * *
## SEÇÃO 3: ESTRUTURA DAS ETAPAS
**3.1** Quais são as **etapas possíveis** que podem existir em um fluxo? Marque as que fazem sentido:

| Etapa | Descrição |
| ---| --- |
| Solicitação/Ideia | Request inicial |
| Triagem | Análise se vale a pena |
| Briefing | Definição do que fazer |
| Aprovação de Briefing | Validar briefing |
| Pauta | Definição de tópicos (blog) |
| Pesquisa | Keywords, referências |
| Roteiro/Copy | Texto do conteúdo |
| Validação Compliance | Checklist legal |
| Validação Médica | Revisão de saúde |
| Validação Jurídica | Revisão legal |
| Produção | Criação do asset |
| Revisão de Qualidade | Design, áudio, vídeo |
| Revisão de Conteúdo | Texto, informações |
| Aprovação Final | Ok para publicar |
| Publicação | Subir no ar |
| Análise de Performance | Métricas pós |
| Outras? |  |

Todas fazem sentido, porém vai depender de cada request. Cada um vai exigir campos obrigatórios diferentes.

**3.2** Uma etapa pode ser **condicional**? (Ex: "Validação Médica" só aparece SE o criativo menciona patologia)
Pode ser, mas acho que no MVP isso trára uma complexidade a mais desnecessaria

**3.3** Uma etapa pode ser **paralela** a outra? (Ex: Compliance e Médico revisam ao mesmo tempo, não em sequência)
Sim

**3.4** Pode ter **etapas opcionais** que o solicitante escolhe incluir ou não?
Sim, ele pode pedir auxilio com algo (exemplo tirar duvida X sobre o briefing)

* * *
## SEÇÃO 4: VALIDADORES E RESPONSÁVEIS
**4.1** Cada etapa pode ter **múltiplos validadores**? Como funciona:
*   \[x \] Todos os validadores precisam aprovar, se um aprovar avança
**4.2** O validador pode ser:
*   \[x \] Pessoa específica (Ex: Samira)
*   \[x \] Grupo/Equipe (Ex: "Time de Compliance")
*   \[ x\] Cargo/Role (Ex: "Qualquer Coordenador")
*   \[ x\] O próprio solicitante
*   \[x \] Responsável pelo item (quem está produzindo)
**4.3** Se o validador for um **grupo**, como distribuir?
*   \[ x\] Todos recebem e qualquer um resolve
**4.4** Pode ter **validador de backup**? (Se o principal não responder em X tempo, vai para backup)
Não precisa
**4.5** O validador pode **delegar** para outra pessoa?
Não
**4.6** O validador pode **se recusar** a validar? (Ex: conflito de interesse)
Não, ou aceita ou nega e vai pra revisão - na revisão pode ser arquivado diretamente e ai cria uma variação. Por exemplo o anuncio vai ter que ter o nome como \[909\] \[V1\] \[REELS\] ... Nome do anuncio
Se tiver variação vai ser \[909\] \[V2\] \[REELS\] ... Nome do anuncio
* * *
## SEÇÃO 5: AÇÕES DO VALIDADOR
**5.1** Quais **ações** o validador pode tomar em cada etapa?

| Ação | Descrição | Resultado |
| ---| ---| --- |
| Aprovar | Ok, próxima etapa | Avança |
| Reprovar | Não está bom | Volta? Para onde? |
| Solicitar ajustes | Pequenas correções | Volta para quem? |
| Escalar | Precisa de alguém acima | Para quem? |
| Pausar | Aguardar algo externo | Fica parado |

**5.2** Ao **reprovar**, o item volta para:
*   \[x \] Etapa específica escolhida pelo validador (normalmente revisão da etapa anterior, ou alguma outra etapa específica)
**5.3** A reprovação exige **justificativa obrigatória**?
Sim
**5.4** Pode ter **reprovação parcial**? (Ex: "Roteiro ok, mas precisa ajustar CTA")
Sim
**5.5** Quantas vezes um item pode ser **reprovado** antes de ser descartado automaticamente? Ou não tem limite?
Nao tem limite
* * *
## SEÇÃO 6: PRAZOS E SLAs
**6.1** Cada etapa pode ter **prazo máximo** (SLA) diferente?
Sim
**6.2** O prazo é em:
*   \[ x\] Horas
*   \[ x\] Dias úteis
*   \[ x\] Dias corridos
*   \[x \] Configurável por etapa
**6.3** O que acontece quando o **prazo estoura**?
*   \[x \] Alerta e mantém
**6.4** Itens **urgentes/prioritários** têm prazos diferentes (reduzidos)?
Não precisa, apenas dem badge diferente
**6.5** O prazo **pausa** em finais de semana/feriados?
Não precisa
* * *
## SEÇÃO 7: NOTIFICAÇÕES DO FLUXO
**7.1** Quando notificar o **validador**?
*   \[x \] Quando item chega na sua etapa
*   \[x \] Lembrete X horas antes do prazo
*   \[x \] Quando prazo está estourando
*   \[ x\] Quando item foi devolvido para ajuste
*   \[x \] Quando alguém comenta
**7.2** Quando notificar o **solicitante/responsável**?
*   \[ \] Quando item avança de etapa
*   \[ \] Quando item é aprovado
*   \[ \] Quando item é reprovado
*   \[ \] Quando solicita ajuste
*   \[ \] Quando conclui o fluxo
*   Todos
**7.3** Quando notificar **gestores/heads**?
*   \[ \] Quando item é escalado
*   \[ \] Quando prazo estoura
*   \[ \] Quando item é descartado
*   \[ \] Resumo diário de pendências
*   Todos

* * *
## SEÇÃO 8: VISIBILIDADE E PERMISSÕES
**8.1** Quem pode **ver** um item em cada etapa?
*   \[ x\] Qualquer um com acesso ao módulo
*   \[x \] Configurável por etapa (posso selecionar quem eu quero que nao veja algo)
**8.2** Quem pode **editar** o item durante o fluxo?
*   \[ x\] Qualquer um com permissão de edição
**8.3** O histórico de aprovações é **visível para todos** ou só para admins?
Todos, nos anuncios, no detalhe de suas aprovações precisam ter observações (opicional) do que por que foi aprovado, o que gostamos, o que achamos que da para melhorar, etc.
E depois nos detalhes da performance em ads, pode ter locais onde escrevemos o por que achamos que ele teve boa performance.
A ideia é que depois tenha uma IA que consiga analisar isso automaticamente usando o historico como base (historico de dados de ads e observações dos criativos)
**8.4** Validadores podem ver **quem validou antes** ou é anônimo?
podem

* * *
## SEÇÃO 9: FLUXOS ESPECÍFICOS - PERGUNTAS
### Para Criativos:
**9.1** O fluxo muda se o criativo é **urgente**? Como?
Nao muda, só tem a badge
**9.2** Se o criativo é da **Oslo**, alguma etapa é pulada ou adicionada?
Sim, porém nao sei agora, vai depender de quem vai configurar o fluxo depois, eu só preciso criar uma plataforma que permita depois o admin configurar isso

**9.3** Se o criativo é de **influencer**, a Bruna Wright valida alguma etapa específica?
Sim, configuramos ela como validadora de algum step.

**9.4** A validação de **design** (Vidjai/Mauro) é a mesma etapa para todos os tipos ou tem especificidades?
Depende
### Para Click Educa (YouTube):
**9.5** O vídeo do Click Educa passa por **validação médica mais rigorosa**? Qual a diferença?
Igual aos demais, porém vao ter mais steps que dependem de medicos, como por exemplo criar o roteiro final tem que vir do medico, criar o esboço e roteiro inicial pode vir da redatora, mas so medico poderá criar o final validado e passar para as proximas etapas de gravação.

**9.6** Tem etapa de **SEO/Thumbnail/Descrição** antes de publicar?
Sim, descrição do youtube otimizada, titulo, etc.

**9.7** Quem dá a **aprovação final** para publicar no YouTube?
Vai depender de quem configuramos, mas normalmente samira.

### Para Social Media:
**9.8** Posts de social media precisam de **validação de compliance** ou é mais leve?
Igual para todos
**9.9** Existe **calendário editorial** que define quando o post sobe, independente de quando foi aprovado?
Existe, porém precisamos criar um sistema onde as pessoas da equipe irão transferir o calendário para esse ssitema. Procure por bibliotecas que possam ajudar a gente nessas features de gestão (se necessário)

**9.10** Quem aprova o **horário de publicação**?
Samira / Vidjai
### Para Blog:
**9.11** O artigo tem etapa de **revisão de SEO** específica?
Sim
**9.12** Quem valida a **pauta** antes de começar a escrever?
Samira e/ou Redatora

**9.13** Existe etapa de **otimização pós-publicação**?
Sim, após 2 meses, 6 meses, 1 ano, 1 ano e 6 emses, 2 anos...
### Para Influencer:
**9.14** O **contrato** do influencer passa por fluxo de aprovação? Quais etapas?
Sim, passa por aprovação do juridico / RH. A bruna solicita no sistema, envia para o influencer um link onde o influcner baixa o arquivo assina e depois envia ele assinado. O influencer deve mandar assinado,

**9.15** A **entrega** do influencer passa por quais validações?
Depende.

**9.16** Quem aprova o **pagamento** ao influencer?
Financeiro

* * *
## SEÇÃO 10: CONFIGURAÇÃO E MANUTENÇÃO
**10.1** Deve ter **templates de fluxo** pré-configurados para começar?
Não precisa

**10.2** Pode **desativar** um fluxo sem deletar? (Histórico mantido)
Sim

**10.3** Se um fluxo for **alterado**, itens em andamento:
*   *   \[ x\] Migram para o novo

**10.4** Pode ter **fluxo de teste** (sandbox) antes de ativar em produção?
Nao precisa

**10.5** Deve ter **relatório de performance do fluxo**? (Ex: tempo médio em cada etapa, gargalos)
Sim

* * *
## SEÇÃO 11: EXCEÇÕES E CASOS ESPECIAIS
**11.1** Pode **forçar aprovação** pulando validadores? Quem tem esse poder?
SuperAdmin

**11.2** Pode **reverter** uma aprovação já feita? (Ex: descobriu problema depois)
Sim

**11.3** Se o **validador for desligado** da empresa, o que acontece com as pendências dele?
Transferida para outro da área

**11.4** Pode ter **aprovação em lote**? (Ex: aprovar 10 criativos de uma vez)
Nao

**11.5** Se o item precisa de **informação externa** (ex: aguardando cliente), como pausar o fluxo?
Nao precisa pausar

**11.6** Pode ter **fluxo de emergência** que pula etapas em casos críticos?
Nao precisa

* * *
## SEÇÃO 12: INTEGRAÇÃO COM OUTROS MÓDULOS
**12.1** Quando o criativo é **aprovado**, ele automaticamente aparece disponível para vincular a Ads?
Ele precisa ser aprovado e a request de subir o criativo em uma campanha especifica tem que ser criado, se a campanha ou conjunto de anuncios nao existir, quem estiver abrindo o request tem que selecionar no input "outro" e escrever qual o nome da companha e ideia que quer criar (o mesmo para o conjunto) (onde ele pode explicar qual publico quer, idade, intersses, etc). (ao clicar para selecionar campanha e conjuntos deve mostrar uma lista que é atualizada sempre vindo dos banco de ads

**12.2** Quando o contrato do influencer é **aprovado**, ele automaticamente muda status para "Ativo"?
Ativo, porém na etapa referente ao processo dele com a Click (ja fez consulta, já tem receita (qual a receita dele e quais produtos tem), se já enviou os documentos para importacao, se ja tem codigo de rastreio, se ja recebeu o produto - quando recebeu o produto)

**12.3** O fluxo pode **criar tasks automáticas** em outras áreas? (Ex: aprovar criativo cria task para Rafael Pro subir em Ads)
Sim

**12.4** O fluxo pode **atualizar dados automaticamente**? (Ex: aprovar produção atualiza custo total)
Sim

* * *
## SEÇÃO 13: VISUALIZAÇÃO DE FLUXOS
**13.1** Deve ter **visualização em Kanban** (colunas por etapa)?
Sim

**13.2** Deve ter **visualização em lista** com filtros?
sim (kanban tbm com filtros, tudo com filtro e reordenação)

**13.3** Deve ter **visualização de timeline** do item (histórico visual)?
sim

**13.4** Deve ter **indicador visual** de onde o item está no fluxo? (Ex: progress bar)
sim

**13.5** O validador deve ter **fila de pendências** só dele?
sim