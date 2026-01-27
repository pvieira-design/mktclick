# 3

# Mais Perguntas - Módulos que Faltavam
## MÓDULO 7: DASHBOARD DE PERFORMANCE DE ADS (Perguntas 51-62)
**51.** Vocês já têm os **dados de Ads no banco PostgreSQL** da Click? Quais tabelas/campos estão disponíveis? (impressões, cliques, gastos, conversões por criativo?)
Resposta: Sim

**52.** Qual a **fonte primária** dos dados de Ads hoje? Meta Ads API direto no banco? Export manual? Integração via N8N?
Resposta: Banco de dados, enviei em outro arquivo

**53.** Quais **métricas são obrigatórias** no dashboard? Liste as top 10 que não podem faltar.
Resposta: Custo por click\_deal, pagamento de consulta (payment\_consulting), pagamento de orçemento (product\_budget), ROAS (com base no budget value)

**54.** Quer ver métricas **por criativo individual** ou só **agregadas por campanha/conjunto**?
Resposta: Ambos

**55.** Precisa de **comparativo temporal**? (Ex: essa semana vs semana passada, esse mês vs mês anterior)
Resposta: Sim, mas não precisa no MVP

**56.** Quer **filtros por patologia**? (Ex: ver só performance de criativos de insônia)
Resposta: Sim

**59.** Quem deve ter **acesso ao dashboard**? Só gestão? Toda equipe de marketing? Oslo também?
Resposta: Preciso selecionar quem tem a skill de acesso ao dashboard

**62.** Precisa de **exportação** dos dados do dashboard para Excel/PDF para apresentar em reuniões?
Resposta: Não precisa
* * *
## MÓDULO 8: REDES SOCIAIS - CALENDÁRIO E PUBLICAÇÕES (Perguntas 63-72)
**63.** O sistema deve **gerenciar publicações** de quais redes?
Resposta: (Instagram, LinkedIn, YouTube)
**64.** Quer um **calendário visual** (tipo Kanban por dia/semana) ou só uma lista de publicações agendadas?
Resposta: Kanban, lista, calendario.

**65.** O sistema deve **publicar automaticamente** (integração com APIs das redes) ou só organizar o que vai ser publicado manualmente?
Resposta: Manualmente no MVP

**66.** Precisa de **aprovação** antes de uma publicação ir ao ar? Quem aprova?
Resposta: Sim, quem aprova é configurável, precisa ter nas configs os fluxos que existem e quem aprova cada etapa (podendo selecionar pessoa, um grupo de pessoas)

**67.** Quer **templates de publicação** por tipo? (Ex: template de carrossel educativo, template de reels)
Resposta: Nao precisa

**68.** Precisa vincular publicação de rede social com **criativo do módulo de Ads**? (Ex: esse post do Instagram também virou um anúncio)
Resposta: Nao precisa

**69.** Quer rastrear **métricas de cada publicação**? (Likes, comentários, shares, alcance) - input manual ou integração?
Resposta: Nao precisa no MVP, futuramente sim

**72.** Quer **histórico de tudo que foi publicado** com filtros por rede, data, tipo, performance?
Resposta: Sim
* * *
## MÓDULO 9: ENDOMARKETING (Perguntas 73-78)
**73.** Quais são as **ações de endomarketing** que acontecem hoje?
Resposta: Aniversariantes, comunicados internos, celebrações, competições...

**74.** O sistema deve **automatizar** o envio de feliz aniversário ou só lembrar quem é responsável?
Resposta: Não

**75.** Precisa de um **mural/feed interno** onde a equipe vê comunicados?
Resposta: Sim

**76.** Quer integrar com **lista de colaboradores** do RH/banco da Click para puxar aniversários automaticamente?
Resposta: Não precisa

**77.** Endomarketing inclui **onboarding de novos funcionários**? (Kit de boas-vindas, apresentação da marca)
Resposta: Não precisa nesse sistema, apenas o fluxo de enviar comunicados, avisos, etc.

