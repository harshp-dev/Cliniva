# Architecture Rules

## 1. Purpose

This document defines the system architecture rules for Cliniva.

It is the top-level engineering contract for the project. Frontend rules and backend rules must align with this file.

This file exists to prevent:

- accidental over-engineering
- inconsistent module boundaries
- duplicated business logic
- weak security boundaries
- unclear ownership of code
- architecture drift as the project grows

## 2. Architecture Goal

Cliniva must be built as a **production-grade MVP** with a structure that is:

- secure
- modular
- understandable
- testable
- scalable without premature complexity

The architecture must support a healthcare product with sensitive data while keeping the MVP delivery practical.

## 3. Chosen Architecture Style

### 3.1 Official Architecture

Cliniva will use a **modular monolith** architecture for the MVP.

That means:

- one primary Next.js application
- one primary Supabase project
- one shared database
- one codebase
- domain modules separated clearly inside the same repository

### 3.2 Why This Is the Correct Choice

For the MVP, a modular monolith is the right tradeoff because it:

- reduces deployment complexity
- reduces operational overhead
- keeps velocity high
- makes local development simpler
- supports strong domain separation without introducing microservices too early

### 3.3 What We Are Not Doing

We are not building:

- microservices
- separate frontend and backend repositories
- event-driven distributed architecture
- premature internal SDK layers
- multiple databases for different services

Any move away from the modular monolith must be justified by real product or scaling needs, not preference.

## 4. Core Architectural Principles

### 4.1 Security by Design

Security is not a later layer. It is part of the architecture.

Every major design decision must account for:

- authentication
- authorization
- PHI exposure minimization
- auditability
- secret safety
- data ownership boundaries

### 4.2 Clear Boundaries

Every major concern must have a defined home.

Examples:

- UI rendering belongs in components and route files
- business logic belongs in services
- access control logic belongs in auth and permissions modules plus RLS
- data constraints belong in the database

If a concern has no clear owner, the architecture is wrong.

### 4.3 Centralize Risky Logic

Risky or sensitive logic must not be scattered.

Centralize:

- permission checks
- booking rules
- consultation creation rules
- note ownership rules
- audit event creation
- integration credential usage

### 4.4 Simple First, Not Naive

The architecture should stay simple, but not fragile.

Good architecture for this project is:

- deliberate
- boring in the right places
- strict about boundaries
- flexible enough for Phase 2 later

### 4.5 Database-Enforced Integrity

Important integrity and security rules must not rely only on UI or server code.

Use database enforcement for:

- foreign keys
- uniqueness
- status validity where appropriate
- row-level access control
- audit-related triggers where justified

## 5. System Building Blocks

The system consists of the following major parts:

### 5.1 Presentation Layer

Includes:

- Next.js pages
- layouts
- route groups
- shared UI components
- feature components
- forms

Responsibilities:

- display data
- capture user interaction
- provide route-area user experience
- avoid containing domain-critical logic

### 5.2 Application Layer

Includes:

- server actions
- route handlers
- service modules
- orchestration logic

Responsibilities:

- enforce application workflows
- validate input
- coordinate domain actions
- trigger integrations
- map results to UI or API responses

### 5.3 Domain Layer

Includes:

- service logic grouped by domain
- domain rules
- permission-aware workflows
- domain constants and types

Responsibilities:

- express business rules clearly
- keep domain workflows reusable
- avoid leaking transport details into core logic

### 5.4 Data Layer

Includes:

- Supabase clients
- repository or query helpers
- SQL migrations
- schema definitions through migrations
- triggers and policies

Responsibilities:

- store and retrieve data
- enforce integrity
- enforce RLS
- keep data access predictable

### 5.5 Platform / Integration Layer

Includes:

- auth integration
- video provider integration
- email/SMS providers
- storage
- logging and monitoring

Responsibilities:

- isolate third-party implementation details
- avoid leaking provider-specific logic everywhere
- make integrations replaceable with controlled effort

## 6. Official Module Boundaries

## 6.1 UI Boundary

UI modules may:

- render data
- collect user input
- trigger actions
- display validation and status feedback

UI modules must not:

