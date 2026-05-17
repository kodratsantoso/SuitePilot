# ADR-0003 — Human Review Gate as Mandatory Step

**Status:** Accepted
**Date:** 2026-05-13
**Authors:** Engineering Team

---

## Context

AI-generated content for NetSuite implementations carries significant professional and commercial risk:

- Incorrect module recommendations can lead to over-scoping or under-scoping, directly impacting project profitability and client satisfaction
- Incorrect technical guidance (e.g., wrong SuiteScript API, wrong integration approach) can cause system failures in production environments
- Incorrect compliance or accounting guidance can expose clients to financial and legal risk
- AI models can hallucinate plausible-sounding but incorrect NetSuite configuration options, especially for less common modules

The question is: should human review be mandatory, optional, or configurable per output type?

---

## Decision

**Human review is mandatory for all AI-generated outputs before they can be used in any client deliverable.**

This is not configurable. No flag, role, or setting bypasses this requirement.

Specifically:
- AI outputs begin in DRAFT status
- After passing the Governance Agent quality gate, they move to UNDER_REVIEW
- A qualified human reviewer must approve the output before it reaches APPROVED status
- Only APPROVED outputs may be embedded in project documents that are shared with clients
- This rule applies to all agents and all skill types without exception

The Governance Agent does not replace human review — it is a pre-screening step that catches obvious problems before a human reviewer spends time on the output.

---

## Consequences

**Positive:**
- Protects clients from AI errors in high-stakes implementation decisions
- Protects the implementation firm from liability for unreviewed AI outputs
- Forces a feedback loop that improves AI quality over time (reviewers flag issues → prompts improve)
- Creates a defensible audit trail: every approved output has a named human reviewer

**Negative:**
- Adds latency to document generation workflows — outputs can't be used immediately
- Requires reviewer capacity — the platform is not fully autonomous
- May feel restrictive to experienced users who trust the AI outputs

**Why we accept these consequences:**
NetSuite implementations are professional services engagements with real financial and operational consequences for clients. We are building a tool that makes consultants faster and more consistent — not a tool that replaces consultant judgment. The review gate preserves the consulting value while amplifying consultant productivity.

---

## Alternatives Considered and Rejected

- **Optional review (configurable per org):** Rejected because it creates liability ambiguity and would inevitably lead to reviewless outputs causing client incidents.
- **Auto-approve low-risk output types (e.g., meeting minutes):** Considered and partially accepted — meeting minutes may have a lighter review SLA, but they still require a reviewer to confirm before being shared. No output type is fully auto-approved.
- **AI-to-AI review (Governance Agent as final approver):** Rejected. An AI cannot provide the professional accountability that a named human reviewer provides.
