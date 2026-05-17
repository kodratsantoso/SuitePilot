# E2E Test Checklist

> Last updated: 2026-05-13
> Status: Planned — E2E tests begin Phase 3

This checklist defines the end-to-end user workflows that must have automated test coverage before a phase is considered release-ready.

---

## Phase 1 E2E Flows

- [ ] User registers, creates organization, logs in
- [ ] User creates a customer
- [ ] User creates a project under a customer
- [ ] User invites a team member to the organization
- [ ] User views audit log after creating a project

---

## Phase 3 E2E Flows

- [ ] User starts a discovery session for a project
- [ ] AI Presales Agent summarizes discovery session
- [ ] User reviews and approves AI summary
- [ ] System generates module recommendation from discovery data
- [ ] User reviews module recommendation
- [ ] Approved recommendation is attached to project document store

---

## Phase 4 E2E Flows

- [ ] User requests BRD generation from approved discovery summary
- [ ] Governance Agent runs quality check on BRD
- [ ] BRD enters review queue
- [ ] Reviewer approves BRD with comment
- [ ] BRD status changes to APPROVED
- [ ] User exports BRD to PDF

---

## General E2E Rules

- E2E tests run against a dedicated staging database, not production.
- Tests must clean up their created data after execution.
- Tests must not depend on external AI provider APIs — AI calls are mocked in E2E tests.
- Each E2E test represents a complete user story, not an isolated API call.
