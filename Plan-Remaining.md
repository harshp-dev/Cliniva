# MVP Remaining Plan

This plan reflects the current codebase as of March 14, 2026. It replaces the older version that still treated several already-built features as pending.

## Current MVP Status

Completed or substantially implemented:
- Authentication: sign up, sign in, sign out, email confirmation flow
- Role-based routing and route protection
- Patient, provider, and admin dashboards
- Patient appointment booking
- Provider availability management
- Consultation room stub
- SOAP note creation and patient-shared note visibility
- Patient records view
- In-app notifications read views
- Admin operational overview pages
- Reusable dashboard shell with role-aware sidebar navigation

Built but still needing workflow completion or polish:
- Appointment lifecycle status actions
- Admin action flows
- Notification behavior consistency
- Profile management
- Seed stability and admin demo data consistency
- Final MVP hardening

## Remaining MVP Work

### Task 1: Appointment Lifecycle Completion

#### Goal
Make appointment status management complete and reliable across patient, provider, consultation, notification, and admin workflows.

#### Why This Is Next
This is the highest-value remaining work because it connects the three role-based areas into one coherent product flow.

#### Scope
- Providers can confirm appointments
- Providers can cancel appointments
- Providers can mark appointments completed
- Patients can see the updated status immediately in their workspace
- Admin can inspect operational status accurately
- Notifications are created for each important state change
- Audit events are created for sensitive appointment state changes

#### Required Behaviors
- New patient-booked appointment defaults to `requested`
- Provider can move `requested -> confirmed`
- Provider can move `requested -> cancelled`
- Provider can move `confirmed -> completed`
- Completed appointments should be reflected in visit history
- Cancelled appointments should remain visible historically, not disappear
- Consultation session state should stay aligned with appointment state where applicable

#### Routes Affected
- `/provider/appointments`
- `/patient/appointments`
- `/consultations/[appointmentId]`
- `/admin/operations`

#### Files to Update
- `app/(provider)/provider/appointments/actions.ts`
- `app/(provider)/provider/appointments/page.tsx`
- `app/(patient)/patient/appointments/page.tsx`
- `app/consultations/[appointmentId]/actions.ts`
- `lib/services/appointments/update-appointment-status.ts`
- `lib/services/notifications/create-notification.ts`
- `lib/services/audit/*` if audit helper abstraction is introduced

#### UI Expectations
- Provider appointment cards must show action buttons only when transitions are valid
- Patient view must clearly distinguish requested, confirmed, completed, and cancelled states
- Status presentation must remain visually consistent across all role views

#### Done When
- Provider can drive the full lifecycle without manual DB edits
- Patient sees correct status in both upcoming and history contexts
- Notifications and audit logs are created for the critical transitions

---

### Task 2: Admin Actions and Operational Controls

#### Goal
Turn the admin role from a read-only dashboard into a real MVP operations role.

#### Scope
- Admin can inspect appointment operations with filters or segmented views
- Admin can inspect provider roster in a more useful way
- Admin can inspect audit logs with clearer context
- Admin can perform limited admin actions where policy allows

#### Important Constraint
Admin is an operations role, not an unrestricted PHI superuser. Every admin action must remain policy-aware and role-safe.

#### Candidate Admin Actions for MVP
- Review provider roster details
- View user counts and operational state
- Filter audit log entries by action or entity type
- Review appointment operations in a clearer queue layout
- Optionally cancel problematic appointments operationally if required by MVP scope

#### Routes Affected
- `/admin/dashboard`
- `/admin/operations`
- `/admin/audit`
- `/admin/providers`

#### Files to Create or Update
- `app/(admin)/admin/operations/page.tsx`
- `app/(admin)/admin/audit/page.tsx`
- `app/(admin)/admin/providers/page.tsx`
- `lib/services/dashboards/get-admin-dashboard-data.ts`
- `lib/services/audit/*`
- `lib/services/admin/*` if admin action layer is introduced

#### UI Expectations
- Admin pages must feel operational and controlled, not generic list dumps
- Filters and labels must clarify what the admin is reviewing
- Any mutating action must have clear intent and strong guardrails

#### Done When
- Admin can do more than observe summaries
- Admin area supports real MVP operations monitoring and limited action-taking

