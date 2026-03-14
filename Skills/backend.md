# Backend Rules

## 1. Purpose

This document defines the backend engineering rules for Cliniva.

These rules are mandatory for all server-side work. They exist to ensure the backend is:

- secure
- maintainable
- auditable
- scalable
- predictable
- production-ready

This project handles healthcare workflows and protected data. Backend shortcuts are not acceptable.

## 2. Backend Mission

The backend must provide:

- secure authentication and authorization
- strict data access boundaries
- reliable domain workflows
- auditable changes to sensitive data
- clean separation of business logic and transport logic
- stable APIs for the frontend
- a strong database foundation for future phases

## 3. Primary Backend Stack

Backend work must use the following stack unless an approved architecture change is made:

- **Next.js Route Handlers**
- **Next.js Server Actions** for tightly scoped mutations only
- **Supabase Auth**
- **Supabase Postgres**
- **Supabase Storage**
- **Supabase Realtime** where needed
- **PostgreSQL functions / triggers**
- **TypeScript**
- **Zod**

Optional supporting tools for later stages:

- **GitHub Actions**
- **Vitest**
- **Playwright**
- **Sentry or equivalent error monitoring**

## 4. Core Backend Principles

### 4.1 Security First

Backend decisions must assume:

- the client can be tampered with
- requests can be replayed
- permissions can be probed
- sensitive data must be protected by default

No backend feature is complete without proper authorization.

### 4.2 Database as the Final Authority

Authorization must be enforced at multiple layers:

- UI layer for experience
- server layer for business logic
- database layer for enforcement

The database is the final authority.

Supabase RLS is mandatory for protected data.

### 4.3 Thin Transport, Strong Domain Logic

Route handlers should remain thin.

They should mainly do:

- request parsing
- authentication context extraction
- schema validation
- calling domain services
- formatting response shape

They must not become giant business-logic files.

### 4.4 Single Responsibility

Each backend module should do one job well.

Examples:

- auth helpers resolve user and session context
- permission helpers answer access questions
- appointment services handle booking rules
- audit services write audit events

Do not mix unrelated domain logic in the same module.

### 4.5 Explicitness Over Magic

Avoid hidden behavior and implicit side effects.

Prefer:

- explicit parameters
- explicit permission checks
- explicit schema parsing
- explicit transaction boundaries

## 5. Mandatory Backend Standards

### 5.1 TypeScript Rules

- TypeScript strict mode must remain enabled
- avoid `any`
- avoid untyped payload handling
- return typed service results
- define domain types clearly
- use Zod for runtime validation

### 5.2 Validation Rules

All external input must be validated.

This includes:

- request bodies
- query parameters
- route parameters
- webhook payloads
- server action inputs

Rules:

- validate before using data
- fail early
- return safe error messages
- do not trust client-side validation

### 5.3 Error Handling Rules

Errors must be:

- controlled
- intentional
- non-leaky
- logged appropriately

Do not:

- throw raw internal errors to the client
- leak SQL details
- leak secret configuration
- leak PHI in error messages

Backend code should distinguish:

- validation errors
- authentication errors
- authorization errors
- not found errors
- conflict errors
- internal server errors

### 5.4 Logging Rules

Logs must be useful but safe.

Never log:

- access tokens
- service keys
- passwords
- PHI unless explicitly masked and operationally justified

Always consider whether an event should be:

- a normal app log
- a security log
- an audit event

## 6. Backend Architecture Rules

## 6.1 Backend Layering

Use this backend layering model:

1. transport layer
2. application/service layer
3. data access layer
4. database enforcement layer

### 6.2 Transport Layer

Transport layer includes:

- route handlers
- webhook endpoints
- server actions used as mutation entry points

Responsibilities:

- parse input
- validate input
- resolve auth/session
- call service logic
- map responses/errors

### 6.3 Service Layer

Service modules contain business rules.

Examples:

- appointment booking rules
- schedule conflict checks
- consultation state transitions
- note creation rules
- notification event decisions

Service modules should be reusable by multiple entry points.

### 6.4 Data Access Layer

Data access modules handle:

- Supabase queries
- SQL procedure calls
- repository-like access helpers when helpful

Rules:

- avoid duplicating query logic across many services
- centralize repeated access patterns
- keep data access predictable and typed

### 6.5 Database Enforcement Layer

This is where the hard guarantees live:

