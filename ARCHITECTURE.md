# ARCHITECTURE.md

This document explains the system architecture of the Virtual Health Platform.

---

# SYSTEM OVERVIEW

The system is composed of four major layers:

1. Frontend Application
2. Backend APIs
3. Data Layer
4. External Services

Architecture style: **API-first modular SaaS platform**

---

# FRONTEND LAYER

Built with Next.js.

Responsibilities:

• UI rendering
• Client-side routing
• Data fetching
• Form validation
• Realtime updates

Major interfaces:

Patient Portal
Provider Dashboard
Admin Panel

---

# BACKEND LAYER

Backend logic is implemented using:

• Next.js API routes
• Supabase Edge Functions

Responsibilities:

• Business logic
• Validation
• Authorization
• Integration with third-party services

---

# DATABASE LAYER

Database: PostgreSQL (Supabase)

Key features:

• Row Level Security
• Foreign key relationships
• JSON fields for flexible medical data

Important tables:

patients
providers
appointments
medical_records
prescriptions
claims
payments

---

# AUTHENTICATION

Authentication handled by Supabase Auth.

Supported login methods:

• Email/password
• OAuth providers
• Magic link login

User roles:

Admin
Provider
Staff
Patient

Authorization is enforced using **role-based access control**.

---

# VIDEO CONSULTATION SYSTEM

Video calls use WebRTC via third-party services.

Recommended providers:

• Twilio Video
• LiveKit

Features:

• secure peer connection
• session recording
• screen sharing
• chat

---

# FILE STORAGE

Patient documents stored in Supabase Storage.

Examples:

• medical reports
• prescriptions
• consent forms
• lab results

All uploads must be encrypted and access controlled.

---

# REALTIME FEATURES

Supabase realtime is used for:

• appointment updates
• messaging
• provider notifications

---

# INTEGRATIONS

Important integrations:

Stripe → billing
Surescripts → e-prescribing
FHIR APIs → external EHR interoperability
Email/SMS → notifications

---

# SECURITY ARCHITECTURE

Security principles:

Least privilege access
Row level data isolation
Encrypted communications
Audit logging

Sensitive data includes:

• patient records
• prescriptions
• insurance details

---

# SCALABILITY

System scalability strategy:

• stateless frontend (Next.js)
• managed Postgres (Supabase)
• serverless functions
• CDN delivery via Vercel

---

# MONITORING

System monitoring tools:

• Supabase logs
• Sentry
• Datadog (optional)

Key metrics:

API latency
appointment success rate
video call uptime
system errors

---

End of ARCHITECTURE.md
