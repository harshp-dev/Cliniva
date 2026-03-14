# MVP Execution Tracker

Last updated: 2026-03-14

## Status Legend
- `[x]` Completed
- `[-]` In progress
- `[ ]` Not started
- `[~]` Partial / built but needs hardening

## Phase 1: Demo and Environment Stability
- [x] Create repo-local execution tracker
- [x] Add a reliable hosted Supabase demo bootstrap path for auth users and core data
- [ ] Verify demo accounts for patient, provider, and admin can log in against the target project
- [x] Document repeatable setup and smoke-test steps

## Phase 2: Identity and Profile Completion
- [x] Patient sign up and sign in
- [x] Provider sign in and protected routing
- [x] Patient profile page and update action
- [x] Provider profile page and update action
- [~] Forgot password flow decision and implementation review
- [ ] Full onboarding consistency review

## Phase 3: Scheduling and Appointment Lifecycle
- [x] Patient appointment request flow
- [x] Provider availability management
- [~] Provider appointment lifecycle actions
- [~] Patient appointment history and status clarity
- [ ] Admin lifecycle inspection consistency
- [ ] Audit coverage for critical appointment transitions

## Phase 4: Consultation Workflow
- [x] Consultation room stub and route
- [~] Appointment-to-consultation state alignment
- [~] Provider start and complete actions
- [ ] Patient join-path validation across lifecycle states
- [ ] Real video integration decision for MVP

## Phase 5: Clinical Notes and Record Release
- [x] SOAP note editor and save action
- [x] Patient shared-record visibility
- [~] Audit coverage for note creation and release
- [ ] Final validation of provider-only vs patient-visible note rules

## Phase 6: Notifications and Messaging Foundation
- [x] In-app notification list on patient and provider dashboards
- [x] Dedicated patient and provider notification pages
- [x] Mark-as-read actions
- [~] Event-driven notification consistency across appointment lifecycle
- [ ] Notification coverage for note-sharing and all consultation events
- [ ] Optional outbound reminder strategy decision

## Phase 7: Admin Operations
- [x] Admin dashboard
- [x] Admin operations page
- [x] Admin audit page
- [x] Admin providers page
- [~] Admin operational action guardrails and completeness
- [ ] Final admin workflow acceptance pass

## Phase 8: UX Hardening
- [~] Empty-state coverage
- [~] Success and error-state consistency
- [~] Cross-role navigation consistency
- [ ] Dead-end route review
- [ ] Full polish pass across functional pages

## Phase 9: Testing and Release Readiness
- [x] ESLint baseline
- [x] Typecheck script and passing baseline
- [ ] Playwright end-to-end coverage
- [ ] Core workflow smoke-test checklist
- [ ] Release/demo checklist

## Current Focus
1. Phase 1 demo and environment stability
2. Phase 3 appointment lifecycle completion
3. Phase 6 notification consistency
4. Phase 9 workflow smoke testing

## Notes
- The immediate blocker for reliable end-to-end testing is that the current app points to a hosted Supabase project, while demo auth users and linked records are not guaranteed to exist there.
- The next implementation step is to add a service-role bootstrap script that creates demo auth users and core domain records against the active Supabase project.


