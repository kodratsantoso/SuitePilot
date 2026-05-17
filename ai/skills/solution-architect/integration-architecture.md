# Skill: Integration Architecture

## Purpose

Design the integration architecture for a NetSuite implementation, describing how external systems connect to NetSuite, what data flows in which direction, what integration patterns apply, and what technical decisions need to be made. Produces the Integration Architecture Document (IAD).

## When To Use

Use when integration requirements are confirmed (from BRD and fit-gap) and before technical design of individual integrations begins.

## Required Inputs

- Integration requirements list
- List of external systems to be integrated (names, system types)
- Data entities to be exchanged (e.g., customers, orders, invoices, inventory)
- Integration direction (inbound to NetSuite / outbound from NetSuite / bidirectional)
- Volume and frequency requirements (batch vs. real-time)
- Any existing integration infrastructure (middleware, iPaaS platforms)
- Security and authentication requirements

## Process

1. For each integration, define the pattern (REST, SOAP, file-based, iPaaS).
2. Map the data flow: source system, data entity, direction, target system, frequency.
3. Identify the NetSuite endpoint type for each integration (REST Record API, SOAP SuiteTalk, RESTlet, CSV import).
4. Note error handling, retry, and alerting requirements.
5. Identify integration risks (volume, latency, authentication, data transformation complexity).

## Output Format

```markdown
# Integration Architecture Document

**Project:** [Name]
**Customer:** [Name]
**Status:** DRAFT — Pending Solution Architect and Technical Consultant Review

## Integration Overview

| Integration ID | External System | Data Entity | Direction | Pattern | Frequency | NetSuite Endpoint |
|---|---|---|---|---|---|---|

## Integration Details

### INT-001: [External System] → NetSuite ([Data Entity])

**Direction:** [Inbound / Outbound / Bidirectional]
**Pattern:** [REST / SOAP / File / iPaaS]
**Frequency:** [Real-time / Scheduled (interval) / Event-triggered]
**NetSuite Endpoint:** [REST Record API / SuiteTalk SOAP / RESTlet / CSV Import]
**Key Data Fields:** [List of fields being exchanged]
**Transformation Required:** [Yes/No — brief description if Yes]
**Error Handling:** [How errors are detected and handled]
**Authentication:** [OAuth TBA / Basic Auth / API Key — note: Basic Auth is deprecated in NetSuite]
**Risks:** [Any known risks for this integration]

[Repeat for each integration]

## Authentication Summary

[Consolidated view of authentication methods; flag any use of deprecated Basic Auth]

## Integration Risks

| Risk | Affected Integrations | Severity | Mitigation |
|---|---|---|---|

## Assumptions

[All assumptions about volume, frequency, system availability, etc.]

## Items Requiring Technical Consultant Input

[List of decisions that cannot be made at the architecture level and need technical assessment]
```

## Validation Rules

- Every integration requirement from the BRD must appear in the document
- Authentication method must be specified for every integration
- Basic Auth must be flagged as deprecated with a note to use Token-Based Authentication
- Transformation requirements must be noted; they drive technical design complexity

## Risk Checks

- Flag any real-time integration — real-time integrations are highest risk and must be validated by the technical consultant
- Flag any integration with a volume > 10,000 records per run — governance and performance implications
- Flag any SOAP/SuiteTalk integration — SuiteTalk is older and has known limitations; REST is preferred

## Do Not Do

- Do not design individual RESTlet code or field mappings (that is the Technical Consultant Agent's domain)
- Do not specify middleware vendor unless the customer has already chosen one
- Do not claim a specific integration will work without noting the assumption

## Example Output

> INT-001: Salesforce CRM → NetSuite (Customer/Lead). Inbound, REST, real-time on opportunity close. NetSuite REST Record API (Customer record). Authentication: OAuth TBA. Risk: Salesforce opportunity close trigger may fire multiple times; NetSuite upsert logic must handle duplicates. Technical consultant to confirm deduplication approach.
