import { callStructuredAi } from '../ai-engine.js'

export interface ModuleRecommendationResult {
  moduleName: string
  rationale: string
  impactedArea: string
  implementationImpact: string
  assumptions: string
  dependencies: string[]
  implementationOrder: number
  confidenceScore: number
  evidence: { type: string; reference: string }[]
}

const SYSTEM_PROMPT = `You are a NetSuite solution architect with deep expertise in implementation methodology.
Based on the discovery data provided, recommend the appropriate NetSuite modules for this implementation.

For EACH recommended module:
1. Explain WHY this module is needed (reference specific requirements/pain points)
2. Describe the impacted business area
3. Estimate the implementation impact (time/effort/complexity)
4. List key assumptions for this module to work correctly
5. Identify module dependencies (what must be implemented first)
6. Suggest implementation order (lower number = earlier phase)
7. Assign confidence score (0-100)

Available NetSuite modules:
- Financial Management (core GL, chart of accounts, periods)
- Accounts Payable (vendor bills, payments, vendor credits)
- Accounts Receivable (invoices, payments, credit memos)
- Procurement (purchase orders, vendor management)
- Inventory Management (items, locations, inventory tracking)
- Warehouse Management System (WMS, bin management, fulfillment)
- CRM (customers, contacts, cases, activities)
- Sales Force Automation (opportunities, forecasts, quotes)
- Order Management (sales orders, fulfillment, shipping)
- Revenue Recognition (ASC 606, revenue schedules)
- Fixed Assets (asset register, depreciation)
- Manufacturing (work orders, BOM, routing)
- SuiteAnalytics (saved searches, reports, dashboards, SuiteAnalytics Connect)
- SuiteProjects (project management, time/expense, resource planning)
- SuitePeople (HR, payroll, benefits — if applicable)
- Multi-Book Accounting (multiple accounting standards)
- Multi-Currency (foreign currency transactions, revaluation)
- Multi-Subsidiary/Intercompany (OneWorld)
- SuiteCommerce/SuiteCommerce Advanced (ecommerce)
- Connector/Integration (external system integrations)
- SuiteBuilder/SuiteScript (customization platform)
- SuiteFlow/Workflow (automated business process workflows)

Confidence scoring:
- 90-100: Module is clearly required based on explicit requirements/pain points
- 70-89: Module is likely required based on business context
- 40-69: Module may be needed, needs further discovery
- 0-39: Speculative recommendation based on limited information

Return a JSON array with these exact fields:
{
  "moduleName": "string (exact name from the list)",
  "rationale": "string (3-5 sentence detailed rationale referencing specific evidence)",
  "impactedArea": "string (business area this addresses)",
  "implementationImpact": "string (effort/complexity description)",
  "assumptions": "string (key assumptions for this module)",
  "dependencies": ["array of module names that must be implemented first"],
  "implementationOrder": number (1-10, lower = earlier phase),
  "confidenceScore": number (0-100),
  "evidence": [{"type": "requirement|pain_point", "reference": "title or description snippet"}]
}`

export async function recommendModules(
  context: {
    projectName: string
    projectType: string
    requirements: Array<{ id: string; title: string; description?: string | null; priority: string; source: string }>
    painPoints: Array<{ id: string; title: string; description?: string | null; severity: string }>
    discoveryAnswers?: Array<{ question: string; answer: string; category: string }>
  }
): Promise<ModuleRecommendationResult[]> {
  const requirementsStr = context.requirements.length
    ? `\nRequirements (${context.requirements.length}):\n${context.requirements.map((r) => `- [${r.priority}] ${r.title}: ${r.description ?? 'No description'}`).join('\n')}`
    : '\nRequirements: None captured yet.'

  const painPointsStr = context.painPoints.length
    ? `\nPain Points (${context.painPoints.length}):\n${context.painPoints.map((p) => `- [${p.severity}] ${p.title}: ${p.description ?? 'No description'}`).join('\n')}`
    : '\nPain Points: None captured yet.'

  const answersStr = context.discoveryAnswers?.length
    ? `\n\nDiscovery Answers (${context.discoveryAnswers.length}):\n${context.discoveryAnswers.map((a) => `[${a.category}] Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}`
    : ''

  const userMessage = `Project: ${context.projectName}
Project Type: ${context.projectType}
${requirementsStr}
${painPointsStr}
${answersStr}

Based on this discovery data, recommend the appropriate NetSuite modules for this implementation.
Only recommend modules that are clearly justified by the evidence. Return the JSON array.`

  return callStructuredAi<ModuleRecommendationResult[]>(SYSTEM_PROMPT, userMessage, { maxTokens: 6000 })
}
