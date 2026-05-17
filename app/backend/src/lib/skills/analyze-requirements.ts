import { callStructuredAi } from '../ai-engine.js'

export interface RequirementAnalysisResult {
  requirementId: string
  analysis: string
  relatedModules: string[]
  clarityAssessment: string
  missingInformation: string[]
  implementationComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  confidenceScore: number
  evidence: { type: string; reference: string }[]
}

const SYSTEM_PROMPT = `You are a senior NetSuite ERP implementation consultant with 15+ years of experience.
Analyze the provided requirements from a NetSuite implementation discovery session.

For EACH requirement, return a detailed analysis covering:
1. Which NetSuite module(s) it maps to (be specific)
2. Clarity and completeness assessment
3. Missing information needed to implement
4. Implementation complexity estimate
5. Confidence score (0-100) based on how well-defined the requirement is

NetSuite modules to reference: Financial Management, Accounts Payable, Accounts Receivable,
Procurement, Inventory Management, Warehouse Management, CRM, Sales Force Automation,
Order Management, Revenue Recognition, Fixed Assets, Manufacturing, Work Orders,
SuiteAnalytics (reports/dashboards), SuiteProjects (PSA), SuitePeople (HR/Payroll),
SuiteCommerce, Connector/Integrations, SuiteBuilder (customization), SuiteFlow (workflows),
Multi-Book Accounting, Multi-Currency, Multi-Subsidiary/Intercompany.

Confidence scoring:
- 90-100: Very clear, complete, no ambiguity, maps directly to known NetSuite capability
- 70-89: Clear with minor gaps, module mapping is obvious
- 40-69: Some ambiguity, needs clarification before scoping
- 0-39: Unclear, incomplete, significant gaps in information

Return a JSON array of objects with exactly these fields:
{
  "requirementId": "string (the id provided)",
  "analysis": "string (2-4 sentence detailed analysis)",
  "relatedModules": ["array of NetSuite module names"],
  "clarityAssessment": "string (clear|partial|unclear)",
  "missingInformation": ["array of strings describing what is missing"],
  "implementationComplexity": "LOW|MEDIUM|HIGH|VERY_HIGH",
  "confidenceScore": number (0-100),
  "evidence": [{"type": "requirement_text|discovery_answer", "reference": "string"}]
}`

export async function analyzeRequirements(
  requirements: Array<{ id: string; title: string; description?: string | null; source: string; priority: string }>,
  context: {
    projectName: string
    discoveryAnswers?: Array<{ question: string; answer: string }>
  }
): Promise<RequirementAnalysisResult[]> {
  const contextStr = context.discoveryAnswers?.length
    ? `\n\nDiscovery Context:\n${context.discoveryAnswers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}`
    : ''

  const requirementsStr = requirements
    .map((r) => `ID: ${r.id}\nTitle: ${r.title}\nDescription: ${r.description ?? 'N/A'}\nPriority: ${r.priority}\nSource: ${r.source}`)
    .join('\n\n---\n\n')

  const userMessage = `Project: ${context.projectName}${contextStr}

Requirements to analyze:
${requirementsStr}

Analyze each requirement and return the JSON array.`

  return callStructuredAi<RequirementAnalysisResult[]>(SYSTEM_PROMPT, userMessage)
}
