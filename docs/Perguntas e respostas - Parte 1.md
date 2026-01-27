# 1

## Perguntas Estratégicas para Definição do Escopo
### 1\. Arquitetura e Infraestrutura
**1.1 Banco de Dados**
*   O sistema vai usar o banco PostgreSQL existente da Click ou vai ser um banco separado?
*   Se separado: você quer PostgreSQL, SQLite (mais simples), ou outro?
Resposta: Usaremos um novo banco de dados que será criado local inicialmente, depois iremos conectar com vercel, neon. O Banco é em postgree.

**1.2 Hospedagem**
*   Vai rodar em servidor próprio da Click ou em cloud (Vercel, Railway, etc)?
*   Precisa de domínio próprio (ex: [marketing.clickcannabis.com.br](http://marketing.clickcannabis.com.br/))?
Resposta: Ainda não tenho definido

**1.3 Autenticação**
*   Quem vai ter acesso? Toda equipe Click + Oslo?
*   Precisa de níveis de permissão (admin, editor, visualizador)?
Resposta: Super Admin, Heads, Coordenadores, Equipe (redatores, social media, etc - cada um com suas permissões)
* * *
### 2\. Relação com Ferramentas Existentes
**2.1 ClickUp**
*   O sistema vai **substituir** o ClickUp para marketing ou **complementar**?
*   Se complementar: quer sincronização bidirecional (tasks criadas aqui aparecem lá e vice-versa)?
Resposta: Substituir
**2.2 Google Drive**
*   Onde ficam os arquivos finais dos criativos hoje? Drive?
*   O sistema deve gerenciar arquivos ou apenas linkar para o Drive?
Resposta: Está em um drive, mas iremos subir manualmente. Usaremos Blob da Vercel

**2.3 Meta Ads Manager**
*   Quer integração automática para puxar métricas de performance?
*   Ou vai ser input manual do Rafael Pro?
Resposta: Temos um banco de dados para puxar - postgresql://click:52439100@159.203.75.72:5432/adtracker

**2.4 Strapi (Blog)**
*   Qual tipo de integração você imagina? Apenas link para o Strapi ou gestão do pipeline de conteúdo (pauta → redação → revisão → publicação)?
Resposta: A ideia é gerir o blog dentro do sistema, mas somente em versões futuras. Agora seria principalmente a feature de mapear quais próximos artigos precisam ser desenvolvidos, um local para a Content Manager solicitar artigos, e um local para a redatora enviar os textos (onde ela pode salvar como rascunho e depois voltar a redigir)

* * *
### 4\. Fluxo de Trabalho
**4.1 Nomenclatura de Criativos** Na reunião foi mencionado um "fluxo de validação do nome do criativo". Existe um padrão de nomenclatura definido? Ex: `[DATA]_[PATOLOGIA]_[TIPO]_[VERSÃO]`
Resposta: Precisa ser editável nas configurações do sistema

**4.2 Validadores por Etapa** Confirme quem valida o quê:
*   Compliance do roteiro: Jurídico, Médico, Content Manager (Nem todos vao precisar sempre validar, pode ser configurável isso)
*   Qualidade do design: Vidjai, Mauro, Pedro Mota
*   Performance pós-teste: Rafael Pro, Lucas Rouxinol
*   Aprovação final: Pedro Mota, Lucas Rouxinol, Head de marketing...
**4.3 SLA de Entregas** Existem prazos definidos para cada etapa? Ex:
Resposta: Vai depender da task, ainda nao tenho isso mapeado
* * *
### 5\. Integrações Técnicas
**5.1 N8N**
*   O sistema pode usar N8N para automações (notificações, sincronizações)?
*   Já existe algum workflow de marketing no N8N?
Nao precisa usar n8n, o sistema pode fazer as integrações direto com o que for necessario, usando Resend para mandar emails, notificações interna da plataforma.