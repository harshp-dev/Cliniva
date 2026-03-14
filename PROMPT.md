You are a senior staff engineer and autonomous coding agent.

Your task is to build a production-ready SaaS application called:

Virtual Health Platform

The system is an API-first telehealth platform similar to Healthie.

The platform must support:

- patient onboarding
- appointment scheduling
- telehealth video consultations
- electronic health records
- prescription management
- patient portal
- provider dashboard
- billing and insurance claims
- messaging and notifications
- multi-tenant healthcare organizations

You must automatically scaffold the entire project.

--------------------------------------------------

TECH STACK

Use the following stack:

Frontend
Next.js 14 (App Router)
TypeScript
TailwindCSS

Backend
Supabase
PostgreSQL
Supabase Auth
Supabase Edge Functions

Realtime
Supabase Realtime
WebSockets

Video
Twilio Video

Infrastructure
Vercel deployment
Supabase Cloud

Payments
Stripe

--------------------------------------------------

PROJECT STRUCTURE

Create the following repository structure.

app/
  (auth)/
  (dashboard)/
  (patient)/
  (provider)/

components/
hooks/
lib/
services/
types/

supabase/
  migrations/
  functions/
  policies/

docs/

tests/

--------------------------------------------------

DATABASE DESIGN

Create PostgreSQL tables using Supabase migrations.

Core tables:

organizations
users
roles
permissions
patients
providers
appointments
medical_records
clinical_notes
prescriptions
medications
allergies
vital_signs
diagnoses
procedures
lab_orders
lab_results
care_plans
messages
notifications
documents
payments
claims
insurance_plans
audit_logs

Each table must include:

id uuid primary key
organization_id uuid
created_at timestamp
updated_at timestamp

Enable Row Level Security.

Create policies that enforce:

tenant isolation
role-based access control

--------------------------------------------------

AUTHENTICATION

Implement authentication using Supabase Auth.

Supported roles:

admin
provider
staff
patient

Create middleware to enforce:

role based access
tenant isolation

--------------------------------------------------

API ROUTES

Create API routes using Next.js route handlers.

Required endpoints:

/api/patients
/api/providers
/api/appointments
/api/medical-records
/api/prescriptions
/api/messages
/api/notifications
/api/payments
/api/claims

Ensure:

REST conventions
input validation with Zod
consistent response format

--------------------------------------------------

CORE FEATURES

PATIENT MANAGEMENT

- patient onboarding form
- patient profile
- document upload

APPOINTMENT SYSTEM

- provider availability
- appointment booking
- calendar view
- reminders

VIDEO CONSULTATIONS

- generate secure meeting room
- WebRTC integration
- provider notes during call

EHR

- clinical notes
- SOAP notes
- diagnosis tracking
- treatment plans

PRESCRIPTIONS

- medication database
- prescription generation
- drug interaction warnings

MESSAGING

- patient provider chat
- notifications
- message history

BILLING

- Stripe integration
- invoice generation
- claim tracking

--------------------------------------------------

UI REQUIREMENTS

Create responsive UI with Tailwind.

Main dashboards:

Provider dashboard
Patient portal
Admin panel

Pages:

login
signup
dashboard
patients
appointments
consultation
billing

--------------------------------------------------

SECURITY

The system must enforce:

HIPAA-style security practices
encrypted communication
audit logging
role-based authorization

Never log patient health information.

--------------------------------------------------

TESTING

Add:

unit tests
API tests
Playwright e2e tests

--------------------------------------------------

DEV COMMANDS

Create scripts in package.json:

dev
build
test
lint
format

--------------------------------------------------

DOCUMENTATION

Generate documentation files:

README.md
PRD.md
ARCHITECTURE.md
AGENTS.md
TASKS.md

--------------------------------------------------

IMPLEMENTATION ORDER

1 initialize Next.js project
2 install dependencies
3 configure Supabase
4 implement authentication
5 create database schema
6 implement patient module
7 implement appointment system
8 implement telehealth video
9 implement EHR
10 implement billing
11 implement messaging
12 add tests
13 generate documentation

--------------------------------------------------

AUTONOMOUS EXECUTION RULES

You are allowed to:

create files
modify files
install dependencies
run migrations
write tests
generate documentation

Continue working until the system compiles and runs locally.

When finished:

print the setup instructions and run commands.

Start implementation now.