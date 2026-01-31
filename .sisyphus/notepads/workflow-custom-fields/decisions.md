# Workflow Custom Fields - Architectural Decisions

## Decision Log

### 2026-01-30: Plan Initialization
- **Decision**: Execute 9 tasks in 3 waves
- **Wave 1**: Task 1 (Schema) + Task 4 (Admin UI) - parallel
- **Wave 2**: Task 2 (Backend endpoints) + Task 3 (Validation) + Task 5 (Permission hook) - parallel after Wave 1
- **Wave 3**: Task 6 (InlineFieldEditor) + Task 7 (View page) + Task 8 (Version history) + Task 9 (Validation UI) - sequential after Wave 2

### Unassigned Fields Label
- **Decision**: Use "Desagrupado" for fields without assignedStepId
- **Rationale**: User explicitly requested this term over "Geral"

### Auto-Save Strategy
- **Decision**: onBlur for standard fields, dedicated save button for WYSIWYG
- **Rationale**: WYSIWYG content can be large; accidental blur could trigger unwanted saves

### Permission Model
- **DRAFT**: Creator can edit all fields
- **REJECTED**: Creator OR area member of target step can edit all fields
- **IN_REVIEW/PENDING**: Only area members of current step can edit fields assigned to that step (or unassigned fields that are empty)
- **APPROVED**: Only admin can edit any field
- **CANCELLED**: Nobody can edit

### Versioning Strategy
- **Decision**: Create FieldValueVersion record on every save
- **Fields**: oldValue, newValue, changedById, stepId (which step was active), createdAt
- **UI**: Show last 10 versions with "Ver mais" link
