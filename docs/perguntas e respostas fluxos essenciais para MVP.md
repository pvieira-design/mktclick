# 7

# 📋 PERGUNTAS COMPLEMENTARES - FLUXOS ESSENCIAIS
* * *
## PARTE 1: FLUXO DE ABERTURA DE REQUEST
### 1.1 Tipos de Request
**1.1.1** Quais são os **tipos de request** que podem ser abertos? Marque todos:

| Tipo de Request | Pode criar? | Pode conter múltiplos itens? |
| ---| ---| --- |
| Request de Criativo Único (1 vídeo, 1 carrossel) | \[ x\] | N/A |
| Request de Produção (múltiplos itens) | \[ x\] | Sim |
| Request de Copy/Roteiro | \[x \] | \[ \] |
| Request de Artigo Blog | \[ x\] | \[ \] |
| Request de Post Social Media | \[ x\] | \[ \] |
| Request de Vídeo Click Educa | \[x \] | \[ \] |
| Request de Contrato Influencer | \[ x\] | \[ \] |
| Request de Subir Criativo em Ads | \[x \] | \[ \] |
| Request de Análise/Otimização | \[x \] | \[ \] |
| Outro: \_\_\_ | \[ \] | \[ \] |

A ideia é que na produção eu possa selecionar os demais itens, se vai ter criativo, post para social media, fotos (número de fotos que devem ser entregues) etc. (produção pode ser click runner (corrida da click), click house (casa de influencers), produção oslo (que pode ser entregas grandes medias ou pequenas), produção de criativos para insonia com ilustrador (nao é oslo, nao é nada, é terceirizado), etc... outras coisas)

**1.1.2** Um **Request de Produção** pode misturar tipos diferentes?
*   \[x \] Sim (Ex: 3 vídeos + 2 carrosséis + 5 copies na mesma produção)
*   
**1.1.3** Quem pode **abrir request**?
*   \[x \] Qualquer usuário logado
*   
* * *
### 1.2 Campos do Request
**1.2.1** Quais campos são **obrigatórios** ao abrir qualquer request?

| Campo | Obrigatório? | Observação |
| ---| ---| --- |
| Título/Nome | \[x \] |  |
| Tipo de request | \[ x\] |  |
| Descrição/Briefing | \[ x\] |  |
| Responsável/Destinatário | \[ \] | Quem vai executar |
| Deadline | \[ \] |  |
| Prioridade | \[ x\] | Baixa/Normal/Alta/Urgente |
| Patologia | \[ \] |  |
| Origem (Oslo/Interno/Influencer, outros) (podemos configurar os tipos de origem que vamos ter, podem aparecer novos freelas) | \[x \] |  |
| Arquivos de referência | \[ \] |  |
| Outras observações (campo de texto aberto) |  |  |

