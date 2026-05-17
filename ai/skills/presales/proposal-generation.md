# Skill: Proposal Generation

## Purpose

Generate professional, structured proposal sections for a NetSuite implementation engagement based on confirmed discovery findings, module recommendations, and scoping inputs. Produces content for executive summaries, proposed solution descriptions, and scope overviews that can be incorporated into a formal Statement of Work or proposal document.

## When To Use

Use after discovery is complete, module recommendations are drafted, and the presales team is ready to produce a formal proposal for the customer. All generated content must be reviewed and approved before inclusion in any client-facing document.

## Required Inputs

- Discovery summary
- Module recommendation report (draft or approved)
- Proposed implementation phases and high-level timeline
- Customer's primary pain points (from qualification assessment)
- Implementation team structure (if known)
- Commercial terms (if available — e.g., fixed price vs. T&M, high-level budget range)

## Process

1. Generate an executive summary that concisely describes the customer's situation and why NetSuite addresses their needs.
2. Generate a proposed solution section that describes the recommended modules and what they will deliver for the customer.
3. Generate a scope overview (in scope / out of scope / assumptions).
4. Generate an implementation approach section describing the delivery methodology.
5. Flag any sections where additional input is needed from the presales team.

## Output Format

```markdown
# Proposal Content Draft

**Customer:** [Name]
**Date:** [Date]
**Prepared by:** AI Presales Agent
**Status:** DRAFT — For Presales Lead Review and Editing

> This is a draft for presales consultant review and editing.
> It must not be shared with the customer in this form.
> All sections require human review and approval before use.

---

## Executive Summary

[3–5 sentences: customer's business situation, primary challenges, why NetSuite and this implementation partner are the right solution]

---

## Proposed Solution

[Description of the recommended NetSuite solution: modules, what each delivers, how they work together]

---

## Implementation Scope

### In Scope
[Bullet list]

### Out of Scope
[Bullet list — be explicit; what is not included reduces future scope disputes]

### Assumptions
[Bullet list — conditions that must hold for the scope to be as described]

---

## Implementation Approach

[Description of the implementation methodology: phases, key milestones, customer involvement expectations]

---

## Why [Partner Name]

[Placeholder section — presales team to complete with firm-specific credentials and experience]

---

## Sections Requiring Additional Input

[List any sections where the AI flagged insufficient input to produce quality content]
```

## Validation Rules

- Executive summary must reference specific customer pain points, not generic ERP language
- Scope must include both "In Scope" and "Out of Scope" — neither may be empty
- Assumptions section must be present
- The "Why [Partner]" section must be explicitly flagged as a placeholder for human completion
- Status must be DRAFT

## Risk Checks

- Flag if the proposed scope does not align with the qualification assessment risk level
- Flag if the implementation timeline in the proposal is shorter than the qualification assessment flagged as realistic
- Flag any scope item that was not discussed in discovery

## Do Not Do

- Do not generate pricing, fee schedules, or commercial terms
- Do not claim specific ROI or business outcomes without evidence from the customer
- Do not generate a complete proposal document — only the sections listed above
- Do not include customer logos, third-party trademarks, or specific product version numbers

## Example Output

> Executive summary draft for Acme Manufacturing: "Acme Manufacturing is a growing mid-market discrete manufacturer facing significant operational challenges from manual purchase order management, limited inventory visibility, and disconnected financial reporting. By implementing NetSuite's integrated Financial Management, Inventory Management, and Procurement modules, Acme will gain real-time operational visibility and eliminate the manual processes that currently consume [X] hours per week across finance and operations teams..."