**78.** Precisa rastrear **engajamento interno**? (Ex: quantos viram o comunicado, quantos reagiram)
Resposta: Não
* * *
## MÓDULO 10: TRADE MARKETING / CLICK STORE (Perguntas 79-86)
**79.** O que exatamente entra em **Trade Marketing**? (Outdoor, guarda-sol, motoristas de app, eventos presenciais, Click Store?)
Resposta: Controle de guarda-sol (eu preciso selecionar no mapa um local e depois registro entregas e perdas que foram feitos naquele local, 1 vez por mes é a validação de quantidade restante, para sabermos quanto perdemos, quantos mandamos, etc.)
Controle de outdoor onde eu seleciono pontos no mapa que temos outdoors, data de inicio, data fim.
Apenas esses dois controles por agora.

**80.** Precisa de **controle de estoque** de materiais físicos? (Quantos guarda-sóis temos, quantos kits Click Store disponíveis?)
Resposta: Não agora. Futuramente pensamos em como fazer isso , integrado com shopify, correios, envio de kits, etc.

**81.** Como funciona a **Click Store**? É loja física? É envio de kits para parceiros? Precisa de gestão de pedidos?
Resposta: Loja online shopify

**83.** Precisa de **calendário de eventos** presenciais? (Feiras, congressos, ações de rua)
Resposta: Sim, calendário de eventos e calendário de datas especiais (util para social media)

**84.** Quer vincular **custos de trade marketing** com resultados? (Ex: gastamos X no evento Y, geramos Z leads)
Resposta: Não precisa agora, futuramente sim quando voltarmos a investir em outdoors. Trademarketing implementamos na V2

**86.** Precisa de **galeria de fotos** das ações realizadas? (Para registro e reuso em materiais futuros)
Resposta: Sim, fotos e arquivos de videos.

* * *
## MÓDULO 11: GESTÃO DE PROPOSTAS E PARCERIAS (Perguntas 87-94)
**87.** Por quais **canais** chegam propostas?
Resposta: Instagram DM, email, WhatsApp, LinkedIn, indicação?

**88.** Quem **recebe** essas propostas hoje? Samira? Pedro? Várias pessoas?
Resposta: Aleatorio

**89.** Qual o **fluxo de uma proposta**?
Resposta: Recebida → Triagem → Análise → Negociação → Fechada/Rejeitada?

**90.** Precisa de **categorização** das propostas? (Influencer, Parceria B2B, Evento, Mídia, Outro?)
Resposta: Sim, temos um fluxo no N8N que cataloga todas as propostas recebidas no email e cria a task no clickup, podemos pensar em algo do tipo.

**91.** Quer um **histórico de todas as propostas** recebidas, mesmo as rejeitadas? Para análise futura?
Resposta: Sim

**92.** Precisa de **templates de resposta** para propostas? (Ex: resposta padrão de rejeição educada)
Resposta: Não precisa agora, futuramente sim

**93.** Quem tem **autoridade** para aprovar/rejeitar cada tipo de proposta?
Resposta: Preciso selecionar quem tem essa skill

**94.** Quer **métricas de propostas**? (Quantas recebemos por mês, taxa de conversão, tempo médio de resposta)
Resposta: Sim
Podemos ter um formulário que enviamos para as pessoas preencherem, e criara automaticamente a reuqest em nosso fluxo como pendente.

* * *
## MÓDULO 12: CALENDÁRIO EDITORIAL E DATAS COMEMORATIVAS (Perguntas 95-100)
**95.** Quer um **calendário unificado** que mostre tudo? (Publicações de redes, entregas de criativos, posts do blog, eventos, datas comemorativas)
Resposta: Sim

**96.** Quais **datas comemorativas** são relevantes para a Click? (Dia da Cannabis, datas de saúde, feriados comerciais?)
Resposta: Sim

**97.** Precisa de **planejamento antecipado**? (Ex: 30 dias antes de uma data comemorativa, criar task automática para planejar ação)
Resposta: Sim

**98.** Quer **visão por semana, mês ou trimestre**?
Resposta: todos possíveis que seriam uteis

