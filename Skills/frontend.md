# Frontend Rules

## 1. Purpose

This document defines the frontend implementation rules for Cliniva.

These rules are mandatory for all UI work. They exist to keep the codebase:

- reusable
- consistent
- maintainable
- accessible
- secure
- production-ready

This is not a suggestion file. It is the standard the project must follow.

## 2. Frontend Mission

The frontend must deliver:

- clean and predictable user flows
- reusable and composable UI
- strong typing
- minimal duplication
- accessible interfaces
- secure handling of sensitive healthcare data
- scalable patterns that remain maintainable as the application grows

## 3. Primary Frontend Stack

Frontend work must use the following stack unless an approved architecture change is made:

- **Next.js App Router**
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Zod**
- **React Hook Form**
- **internal reusable component library in the repo**

## 4. Core Frontend Principles

### 4.1 DRY

Do not duplicate:

- UI patterns
- validation logic
- layout logic
- permission-based rendering logic
- formatting helpers
- loading state patterns
- empty state patterns
- table or list rendering patterns

If the same pattern appears more than twice, extract it.

### 4.2 Reusability

Every component must be designed for reuse unless it is truly page-specific.

Before creating a new component, check whether the problem can be solved by:

- extending an existing shared component
- composing smaller existing primitives
- creating a configurable shared component

### 4.3 Single Responsibility

Each component should do one job well.

Examples:

- `Button` should handle button rendering and variants, not business workflow logic
- `AppointmentCard` should display appointment data, not fetch it directly unless intentionally designed as a smart feature component
- `PatientProfileForm` should manage profile form UI, not embed unrelated scheduling logic

### 4.4 Composition Over Duplication

Prefer small building blocks that compose into larger UIs.

Good:

- `Button`
- `Input`
- `FieldLabel`
- `FormField`
- `Card`
- `SectionHeader`
- `EmptyState`

Bad:

- separate almost-identical button components for each screen
- duplicated page headers across app areas
- one-off form field implementations with inconsistent validation output

### 4.5 Predictability

The same UI problem should be solved the same way across the application.

Examples:

- form validation errors should always render the same way
- destructive actions should always use the same interaction pattern
- loading skeletons should follow the same visual system
- role-protected navigation should follow a consistent structure

### 4.6 Server-First Thinking

In Next.js App Router, default to Server Components unless client behavior is necessary.

Use Client Components only when the UI needs:

- browser-only APIs
- event-driven interactivity
- local interactive state
- form libraries requiring client rendering
- realtime subscriptions in the client

If a component does not need `"use client"`, it must not have `"use client"`.

## 5. Mandatory Frontend Standards

### 5.1 TypeScript Rules

- TypeScript strict mode must remain enabled
- avoid `any`
- avoid unsafe type assertions unless no safer alternative exists
- prefer explicit domain types for application data
- use Zod schemas where runtime validation is required
- share validation schemas between client and server when possible

### 5.2 Component Rules

- components must be small and understandable
- props must be explicitly typed
- avoid giant prop surfaces
- avoid boolean explosion in props
- prefer variants or composition over many unrelated flags
- keep rendering logic clear and linear
- extract subcomponents when JSX becomes noisy or repeated

### 5.3 Styling Rules

- use Tailwind utility classes
- avoid ad hoc inline styles unless technically necessary
- use design tokens or CSS variables for repeated values
- keep spacing, typography, borders, and colors consistent
- avoid one-off visual hacks that break consistency

### 5.4 Accessibility Rules

Every component must meet baseline accessibility requirements:

- semantic HTML first
- buttons must use `button`
- links must use `a` or `Link`
- inputs must have labels
- dialogs must support keyboard interaction
- visible focus states are mandatory
- color contrast must be readable
- icons must have accessible labeling when needed
- interactive states must not rely only on color

### 5.5 Performance Rules

- avoid unnecessary client components
- avoid unnecessary rerenders caused by poor component boundaries
- do not fetch the same data multiple times in the same render path unless intentional
- use pagination or lazy loading for large datasets
- keep bundle size in mind when adding libraries