- schema constraints
- foreign keys
- check constraints
- indexes
- triggers
- functions
- RLS policies

If a rule matters for security or integrity, do not rely on application code alone.

## 7. Folder Structure Rules for Backend

Recommended backend-oriented structure:

```text
app/
  api/
lib/
  auth/
  permissions/
  services/
  repositories/
  supabase/
  validations/
  errors/
  logging/
  constants/
types/
supabase/
  migrations/
  seed/
```

### 7.1 Module Responsibilities

- `lib/auth`: session, auth context, user resolution
- `lib/permissions`: permission checks and policy helpers
- `lib/services`: domain logic
- `lib/repositories`: reusable data access
- `lib/supabase`: client setup and low-level access helpers
- `lib/validations`: Zod schemas
- `lib/errors`: typed error helpers
- `lib/logging`: app and security logging utilities
- `lib/constants`: backend constants and enums that do not belong in DB only

### 7.2 Feature-Based Service Structure

Group services by domain:

```text
lib/services/
  appointments/
  consultations/
  profiles/
  notes/
  notifications/
  audit/
```

Example:

```text
lib/services/appointments/
  create-appointment.ts
  cancel-appointment.ts
  reschedule-appointment.ts
  get-provider-appointments.ts
```

### 7.3 Constants Rules

Use `lib/constants` for:

- role values
- appointment statuses
- system limits
- feature flags
- reusable domain constants

Do not scatter repeated magic strings across the codebase.

## 8. API and Route Handler Rules

### 8.1 Route Handler Design

Every route handler must:

1. authenticate if required
2. validate input
3. check authorization
4. call a service module
5. return a clear typed response shape
6. handle errors safely

### 8.2 Keep Route Handlers Thin

Route handlers must not:

- contain large database query blocks
- duplicate domain rules
- implement complex scheduling logic inline
- contain reusable permission logic inline

If a route handler grows beyond a clean orchestration role, extract logic.

### 8.3 Response Shape Rules

Responses should be predictable.

Rules:

- use consistent JSON structure for API responses
- include clear success or error semantics
- keep error messages safe and understandable
- do not expose internal stack traces

### 8.4 HTTP Method Discipline

Use methods intentionally:

- `GET` for reads
- `POST` for creation or command-like operations
- `PATCH` for partial updates
- `DELETE` only for valid delete operations

Do not overload random endpoints with unclear semantics.

### 8.5 Webhook Rules

Webhook endpoints must:

- validate signature if provider supports it
- validate payload schema
- be idempotent where possible
- log processing results safely

## 9. Authentication and Authorization Rules

### 9.1 Auth Source of Truth

Use Supabase Auth as the identity source of truth for user authentication.

Application profile and role data can live in application tables linked to auth users.

### 9.2 Role Model

Initial backend roles:

- `patient`
- `provider`
- `admin`

Do not invent extra roles casually. Role sprawl creates permission bugs.

### 9.3 Authorization Rules

Authorization must be checked:

- before sensitive reads
- before writes
- before status transitions
- before admin operations

Rules must be centralized where possible.

Do not scatter ad hoc permission checks everywhere.

### 9.4 Provider Access Rules

Providers must not automatically see all patient data.

Provider access should be limited to:

- assigned appointments
- permitted clinical relationships
- records they are authorized to view or edit

### 9.5 Admin Access Rules

Admin access must be deliberate.

Admin role does not mean unrestricted PHI access by default unless policy explicitly allows it.

## 10. Supabase Rules

### 10.1 Client Separation

Create separate helpers for:

- browser client
- server client
- privileged service-role or admin client

The service-role client must never be exposed to client-side code.

### 10.2 RLS Requirement

Every protected table must have:

- RLS enabled
- at least one explicit policy
- a documented access model

No protected table should ship without RLS.

### 10.3 Migration Discipline

All schema changes must go through migrations.

Do not:

- make manual production schema edits without a tracked migration
- rely on undocumented dashboard-only schema changes

### 10.4 Database Constraints

Use database constraints aggressively for integrity.

Examples:

- foreign keys
- unique constraints
- check constraints
- not-null constraints
- indexed lookup keys

### 10.5 Trigger and Function Rules

Use triggers and functions when they improve:

- auditability
- integrity
- timestamps
- derived state enforcement

Do not hide core business workflows in overly complex database logic.

