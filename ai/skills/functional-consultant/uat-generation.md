# Skill: UAT Generation

## Purpose

Generate User Acceptance Testing (UAT) test scripts for a specific process area or module, based on the approved functional design. UAT scripts give business users a structured way to validate that NetSuite has been configured correctly and that their business processes work as designed.

## When To Use

Use after the Functional Design Document for the relevant process area has been reviewed and approved. UAT scripts must be aligned to the approved design — do not generate UAT before design is confirmed.

## Required Inputs

- Approved Functional Design Document (for the process area)
- Process steps from the FDD
- Configuration decisions and approval rules from the FDD
- Roles and users involved in the process
- Any specific edge cases or exceptions the customer wants to test
- NetSuite environment (sandbox URL, test user credentials placeholder)

## Process

1. For each process step in the FDD, create one or more test cases.
2. For each test case, write numbered steps, expected results, and a pass/fail column.
3. Group test cases by process and role.
4. Add edge case test cases for the most common failure modes.
5. Add a test execution header for the UAT period.

## Output Format

```markdown
# UAT Test Script — [Process Area]

**Project:** [Name]
**Module / Process:** [e.g., Purchase-to-Pay]
**Version:** 0.1 (Draft)
**Date:** [Date]
**Status:** DRAFT — Pending Functional Consultant and Key User Review

**UAT Environment:** [Sandbox URL — to be filled in by project team]
**Test Period:** [Dates — to be filled in by PM]

---

## Test Execution Summary

| Test Case ID | Description | Tester | Date Executed | Result (Pass/Fail) | Defect ID |
|---|---|---|---|---|---|

---

## Test Cases

### TC-[Area]-001: [Test Case Name]

**Role:** [Who executes this test]
**Preconditions:** [What must be set up before this test can run]

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|
| 1 | Navigate to [Menu Path] | [Expected result] | | |
| 2 | [Action] | [Expected result] | | |

**Test Data Required:** [Specific test data needed for this test case]
**Notes:** [Any notes for the tester]

---
[Repeat for each test case]
```

## Validation Rules

- Every process step in the FDD must have at least one corresponding test case
- Each test case must have specific expected results — not "works correctly" but a precise outcome
- Test data requirements must be specified for every test case
- Preconditions must be explicit — testers must know what setup is needed

## Risk Checks

- Flag if fewer than 3 test cases cover approval routing (most common point of failure in UAT)
- Flag if integration touchpoints are not included in the test script (integration UAT is often forgotten)
- Flag if negative test cases (what happens when something goes wrong) are not included

## Do Not Do

- Do not generate UAT scripts for process areas that have not been functionally designed
- Do not leave "Expected Result" fields as vague descriptions
- Do not assume the tester knows NetSuite navigation — write step-by-step navigation instructions

## Example Output

> TC-P2P-003: Three-Way Match Vendor Bill Approval.
> Role: AP Clerk.
> Preconditions: PO-00123 exists and is approved; Item Receipt IR-00045 linked to PO-00123 has been created.
> Step 1: Navigate to Transactions > Payables > Enter Bills. Expected: Bill entry form loads.
> Step 2: Select Vendor "Acme Supplier Inc." Expected: Vendor record loads with default payment terms "Net 30."
> Step 3: Link to PO-00123 in the Apply Transactions tab. Expected: PO line items populate on the bill automatically.
> Step 4: Enter invoice number "INV-9981" and amount $4,500. Expected: Amount matches PO and Receipt; 3-way match validation passes.
> Step 5: Click Save. Expected: Bill saved with status "Pending Approval" (below $5,000 threshold — should auto-approve per approval rule). Verify status changes to "Approved."