**99.** O calendário deve ser **editável por todos** ou só por gestores?
Resposta: Preciso configurar quem tem essa skill

**100.** Precisa de **sincronização com Google Calendar** da equipe?
Resposta: Não

* * *
## MÓDULO 13: BIBLIOTECA DE ASSETS E BRANDBOOK (Perguntas 101-108)
**101.** Onde ficam os **arquivos finais** hoje? (Google Drive? Servidor? Espalhados?)
Resposta: Espalhados

**102.** Quer uma **biblioteca centralizada** no sistema ou só links organizados para o Drive?
Resposta: Centralizado

**103.** Precisa de **categorização de assets**? (Por tipo: vídeo, imagem, áudio / Por uso: Ads, Social, Blog / Por patologia)
Resposta: Sim

**104.** Quer controle de **versões de assets**? (v1, v2, v3 do mesmo arquivo)
Resposta: SIm

**105.** Precisa de **busca por tags/palavras-chave** nos assets?
Resposta: Sim

**106.** O **Brandbook** deve estar no sistema? (Cores, fontes, regras de uso da marca)
Resposta: Podemos adicionar o PDF em um local de arquivos úteis

**107.** Precisa de **aprovação** antes de um asset entrar na biblioteca oficial?
Resposta: Não

**108.** Quer rastrear **onde cada asset foi usado**? (Ex: essa imagem foi usada no post X, no anúncio Y, no blog Z)
Resposta: Não precisa agora

* * *
## MÓDULO 14: REDATORES E COPYWRITING (Perguntas 109-114)
**109.** Além do blog, quais **outros textos** os redatores produzem?
Resposta: Copy de Ads, roteiros, landing pages, emails, WhatsApp Remarketing

**110.** Precisa de **banco de copies aprovadas** para reuso? (Ex: copies que performaram bem)
Resposta: Sim

**111.** Quer **templates de copy** por objetivo? (Conversão, awareness, remarketing?)
Resposta: Sim

**112.** Precisa de **revisão obrigatória** antes de uma copy ir para produção? Quem revisa?
Resposta: Sim, é configurável nas configs quem revisa

**113.** Quer rastrear **qual copy foi usada em qual criativo** e sua performance?
Resposta: Sim

**114.** Precisa de **briefing estruturado** para solicitar uma copy? (Objetivo, público, tom, CTA, referências)
Resposta: Opcional

* * *
## MÓDULO 15: RELATÓRIOS E REPORTS (Perguntas 115-120)
**115.** Quais **relatórios** o Lucas quer receber? (Semanal? Mensal? Por área?)
Resposta: Semanal

**116.** Os relatórios devem ser **gerados automaticamente** pelo sistema ou montados manualmente com dados do sistema?
Resposta: Futuramente quero que seja automatico

**117.** Quais **seções** um relatório de marketing deve ter? (Performance de Ads, entregas da Oslo, publicações, influencers, blog?)
Resposta: Não sei

**118.** Precisa de **comparativo com período anterior** nos relatórios?
Resposta: Acho que seria bom

**119.** Quer **envio automático** por email ou só disponível no sistema para download?
Resposta: Download apenas

**120.** Precisa de **relatório específico para a Oslo**? (O que eles entregaram, qualidade, prazos)
Resposta: Sim, além desses o resultado dos criativos. Mas eles também devem ter acesso aos detalhes dos resultados dos criativos que iremos criar.
* * *
## MÓDULO 16: CLICK EDUCA (Perguntas 121-125)
**121.** O que é o **Click Educa** exatamente? Cursos para médicos? Conteúdo educativo para pacientes? Ambos?
Resposta: Vai ser um local de educação de medicos, com videos e uma comunidade paga, masterclass (ainda nao existem), youtube gratuito (é o que já existe)
**122.** O Click Educa deve estar **dentro do sistema de marketing** ou é um produto separado?
Resposta: As entregas do click educa estao dentro do sistema, entregas de videos para youtube por exemplo, desde roteiro a entrega final. É um tipo de conteúdo (como os criativos, social media, etc)