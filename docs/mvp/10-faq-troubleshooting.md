# FAQ & Troubleshooting

[◀ Anterior](09-exemplos-uso.md) | [Índice](README.md) | [Próximo ▶](11-contexto-click-cannabis.md)

---

## Perguntas Frequentes (FAQ)

### 1. Posso aprovar meu próprio request?
**Resposta**: Sim, para evitar gargalos em tarefas simples. Um admin pode aprovar seu próprio request. A ação fica registrada no histórico.

---

### 2. O que acontece se o deadline passar?
**Resposta**: Nada funcional, apenas um alerta visual para priorização. O sistema continua funcionando normalmente. O deadline expirado aparece com badge vermelha na lista.

---

### 3. Posso anexar arquivos?
**Resposta**: No MVP, use links (Google Drive, Frame.io, Figma) na descrição do request. Upload de arquivos será adicionado na Fase 2.

---

### 4. Quem recebe e-mail?
**Resposta**: Ninguém. O MVP foca em notificações dentro da plataforma (toasts e badges). Notificações por e-mail/WhatsApp serão adicionadas na Fase 2.

---

### 5. Posso deletar um request?
**Resposta**: Não. Apenas cancelar, para manter o histórico de auditoria. Requests cancelados ficam riscados na lista.

---

### 6. Como mudo um request de 'Approved' para 'Draft'?
**Resposta**: Não é possível. Deve-se criar um novo request ou cancelar e refazer. Isso garante rastreabilidade.

---

### 7. A Oslo vê os requests da equipe interna?
**Resposta**: Sim, transparência total é uma decisão de negócio. Todos veem todos os requests.

---

### 8. Existe limite de requests?
**Resposta**: Não. O sistema é escalável para 200+ vídeos/mês.

---

### 9. O sistema funciona no celular?
**Resposta**: Sim, a interface Untitled UI é responsiva e funciona em todos os tamanhos de tela.

---

### 10. Como peço uma nova funcionalidade?
**Resposta**: Abra um request do tipo "Análise/Otimização" para o Pedro (Super Admin).

---

## Resolução de Problemas (Troubleshooting)

### Problema 1: "Botão de aprovação não aparece"

**Sintomas**:
- Você está vendo um request em status `pending` ou `in_review`
- Não consegue clicar em "Aprovar" ou "Rejeitar"

**Causas Possíveis**:
1. Você não é admin/head
2. Você não clicou em "Iniciar Revisão" primeiro
3. Seu role foi removido

**Solução**:
1. Verifique se você clicou em "Iniciar Revisão" primeiro (status deve ser `in_review`)
2. Verifique se seu role é Admin ou Head (pergunte ao Pedro)
3. Faça logout e login novamente

---

### Problema 2: "Não consigo editar"

**Sintomas**:
- Botão "Editar" está desabilitado
- Campos estão em read-only

**Causas Possíveis**:
1. Request não está em status `draft`
2. Você não é o criador
3. Request foi rejeitado e você não clicou em "Corrigir"

**Solução**:
1. Requests só são editáveis em status `draft`
2. Se estiver `rejected`, clique em "Corrigir" para voltar para `draft`
3. Se estiver `pending` ou `in_review`, aguarde rejeição ou cancelamento
4. Se estiver `approved`, crie um novo request

---

### Problema 3: "Erro de Timezone"

**Sintomas**:
- Deadline aparece com horário errado
- Diferença de 3 horas (UTC vs Brasília)

**Causas Possíveis**:
1. Relógio do computador está errado
2. Timezone do navegador está configurado errado

**Solução**:
1. Certifique-se que o relógio do seu computador está correto
2. O sistema usa o horário de Brasília (UTC-3)
3. Se o problema persistir, limpe o cache do navegador

---

### Problema 4: "Request sumiu"

**Sintomas**:
- Você criou um request, mas não consegue encontrá-lo na lista
- Busca não retorna resultados

**Causas Possíveis**:
1. Há filtros ativos (ex: filtrando apenas por 'Pending')
2. Request foi cancelado
3. Você está na página errada

**Solução**:
1. Verifique se há filtros ativos (Status, Tipo, Prioridade)
2. Limpe todos os filtros clicando em "Limpar Filtros"
3. Procure por "Cancelado" se achar que foi cancelado
4. Use a busca por título

