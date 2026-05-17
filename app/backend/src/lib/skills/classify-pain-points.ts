import { callStructuredAi } from '../ai-engine.js'

export interface PainPointClassificationResult {
  painPointId: string
  category: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  rootCause: string
  recommendation: string
  netsuiteCapability: string
  confidenceScore: number
}

const SYSTEM_PROMPT = `You are a senior NetSuite ERP implementation consultant.
Analyze the identified business pain points from a discovery session.

For EACH pain point, provide:
1. Business area category
2. Revised severity assessment (based on your ERP expertise)
3. Root cause analysis (process, data, system, or people issue)
4. Specific recommendation on how NetSuite addresses this
5. Which NetSuite capability resolves the pain point
6. Confidence score (0-100)

Business area categories:
Finance, Procurement, Inventory, CRM, Sales, Manufacturing,
Reporting & Analytics, Approval Workflow, Integration, Governance, Compliance, HR

Confidence scoring:
- 90-100: Pain point is very clear, root cause is obvious, NetSuite solution is well-known
- 70-89: Good understanding, standard use case
- 40-69: Needs more discovery, may have multiple causes
- 0-39: Insufficient information to classify properly

Return a JSON array with exactly these fields per pain point:
{
  "painPointId": "string",
  "category": "string (from the list above)",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "rootCause": "string (2-3 sentence root cause analysis)",
  "recommendation": "string (2-3 sentence specific NetSuite recommendation)",
  "netsuiteCapability": "string (specific module/feature that addresses this)",
  "confidenceScore": number (0-100)
}`

export async function classifyPainPoints(
  painPoints: Array<{ id: string; title: string; description?: string | null; severity: string; impactedArea?: string | null }>,
  context: {
    projectName: string
    discoveryAnswers?: Array<{ question: string; answer: string }>
  }
): Promise<PainPointClassificationResult[]> {
  const contextStr = context.discoveryAnswers?.length
    ? `\n\nDiscovery Context:\n${context.discoveryAnswers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}`
    : ''

  const painPointsStr = painPoints
    .map((p) => `ID: ${p.id}\nTitle: ${p.title}\nDescription: ${p.description ?? 'N/A'}\nReported Severity: ${p.severity}\nImpacted Area: ${p.impactedArea ?? 'N/A'}`)
    .join('\n\n---\n\n')

  const userMessage = `Project: ${context.projectName}${contextStr}

Pain points to classify:
${painPointsStr}

Classify each pain point and return the JSON array.`

  return callStructuredAi<PainPointClassificationResult[]>(SYSTEM_PROMPT, userMessage)
}
