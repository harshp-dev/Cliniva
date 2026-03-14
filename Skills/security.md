# Security Rules

## 1. Purpose

This document defines the security rules for Cliniva.

These rules are mandatory for all product, engineering, architecture, and AI-agent work in this repository.

This project handles healthcare-sensitive workflows and potentially protected health information. Security is therefore a product requirement, not a later optimization.

## 2. Security Goals

The security posture for the MVP must ensure:

- authenticated access to protected areas
- strict authorization boundaries
- minimal PHI exposure
- safe secret handling
- auditable sensitive actions
- secure integration patterns
- safe storage and transport of data
- a foundation that can be hardened further in later phases

## 3. Core Security Principles

### 3.1 Deny by Default

If access is not explicitly allowed, it must be denied.

This applies to:

- routes
- API endpoints
- database rows
- files
- admin capabilities
- provider access to patient data

### 3.2 Least Privilege

Every user, service, and module should have only the access required to perform its job.

Do not grant broad access because it is convenient.

### 3.3 Defense in Depth

Security must exist at multiple layers:

- UI and route guards
- server-side authorization
- database-level RLS
- secure storage rules
- secret isolation

No single layer should be trusted alone.

### 3.4 Minimize Sensitive Data

Only collect, store, fetch, and display the minimum data needed for the current product requirement.

Do not over-collect patient or provider data in the MVP.

### 3.5 Security Before Convenience

If a feature is easier to implement in an insecure way, that implementation is not acceptable.

## 4. Threat Assumptions

Agents and engineers must assume:

- clients can be modified
- requests can be replayed
- URLs can be guessed
- route parameters can be tampered with
- frontend checks can be bypassed
- logs may be read by operators
- third-party integrations can fail or misbehave

All sensitive logic must be designed with these assumptions in mind.

## 5. Authentication Rules

### 5.1 Auth Source of Truth

Use Supabase Auth as the source of truth for authentication.

No custom parallel identity system should be introduced for MVP.

### 5.2 Protected Routes

All patient, provider, and admin application areas must require authenticated access.

Public routes must be explicitly public.

### 5.3 Session Handling

Authentication state must be handled using approved server-safe patterns.

Rules:

- use secure session handling
- do not trust client-only auth state for protected operations
- do not expose server-only auth details to the browser unnecessarily

### 5.4 MFA Policy

Provider and admin accounts should be designed with stronger authentication support in mind.

If MFA is enabled, it must never be bypassed by convenience code.

## 6. Authorization Rules

### 6.1 Authorization Is Mandatory

Authentication alone is never enough.

Every protected action must answer:

- who is the user
- what role do they have
- are they allowed to perform this action on this resource

### 6.2 Role Model

Initial allowed roles for MVP:

- `patient`
- `provider`
- `admin`

Do not create role sprawl without strong reason.

### 6.3 Resource Ownership Rules

Patients may access only their own allowed records.

Providers may access only the patient data required for appointments or authorized clinical workflows.

Admins must not automatically receive unrestricted PHI access unless explicitly required and implemented safely.

### 6.4 No Client-Trusted Authorization

Frontend role checks are for user experience only.

Real authorization must happen:

- in server logic
- in database policies

## 7. PHI and Sensitive Data Rules

### 7.1 PHI Minimization

Only return the fields needed for the current workflow.

Do not send full patient records to the frontend if the screen only needs:

- a display name
- appointment time
- status

### 7.2 No Unnecessary Duplication

Do not duplicate sensitive data across multiple tables, payloads, or logs without a strong reason.

### 7.3 Safe Display Rules

Sensitive data should only be rendered when the workflow truly requires it.

Avoid putting PHI into:

- global layout data
- broad client-side stores
- debug panels
- analytics payloads

### 7.4 Export and Reporting Caution

Any export-like feature involving sensitive data must be treated as high risk and should not be added casually in MVP.

## 8. Supabase Security Rules

### 8.1 RLS Is Mandatory

Every protected table must have:

- RLS enabled
- explicit policies
- a documented access model

No PHI-bearing or role-sensitive table should ship without RLS.

### 8.2 Service Role Usage

The Supabase service-role key is highly privileged.

Rules:

- never expose it to client code
- never use it in browser components
- use it only in tightly controlled server contexts when absolutely necessary
- prefer user-context access plus RLS whenever possible

### 8.3 Auth-Aware Data Access

Whenever possible, query data with the authenticated user context so database policies remain active.

### 8.4 Migration Review Rule

Every schema change must be reviewed for:

- access impact
- RLS impact
- new sensitive fields
- indexing implications
- audit implications

## 9. Secrets and Environment Rules

### 9.1 Secret Sources

Secrets must come only from approved environment configuration.

Do not hardcode:

- API keys
- service-role keys
- webhook secrets
- provider tokens
- SMTP credentials

### 9.2 Client vs Server Variables