---

### Task 3: Notification Workflow Completion

#### Goal
Make notifications behave like a real product system instead of just a static feed.

#### Scope
- Generate notifications for important actions:
  - appointment requested
  - appointment confirmed
  - appointment cancelled
  - consultation started
  - consultation completed
  - SOAP note shared with patient
- Add mark-as-read behavior
- Keep unread counts consistent across dashboard and notification pages

#### Routes Affected
- `/patient/dashboard`
- `/patient/notifications`
- `/provider/dashboard`
- `/provider/notifications`

#### Files to Create or Update
- `lib/services/notifications/create-notification.ts`
- `lib/services/notifications/get-user-notifications.ts`
- `lib/services/notifications/mark-notification-read.ts`
- `components/features/notifications/notification-list/*`
- related server actions in patient/provider areas

#### UI Expectations
- Notification cards should support read/unread treatment
- Unread count badges must match the underlying data
- Notification language should sound product-ready and specific

#### Done When
- Notifications are event-driven and not just seeded demo content
- Unread state behaves consistently across pages

---

### Task 4: Patient and Provider Profile Management

#### Goal
Allow users to manage their essential profile information inside the product.

#### Scope
- Patient profile management
- Provider profile management
- Contact details editing
- Intake-completion relevant fields for patient
- Provider specialty / experience / bio editing where appropriate

#### Routes to Add
- `/patient/profile`
- `/provider/profile`

#### Files to Create
- `app/(patient)/patient/profile/page.tsx`
- `app/(provider)/provider/profile/page.tsx`
- `app/(patient)/patient/profile/actions.ts`
- `app/(provider)/provider/profile/actions.ts`
- `lib/services/profiles/update-patient-profile.ts`
- `lib/services/profiles/update-provider-profile.ts`
- reusable form components where justified

#### UI Expectations
- Reuse the dashboard shell
- Forms must be clean, structured, and validation-backed
- Completion-related fields should feel deliberate, not like a database dump

#### Done When
- Patient and provider can manage their own profile data without direct SQL changes
- Completion and dashboard summary data reflect those edits correctly

---

### Task 5: Seed Stability and Demo Data Quality

#### Goal
Ensure manual SQL-based seeding remains reliable and produces realistic demo behavior for all three roles.

#### Scope
- Keep seed idempotent
- Ensure manually seeded auth users can log in reliably
- Ensure admin-specific seed data is present and visible
- Ensure notifications, appointments, notes, and audit logs create useful dashboard states

#### Files to Update
- `supabase/seed/0001_mvp_seed.sql`
- supporting migration files only if schema adjustments are required

#### Done When
- Re-running the seed does not break auth rows
- Admin, provider, and patient demo accounts all log in reliably
- Every role lands in a dashboard with meaningful content

---

### Task 6: Final MVP Hardening

#### Goal
Tighten the application so the MVP is coherent, stable, and presentable before phase 2 work begins.

#### Scope
- Empty states
- Error states
- Success messaging
- Loading and pending UX where needed
- Route consistency and navigation review
- Visual polish pass on functional pages
- Audit coverage review for critical actions
- Seed review and environment sanity checks

#### Areas to Review
- auth routes
- role redirects
- provider notes workflow
- consultation actions
- admin operational screens
- notification consistency

#### Done When
- Core MVP flows work without manual intervention
- The product feels connected rather than page-by-page
- There are no obvious dead-end screens or missing route links

---

## Recommended Build Order

1. Appointment Lifecycle Completion
2. Notification Workflow Completion
3. Admin Actions and Operational Controls
4. Patient and Provider Profile Management
5. Seed Stability and Demo Data Quality
6. Final MVP Hardening

## Execution Rule

When you say `Implement Task 1`, `Implement Task 2`, and so on, the implementation should include:
- route work
- service layer work
- server actions
- UI updates
- role-safe behavior
- audit and notification updates where relevant
- basic error handling

## Notes

- The old plan file is no longer source-of-truth because several items there are already implemented.
- This file should now be treated as the active execution plan for the remaining MVP work.
- After MVP hardening is complete, the next phase should move into deeper admin tooling, real video integration, analytics/reporting, and broader product workflows.
