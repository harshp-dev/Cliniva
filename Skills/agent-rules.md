# Agent Rules

## 1. Purpose

This document defines the operating rules for AI agents working in the Cliniva repository.

These rules are mandatory. They exist to ensure agents:

- make safe changes
- follow the project architecture
- do not introduce structural debt
- respect healthcare data sensitivity
- build reusable production-grade code
- leave the repository in a better state after each task

## 2. Agent Mission

An agent working in this repository must act like a disciplined senior engineer.

That means the agent must:

- understand the requested outcome
- inspect existing code before changing it
- follow the project plan and rules
- prefer reusable, maintainable solutions
- avoid unnecessary scope expansion
- protect security and data boundaries
- verify work before stopping

## 3. Source of Truth Order

When rules conflict or decisions are unclear, agents must follow this order:

1. the user’s direct request
2. project safety and security requirements
3. `Plan.md`
4. `Skills/architecture.md`
5. `Skills/folder-structure.md`
6. `Skills/frontend.md`
7. `Skills/backend.md`
8. the current codebase

If the codebase conflicts with the documented rules, agents should prefer the documented rules unless the user explicitly directs otherwise.

## 4. Mandatory Working Process

Every agent must follow this sequence for non-trivial tasks:

1. inspect the relevant files and current structure
2. identify the correct layer and folder for the change
3. check whether reusable code already exists
4. implement the smallest correct solution
5. avoid breaking boundaries or duplicating logic
6. verify the result with lint, tests, or direct inspection where possible
7. report what changed and any remaining risk

Agents must not jump straight into coding without understanding the existing context.

## 5. Scope Control Rules

### 5.1 Stay Inside the Requested Scope

Agents must solve the requested problem without expanding into unrelated refactors unless:

- the current structure blocks the requested work
- a security or correctness issue makes the requested solution unsafe
- a small adjacent fix is necessary to keep the change coherent

### 5.2 Do Not Sneak In Phase 2 Work

This project is currently focused on MVP delivery.

Agents must not introduce post-MVP scope such as:

- billing systems
- e-prescribing
- labs integration
- AI workflows
- mobile apps
- marketplace architecture

unless the user explicitly asks for it.

## 6. Architecture Compliance Rules

Agents must follow `Skills/architecture.md`.

### 6.1 Layer Discipline

Agents must place code in the correct layer:

- route code in `app`
- reusable UI in `components`
- domain logic in `lib/services`
- validations in `lib/validations`
- permissions in `lib/permissions`
- integrations in `lib/integrations`
- data access in `lib/repositories` or approved data modules
- schema changes in `supabase/migrations`

### 6.2 No Layer Leaks

Agents must not:

- place business logic in UI primitives
- place privileged data access in client components
- place domain logic directly into route files when it should live in services
- scatter integration calls across unrelated files

## 7. Reuse Rules

### 7.1 Reuse Before Create

Before creating a new module, component, helper, or schema, agents must check whether a suitable existing implementation already exists.

If an existing module solves the problem with a small extension, the agent should extend it instead of duplicating it.

### 7.2 Shared Code Rules

Agents should extract shared code only when justified.

Use the rule of three:

- once: keep local
- twice: consider extraction
- three times: extraction is strongly expected

### 7.3 No Duplicate Patterns

Agents must not create:

- duplicate button systems
- duplicate form validation patterns
- duplicate permission helpers
- duplicate Supabase client setup
- duplicate error-handling wrappers for the same purpose

## 8. Frontend-Specific Agent Rules

Agents working on frontend tasks must follow `Skills/frontend.md`.

### 8.1 Component Rules

Agents must:

- build reusable components
- use the approved folder structure
- prefer server components unless client behavior is required
- keep components small and composable
- use shared form patterns

### 8.2 UI Quality Rules

Agents must ensure:

- accessibility
- consistent loading and error states
- clear form validation behavior
- no unnecessary client-side state

### 8.3 Component Placement Rules

Agents must place components correctly:

- primitives in `components/ui`
- shared app components in `components/common`
- reusable form units in `components/forms`
- domain-specific UI in `components/features`

## 9. Backend-Specific Agent Rules

Agents working on backend tasks must follow `Skills/backend.md`.

### 9.1 Backend Design Rules

Agents must:

- validate all inputs
- keep route handlers thin
- place business logic in service modules
- enforce permissions correctly
- use RLS-aware data access design

### 9.2 Supabase Rules

Agents must:

- use the correct Supabase client for the context
- never expose service-role credentials to client code
- create migrations for schema changes
- treat RLS as mandatory for protected data

### 9.3 Security Rules

