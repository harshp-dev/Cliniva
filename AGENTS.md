# AGENTS.md

AI Agent Instructions for the Virtual Health Platform

This repository contains a **multi-tenant virtual healthcare platform** similar to modern API-first EHR systems.
The platform supports telehealth services including patient onboarding, appointments, video consultations, clinical documentation, and billing.

AI coding agents must follow the rules defined in this file before modifying the codebase.

---

# PROJECT OVERVIEW

The goal of the system is to provide infrastructure for digital health organizations to deliver remote care.

Core platform capabilities:

• Patient registration and onboarding
• Appointment scheduling
• Video consultations
• Electronic health records
• Prescription management
• Billing and insurance claims
• Patient portal
• Provider dashboard
• Messaging and notifications
• HIPAA-ready security architecture

The platform is **multi-tenant** where multiple healthcare organizations operate independently within the same infrastructure.

---

# TECH STACK

Frontend + Backend

• Next.js (App Router)
• TypeScript
• TailwindCSS

Backend Platform

• Supabase
• PostgreSQL (via Supabase)
• Supabase Auth
• Supabase Storage
• Supabase Edge Functions

Realtime / Video

• Twilio Video

Infrastructure

• Vercel (frontend deployment)
• CI/CD via GitHub Actions

External Integrations

• Stripe (payments)
• Surescripts (e-prescribing)
• FHIR APIs
• Email/SMS provider (Sendgrid/Twilio)

---

# CORE DOMAIN ENTITIES

Primary database entities:

Patients
Providers
Organizations
Appointments
MedicalRecords
Prescriptions
LabOrders
LabResults
InsurancePlans
Claims
Payments
CarePlans
ClinicalNotes
Medications
Allergies
VitalSigns
Diagnoses
Procedures
Referrals
ConsentForms
AuditLogs
Users
Roles
Permissions
Templates
Workflows
Notifications
Messages
Documents

Agents must maintain **schema consistency** when editing these entities.

---

# PROJECT STRUCTURE

Typical repository structure:

/app
/(auth)
/(dashboard)
/(patient)
/(provider)

/components
/hooks
/lib
/services
/types

/supabase
/migrations
/functions

/docs

---

# API DESIGN RULES

All APIs must follow REST conventions.

Examples:

/api/patients
/api/providers
/api/appointments
/api/medical-records
/api/prescriptions
/api/billing
/api/lab-orders
/api/messages
/api/notifications

Rules:

• Use plural resource names
• Return consistent JSON responses
• Implement pagination for lists
• Validate input with schemas

---

# DATABASE RULES

Database is managed through **Supabase PostgreSQL**.

Agents must follow these rules:

• Use migrations for schema updates
• Never alter production tables manually
• Maintain foreign key integrity
• Always index frequently queried fields

All core tables must contain:

organization_id
created_at
updated_at

---

# MULTI TENANT ARCHITECTURE

Every record must belong to an organization.

Tenant isolation rules:

• organization_id is mandatory
• Row Level Security (RLS) must be enabled
• Queries must filter by organization context

Cross-tenant data access is forbidden.

---

# SECURITY RULES

Healthcare applications must prioritize security.

Agents must enforce:

• Authentication using Supabase Auth
• Role-based authorization
• Encryption in transit (HTTPS)
• Secure storage of PHI
• Audit logs for sensitive actions

Never expose sensitive patient data in logs.

---

# CODING RULES

General principles:

• Use modular architecture
• Keep components reusable
• Maintain strict TypeScript types
• Follow ESLint and Prettier formatting

Naming conventions:

Classes → PascalCase
Functions → camelCase
Constants → UPPER_CASE

---

# TESTING RULES

Agents must ensure:

• Unit tests for business logic
• Integration tests for APIs
• E2E tests for major workflows

Testing tools:

• Jest
• Playwright

---

# DEVELOPMENT COMMANDS

Install dependencies

npm install

Run development server

npm run dev

Run tests

npm run test

Run lint

npm run lint

Build production

npm run build

---

# AGENT WORKFLOW RULES

Agents must:

1. Read AGENTS.md before changes
2. Follow architecture defined in ARCHITECTURE.md
3. Check TASKS.md for implementation roadmap
4. Avoid breaking API contracts
5. Update docs when making structural changes

---

# MVP SCOPE

Initial MVP features:

• Patient registration
• Appointment scheduling
• Basic video consultation
• Clinical documentation
• Provider dashboard
• Patient portal

Focus on **single specialty first** (e.g., mental health or primary care).

---

End of AGENTS.md
