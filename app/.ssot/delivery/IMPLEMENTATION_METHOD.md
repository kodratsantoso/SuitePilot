# Implementation Methodology

> Last updated: 2026-05-13 (updated Prompt 02)

> **Prompt 02 Update:** Project management is now a first-class capability of the platform. The delivery methodology is supported by two parallel tracks: (1) the project management module (tasks, milestones, RAID, workstreams) which helps teams manage their implementation project, and (2) the AI-assisted delivery module (discovery, documents, fit-gap, UAT) which helps teams produce implementation deliverables. Both tracks are tied to a specific project workspace.

This document defines the delivery methodology that the AI NetSuite Implementation OS supports and enforces through its workflows.

---

## Delivery Framework

The platform is designed around a structured NetSuite implementation lifecycle:

```
Presales & Discovery
  → Solution Architecture & Fit-Gap
    → Functional Design
      → Technical Design & Build
        → Testing & UAT
          → Cutover & Go-Live
            → Hypercare
              → Project Close
```

Each phase produces specific deliverables that the platform's AI agents help generate, review, and govern.

---

## Phase-by-Phase Deliverables

### Presales & Discovery
- Discovery session notes
- Customer qualification assessment
- Module recommendation report
- Business Requirements Document (BRD) — initial draft
- Project estimation input

### Solution Architecture & Fit-Gap
- Fit-Gap Analysis Report
- Solution Blueprint
- Integration Architecture Document
- Assumption Register (initial)
- Risk Register (initial)

### Functional Design
- Functional Design Documents (FDD) per process area
- Process flow diagrams (described in text/table form)
- Master Data Design Document
- Configuration workbooks (structure)

### Technical Design & Build
- Technical Design Documents (TDD)
- SuiteScript/RESTlet design specs
- Integration mapping documents
- Data migration strategy

### Testing & UAT
- UAT Test Scripts
- Defect Log structure
- Test summary report

### Cutover & Go-Live
- Cutover Checklist
- Cutover Runbook
- Go-Live Readiness Assessment

### Hypercare
- Hypercare Tracker
- Issue log
- Hypercare exit report

---

## Quality Expectations

- All AI-generated deliverables must pass the Governance Agent quality check before entering human review.
- All deliverables must include an "Assumptions" section.
- All deliverables must include a "Review Status" header (Draft / Under Review / Approved).
- NetSuite-specific configuration guidance must reference the relevant NetSuite module by name and note version assumptions.