### 5.6 Security Rules

- never expose secrets in client code
- never trust client-side authorization
- do not leak PHI through debug text, logs, or unsafe rendering
- sensitive data should be rendered only when explicitly required
- frontend checks do not replace backend or RLS authorization

## 6. Directory and Component Structure Rules

Frontend structure must be deliberate and consistent.

## 6.1 Top-Level Frontend Areas

Recommended structure:

```text
app/
components/
  ui/
  common/
  forms/
  features/
lib/
  validations/
  utils/
  permissions/
types/
```

### 6.2 Component Folder Convention

If a component is shared and meaningful, it should live in its own folder.

Preferred structure:

```text
components/
  common/
    button/
      button.tsx
      button.types.ts
      button.test.tsx
      index.ts
```

This pattern is recommended for:

- buttons
- cards
- dialogs
- form fields
- tables
- loaders
- badges
- dropdowns
- navigation items

### 6.3 When a Single File Is Fine

A single file component is acceptable only when all of the following are true:

- the component is small
- it has no supporting types or tests yet
- it is clearly local in scope
- it is unlikely to be reused

If the component grows, split it into a folder.

### 6.4 `ui` vs `common` vs `features`

Use:

- `components/ui` for low-level visual primitives
- `components/common` for reusable app-level shared components
- `components/forms` for reusable form-specific building blocks
- `components/features` for domain-specific composed components

Examples:

- `components/ui/input`
- `components/common/button`
- `components/forms/form-field`
- `components/features/appointments/appointment-card`

### 6.5 Feature Grouping Rule

Feature-specific UI should live together.

Example:

```text
components/features/appointments/
  appointment-card/
  appointment-list/
  appointment-status-badge/
  appointment-booking-form/
```

Do not scatter appointment UI across unrelated folders.

## 7. Component Design Rules

### 7.1 Preferred Component Layers

Frontend work should follow this order:

1. primitive
2. shared reusable component
3. feature component
4. page composition

Example:

1. `Input`
2. `FormField`
3. `PatientIntakeForm`
4. `PatientOnboardingPage`

### 7.2 Variant Strategy

Shared components should use controlled variants instead of multiple duplicate versions.

Example:

- `Button` with `variant="primary" | "secondary" | "ghost" | "destructive"`

Do not create:

- `PrimaryButton`
- `SecondaryButton`
- `DangerButton`

unless there is a very strong architectural reason.

### 7.3 Prop Design

Props must be:

- minimal
- clear
- typed
- purpose-driven

Avoid:

- prop names that are vague
- too many optional booleans
- leaking internal implementation details to callers

### 7.4 Class Management

Use a shared class merge helper for conditional classes.

Do not build large unreadable class strings inline if they can be abstracted safely.

### 7.5 No Business Logic in Primitive Components

Primitive shared components must not know about:

- Supabase
- route handlers
- appointment domain rules
- provider roles
- patient workflows

They should stay generic.

## 8. Page and Layout Rules

### 8.1 Page Responsibility

Pages should focus on:

- data loading
- composition
- route-level behavior

Pages should not become giant dumping grounds for:

- repeated JSX
- large client-side business logic
- deeply nested conditional rendering

### 8.2 Layout Responsibility

Layouts should handle:

- route-area shell
- navigation containers
- shared page chrome
- route protection entry points when appropriate

Layouts should not contain page-specific business rules.

### 8.3 Route Group Standards

Use route groups to separate:

- public pages
- auth pages
- patient area
- provider area
- admin area

Each route area should have its own layout and navigation pattern.

## 9. Data Fetching Rules

### 9.1 Default Data Strategy

Prefer server-side data loading for:

- dashboards
- lists
- detail pages
- initial route rendering

### 9.2 Client Fetching Use Cases

Use client-side fetching only when needed for:

- live updates
- highly interactive filtering
- transient post-render updates
- realtime subscriptions

### 9.3 Fetching Consistency

Data access should be routed through shared helpers or service functions where appropriate.

