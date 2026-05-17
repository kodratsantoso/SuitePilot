import { callStructuredAi } from '../ai-engine.js'

export interface UatScenarioResult {
  title: string
  category: 'POSITIVE_TEST' | 'NEGATIVE_TEST' | 'APPROVAL_TEST' | 'INTEGRATION_TEST' | 'REGRESSION_TEST' | 'SECURITY_TEST'
  precondition: string
  testSteps: string
  expectedResult: string
  affectedModule: string
  businessObjective: string
}

const SYSTEM_PROMPT = `You are a senior NetSuite QA lead generating UAT (User Acceptance Testing) scenarios.
Generate comprehensive, executable UAT test scenarios for a NetSuite implementation.

For each scenario:
1. Write a clear, specific title (format: "TC-[Category]-[Number]: [Action] [Object]")
2. Select the appropriate test category
3. Define preconditions (what must be set up before the test can run)
4. Write numbered, step-by-step test steps (each step should be actionable in NetSuite UI)
5. Define the expected result (what the tester should see/experience)
6. Identify the affected NetSuite module(s)
7. State the business objective this test validates

Test categories:
- POSITIVE_TEST: Happy path — normal workflow, expected inputs, expected success
- NEGATIVE_TEST: Error handling — invalid inputs, missing required fields, constraint violations
- APPROVAL_TEST: Approval workflow — submission, routing, approval/rejection
- INTEGRATION_TEST: Integration with external systems — data sync, API calls
- REGRESSION_TEST: Core functionality after customization — ensure standard features still work
- SECURITY_TEST: Permission validation — role-based access, record-level security

NetSuite-specific testing notes:
- Test steps should reference NetSuite navigation paths (e.g., "Navigate to Transactions > Purchases > Enter Bills")
- Include field-level verification steps where important
- Integration tests should check NetSuite-side record creation
- Approval tests should cover full workflow from submission to final approval
- Negative tests should verify proper error messages appear

Return a JSON array with EXACTLY these fields per scenario:
{
  "title": "string (e.g., 'TC-POS-001: Create a Standard Vendor Bill')",
  "category": "POSITIVE_TEST|NEGATIVE_TEST|APPROVAL_TEST|INTEGRATION_TEST|REGRESSION_TEST|SECURITY_TEST",
  "precondition": "string (bullet-pointed preconditions separated by newlines)",
  "testSteps": "string (numbered steps, one per line, e.g., '1. Navigate to...\\n2. Click...')",
  "expectedResult": "string (what the tester should observe after completing the steps)",
  "affectedModule": "string (NetSuite module name)",
  "businessObjective": "string (1-2 sentences on what business process this validates)"
}`

export async function generateUatScenarios(
  context: {
    projectName: string
    projectType: string
    workstreamName?: string
    processName?: string
    requirements?: Array<{ title: string; description?: string | null; priority: string }>
    fitGapItems?: Array<{ requirementTitle: string; fitCategory: string; recommendation: string }>
    moduleRecommendations?: string[]
    scenarioCount?: number
  }
): Promise<UatScenarioResult[]> {
  const scenarioCount = context.scenarioCount ?? 8

  const requirementsStr = context.requirements?.length
    ? `\nRequirements:\n${context.requirements.map((r) => `- [${r.priority}] ${r.title}: ${r.description ?? 'N/A'}`).join('\n')}`
    : ''

  const fitGapStr = context.fitGapItems?.length
    ? `\nFit-Gap Summary:\n${context.fitGapItems.map((f) => `- ${f.requirementTitle}: ${f.fitCategory} → ${f.recommendation}`).join('\n')}`
    : ''

  const modulesStr = context.moduleRecommendations?.length
    ? `\nModules in scope: ${context.moduleRecommendations.join(', ')}`
    : ''

  const workstreamStr = context.workstreamName ? `\nWorkstream: ${context.workstreamName}` : ''
  const processStr = context.processName ? `\nProcess: ${context.processName}` : ''

  const userMessage = `Project: ${context.projectName}
Project Type: ${context.projectType}${workstreamStr}${processStr}${modulesStr}
${requirementsStr}
${fitGapStr}

Generate ${scenarioCount} comprehensive UAT scenarios covering:
- Key positive test cases for core workflows
- At least 1-2 negative test cases for error handling
- At least 1 approval workflow test (if applicable)
- Integration tests (if applicable)

Return the JSON array with ${scenarioCount} scenarios.`

  return callStructuredAi<UatScenarioResult[]>(SYSTEM_PROMPT, userMessage, { maxTokens: 6000 })
}
