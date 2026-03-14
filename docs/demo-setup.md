# Demo Setup

## Purpose

This project currently points to a hosted Supabase project through `.env`. The fastest way to make patient, provider, and admin testing reliable is to bootstrap the hosted project with repeatable demo users and core records.

## Command

```bash
npm run demo:bootstrap
```

This script uses:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

from the local `.env` file or the current shell environment.

## What It Creates

### Auth users
- Admin: `ava.thompson@cliniva.com`
- Provider: `ethan.parker@cliniva.com`
- Provider: `maya.collins@cliniva.com`
- Patient: `olivia.carter@cliniva.com`
- Patient: `noah.bennett@cliniva.com`
- Patient: `sophia.reed@cliniva.com`

Password for all demo users:

```text
ClinivaDemo!23
```

### Domain records
- `profiles`
- `provider_profiles`
- `patient_profiles`
- provider availability blocks
- one requested appointment
- one confirmed appointment
- one completed appointment
- one completed consultation session
- one shared SOAP note
- notifications for all three roles
- admin-facing audit events

## Expected Testing Outcome

After running the bootstrap script:
- patient flows should have visible appointments, notifications, and records
- provider flows should have availability, queue items, and documentation context
- admin flows should have provider roster, upcoming operations, and audit activity

## Suggested Demo Order

1. Run `npm run demo:bootstrap`
2. Start the app with `npm run dev`
3. Sign in as patient and request an appointment
4. Sign in as provider and confirm or cancel the request
5. Start and complete the consultation
6. Save a SOAP note
7. Sign back in as patient and review notifications and records
8. Sign in as admin and review operations, providers, and audit screens

## Notes

- The script is idempotent enough for repeat demo use. It updates auth user metadata and core profile records, and inserts or refreshes the main demo content.
- This script is intended for development and demo environments only. Do not run it against production data.