- contain reusable backend rules
- contain direct privileged database logic
- define authorization policy inline in many places

### 6.2 Route Boundary

Pages and route handlers are entry points, not the main home of business logic.

They may:

- read params
- validate inputs
- resolve session context
- call service modules

They must not:

- become large domain implementation files
- duplicate service logic
- duplicate permission logic

### 6.3 Service Boundary

Service modules are the main home for business workflows.

They may:

- coordinate repositories and integrations
- enforce domain rules
- enforce workflow rules
- create audit events

They must not:

- render UI
- depend on client-only modules
- hide random side effects without clear naming

### 6.4 Repository / Data Boundary

Repository or data-access modules may:

- encapsulate queries
- normalize data access patterns
- provide typed fetch/update helpers

They must not:

- contain unrelated business workflows
- make UI decisions
- silently bypass security design

### 6.5 Database Boundary

The database is responsible for:

- data integrity
- relational consistency
- access constraints through RLS
- durable audit-related behaviors when needed

The database should not become an unreadable application layer replacement.

## 7. Domain-Driven Structure for MVP

The project should be organized around the main MVP domains.

### 7.1 Initial Domains

- auth
- profiles
- appointments
- consultations
- notes
- notifications
- audit

### 7.2 Domain Ownership Rule

Each domain should own:

- service logic
- validation schemas
- constants specific to that domain
- reusable types when appropriate
- data access logic if specialized

Example:

- appointment status logic belongs in the appointments domain
- SOAP note edit rules belong in the notes domain

### 7.3 Shared Code Rule

Only move something to shared modules when it is truly shared.

Do not create vague shared abstractions too early.

Bad shared module examples:

- `lib/helpers.ts` with random unrelated functions
- `lib/service-utils.ts` with domain-specific hidden behavior

## 8. Route Strategy

### 8.1 App Router Areas

The application should be separated into route groups such as:

- public
- auth
- patient
- provider
- admin

Each area should have:

- its own layout
- its own route guard pattern
- its own navigation shell

### 8.2 Route Ownership

Each route should be easy to reason about.

A route file should answer:

- what data does this page need
- who can access it
- what actions can be triggered from it

If a route cannot be understood quickly, too much logic is inside it.

## 9. Server Actions vs Route Handlers

This project will use both, but with discipline.

### 9.1 Use Server Actions When

Use server actions for:

- form submissions tightly coupled to a page
- simple authenticated mutations
- UI-oriented mutations with limited integration complexity

Examples:

- update patient profile
- create simple intake submission
- change a local preference

### 9.2 Use Route Handlers When

Use route handlers for:

- API-style workflows
- integration endpoints
- webhook ingestion
- reusable mutation endpoints
- complex workflows with explicit request/response structure

Examples:

- appointment booking endpoint
- consultation room token creation
- video webhook processing
- admin workflow endpoints

### 9.3 Decision Rule

If the operation is:

- transport-neutral
- integration-heavy
- shared by multiple clients
- likely to evolve into a formal API contract

prefer a route handler plus service module.

If the operation is:

- page-local
- simple
- form-bound
- not integration-heavy

server actions are acceptable.

## 10. Data Ownership and Access Model

### 10.1 Identity Source

Supabase Auth is the source of truth for authentication identity.

### 10.2 Application Ownership

Application tables own product-specific data such as:

- patient profile details
- provider profile details
- appointments
- consultation sessions
- notes
- notifications

### 10.3 Access Enforcement

Access must be enforced at three levels:

1. route and UI guard level
2. service-level permission checks
3. Supabase RLS policies

Failure at any one layer must not expose protected data.

### 10.4 PHI Minimization Rule

Only surface the minimum data needed for the specific screen or action.

This applies to:

- queries
- API responses
- server-rendered props
- logs
- exported reports

## 11. Integration Architecture

### 11.1 Third-Party Integration Rule

Every third-party integration must be wrapped behind application-level modules.

Do not scatter direct provider calls throughout the codebase.

### 11.2 Initial MVP Integrations

- Supabase
- Daily.co
- email provider
- SMS provider if enabled