Agents must never:

- trust client role data
- leak PHI in logs
- bypass authorization casually
- return raw internal errors directly to users

## 10. Folder Structure Compliance Rules

Agents must follow `Skills/folder-structure.md`.

### 10.1 Correct Placement Required

Before creating any new file, the agent must determine:

- what responsibility the file has
- which folder owns that responsibility
- whether the file belongs to an existing domain module

### 10.2 No Random Files

Agents must not create random files in:

- the repository root
- the top level of `components`
- the top level of `lib`

unless the file clearly belongs there by project convention.

### 10.3 Keep Related Files Together

Files that evolve together must live together.

Examples:

- appointment UI in appointment feature folders
- appointment services in appointment service folders
- appointment validations in appointment validation files or domain validation modules

## 11. Naming Rules for Agents

Agents must use names that are:

- descriptive
- stable
- domain-aware
- easy to scan

Do not create files or symbols with vague names like:

- `helper`
- `temp`
- `new-file`
- `misc`
- `data-handler`

when a specific name is possible.

## 12. Editing Rules

### 12.1 Prefer Minimal Correct Changes

Agents should make the smallest correct change that fully solves the task.

Do not rewrite unrelated code unless necessary.

### 12.2 Respect Existing User Work

If the repo contains changes not made by the agent:

- do not revert them
- do not overwrite them casually
- work around them if possible
- ask only if there is a direct conflict

### 12.3 Do Not Introduce Dead Scaffolding Lightly

Agents should not add empty files, placeholder modules, or premature abstractions unless:

- the user asked for structure
- the project foundation explicitly requires them
- they are part of a planned scaffold

## 13. Database Change Rules

When a task involves schema changes, agents must:

1. place the change in `supabase/migrations`
2. preserve integrity constraints
3. account for authorization impact
4. update related types or documentation if needed
5. review whether RLS policies must change too

No database change is complete without considering access control.

## 14. Security and Compliance Rules

This project handles healthcare-sensitive workflows.

Agents must always assume:

- protected data must be minimized
- secure defaults are required
- auditability matters
- secrets must stay server-side

### 14.1 PHI Handling Rules

Agents must not:

- print PHI into debug output unnecessarily
- expose broad record payloads to the client by default
- duplicate sensitive data across multiple places without reason

### 14.2 Secret Handling Rules

Agents must not:

- hardcode secrets
- commit secrets
- expose server-only env vars to client bundles

## 15. Testing and Verification Rules

### 15.1 Verification Is Required

An agent must verify work before stopping whenever verification is possible.

Preferred verification includes:

- linting
- type checking
- targeted tests
- inspecting generated structure
- checking route/module imports

### 15.2 If Verification Cannot Be Run

If an agent cannot run tests or verification, it must say so clearly and explain what remains unverified.

### 15.3 No “Looks Fine” Closures

Agents must not stop after writing code without checking:

- syntax plausibility
- structure correctness
- import/path correctness
- rule compliance

## 16. Communication Rules

### 16.1 Be Precise

Agents must communicate:

- what they changed
- where they changed it
- what was verified
- what remains risky or pending

### 16.2 No Misleading Confidence

Agents must not claim:

- tests passed if they did not run
- a feature is complete if key layers are missing
- security is handled if RLS or permission checks are absent

### 16.3 Raise Real Concerns

If the agent notices a major issue, it should say so directly.

Examples:

- architecture violation
- security gap
- conflicting existing changes
- dangerous requirement ambiguity

## 17. Decision Rules for Agents

When choosing between two implementations, agents should prefer the one that is:

1. safer
2. more correct
3. more maintainable
4. more consistent with project rules
5. more reusable
6. simpler to extend later

Short-term convenience is not a valid reason to violate core project rules.

## 18. Forbidden Agent Behaviors

Agents must not:

- bypass architecture because it feels faster
- duplicate code instead of checking existing modules
- mix unrelated concerns into one file
- add unrequested post-MVP scope
- expose secrets or protected data
- invent structure that conflicts with documented rules
- leave broken imports or incomplete edits behind
- claim work is production-ready when major verification is missing

## 19. Definition of Done for Agent Work

An agent task is complete only when:

- the requested outcome is implemented
- the change follows the architecture
- files are placed in the correct folders
- duplication has been avoided
- naming is clear
- security and permissions were considered
- verification was performed where possible
- the final report is honest about what changed and what remains

## 20. Recommended Next Rule Files

After this file, the next project rulebooks should be:

- `Skills/testing.md`
- `Skills/security.md`

These will complete the execution foundation for both engineers and AI agents.
