# Quality Gates

> Last updated: 2026-05-13

Quality gates are checkpoints that must be passed before work can progress to the next stage. They prevent low-quality or unreviewed AI outputs from reaching clients.

---

## Gate 1 — AI Output Generation

Before an AI output is stored:
- [ ] Required inputs are present and validated
- [ ] The correct agent and skill have been selected
- [ ] The output format matches the skill's defined output format
- [ ] The output includes an explicit assumptions section
- [ ] The output is saved as DRAFT status

---

## Gate 2 — Governance Check

Before an AI output enters the human review queue:
- [ ] Governance Agent has scored the output
- [ ] Quality score meets the minimum threshold for this skill type
- [ ] No critical hallucination flags are present
- [ ] Output does not claim authority on tax, compliance, or licensing
- [ ] Output does not contain fabricated data or unsupported claims
- [ ] Assumptions and limitations are explicitly stated

**If this gate fails:** The output is held in DRAFT state and the generating user is notified with the specific governance failure reasons. The user may revise inputs and regenerate.

---

## Gate 3 — Human Review Approval

Before an AI output status becomes APPROVED:
- [ ] A qualified human reviewer with the appropriate role has reviewed the full output
- [ ] The reviewer has confirmed assumptions are reasonable
- [ ] The reviewer has confirmed no factual errors are present
- [ ] The reviewer has not found misleading or dangerous recommendations
- [ ] The review decision is recorded with comments

**If this gate fails (REJECTED):** The output must not be used in any client deliverable. The failure reason is logged and the generating team is notified.

---

## Gate 4 — Document Publication

Before a project document is marked PUBLISHED and sharable with clients:
- [ ] The underlying AI output (if any) has APPROVED status
- [ ] A human has reviewed the final document formatting
- [ ] The document includes version number and review date
- [ ] The document is stored in the project document store

---

## Gate 5 — Phase Transition

Before a project moves from one implementation phase to the next:
- [ ] All required deliverables for the current phase have APPROVED documents
- [ ] No open P0 or P1 risks are unaddressed
- [ ] Client sign-off has been recorded
- [ ] Phase transition is logged in the project audit trail
