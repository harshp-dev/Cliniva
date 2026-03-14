# Cliniva MVP Implementation Plan

## 1. Purpose

This file defines the end-to-end implementation plan for building the **Cliniva MVP** using **Next.js**, **Supabase**, and the supporting stack required to ship a secure virtual-care product foundation.

This plan is intentionally narrower than the PRD. We are **not** building the full Healthie-class platform in Phase 1. We are building a focused MVP first, validating the product, and only then moving to later phases.

## 2. Product Direction for MVP

### 2.1 Product Goal

Build a working virtual-care web application for a single specialty workflow with:

- patient onboarding
- patient and provider authentication
- appointment scheduling
- provider dashboard
- patient portal
- basic teleconsultation flow
- clinical documentation with SOAP notes
- secure messaging / notifications foundation
- HIPAA-aware architecture and audit readiness

### 2.2 What We Are Explicitly Not Building in MVP

The following PRD items are excluded from the first delivery:

- e-prescribing
- insurance billing and claims
- lab and diagnostics integrations
- multi-tenant white-label architecture as a full productized feature
- native mobile apps
- AI-assisted workflows
- advanced analytics
- chronic care management
- interoperability hub / FHIR marketplace

### 2.3 MVP Outcome

At the end of MVP, Cliniva should allow:

1. a patient to sign up, complete intake basics, and request or book an appointment
2. a provider to manage availability, review upcoming appointments, join a consult, and write SOAP notes
3. an admin or authorized operator to monitor users, appointments, and system activity
4. the team to deploy the system with a stable database schema, role-based access, audit logs, and a clean codebase ready for Phase 2

## 3. Core MVP Users

### 3.1 Patient

- registers and logs in
- completes profile and intake data
- books and manages appointments
- joins virtual consultations
- views visit history and notes that are safe to expose

### 3.2 Provider

- logs in with protected access
- manages schedule and appointment queue
- joins virtual consultations
- reviews patient profile and previous visit history
- creates and updates SOAP notes

### 3.3 Admin / Operations

- monitors users and appointment states
- resolves operational issues
- reviews audit events
- manages provider onboarding and system configuration

## 4. Chosen Tech Stack

This is the approved MVP stack unless a specific implementation issue forces a change.

### 4.1 Frontend

- **Next.js 16 App Router**: primary web application framework
- **React 19**: UI layer
- **TypeScript**: type safety across frontend and backend code
- **Tailwind CSS v4**: styling system
- **shadcn/ui-style component approach or reusable internal component library**: UI primitives built in-repo
- **React Hook Form + Zod**: form handling and validation

### 4.2 Backend / Application Layer

- **Next.js Route Handlers**: server endpoints for controlled business logic
- **Server Actions**: limited use for simple secure form mutations
- **Supabase**: primary backend platform
- **Supabase Auth**: authentication and session management
- **Supabase Postgres**: relational database
- **Supabase Storage**: document and asset storage
- **Supabase Realtime**: live appointment / messaging updates where useful
- **Supabase Row Level Security (RLS)**: authorization boundary at the database layer

### 4.3 Database and Domain Modeling

- **PostgreSQL in Supabase**: source of truth for all domain entities
- **SQL migrations**: schema changes tracked in versioned migration files
- **Database functions / triggers**: audit logs, derived timestamps, and access-related automation

### 4.4 Video / Realtime

- **Daily.co**: fastest path for HIPAA-capable teleconsultation integration in MVP
- **Webhooks from Daily**: optional session event tracking if needed

Reason:

- lower implementation risk than building custom WebRTC
- faster MVP path
- better operational reliability for video sessions

### 4.5 Notifications

- **Resend or SendGrid**: transactional email
- **Twilio**: SMS reminders if reminders are included in MVP
- initial reminder jobs triggered from app logic or scheduled tasks

### 4.6 Validation, Security, and Developer Quality

- **Zod**: runtime validation for forms and server payloads
- **ESLint**: code quality
- **TypeScript strict mode**: development rule
- **Prettier**: formatting if adopted by team
- **Vitest**: unit and utility tests
- **Playwright**: end-to-end flow testing

### 4.7 Deployment and Operations