Only public-safe variables may be exposed to the client.

Server-only secrets must remain server-side.

### 9.3 Secret Handling Rules

Do not:

- commit secrets
- print secrets to logs
- echo secrets in error messages
- store secrets in source files
- pass sensitive secrets through client-rendered props

### 9.4 Compromise Response Rule

If a secret is exposed or suspected to be exposed, it must be rotated.

## 10. Route and API Security Rules

### 10.1 Every Protected Endpoint Must Validate

Protected endpoints must validate:

- authentication
- authorization
- input shape
- allowed state transitions where applicable

### 10.2 No Insecure Direct Object Access

Never assume that because a user knows an `id`, they are allowed to access that resource.

All lookups must be ownership-aware or permission-aware.

### 10.3 Safe Error Responses

Errors returned to clients must not expose:

- stack traces
- SQL details
- internal IDs that increase risk
- secrets
- sensitive record details

### 10.4 Webhook Security

Webhook endpoints must:

- validate signatures when supported
- validate payload schema
- process requests idempotently where possible
- avoid trusting payloads without verification

## 11. File and Storage Security Rules

### 11.1 Sensitive Storage Must Not Be Public

Any bucket or file that can contain sensitive or user-specific information must not be publicly accessible by default.

### 11.2 Upload Rules

All uploads must validate:

- file type
- file size
- access policy
- ownership and permission context

### 11.3 Download Rules

Downloads must be authorized for the requesting user and should be scoped to the minimum necessary access.

## 12. Logging and Audit Rules

### 12.1 Logging Safety

Do not log:

- access tokens
- passwords
- secrets
- raw PHI unless strongly justified and masked
- large sensitive payloads

### 12.2 Audit Requirements

The system must support audit capture for important sensitive actions such as:

- appointment creation and cancellation
- consultation creation and completion
- SOAP note creation and updates
- role changes
- admin-sensitive operations

### 12.3 App Logs vs Audit Logs

Do not confuse operational logs with audit records.

Operational logs help debug systems.

Audit logs record sensitive or important actions for accountability.

## 13. Frontend Security Rules

### 13.1 Frontend Is Not a Trust Boundary

Frontend checks do not secure the system.

They only improve user experience.

### 13.2 No Sensitive Logic in Client Code

Do not place:

- privileged queries
- secret-dependent logic
- service-role logic
- real authorization decisions

inside client-rendered code.

### 13.3 Safe Rendering

Render only the minimum data necessary and avoid accidentally exposing hidden data through debug or state inspection patterns.

## 14. Backend Security Rules

### 14.1 Server Logic Must Enforce Policy

Server actions, route handlers, and services must enforce access rules before mutating or revealing sensitive data.

### 14.2 Business Workflows Need Security Checks

Workflows such as:

- booking appointments
- joining consultations
- creating SOAP notes
- accessing patient history

must all check access rights explicitly.

### 14.3 No Raw Error Leaks

Internal exceptions must be mapped to safe client-facing responses.

## 15. Integration Security Rules

### 15.1 Wrap Third-Party Providers

All third-party providers must be accessed through internal integration modules.

This makes it easier to:

- control secrets
- normalize errors
- constrain data flow
- review provider usage

### 15.2 Minimal Provider Data Sharing

Send only the data required by the provider integration.

Do not over-share patient or appointment details.

### 15.3 External Callback Review

Any external callback or webhook must be treated as untrusted input until verified.

## 16. Security Review Triggers

A security review is required whenever work introduces or changes:

- authentication behavior
- authorization behavior
- RLS policies
- sensitive database fields
- file upload/download flows
- new integrations
- webhook endpoints
- admin capabilities
- PHI exposure paths

## 17. Forbidden Security Anti-Patterns

The following are not allowed:

- shipping protected tables without RLS
- trusting the frontend for authorization
- exposing service-role keys in client code
- putting secrets in source control
- broad `select *` style data access for sensitive workflows
- unrestricted admin access by assumption
- public storage for sensitive documents
- logging raw sensitive payloads
- skipping authorization because a route is hidden in the UI
- using insecure temporary shortcuts in production code

## 18. Senior-Level Security Expectations

Security work in this project must reflect senior engineering judgment.

That means:

- secure defaults
- explicit access models
- minimal data exposure
- no convenience bypasses
- calm, strict handling of risky features

## 19. Definition of Done for Security Compliance

A feature is not security-complete unless:

- authentication requirements are clear
- authorization has been enforced
- sensitive data exposure is minimized
- RLS impact has been considered
- secrets remain server-side
- logs are safe
- audit impact has been reviewed
- new routes or integrations were assessed for abuse paths

## 20. Security Rule for Agents

AI agents working in this repository must treat this file as mandatory.

If an agent sees a requested implementation that would break these rules, the agent must avoid the insecure implementation and choose the safest valid alternative or explicitly flag the risk.
