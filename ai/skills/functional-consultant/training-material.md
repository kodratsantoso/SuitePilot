# Skill: Training Material

## Purpose

Generate training material outlines and content for end-user training on a specific NetSuite process area. Training materials help users understand how to perform their daily tasks in NetSuite after go-live.

## When To Use

Use after UAT is complete and configuration is stable. Training materials must reflect the final configured behavior, not the draft design.

## Required Inputs

- Approved Functional Design Document for the process area
- Approved UAT scripts (to confirm the process steps are as trained)
- User roles to be trained (which job functions, how many users)
- Training format (instructor-led, self-paced, job aid, video script)
- Any specific terminology the customer uses for their processes

## Process

1. Define the training modules by role and process area.
2. For each module, write the learning objectives.
3. Produce step-by-step task instructions (with navigation paths).
4. Produce quick reference job aids for common daily tasks.
5. Flag areas where users typically make mistakes based on the process design.

## Output Format

```markdown
# Training Material — [Process Area] — [Role]

**Project:** [Name]
**Module:** [e.g., Accounts Payable — AP Clerk]
**Version:** 0.1 (Draft)
**Status:** DRAFT — Pending Functional Consultant Review

## Learning Objectives

By the end of this training, the participant will be able to:
1. [Specific, measurable objective]
2. [...]

## Module Contents

### 1. [Task Name] — e.g., Creating a Vendor Bill

**When to do this:** [Business context]
**Role:** [Job role]
**Estimated time:** [Minutes]

**Step-by-step instructions:**

| Step | Action | Notes |
|---|---|---|
| 1 | Navigate to Transactions > Payables > Enter Bills | |

**Common Mistakes to Avoid:**
- [Mistake 1 and how to avoid it]

### Quick Reference: [Task Name]

[One-page format summarizing the key steps for daily reference]

## Knowledge Check Questions

1. [Question to verify understanding]
2. [...]
```

## Validation Rules

- Learning objectives must be specific and measurable
- Navigation paths must match the actual NetSuite menu structure as configured
- Common mistakes section must be included for every task module
- Training material must not contradict the approved FDD

## Risk Checks

- Flag if training is being created before UAT is complete (process may change)
- Flag if approval routing steps are not covered in training (frequent source of go-live issues)

## Do Not Do

- Do not create training materials before the process design is approved
- Do not use generic NetSuite screenshots if the customer has customized the UI
- Do not omit role-based context — different roles see different menus

## Example Output

> Training Module: AP Clerk — Creating and Approving Vendor Bills.
> Learning Objectives: 1. Navigate to the Enter Bills screen. 2. Correctly link a vendor bill to a PO. 3. Understand when a bill auto-approves vs. requires manual approval. 4. Identify and resolve a 3-way match discrepancy.
> Common Mistake: Entering the bill amount before linking the PO — this prevents 3-way matching. Always link the PO first.