**1.2.2** O solicitante escolhe **quem vai executar** ou o sistema distribui automaticamente?
*   \[x \] Sistema distribui automaticamente baseado em regras (que sao configuradas pelo admin nas configs do sistema)
**1.2.3** O solicitante pode **definir o deadline** ou é calculado automaticamente pelo SLA?
*   \[ \] Solicitante define
*   \[ \] Sistema calcula baseado no SLA do tipo
*   \[ x\] Sistema sugere, solicitante pode alterar
* * *
### 1.3 Request de Produção (Múltiplos Itens)
**1.3.1** Ao criar um Request de Produção, como **adicionar os itens**?
*   \[ x\] Lista simples (adicionar um por um)
*   \[ \] Formulário com "quantidade por tipo" (Ex: 3 vídeos UGC, 2 carrosséis)
*   \[ \] Importar de planilha/CSV
*   \[x \] Duplicar de produção anterior
**1.3.2** Cada item da produção tem seu **próprio fluxo** ou a produção inteira passa pelo fluxo?
*   \[ \] Cada item tem fluxo independente
*   \[ \] Produção tem fluxo único, itens são entregas dentro dela
*   \[ x\] Híbrido: produção tem fluxo principal em requests e cada item tem sub-fluxo nas áreas
**1.3.3** Se um item da produção é **reprovado**, o que acontece com os outros?
*   \[ x\] Continuam normalmente
*   \[ \] Toda produção pausa
*   \[ \] Configurável
**1.3.4** O **custo da produção** é:
*   \[ \] Valor único para toda produção
*   \[ \] Soma dos custos de cada item
*   \[ x\] Ambos (custo fixo + variável por item)
* * *
### 1.4 Fluxo Após Abertura
**1.4.1** Após abrir o request, qual o **primeiro status**?
*   \[ \] Aguardando aprovação (alguém precisa aceitar)
*   \[ \] Em andamento (já vai direto para execução)
*   \[ \] Na fila do responsável
*   \[x \] Configurável por tipo
**1.4.2** O responsável pode **recusar** um request atribuído a ele?
*   \[ \] Sim, com justificativa
*   \[ \] Sim, e volta para o solicitante
*   \[ \] Sim, e vai para outro da área
*   \[x \] Não pode recusar
**1.4.3** O solicitante pode **cancelar** o request após aberto?
*   \[x \] Sim, a qualquer momento
*   \[ \] Sim, só antes de iniciar execução
*   \[ \] Não, só admin pode cancelar
**1.4.4** O solicitante pode **editar** o request após aberto?
*   \[ x\] Sim, a qualquer momento
*   \[ \] Sim, só antes de iniciar execução
*   \[ \] Só campos específicos (deadline, prioridade)
*   \[ \] Não, precisa abrir novo
Mas temos que salvar todos os logs de edição, de tudo

* * *
## PARTE 2: VINCULAR CRIATIVO AO BANCO DE ADS
### 2.1 Momento da Vinculação
**2.1.1** Em qual **momento** do fluxo acontece a vinculação com Ads?
*   \[ \] Quando criativo é aprovado (final do fluxo de criação)
*   \[ \] Quando abre request de "Subir em Ads"
*   \[ x\] Quando gestor de tráfego confirma que subiu - porém fica como pendente a vinculação, se passar 2 dias e nao vincular, fica como urgente.

**2.1.2** A vinculação é feita por **quem**?
*   \[ \] Gestor de tráfego (Rafael Pro)
*   \[ x\] Qualquer pessoa com permissão
*   \[ \] Quem criou o request de subir
* * *
### 2.2 Request de Subir Criativo em Ads
**2.2.1** Ao abrir request de "Subir Criativo em Ads", quais **campos** são necessários?

| Campo | Obrigatório? | Observação |
| ---| ---| --- |
| Criativo a subir | \[ x\] | Seleciona de lista de aprovados |
| Conta de Ads | \[ x\] | Account 1 ou 3 |
| Campanha | \[ x\] | Existente ou "Criar nova" |
| Conjunto de Anúncios | \[ x\] | Existente ou "Criar novo" |
| Nome do Anúncio (ad\_name) | \[ \] | Seguir nomenclatura - O sistema gera automaticamente |
| Público-alvo | \[ \] | Se criar novo conjunto |
| Orçamento | \[ x\] |  |
| Data de início | \[ \] |  |
| Observações | \[ \] |  |

