# Ads Types Fase 4 — Integration & Polish — Learnings

## Initialized: 2026-01-31


## UX Polish — Confirmation Dialogs & Loading States

### AlertDialog Pattern
- Import from `@/components/ui/alert-dialog` (base-ui, NOT shadcn)
- Use `open={showDialog}` + `onOpenChange={(open) => !open && setShowDialog(false)}` pattern
- Components: AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
- AlertDialogAction onClick fires the mutation; AlertDialogCancel auto-closes

### Cancel/Delete Project on Detail Page
- Cancel Project: status === "ACTIVE", uses trpc.adProject.cancel, color="secondary-destructive"
- Delete Project: status === "DRAFT", uses trpc.adProject.delete, color="primary-destructive", redirects to /ads-requests
- Both require useState for dialog open state and useMutation for the action
- Needed to import: useState, useRouter (next/navigation), useMutation, toast, Button, AlertDialog components

### Loading Text on Buttons
- Pattern: `{mutation.isPending ? "Verbo..." : "Texto Normal"}`
- Applied to all advancePhase, approvePhase6, updatePhaseStatus, regressMutation, createMutation buttons
- Phase 6 VideoPublicacaoCard needed extra props (isApprovePending, isPublishPending) because isPending was combined

### Deliverable Card Delete Confirmation
- Added showDeleteDialog state, changed onClick to open dialog instead of direct mutate
- AlertDialog renders inside the card's root div (works fine since it portals to body)

### Files Modified
- ads-requests/[id]/page.tsx: Cancel/Delete buttons + AlertDialogs
- deliverable-card.tsx: Delete confirmation AlertDialog
- phase-1-briefing.tsx: Loading text on "Aprovar Briefing e Avancar"
- phase-2-roteiro.tsx: Loading text on "Avancar para Fase 3"
- phase-3-elenco.tsx: Loading text on "Avancar para Fase 4"
- phase-4-producao.tsx: Loading text on "Marcar como Entregue" + "Avancar para Fase 5"
- phase-5-revisao.tsx: Loading text on "Avancar para Fase 6"
- phase-6-publicacao.tsx: Loading text on "Aprovar e Atribuir AD Numbers" + "Marcar como Publicado"
- video-regression-dialog.tsx: Loading text on "Enviar de Volta"
- deliverable-form.tsx: Loading text on "Salvar Hook"