- **Vercel**: Next.js hosting
- **Supabase Cloud**: backend hosting
- **GitHub**: source control and PR workflow
- **GitHub Actions**: CI for lint, typecheck, tests, and migration checks

## 5. MVP Feature Set with Stack Mapping

Each MVP feature below includes the main implementation stack we will use.

### 5.1 Authentication and Access Control

Scope:

- patient sign up and sign in
- provider sign in
- protected routes
- role-based access
- password reset
- optional MFA for provider/admin accounts

Stack:

- Next.js App Router
- Supabase Auth
- Supabase middleware / session handling
- PostgreSQL roles table or profile role column
- RLS policies
- Zod for auth form validation

### 5.2 User Profiles and Onboarding

Scope:

- patient profile
- provider profile
- intake fields for patient basics
- specialty / availability metadata for providers

Stack:

- Next.js forms
- React Hook Form
- Zod
- Supabase Postgres tables
- Supabase Storage for profile assets if needed

### 5.3 Appointment Scheduling

Scope:

- provider availability
- appointment creation
- appointment status lifecycle
- reschedule / cancel flows
- appointment list and calendar-like display

Stack:

- Next.js UI
- Supabase Postgres tables for schedules and appointments
- Route Handlers for booking rules
- Supabase Realtime for status refresh where useful
- transactional email / SMS provider for reminders

### 5.4 Provider Dashboard

Scope:

- today’s appointments
- patient queue
- consult join actions
- quick patient access
- note creation entry points

Stack:

- Next.js server-rendered dashboard pages
- Supabase queries with role checks
- Tailwind component system

### 5.5 Patient Portal

Scope:

- upcoming appointments
- appointment history
- profile editing
- consultation join action
- access to safe post-visit records

Stack:

- Next.js patient routes
- Supabase Auth
- Supabase Postgres
- RLS policies for patient-owned records

### 5.6 Video Consultation

Scope:

- create video room / session
- provider and patient join flow
- appointment-linked session state
- consultation start / end timestamps

Stack:

- Daily.co room/session integration
- Next.js Route Handlers for secure room creation
- Supabase tables for session metadata
- audit/event logging for session actions

### 5.7 Clinical Documentation (SOAP Notes)

Scope:

- create note during or after consult
- save subjective, objective, assessment, and plan sections
- attach note to appointment and patient
- provider-only editing rules

Stack:

- Next.js form UI
- rich text kept simple for MVP; prefer structured textarea sections
- Supabase Postgres
- RLS restricting provider access
- audit triggers for note create/update

### 5.8 Messaging and Notifications Foundation

Scope:

- system notifications for appointment states
- secure in-app notification list
- email reminders
- optional simple patient-provider message thread if time permits

Stack:

- Supabase Postgres notification tables
- Supabase Realtime for in-app refresh
- Resend or SendGrid for email
- Twilio for SMS if included

### 5.9 Audit Logging and Security Controls

Scope:

- capture important user actions
- track read/write operations for sensitive records where feasible
- maintain provider/admin audit trails

Stack:

- Postgres audit tables
- Supabase database triggers / functions
- application-level logging for security events

## 6. Recommended Architecture

### 6.1 Architecture Style

Use a **modular monolith** for MVP.

Meaning:

- one Next.js application
- one Supabase project
- one shared codebase
- domain modules separated by feature, not by premature microservices

This is the correct MVP tradeoff because it minimizes deployment complexity while keeping the codebase organized.

### 6.2 High-Level Layers

1. **Presentation layer**
   Next.js pages, layouts, components, forms
2. **Application layer**
   route handlers, server actions, domain services, permission checks
3. **Data layer**
   Supabase client wrappers, SQL queries, repositories if needed
4. **Platform layer**
   auth, storage, video integration, notifications, logging

### 6.3 Core Rule

UI components must not directly contain critical business rules.

Business rules belong in:

- server actions when small and tightly scoped
- route handlers when logic is API-like or integration-heavy
- service modules when logic is shared or non-trivial

## 7. Proposed Folder Structure

This is the target structure we should move toward during implementation.

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
  shared/
  forms/
  dashboards/