**2.2.2** Se selecionar **"Criar nova campanha"**, quais campos aparecem?
*   \[x \] Nome da campanha
*   \[x \] Objetivo (Conversão, Tráfego, etc.)
*   \[ \] Orçamento
*   \[ x\] Descrição/Justificativa
*   \[ \] Outros: \_\_\_
**2.2.3** Se selecionar **"Criar novo conjunto"**, quais campos aparecem?
*   \[x \] Nome do conjunto
*   \[ x\] Público (idade, gênero, interesses)
*   \[x \] Localização
*   \[ x\] Orçamento
*   \[ \] Outros: \_\_\_
* * *
### 2.3 Lista de Campanhas/Conjuntos
**2.3.1** A lista de campanhas/conjuntos vem do banco de Ads. Deve mostrar:
*   \[ \] Só campanhas ativas
*   \[x \] Todas (ativas + pausadas) (com filtro em tab, as ativas sao principal - também temos filtro de pesquisa pela campanha)
*   \[ \] Filtro para escolher
**2.3.2** Deve mostrar **métricas resumidas** ao lado de cada campanha/conjunto?
*   \[ \] Sim (gasto, conversões, ROAS)
*   \[ \] Não, só nome
*   \[x \] Opcional (expandir para ver)
**2.3.3** A lista atualiza com qual **frequência**?
*   \[x \] Tempo real (a cada acesso)
*   \[ \] Cache de X minutos
*   \[ \] Botão manual de atualizar
* * *
### 2.4 Após Subir em Ads
**2.4.1** Quem **confirma** que o anúncio foi subido?
*   \[ \] Gestor de tráfego marca como "Subido"
*   \[ x\] Sistema detecta automaticamente (via API/banco)
*   \[x \] Solicitante confirma e seleciona qual é o criativo (abre uma lista de quais sao os criativos que tem aquele nome, e em quais campanhas / conjuntos estao.
**2.4.2** O que acontece após confirmar que subiu?
*   \[x \] Status muda para "No Ar"
*   \[ x\] Cria vínculo criativo ↔ ad\_name
*   \[ x\] Começa a puxar métricas
*   \[x \] Todas as anteriores
**2.4.3** E se o ad\_name informado **não existir** no banco de Ads?
*   \[ \] Erro, não deixa salvar
*   \[x \] Aviso, mas permite salvar (vai aparecer quando criar no Meta)
*   \[ \] Cria registro pendente de vínculo
**2.4.4** Um criativo pode ter **múltiplos ad\_names** vinculados?
*   \[x \] Sim, ilimitado (porém o número no inicio sempre vai ser o mesmo (ex \[909\] \[V1\] \[REELS\] ... Nome do anuncio) (sempre mantém o 909 para ele, porém pode ter varios sufixos diferentes)
*   \[ \] Sim, com limite de \_\_\_
*   \[ \] Não, só um
* * *
### 2.5 Visualização de Métricas
**2.5.1** Onde aparecem as métricas do criativo vinculado?

| Local | Deve mostrar? |
| ---| --- |
| Página de detalhe do criativo | \[ x\] |
| Dashboard geral | \[ x\] |
| Dashboard de Ads separado | \[ x\] |
| Lista de criativos (coluna) | \[ x\] |
| Relatórios | \[ x\] |

**2.5.2** Se criativo tem múltiplos ad\_names, conjuntos, campanhas, as métricas mostram:
*   \[x \] Soma total de todos (podendo ver o breakdown)
*   \[ \] Separado por ad\_name
*   \[ \] Ambos (total + breakdown)
**2.5.3** Deve ter **alerta** quando criativo performa mal?
*   \[x \] Sim, definir threshold (ex: payment consulting acima de 55, payment product budget acima de 150, etc)
*   \[ \] Não no MVP
*   \[ \] Opcional, configurável
* * *
## PARTE 3: ESTRUTURA DE ÁREAS E RESPONSÁVEIS
### 3.1 Conceito de Áreas
**3.1.1** Quais **áreas/equipes** existem na Click para o sistema de marketing?

| Área | Existe? | Tem Head? | Tem Coordenador? |
| ---| ---| ---| --- |
| Criativos/Audiovisual | \[ \] | \[ \] | \[ \] |
| Design | \[ \] | \[ \] | \[ \] |
| Conteúdo/Redação | \[ \] | \[ \] | \[ \] |
| Tráfego/Performance | \[ \] | \[ \] | \[ \] |
| Influencers | \[ \] | \[ \] | \[ \] |
| Social Media | \[ \] | \[ \] | \[ \] |
| Blog/SEO | \[ \] | \[ \] | \[ \] |
| Compliance | \[ \] | \[ \] | \[ \] |
| Médico | \[ \] | \[ \] | \[ \] |
| Jurídico | \[ \] | \[ \] | \[ \] |
| Financeiro | \[ \] | \[ \] | \[ \] |
| Outra: \_\_\_ | \[ \] | \[ \] | \[ \] |

**3.1.2** Uma pessoa pode estar em **múltiplas áreas**?
*   \[ x\] Sim
*   \[ \] Não
**3.1.3** Uma área pode ter **múltiplos coordenadores**?
*   \[ x\] Sim
*   \[ \] Não, só um
* * *
### 3.2 Hierarquia
**3.2.1** A hierarquia é fixa assim?

```scss
Super Admin
    └── Head (opcional por área)
        └── Coordenador (opcional por área)
            └── Equipe (executores)
```

*   \[ x\] Sim, essa estrutura
*   \[ \] Não, precisa de mais níveis: \_\_\_
*   \[ \] Não, precisa de menos níveis
**3.2.2** Se área **não tem Head**, quem recebe escalonamentos?
*   \[ x\] Super Admin
*   \[ \] Coordenador da área
*   \[ \] Head de área relacionada
*   \[ \] Configurável por área
**3.2.3** Se área **não tem Coordenador**, quem gerencia a equipe?
*   \[ x\] Head (se existir)
*   \[ x\] Super Admin
*   \[ \] Auto-gestão (equipe sem gestor)
* * *
### 3.3 Configuração de Áreas
**3.3.1** Ao criar/editar uma área, quais campos?

| Campo | Obrigatório? |
| ---| --- |
| Nome da área | \[ x\] |
| Descrição | \[ \] |
| Head | \[ \] |
| Coordenador(es) | \[ \] |
| Membros da equipe | \[ \] |
| Email de contato | \[ \] |
| Tipos de request que atende | \[ \] |

Acho que os outros seriam opcionais. mas coloque o que for necessário para a regra de negócio

**3.3.2** O sistema deve **sugerir automaticamente** responsáveis baseado na área do request?
*   \[x \] Sim, sugere mas pode alterar
*   \[ \] Sim, obrigatório ir para a área
*   \[ \] Não, sempre escolha manual
**3.3.3** Deve ter **visualização de organograma** das áreas?
*   \[ x\] Sim
*   \[ \] Não, só lista
* * *
### 3.4 Atribuição de Requests
**3.4.1** Quando um request chega para uma **área** (não pessoa específica), como distribuir?

| Método | Usar? |
| ---| --- |
| Primeiro que pegar | \[x \] |
| Round-robin (alternado) | \[ \] |
| Quem tem menos na fila | \[ \] |
| Coordenador distribui manualmente | \[ \] |
| Configurável por área | \[ \] |

**3.4.2** Se ninguém da área pegar em X tempo, o que acontece?
*   \[x \] Alerta para coordenador
*   \[x \] Alerta para head
*   \[ x\] Escala para super admin
*   \[ \] Configurável
**3.4.3** Uma pessoa pode **ver requests** de outras áreas?
*   \[x \] Sim, todos
*   \[ \] Só se tiver permissão
*   \[ \] Não, só da sua área
* * *
## PARTE 4: NOMENCLATURA DE ANÚNCIOS
### 4.1 Estrutura do Nome
**4.1.1** Você mencionou a estrutura `[909] [V1] [REELS]...`. Qual é a estrutura **completa**?
Tem que ver os exemplos que temos hoje no arquivo @manual\_nomenclaturas\_click\_ads em /docs no sistema.

**4.1.3** O sistema deve **gerar automaticamente** a nomenclatura ou usuário digita?
*   \[ \] Automático baseado nos campos
*   \[ \] Usuário digita seguindo padrão
*   \[ x\] Sistema sugere, usuário pode ajustar
**4.1.4** Ao criar **variação** (V2, V3), o que muda no nome?
*   \[x \] Só o número da versão
*   \[ \] Versão + data
*   \[ \] Outro: \_\_\_

* * *
## PARTE 5: INTEGRAÇÕES AUTOMÁTICAS
### 5.1 Tasks Automáticas
**5.1.1** Quais **tasks automáticas** devem ser criadas?

| Gatilho | Task criada | Para quem |
| ---| ---| --- |
| Criativo aprovado | Subir em Ads | Gestor de tráfego |
| Contrato aprovado | Verificar onboarding influencer | Bruna |
| Artigo publicado | Revisar em 60 dias | Redatora |
| Criativo no ar há 7 dias | Analisar performance | Gestor de tráfego |
| Prazo estourando | Cobrar responsável | Coordenador |
| Outro: \_\_\_ | \_\_\_ | \_\_\_ |

pense em quais outras

* * *
## PARTE 6: PRIORIZAÇÃO MVP
Importante deixarmos certo a logica de aprovação, abrir requests, áreas, etc.