Avoid scattering raw query logic across many components.

### 9.4 Error and Empty States

Every data-driven UI must define:

- loading state
- empty state
- error state
- success state

No production page should render blank or broken while data is loading or missing.

## 10. Form Rules

Forms are a major part of this product. They must be consistent.

### 10.1 Form Stack

All non-trivial forms should use:

- React Hook Form
- Zod
- shared form field components

### 10.2 Shared Form Building Blocks

Create reusable form elements such as:

- `FormField`
- `FormLabel`
- `FormError`
- `TextInput`
- `TextareaField`
- `SelectField`
- `CheckboxField`
- `DateField`

### 10.3 Validation Rules

- validation must be schema-driven
- client validation and server validation should align
- validation messages should be clear and human-readable
- healthcare-sensitive forms must avoid ambiguous wording

### 10.4 Submission Rules

- disable duplicate submissions where appropriate
- show submission state
- show success or failure feedback
- surface field-level errors and global form errors clearly

## 11. State Management Rules

### 11.1 Prefer Local State First

Start with the smallest valid state scope:

- server state on the server
- form state in the form
- component UI state in the component

Do not introduce global client state unless clearly necessary.

### 11.2 Global State Standard

Only add global state tooling when:

- multiple distant client components need the same live state
- prop drilling becomes harmful
- server-driven patterns are not sufficient

If global state is needed later, it must be added deliberately, not casually.

## 12. Naming Rules

### 12.1 Component Naming

- use PascalCase for React components
- use descriptive names
- names should reflect role, not appearance only

Good:

- `AppointmentCard`
- `PatientDashboardHeader`
- `SoapNoteEditor`

Bad:

- `BlueBox`
- `Thing`
- `NewComponent`

### 12.2 File Naming

- component implementation files should be lowercase kebab or folder-based lowercase naming according to the established structure
- keep names stable and predictable
- prefer folder names that match the component role

### 12.3 Boolean Naming

Booleans should read clearly:

- `isLoading`
- `isDisabled`
- `hasError`
- `canEdit`

## 13. Reuse Checklist Before Creating a New Component

Before adding a new component, ask:

1. does an existing component already solve this?
2. can I extend an existing component safely?
3. is this truly feature-specific?
4. should this be a variant instead of a new component?
5. will this pattern appear elsewhere soon?

If reuse is likely, build for reuse now.

## 14. Frontend Review Checklist

Every frontend PR or implementation pass must be reviewed against this checklist:

- is the component reusable where it should be?
- is there duplicated JSX or styling?
- is the component too large?
- are server and client boundaries correct?
- are loading, empty, and error states present?
- is accessibility covered?
- are forms using shared patterns?
- is validation centralized?
- are names clear?
- is business logic leaking into primitive components?
- is PHI handling minimal and safe?
- is the UI consistent with the design system?

## 15. Anti-Patterns That Are Not Allowed

- copying the same component into multiple folders
- building multiple button implementations for similar use cases
- placing business logic directly in primitive UI components
- overusing `"use client"`
- mixing unrelated responsibilities in one component
- directly embedding raw Supabase queries in many presentational components
- inconsistent validation patterns across forms
- inaccessible clickable `div` elements used as buttons
- large page files with hundreds of lines of mixed concerns
- introducing libraries for problems already solved in the repo

## 16. Senior-Level Expectations

Frontend code in this project must reflect senior engineering judgment.

That means:

- build abstractions only when they are justified
- do not over-engineer
- do not under-structure
- optimize for clarity first
- choose consistency over novelty
- choose maintainability over short-term speed hacks
- treat every shared component as long-lived infrastructure
- assume future developers and AI agents will extend this code

## 17. Definition of Done for Frontend Work

Frontend work is complete only when:

- the UI is implemented correctly
- the component structure is reusable and clean
- types are correct
- validation is correct
- accessibility is covered
- loading and error states exist
- duplication has been removed
- code fits the folder structure rules
- tests are added where appropriate
- the result is production-ready, not just demo-ready
