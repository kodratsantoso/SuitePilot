import { callStructuredAi } from '../ai-engine.js'

export interface FitGapResult {
  requirementId: string
  requirementTitle: string
  fitCategory:
    | 'FIT_STANDARD'
    | 'FIT_WITH_CONFIGURATION'
    | 'FIT_WITH_WORKFLOW'
    | 'FIT_WITH_CUSTOMIZATION'
    | 'FIT_WITH_INTEGRATION'
    | 'GAP'
    | 'OUT_OF_SCOPE'
  rationale: string
  recommendation: string
  implementationImpact: string
  assumptions: string
  risks: string
  confidenceScore: number
}

const SYSTEM_PROMPT = `You are a senior NetSuite functional consultant performing a fit-gap analysis.
Evaluate each requirement against NetSuite's standard capabilities and classify it accurately.

Fit-Gap Categories (use EXACTLY these values):
- FIT_STANDARD: Met out of the box, no configuration needed beyond basic setup
- FIT_WITH_CONFIGURATION: Met through standard NetSuite configuration (forms, fields, searches, dashboards)
- FIT_WITH_WORKFLOW: Met by configuring SuiteFlow/Workflows + standard features
- FIT_WITH_CUSTOMIZATION: Requires SuiteScript, SuiteBuilder custom records, or custom forms
- FIT_WITH_INTEGRATION: Requires integration with external system
- GAP: NetSuite cannot meet this requirement in any practical manner
- OUT_OF_SCOPE: Outside the agreed implementation scope

For EACH requirement:
1. Assign the correct fit category (be specific and realistic about NetSuite capabilities)
2. Write 3-4 sentence rationale explaining HOW NetSuite addresses (or doesn't address) this requirement
3. Provide specific recommendation (what needs to be configured, customized, or integrated)
4. Assess implementation impact (effort, timeline, risk)
5. State key assumptions for this classification
6. Identify risks (e.g., complexity risk, data migration risk, user adoption risk)
7. Assign confidence score (0-100)

Confidence guidelines:
- 90-100: Requirement maps clearly to a known NetSuite capability with well-understood scope
- 70-89: Good fit with some configuration/customization, scope is reasonably clear
- 40-69: Requires more discovery, custom development, or has significant ambiguity
- 0-39: GAP or uncertain — needs deep technical investigation

Return a JSON array with EXACTLY these fields per requirement:
{
  "requirementId": "string",
  "requirementTitle": "string",
  "fitCategory": "FIT_STANDARD|FIT_WITH_CONFIGURATION|FIT_WITH_WORKFLOW|FIT_WITH_CUSTOMIZATION|FIT_WITH_INTEGRATION|GAP|OUT_OF_SCOPE",
  "rationale": "string (3-4 sentences specific to NetSuite capabilities)",
  "recommendation": "string (specific action item)",
  "implementationImpact": "string (effort/complexity description)",
  "assumptions": "string",
  "risks": "string",
  "confidenceScore": number
}`

export async function generateFitGap(
  requirements: Array<{
    id: string
    title: string
    description?: string | null
    priority: string
    category?: string | null
  }>,
  context: {
    projectName: string
    projectType: string
    moduleRecommendations?: string[]
    discoveryAnswers?: Array<{ question: string; answer: string; category: string }>
  }
): Promise<FitGapResult[]> {
  const modulesStr = context.moduleRecommendations?.length
    ? `\nRecommended Modules: ${context.moduleRecommendations.join(', ')}`
    : ''

  const answersStr = context.discoveryAnswers?.length
    ? `\n\nKey Discovery Context:\n${context.discoveryAnswers
        .slice(0, 10)
        .map((a) => `[${a.category}] Q: ${a.question}\nA: ${a.answer}`)
        .join('\n\n')}`
    : ''

  const requirementsStr = requirements
    .map(
      (r) =>
        `ID: ${r.id}\nTitle: ${r.title}\nDescription: ${r.description ?? 'N/A'}\nPriority: ${r.priority}\nCategory: ${r.category ?? 'N/A'}`
    )
    .join('\n\n---\n\n')

  const userMessage = `Project: ${context.projectName}
Project Type: ${context.projectType}${modulesStr}
${answersStr}

Requirements to analyze (${requirements.length} total):
${requirementsStr}

Classify each requirement and return the JSON array.`

  return callStructuredAi<FitGapResult[]>(SYSTEM_PROMPT, userMessage, { maxTokens: 6000 })
}
