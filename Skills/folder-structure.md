# Folder Structure Rules

## 1. Purpose

This document defines the official folder and file structure for Cliniva.

Its purpose is to ensure the codebase stays:

- predictable
- scalable
- easy to navigate
- domain-oriented
- safe for multiple developers and AI agents to extend

This file turns the architecture rules into concrete filesystem rules.

## 2. Core Folder Strategy

Cliniva must use a **domain-aware modular monolith** structure.

This means the repository should be organized by responsibility and domain, not by random file type sprawl.

The structure must support:

- clean route separation
- shared UI reuse
- isolated backend logic
- strong Supabase ownership boundaries
- future growth without large refactors

## 3. Top-Level Repository Structure

The repository should follow this structure:

```text
app/
components/
lib/
public/
supabase/
types/
Skills/
docs/
```

### 3.1 Top-Level Ownership

- `app`: Next.js routes, layouts, route-level UI, loading and error boundaries
- `components`: reusable UI primitives, common UI, form components, and feature UI
- `lib`: business logic, validations, permissions, integrations, utilities, repositories, constants
- `public`: static assets safe for public delivery
- `supabase`: migrations, seed data, database policies, optional SQL helpers
- `types`: shared TypeScript types and domain models
- `Skills`: project operating manuals for AI agents and engineers
- `docs`: additional documentation that is not a rulebook or migration file

## 4. `app` Structure Rules

The `app` folder is for route entry points only.

It must not become a dumping ground for reusable logic.

### 4.1 Official App Structure

```text
app/
  (marketing)/
  (auth)/
  (patient)/
  (provider)/
  (admin)/
  api/
  globals.css
  layout.tsx
  page.tsx
```

### 4.2 Route Group Rules

Use route groups to separate experience areas:

- `(marketing)`: public pages such as landing and product information
- `(auth)`: sign in, sign up, reset password
- `(patient)`: patient dashboard and patient actions
- `(provider)`: provider dashboard and care workflows
- `(admin)`: admin and operations workflows

### 4.3 Route File Rules

Inside route groups, route files may contain:

- page composition
- route-level data loading
- loading UI
- error UI
- route-specific metadata

They must not contain:

- reusable business logic
- duplicated validation logic
- direct integration implementation
- privileged database logic outside approved service patterns

### 4.4 App-Level Subfolder Guidance

Recommended route-area subfolders include:

```text
app/(auth)/sign-in/
app/(auth)/sign-up/
app/(auth)/forgot-password/
app/(patient)/dashboard/
app/(patient)/appointments/
app/(patient)/records/
app/(provider)/dashboard/
app/(provider)/appointments/
app/(provider)/consultations/
app/(provider)/notes/
app/(admin)/dashboard/
app/(admin)/users/
app/(admin)/audit/
app/api/appointments/
app/api/consultations/
app/api/webhooks/
```

## 5. `components` Structure Rules

The `components` folder exists for reusable UI and composed feature-facing UI.

### 5.1 Official Components Structure

```text
components/
  ui/
  common/
  forms/
  features/
```

### 5.2 Folder Meanings

- `components/ui`: low-level primitives with minimal product knowledge
- `components/common`: shared application-level UI used across multiple areas
- `components/forms`: reusable form wrappers and field components
- `components/features`: domain-specific composed UI grouped by feature

### 5.3 `components/ui`

Use for primitives such as:

```text
components/ui/input/
components/ui/textarea/
components/ui/select/
components/ui/checkbox/
components/ui/modal/
components/ui/table/
components/ui/badge/
components/ui/avatar/
components/ui/spinner/
components/ui/skeleton/
```

### 5.4 `components/common`

Use for shared application components such as:

```text
components/common/button/
components/common/card/
components/common/page-header/
components/common/section-header/
components/common/empty-state/
components/common/error-state/
components/common/status-badge/
components/common/layout-shell/
components/common/logo/
```

### 5.5 `components/forms`

Use for reusable form-level building blocks such as:

```text
components/forms/form-field/
components/forms/form-label/
components/forms/form-error/
components/forms/text-input/
components/forms/textarea-field/
components/forms/select-field/
components/forms/date-field/
components/forms/submit-button/
```

### 5.6 `components/features`

Group by domain:

```text
components/features/appointments/
components/features/consultations/
components/features/notes/
components/features/patient-profile/
components/features/provider-profile/
components/features/navigation/
components/features/notifications/
```

Each feature domain may contain multiple reusable pieces.

Example:

```text
components/features/appointments/
  appointment-card/
  appointment-list/
  appointment-booking-form/
  appointment-status-badge/
  provider-availability-form/
```

### 5.7 Component Folder Pattern

When a component is important or reusable, use this pattern:

```text
component-name/
  component-name.tsx
  component-name.types.ts
  component-name.test.tsx
  index.ts
```

This is preferred for all long-lived shared components.

## 6. `lib` Structure Rules

The `lib` folder owns application logic and non-UI shared code.

### 6.1 Official `lib` Structure

```text
lib/
  auth/
  permissions/
  validations/
  constants/
  errors/
  logging/
  utils/
  supabase/
  repositories/
  integrations/
  services/
```

### 6.2 Folder Meanings

- `lib/auth`: auth session helpers, auth guards, role resolution
- `lib/permissions`: centralized permission and policy helpers
- `lib/validations`: Zod schemas and shared validation modules
- `lib/constants`: app-wide constants and enums
- `lib/errors`: normalized error classes or mapping helpers
- `lib/logging`: structured logging, security logging, audit helpers
- `lib/utils`: pure utility helpers that are genuinely shared
- `lib/supabase`: browser, server, and admin Supabase clients plus Supabase helpers
- `lib/repositories`: reusable data access modules
- `lib/integrations`: third-party provider wrappers
- `lib/services`: business workflows grouped by domain

