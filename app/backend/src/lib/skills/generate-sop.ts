import { callStructuredAi } from '../ai-engine.js'

export interface SopResult {
  title: string
  purpose: string
  scope: string
  responsibilities: string
  processSteps: string
  approvalFlow: string
  exceptionHandling: string
  notes: string
}

const SYSTEM_PROMPT = `You are a NetSuite implementation consultant creating Standard Operating Procedures (SOPs) for business processes.
Generate a comprehensive, detailed SOP for a specific NetSuite business process.

The SOP must be:
- Specific to NetSuite (reference actual NetSuite screens, fields, buttons)
- Written for end users (not technical consultants)
- Step-by-step and actionable
- Complete with exception handling and approval flows

SOP sections:
1. Title: Clear process name (e.g., "NetSuite Vendor Bill Processing SOP")
2. Purpose: Why this process exists, what business objective it serves (2-3 sentences)
3. Scope: What is covered, what is excluded, which teams/roles this applies to
4. Responsibilities: Table of roles and their responsibilities in this process
5. Process Steps: Numbered, detailed steps with NetSuite navigation paths
   - Format each step as: "Step N: [Action]\n  - Navigate to: [path]\n  - Enter/Select: [fields]\n  - Click: [button]\n  - Expected result: [what happens]"
6. Approval Flow: Who approves what, at what threshold, what happens if rejected
7. Exception Handling: What to do when things go wrong, escalation path
8. Notes: Important tips, gotchas, best practices for this process in NetSuite

Return a JSON object with EXACTLY these fields:
{
  "title": "string (full SOP document title)",
  "purpose": "string (2-3 sentences on why this process exists)",
  "scope": "string (what is in scope and out of scope, which teams apply)",
  "responsibilities": "string (role-based responsibility table as formatted text)",
  "processSteps": "string (numbered, detailed NetSuite steps — at least 8-12 steps)",
  "approvalFlow": "string (approval thresholds, approvers, escalation)",
  "exceptionHandling": "string (error scenarios and what to do)",
  "notes": "string (important tips and NetSuite-specific notes)"
}`

export async function generateSop(
  context: {
    processName: string
    processCategory: string
    projectName: string
    currentState?: string
    futureState?: string
    affectedModules?: string[]
    workstreamName?: string
  }
): Promise<SopResult> {
  const modulesStr = context.affectedModules?.length
    ? `\nAffected NetSuite Modules: ${context.affectedModules.join(', ')}`
    : ''

  const currentStateStr = context.currentState
    ? `\nCurrent State (AS-IS):\n${context.currentState}`
    : ''

  const futureStateStr = context.futureState
    ? `\nFuture State (TO-BE):\n${context.futureState}`
    : ''

  const workstreamStr = context.workstreamName ? `\nWorkstream: ${context.workstreamName}` : ''

  const userMessage = `Project: ${context.projectName}
Process Name: ${context.processName}
Process Category: ${context.processCategory}${workstreamStr}${modulesStr}
${currentStateStr}
${futureStateStr}

Generate a comprehensive SOP for this NetSuite business process. Return the JSON object.`

  return callStructuredAi<SopResult>(SYSTEM_PROMPT, userMessage, { maxTokens: 5000 })
}
