# Draft: Login Page Migration to Untitled UI

## Requirements (confirmed)
- Migrate login page to split-screen design with Untitled UI components
- Create missing SocialButton component (UI-only for Google - OAuth not configured in backend)
- Create simple Form wrapper component
- Replace SignInForm and SignUpForm with new Untitled UI versions
- Maintain existing auth flow with authClient.signIn.email / authClient.signUp.email
- Support both SignIn and SignUp flows with toggle
- Handle loading/error states properly

## Technical Decisions
- **Component Location**: New components go in `apps/web/src/components/base/buttons/` for SocialButton
- **Form Wrapper**: Simple HTML form passthrough - no complex wrapper needed since project uses @tanstack/react-form directly
- **Auth Client**: Uses Better-Auth with email/password ONLY (NO Google OAuth)
- **Form Library**: @tanstack/react-form with Zod validation
- **Styling**: Tailwind CSS utility classes

## Research Findings

### Current Implementation
- **SignInForm**: Uses shadcn/ui (Button, Input, Label from `./ui/`)
- **SignUpForm**: Uses shadcn/ui components  
- **Login page**: Simple toggle between forms using `useState`
- **Auth**: Better-Auth with `authClient.signIn.email` and `authClient.signUp.email`

### Untitled UI Components Available
- **Button**: `@/components/base/buttons/button.tsx`
  - Props: size (sm|md|lg|xl), color (primary|secondary|tertiary|link-*|destructive variants)
  - Features: iconLeading, iconTrailing, isLoading, isDisabled
- **Input**: `@/components/base/input/input.tsx`
  - Props: label (integrated!), hint, size (sm|md), placeholder, icon, isInvalid
  - Uses react-aria-components TextField wrapper
- **Checkbox**: `@/components/base/checkbox/checkbox.tsx`
  - Props: label, hint, size (sm|md)
- **UntitledLogo**: `@/components/foundations/logo/untitledui-logo.tsx`

### Key Patterns
- Untitled UI Input has INTEGRATED label prop (no separate Label component needed)
- Button supports `isLoading` state with spinner
- Checkbox uses react-aria-components
- Loader component uses `lucide-react` Loader2 icon

## Design Decisions (Defaults Applied)
- **Form Position**: Left side (Logo + Form on left, Dashboard mockup on right) - standard LTR pattern
- **Default View**: Sign In form first (fixing the current bug where SignUp shows first)
- **Dashboard Image**: Placeholder gradient/pattern (user can replace with actual image later)
- **Google Button Behavior**: Show "Coming Soon" toast when clicked (user-friendly feedback)

## Scope Boundaries
- INCLUDE:
  - SocialButton component creation
  - Form wrapper component creation  
  - SignInForm redesign with split-screen layout
  - SignUpForm redesign with split-screen layout
  - Login page update to use new forms
  
- EXCLUDE:
  - Google OAuth backend integration (UI-only button for now)
  - Changes to auth-client.ts
  - Changes to Better-Auth configuration
  - Dashboard redirect changes