### 6.3 `lib/services`

Must be grouped by domain:

```text
lib/services/appointments/
lib/services/consultations/
lib/services/notes/
lib/services/profiles/
lib/services/notifications/
lib/services/audit/
```

### 6.4 `lib/integrations`

Integrations should be isolated:

```text
lib/integrations/daily/
lib/integrations/email/
lib/integrations/sms/
```

### 6.5 `lib/supabase`

Must be explicit:

```text
lib/supabase/browser/
lib/supabase/server/
lib/supabase/admin/
lib/supabase/shared/
```

### 6.6 `lib/utils` Rule

`lib/utils` must not become a random dumping ground.

A helper belongs in `lib/utils` only if it is:

- pure
- shared across domains
- not domain-specific
- not a hidden business rule

## 7. `types` Structure Rules

The `types` folder holds shared TypeScript contracts.

### 7.1 Official `types` Structure

```text
types/
  api/
  domain/
  ui/
  database/
```

### 7.2 Folder Meanings

- `types/api`: API result shapes and transport contracts if shared
- `types/domain`: domain-level reusable business types
- `types/ui`: shared component-facing types if truly reusable
- `types/database`: generated or curated database-related types

## 8. `supabase` Structure Rules

The `supabase` folder owns all database-facing infrastructure that belongs in source control.

### 8.1 Official `supabase` Structure

```text
supabase/
  migrations/
  seed/
  policies/
  functions/
```

### 8.2 Folder Meanings

- `supabase/migrations`: SQL migrations in execution order
- `supabase/seed`: local/dev seed scripts or SQL files
- `supabase/policies`: RLS reference SQL or policy-specific documentation/helpers
- `supabase/functions`: optional SQL helpers or Supabase edge-function related code if adopted later

### 8.3 Migration Rule

Every schema change must be reflected in `supabase/migrations`.

## 9. `Skills` Structure Rules

The `Skills` folder contains the project rulebooks.

Recommended structure:

```text
Skills/
  frontend.md
  backend.md
  architecture.md
  folder-structure.md
  testing.md
  security.md
  agent-rules.md
```

Each skill file must define one area clearly and must not duplicate another file unnecessarily.

## 10. `docs` Structure Rules

Use `docs` for project documentation that is not a core rulebook.

Examples:

```text
docs/
  decisions/
  onboarding/
  product/
  release/
```

Examples of valid content:

- ADRs
- release notes
- local setup guides
- QA guides
- onboarding references

## 11. File Placement Rules

### 11.1 Where New Code Goes

Before creating a file, decide:

1. is this route entry code
2. is this reusable UI
3. is this domain business logic
4. is this validation
5. is this a pure helper
6. is this a third-party integration
7. is this a database artifact

The answer determines the folder.

### 11.2 No Random Root Files

Do not add new files to the repository root unless they are clearly root-level project files.

Allowed root-level examples:

- config files
- package files
- project-level plans
- key documentation such as `PRD.md` or `Plan.md`

### 11.3 Keep Related Files Together

Files that evolve together should live together.

Examples:

- appointment service logic in `lib/services/appointments`
- appointment UI in `components/features/appointments`
- appointment routes in `app/(patient)/appointments` or `app/api/appointments`

## 12. Naming Rules for Folders and Files

### 12.1 Folder Naming

Use lowercase kebab-case or framework-required naming.

Examples:

- `appointment-card`
- `provider-availability-form`
- `(patient)`
- `api`

### 12.2 File Naming

Use descriptive lowercase file names unless framework conventions require otherwise.

Examples:

- `button.tsx`
- `create-appointment.ts`
- `require-auth-session.ts`

### 12.3 Avoid Vague Names

Do not use names like:

- `helpers`
- `misc`
- `stuff`
- `shared-things`
- `temp`

unless the folder truly has a narrow and documented purpose.

## 13. Required Initial Folder Scaffold for MVP

The project should include at minimum:

```text
app/
  (marketing)/
  (auth)/
  (patient)/
  (provider)/
  (admin)/
  api/
components/
  ui/
  common/
  forms/
  features/
lib/
  auth/
  permissions/
  validations/
  constants/
  errors/
  logging/
  utils/
  supabase/
  repositories/
  integrations/
  services/
types/
  api/
  domain/
  ui/
  database/
supabase/
  migrations/
  seed/
  policies/
  functions/
docs/
  decisions/
  onboarding/
  product/
  release/
```

## 14. Anti-Patterns That Are Not Allowed

- giant flat folders with unrelated files
- reusable business logic inside route files
- UI primitives mixed with domain-specific feature UI
- database helpers spread across random files
- ad hoc constants repeated in multiple folders
- untracked schema changes outside `supabase/migrations`
- shared folders with unclear ownership
- large numbers of files directly under `components` or `lib` with no grouping

## 15. Senior-Level Expectations

The folder structure must reflect senior engineering judgment.

That means:

- easy to scan
- easy to extend
- aligned with domain boundaries
- resistant to duplication
- strict enough to guide AI agents and engineers without confusion

## 16. Definition of Done for Folder Structure Compliance

A new file or folder is compliant only when:

- it lives in the correct top-level area
- its responsibility is obvious
- its name is descriptive
- it does not duplicate another structure unnecessarily
- it supports reuse where appropriate
- it follows the architecture and frontend/backend rules