lib/
  auth/
  supabase/
  validations/
  permissions/
  services/
    appointments/
    consultations/
    notes/
    notifications/
  utils/
types/
supabase/
  migrations/
  seed/
docs/
```

### 7.1 Route Groups

- `(marketing)`: landing and public pages
- `(auth)`: login, signup, reset password
- `(patient)`: patient portal
- `(provider)`: provider workspace
- `(admin)`: operator/admin tools

### 7.2 Key Internal Modules

- `lib/supabase`: browser/server/admin clients
- `lib/auth`: session, user role resolution, guards
- `lib/permissions`: authorization helpers
- `lib/validations`: zod schemas shared across client and server
- `lib/services`: domain-specific business logic

## 8. Core Database Design for MVP

The exact schema may evolve, but the MVP should begin with these tables.

### 8.1 Identity and Access

- `profiles`
- `user_roles`
- `provider_profiles`
- `patient_profiles`

### 8.2 Scheduling

- `provider_availability`
- `appointments`
- `appointment_participants`
- `consultation_sessions`

### 8.3 Clinical

- `medical_records`
- `soap_notes`
- `patient_intake_forms`

### 8.4 Communication and Operations

- `notifications`
- `message_threads` optional
- `message_entries` optional
- `audit_logs`

### 8.5 Suggested Appointment Statuses

- `requested`
- `confirmed`
- `cancelled`
- `completed`
- `no_show`

## 9. Authorization Model

### 9.1 Roles

- `patient`
- `provider`
- `admin`

### 9.2 Access Rules

- patients can only view and update their own profile and allowed records
- providers can only access patients connected through appointments or authorized clinical relationships
- admins can manage operations but should not automatically gain unrestricted PHI access without explicit policy

### 9.3 RLS Requirement

Every PHI-bearing table must have explicit RLS policies before feature completion.

No MVP feature is considered done until:

- access rules are enforced in the UI
- access rules are enforced in server logic
- access rules are enforced in the database

## 10. MVP Pages and User Flows

### 10.1 Public / Marketing

- home / landing page
- product overview
- login / signup entry points

### 10.2 Auth

- patient signup
- sign in
- forgot password
- provider invite or controlled provider onboarding

### 10.3 Patient App

- dashboard
- profile / intake
- appointments list
- book appointment
- consultation room entry
- records / visit history

### 10.4 Provider App

- dashboard
- schedule / appointment queue
- patient detail
- consultation room
- SOAP notes editor

### 10.5 Admin App

- users overview
- provider onboarding
- appointment operations
- audit log viewer basic version

## 11. Delivery Phases

The MVP itself should be built in internal milestones. This keeps delivery predictable.

### Phase A: Foundation

- initialize project standards
- configure Supabase
- configure environment variables
- add auth scaffolding
- define initial folder structure
- add core UI primitives

### Phase B: Identity and Profiles

- implement auth flows
- create profile tables and role model
- build patient and provider onboarding
- protect app routes

### Phase C: Scheduling

- implement provider availability
- implement appointment booking
- implement appointment states
- create patient and provider appointment views

### Phase D: Consultation

- integrate Daily.co
- create consultation room flow
- connect sessions to appointments
- capture visit timing events

### Phase E: Clinical Notes

- create SOAP notes schema
- provider note editor
- patient/appointment linking
- permissions and audit coverage

### Phase F: Notifications and Hardening

- email reminders
- in-app notifications
- audit logs
- error handling
- loading / empty states
- test coverage for core flows

### Phase G: Release Readiness

- CI pipeline
- deployment setup
- QA pass
- seed/demo data
- MVP checklist signoff

## 12. Detailed End-to-End Build Steps

This is the exact high-level sequence we should follow.

1. Finalize MVP scope and freeze Phase 1 exclusions.
2. Set up Supabase project, local environment variables, and project secrets handling.
3. Add Supabase client utilities for browser, server, and privileged admin contexts.
4. Define domain types and validation schemas.
5. Create initial database schema and migrations.
6. Enable RLS and write base policies.
7. Implement authentication and protected route handling.
8. Build role-aware app shells for patient, provider, and admin areas.
9. Implement profile and onboarding flows.
10. Implement provider availability management.
11. Implement appointment booking, rescheduling, cancellation, and listing.
12. Add notification events for appointment lifecycle changes.
13. Integrate Daily.co and secure consultation room creation.
14. Build provider consultation workflow.
15. Build structured SOAP notes workflow.
16. Add audit logs for critical patient-data and appointment actions.
17. Add patient portal history and allowed record views.
18. Add QA coverage with unit, integration, and end-to-end tests.
19. Configure CI, preview deployments, and production deployment.
20. Perform final MVP validation against acceptance criteria.

## 13. Acceptance Criteria for MVP Completion

The MVP is done only when all of the following are true:

- users can authenticate and reach the correct dashboard by role
- a patient can create and manage an appointment
- a provider can manage availability and see assigned appointments
- patient and provider can join a consultation session linked to the appointment
- a provider can create SOAP notes for a completed consultation
- permissions are enforced correctly across all protected resources
- audit logging exists for critical sensitive actions
- the application passes lint, typecheck, and core flow tests
- the application is deployable and documented

## 14. Non-Functional Requirements for MVP

### 14.1 Security

- HTTPS only
- secure cookie/session handling
- RLS on PHI tables
- environment secrets never committed
- provider/admin stronger auth controls

### 14.2 Reliability

- graceful empty and error states
- retry-safe appointment actions where possible
- no silent mutation failures

### 14.3 Performance

- server-render where appropriate
- paginate large lists
- avoid over-fetching

### 14.4 Maintainability

- strong typing
- shared schema validation
- no duplicated permission logic
- migrations tracked in source control

## 15. Testing Strategy

### 15.1 Unit Tests

Use **Vitest** for:

- validation schemas
- permission helpers
- appointment rule logic
- note transformation utilities

### 15.2 Integration Tests

Use integration-style tests for:

- auth-protected server actions
- route handlers
- Supabase-facing domain logic

### 15.3 End-to-End Tests

Use **Playwright** for:

- patient signup and login
- appointment booking
- provider dashboard flow
- consultation launch entry
- SOAP note creation

## 16. Environment and Secrets

Expected environment groups:

- Next.js public variables
- Next.js server-only variables
- Supabase URL and anon key
- Supabase service role key
- Daily API credentials
- email provider credentials
- SMS provider credentials if used

Rule:

- service-role credentials must never be accessible from client code

## 17. Risks and Mitigations

### 17.1 HIPAA / PHI Handling Risk

Mitigation:

- keep MVP narrow
- use RLS from the beginning
- add audit logs early
- avoid exposing unnecessary record data

### 17.2 Overbuilding Risk

Mitigation:

- freeze MVP exclusions
- reject Phase 2 features during MVP unless they unblock MVP delivery

### 17.3 Video Integration Risk

Mitigation:

- use Daily.co instead of custom WebRTC
- keep video feature focused on join/start/end flow only

### 17.4 Permission Bugs

Mitigation:

- centralize role and permission helpers
- enforce security at DB and server layers
- add integration tests for forbidden access

## 18. Definition of Done for Each Feature

Every feature must satisfy:

- UI implemented
- server logic implemented
- validation implemented
- database schema ready
- RLS policy ready
- loading/error states handled
- audit impact reviewed
- tests added
- documentation updated if required

## 19. Documentation to Create After This Plan

After `Plan.md`, we should create a dedicated `Skills` or documentation structure for AI-agent execution rules.

Recommended future files:

- `Skills/frontend.md`
- `Skills/backend.md`
- `Skills/architecture.md`
- `Skills/folder-structure.md`
- `Skills/agent-rules.md`
- `Skills/testing.md`
- `Skills/security.md`

Each file should define:

- clear ownership area
- strict implementation rules
- naming conventions
- do and do-not rules
- review checklist
- examples where needed

## 20. Immediate Next Step After This File

Once this plan is approved, the next implementation artifact should be:

1. project setup and architecture decisions locked into codebase structure
2. Supabase integration and environment setup
3. initial schema and auth foundation

This order matters. We should not begin building dashboards or forms before the auth, schema, and access-control foundation is in place.
