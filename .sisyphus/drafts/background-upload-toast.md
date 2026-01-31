# Draft: Background Upload Toast Progress

## Requirements (confirmed)
- When files are dropped/selected, close the modal IMMEDIATELY
- Show a persistent toast in bottom-right corner with upload progress
- Toast should show: total files, overall progress ("2 of 5 files uploaded"), visual progress bar
- Toast should persist until all uploads complete
- On completion, show success toast with count
- On error, show error toast but continue other uploads
- Work for any number of files (1 or many)

## Technical Constraints (confirmed)
- Use sonner's `toast.custom()` for custom progress toast component
- Use toast ID to update the same toast as progress changes
- Toast must not auto-dismiss until uploads complete (duration: Infinity)
- Uploads should continue even if user navigates away (nice to have)

## Research Findings

### Current Implementation
- **Library page**: `apps/web/src/app/library/page.tsx`
  - Modal stays open during uploads
  - `uploadingFiles` Map state tracks progress: `Map<string, { progress: number; file: File }>`
  - Two upload methods: `useFileUpload` (Base64, fake progress) and `useR2Upload` (XHR, real progress)
  - `handleFilesDropped` processes files sequentially in a for loop

### Upload Hooks
- **useFileUpload**: Fakes progress (10% -> 30% -> 100%) for Base64/tRPC uploads
- **useR2Upload**: Real progress via XHR for video files

### Toast System
- Sonner configured in `providers.tsx`: `<Toaster richColors />`
- Custom styling in `apps/web/src/components/ui/sonner.tsx`
- Currently only uses `toast.success()`, `toast.error()` - no custom toasts

### Sonner API (from Context7)
- `toast.custom(<Component />)` for custom React components
- `toast("message", { duration: Infinity })` for persistent toasts
- `toast.dismiss(toastId)` to programmatically dismiss
- `toast.success("message", { id: toastId })` to update existing toast by ID

### Existing Progress UI Components
- `FileUpload.ListItemProgressBar` - Rich component with file icon, name, size, progress bar
- `ProgressBar` - Simpler base progress bar component
- Both support progress percentage display

## Technical Decisions
- **Toast positioning**: Sonner's default is bottom-right, which matches requirement
- **State management**: Need to track uploads globally (not in modal)
- **Parallel uploads**: Current implementation is sequential - TBD if this should change

## User Decisions (Confirmed)
1. **Upload Strategy**: Sequential - Keeps current behavior
2. **Progress Detail**: Summary only - "2 de 5 arquivos enviados" with single progress bar
3. **Error Handling**: Show error count, continue others - "X enviados, Y falharam"
4. **Language**: Portuguese - matches existing UI

## Scope Boundaries
- INCLUDE: Toast component, handleFilesDropped changes, state management
- EXCLUDE: Changes to upload hooks themselves, navigation persistence (nice-to-have), retry functionality