## 11. Domain Rules

### 11.1 Business Logic Must Be Centralized

Rules such as:

- appointment conflict detection
- allowed status transitions
- note ownership rules
- consultation room creation rules

must live in service modules, not duplicated across endpoints.

### 11.2 State Transition Rules

Any workflow with statuses must define allowed transitions.

Example for appointments:

- `requested -> confirmed`
- `confirmed -> completed`
- `confirmed -> cancelled`
- `confirmed -> no_show`

Do not allow arbitrary state changes from anywhere.

### 11.3 Idempotency Awareness

For operations such as:

- booking
- notification dispatch
- webhook processing
- consultation session creation

consider duplicate request behavior.

If the same request can be retried, the service should behave safely.

## 12. Data Access Rules

### 12.1 No Query Sprawl

Do not copy the same Supabase query patterns across many files.

Extract reusable access helpers when:

- the query is used more than once
- the access policy is sensitive
- the query shape is non-trivial

### 12.2 Select Minimal Data

Only fetch the data required for the current use case.

Especially for healthcare data:

- minimize PHI exposure
- avoid wide selects by default
- avoid returning hidden fields that the caller does not need

### 12.3 Avoid N+1 Patterns

When loading related data for lists or dashboards, design queries intentionally.

Do not ship obviously inefficient repeated-fetch patterns.

## 13. Security and Audit Rules

### 13.1 Audit Requirements

Critical actions should create audit records.

Examples:

- patient record access where required by policy
- appointment creation and cancellation
- SOAP note creation and update
- provider role changes
- admin-sensitive operations

### 13.2 Sensitive Data Handling

Rules:

- store only what the MVP needs
- minimize PHI duplication
- never place PHI in logs
- do not expose service credentials to routes or clients improperly

### 13.3 Secret Handling

- secrets must come from environment variables
- never hardcode secrets
- never commit secrets
- rotate credentials when compromised

### 13.4 File and Storage Rules

For Supabase Storage or document uploads:

- validate file type
- validate file size
- restrict access with policy
- avoid public buckets for sensitive documents

## 14. Testing Rules

### 14.1 What Must Be Tested

Backend work must include tests where appropriate for:

- validation schemas
- permission rules
- service-layer business logic
- route handler behavior
- forbidden access paths

### 14.2 Priority Test Areas

Highest backend testing priority:

- auth and role resolution
- RLS-sensitive data access patterns
- appointment lifecycle rules
- consultation creation rules
- SOAP note ownership and visibility rules

### 14.3 Forbidden Testing Shortcut

Do not assume manual testing is enough for security-sensitive backend behavior.

## 15. Naming Rules

### 15.1 Service Names

Service names should be action-oriented and explicit.

Good:

- `createAppointment`
- `cancelAppointment`
- `createSoapNote`
- `getPatientPortalSummary`

Bad:

- `handleStuff`
- `processThing`
- `manageData`

### 15.2 File Names

Use clear lowercase file naming that matches the module purpose.

Examples:

- `create-appointment.ts`
- `get-provider-dashboard-data.ts`
- `require-auth-session.ts`

### 15.3 Constant Names

Constants should be centralized and named clearly.

Good:

- `APPOINTMENT_STATUS`
- `USER_ROLE`
- `MAX_NOTE_LENGTH`

## 16. Anti-Patterns That Are Not Allowed

- putting business logic directly into route handlers
- duplicating permission checks in ad hoc ways
- shipping protected tables without RLS
- trusting client-provided role data
- exposing service-role credentials to client code
- making schema changes without migrations
- logging PHI or secrets
- using one massive service file for multiple domains
- mixing notification sending logic into unrelated modules
- returning raw database errors directly to the client

## 17. Senior-Level Expectations

Backend code in this project must reflect senior engineering judgment.

That means:

- design for correctness first
- make security boundaries explicit
- centralize risky logic
- keep modules understandable
- prefer boring, reliable architecture over clever shortcuts
- make future maintenance easier, not harder
- assume later agents and developers will build on this foundation

## 18. Definition of Done for Backend Work

Backend work is complete only when:

- input is validated
- auth is handled correctly
- authorization is enforced
- business logic is placed in the right layer
- schema and migrations are updated if needed
- RLS is correct
- errors are safe
- audit impact is reviewed
- tests are added where appropriate
- the implementation is production-ready
