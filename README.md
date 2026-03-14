# Virtual Health Platform

API-first telehealth SaaS scaffold built with Next.js 14, Supabase, Twilio Video, and Stripe.

## Features

- Multi-tenant organizations with tenant isolation via Supabase RLS
- Role-based access for `admin`, `provider`, `staff`, `patient`
- Patient onboarding and portal workflows
- Appointment scheduling and consultation room token generation
- EHR scaffolding: medical records, clinical notes, vitals, diagnoses, labs, care plans
- Prescription workflows with interaction warning hook
- Secure messaging and notification channels
- Billing + insurance claims APIs
- Audit logging and secure API response conventions

## Stack

- Frontend: Next.js 14 App Router, TypeScript, TailwindCSS
- Backend: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- Video: Twilio Video
- Payments: Stripe
- Deployment: Vercel + Supabase Cloud

## Repository Structure

```txt
app/
  (auth)/
  (dashboard)/
  (patient)/
  (provider)/
  api/
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
```

## Environment

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`
- `TWILIO_TWIML_APP_SID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run test
npm run test:e2e
```

## Supabase Setup

1. Create a Supabase project.
2. Run SQL from:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/policies/002_rls_policies.sql`
3. Enable Realtime for `messages`, `notifications`, `appointments` tables.
4. Configure auth providers and email templates.
5. Deploy edge functions from `supabase/functions/`.

## Security Notes

- Row Level Security enabled for all core tables.
- Tenant isolation policy enforces `organization_id = current_org_id()`.
- Middleware applies role checks and propagates tenant context.
- Avoid logging PHI; logger redacts sensitive fields.
- Configure HTTPS/TLS and secure secret management in production.