---

### Problema 5: "Erro ao submeter"

**Sintomas**:
- Botão "Submeter" está desabilitado
- Toast de erro aparece

**Causas Possíveis**:
1. Título tem menos de 3 caracteres
2. Descrição tem menos de 10 caracteres
3. ContentType não foi selecionado
4. Deadline é inválido

**Solução**:
1. Verifique se o título tem pelo menos 3 caracteres
2. Verifique se a descrição tem pelo menos 10 caracteres
3. Selecione um ContentType
4. Verifique se o deadline é válido (mínimo +1h a partir de agora)
5. Toast de erro lista os campos faltantes

---

### Problema 6: "Sessão expirada"

**Sintomas**:
- Você é redirecionado para a página de login
- Toast: "Sua sessão expirou"

**Causas Possíveis**:
1. Você ficou inativo por mais de 24 horas
2. Você foi desconectado por outro dispositivo
3. Cookies foram limpos

**Solução**:
1. Faça logout e login novamente
2. Verifique se seus cookies estão habilitados
3. Tente em uma aba anônima para descartar problemas de cache

---

### Problema 7: "Lentidão na lista"

**Sintomas**:
- Lista de requests demora para carregar
- Filtros são lentos

**Causas Possíveis**:
1. Muitos requests na lista (1000+)
2. Conexão de internet lenta
3. Navegador com muitas abas abertas

**Solução**:
1. O sistema carrega os últimos 50 por padrão
2. Use a busca para itens antigos (mais rápido)
3. Aplique filtros para reduzir resultados
4. Feche outras abas do navegador
5. Tente em outro navegador

---

### Problema 8: "Justificativa de rejeição não salva"

**Sintomas**:
- Você preenche o motivo de rejeição
- Botão "Confirmar" continua desabilitado

**Causas Possíveis**:
1. Motivo tem menos de 10 caracteres
2. Motivo tem apenas espaços em branco
3. Há caracteres especiais problemáticos

**Solução**:
1. Verifique se o motivo tem pelo menos 10 caracteres reais (sem contar espaços)
2. Não use apenas espaços em branco
3. Tente remover caracteres especiais
4. Exemplo válido: "Falta definir o CTA final do vídeo" (35 caracteres)

---

### Problema 9: "Dois admins tentando revisar ao mesmo tempo"

**Sintomas**:
- Você clica em "Iniciar Revisão"
- Toast: "Este request já está sendo revisado por outro usuário"

**Causas Possíveis**:
1. Outro admin clicou em "Iniciar Revisão" no mesmo request
2. Você está em duas abas diferentes

**Solução**:
1. Aguarde o outro admin terminar a revisão
2. Feche a outra aba
3. Recarregue a página

---

### Problema 10: "Não consigo ver requests de outro usuário"

**Sintomas**:
- Você procura um request criado por outro usuário
- Não consegue encontrar

**Causas Possíveis**:
1. Há filtro ativo por "Criador"
2. Request foi cancelado
3. Você está filtrando por status específico

**Solução**:
1. Limpe todos os filtros
2. Use a busca por título
3. Verifique se o request não foi cancelado
4. Lembre-se: todos veem todos os requests (transparência total)

---

## Checklist de Troubleshooting

Antes de contatar o suporte, verifique:

- [ ] Você está logado?
- [ ] Sua sessão expirou? (faça login novamente)
- [ ] Há filtros ativos? (limpe-os)
- [ ] Você tem a role correta? (pergunte ao Pedro)
- [ ] O relógio do seu computador está correto?
- [ ] Você está usando um navegador moderno? (Chrome, Firefox, Safari, Edge)
- [ ] Você limpou o cache do navegador?
- [ ] Você tentou em uma aba anônima?
- [ ] Você tentou em outro navegador?

---

## Contato para Suporte

Se o problema persistir:
1. Anote o erro exato (screenshot)
2. Anote o horário e o request ID
3. Contate o Pedro (Super Admin) via WhatsApp ou e-mail

---

[◀ Anterior](09-exemplos-uso.md) | [Índice](README.md) | [Próximo ▶](11-contexto-click-cannabis.md)
