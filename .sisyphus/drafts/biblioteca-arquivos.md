# Draft: Biblioteca de Arquivos

## Requirements (confirmed)

### Biblioteca de Arquivos
- **Nome no sidemenu**: "Biblioteca"
- **Posicao no menu**: General section, apos "Criadores"
- **Icone**: Folder/Pasta
- **Layout**: Grid com thumbnails + Lista com toggle (usuario escolhe)
- **Metadados**: Completo (nome, tamanho, tipo, URL, data, usuario, descricao/nota, tags)
- **Funcionalidades**: Upload direto, filtros/busca, preview inline, download, editar metadados, arquivar (soft delete)
- **Tipos de arquivo**: Blacklist (bloqueia .exe, .sh, .bat, etc)
- **Tamanho maximo**: 50MB (base64) - futuro: migrar para signed URLs
- **Compartilhamento**: Todos veem todos os arquivos

### Sistema de Tags
- **Criacao**: Todos podem criar tags ao fazer upload
- **Gerenciamento**: Admins em /admin/tags
- **Selecao**: Usuario seleciona tags existentes + pode criar novas

### Filtros na biblioteca
- Por tipo de arquivo (imagem, documento, video, etc)
- Por tags
- Por status (ativo/arquivado)
- Busca: nome + descricao

### Upload no formulario de Request
- **Posicao**: Antes da secao "Criadores"
- **Label**: "Referencias Visuais"
- **Obrigatorio**: Nao (opcional)
- **Comportamento**: Upload novo OU selecionar da biblioteca
- **Centralizacao**: Todo upload vai automaticamente para biblioteca
- **Seletor**: Modal com grid (Untitled UI modal)
- **Limite por request**: Sem limite

### Edicao posterior
- Pode adicionar/remover arquivos depois de criado
- Exibicao: Secao com grid de thumbnails

### Thumbnails
- Imagens: thumbnail real (usa URL do Vercel Blob)
- Outros tipos: icone por tipo de arquivo

### Arquivamento
- Soft delete (nunca hard delete)
- Mantem vinculo com requests
- Mostra com badge "Arquivado" no request

## Technical Decisions
- **Upload**: Base64 via Vercel Blob (limite 50MB) - manter arquitetura atual
- **Futuro**: Migrar para signed URLs para arquivos grandes
- **Schema**: Novo arquivo file.prisma seguindo padrao multi-file
- **Router**: Novo fileRouter + fileTagRouter

## Research Findings
- Projeto usa Prisma multi-file schema
- Upload atual: useFileUpload hook + uploadRouter com Vercel Blob
- Sidebar: NavListSections com sections array
- FileUpload.DropZone ja existe com drag & drop

## Scope Boundaries
- **INCLUDE**: Biblioteca, tags, upload no request, modal seletor
- **EXCLUDE**: Folders/hierarquia, versionamento, bulk operations, integracao externa, AI tagging