### 11.3 Integration Wrapper Responsibility

Integration modules should handle:

- provider setup
- request shaping
- response normalization
- error mapping
- retry or idempotency strategy where needed

### 11.4 Replaceability Rule

We do not need full provider-agnostic abstraction on day one, but provider-specific logic must still be isolated.

This makes replacement possible later without rewriting the whole app.

## 12. Audit and Compliance Architecture

### 12.1 Audit Is a First-Class Concern

Audit behavior must be part of system design from the beginning.

Relevant actions include:

- appointment creation and cancellation
- consultation state changes
- SOAP note creation and update
- admin-sensitive actions
- key record access events where policy requires them

### 12.2 Compliance Boundaries

Architecture must account for:

- protected routes
- role-aware access
- safe storage usage
- safe secret handling
- safe logging

The MVP does not need full enterprise compliance certification to be useful, but the architecture must not block future compliance hardening.

## 13. Folder-to-Architecture Mapping

This is the intended relationship between major folders.

### 13.1 `app`

Owns:

- routes
- layouts
- route-local loading/error UI
- entry points into the application

### 13.2 `components`

Owns:

- reusable UI primitives
- shared UI elements
- feature UI compositions

### 13.3 `lib`

Owns:

- services
- auth helpers
- permission logic
- validations
- repositories
- integrations
- utilities

### 13.4 `types`

Owns:

- shared domain types
- API result shapes if needed
- strongly reusable type definitions

### 13.5 `supabase`

Owns:

- migrations
- seed data
- SQL policies
- schema evolution history

## 14. Architecture Rules for Reuse

### 14.1 Reuse Where It Matters

Reuse should focus on:

- shared UI primitives
- shared validation schemas
- shared permission helpers
- shared data access helpers
- shared domain services

### 14.2 Do Not Over-Abstract

Avoid creating abstractions that:

- hide important logic
- make debugging harder
- support imaginary future use cases
- merge unrelated concerns

### 14.3 Rule of Three

If a pattern appears once, keep it local.

If it appears twice, consider extraction.

If it appears three times, extraction should be strongly expected unless there is a clear reason not to.

## 15. Performance and Scalability Rules

### 15.1 MVP Performance Approach

Optimize for:

- clear query boundaries
- server-first rendering
- minimized client bundles
- efficient dashboard and list loading

### 15.2 Scalability Without Premature Services

The architecture should support future scaling by:

- clear domain modularity
- isolated integration logic
- clear service boundaries
- controlled data access

We do not need distributed systems to be scalable in code quality.

## 16. Testing Architecture Rules

### 16.1 Test at the Right Layer

- UI behavior at the component or E2E level
- business rules at the service level
- access rules at the integration and database-aware level
- route behavior at the transport layer

### 16.2 Avoid Testing Only Through Pages

If all important logic is only testable through page flows, the architecture is too coupled.

Service logic must be testable independently.

## 17. Architecture Decision Rules

When making an implementation decision, evaluate it in this order:

1. is it secure
2. is it correct
3. is it simple
4. is it maintainable
5. is it reusable
6. is it scalable enough for the current phase

Do not optimize for cleverness.

## 18. Forbidden Architectural Anti-Patterns

- microservices for MVP
- duplicated business logic across route handlers and pages
- direct privileged database access from UI code
- unowned modules with vague responsibilities
- shared utility dumping grounds
- bypassing RLS with careless service-role use
- large route files that act as controllers, services, and repositories at once
- business logic hidden inside UI components
- direct third-party integration calls scattered across unrelated files
- undocumented schema changes outside migrations

## 19. Senior-Level Expectations

Architecture in this project must reflect senior engineering judgment.

That means:

- make boundaries obvious
- keep risks centralized
- design for clarity, not ego
- choose structures the team can extend safely
- leave the system better than it was before each change

## 20. Definition of Done for Architecture Compliance

A feature or module is architecture-compliant only when:

- it lives in the correct layer
- responsibilities are clear
- business logic is not duplicated
- permissions are enforced in the correct places
- integration logic is isolated
- data ownership is clear
- tests can target the right layer
- the result supports future extension without structural cleanup first
