import { callStructuredAi } from '../ai-engine.js'

export interface ScopeEstimationResult {
  scopeSummary: string
  implementationApproach: string
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  complexityFactors: string[]
  workstreams: Array<{
    name: string
    description: string
    phase: string
    modules: string[]
    estimatedEffort: string
  }>
  assumptions: string
  exclusions: string
  risks: string
  confidenceScore: number
}

const SYSTEM_PROMPT = `You are a senior NetSuite implementation project manager with expertise in scoping and estimation.
Based on the discovery data, generate a structured implementation scope estimation.

Provide:
1. Executive scope summary (3-5 sentences)
2. Recommended implementation approach (phased, big-bang, parallel, etc. — with justification)
3. Overall complexity assessment (LOW/MEDIUM/HIGH/VERY_HIGH) with specific complexity factors
4. Implementation workstreams with phase and effort estimate
5. Key assumptions underlying this scope
6. Explicit exclusions from scope
7. Identified implementation risks
8. Confidence score (0-100)

Complexity factors to evaluate:
- Number of entities/subsidiaries
- Number and complexity of integrations
- Custom workflow requirements
- Manufacturing/WMS complexity
- Data migration complexity (data volume, data quality, legacy formats)
- Reporting and analytics complexity
- Multi-currency/multi-book requirements
- Localization requirements (tax, legal, language)
- Change management complexity

Effort levels: Low (< 2 weeks), Medium (2-6 weeks), High (6-12 weeks), Very High (> 12 weeks)
Implementation phases: Foundation, Configuration, Integration, Migration, UAT, Go-Live

Return a JSON object with EXACTLY these fields:
{
  "scopeSummary": "string (3-5 sentence overview)",
  "implementationApproach": "string (approach with justification)",
  "estimatedComplexity": "LOW|MEDIUM|HIGH|VERY_HIGH",
  "complexityFactors": ["array of specific factors contributing to this complexity level"],
  "workstreams": [
    {
      "name": "string",
      "description": "string",
      "phase": "string (Foundation|Configuration|Integration|Migration|UAT|Go-Live)",
      "modules": ["array of module names"],
      "estimatedEffort": "string (Low|Medium|High|Very High)"
    }
  ],
  "assumptions": "string (key assumptions as a structured paragraph)",
  "exclusions": "string (what is explicitly out of scope)",
  "risks": "string (key implementation risks)",
  "confidenceScore": number (0-100)
}`

export async function estimateScope(
  context: {
    projectName: string
    projectType: string
    requirements: Array<{ title: string; priority: string }>
    painPoints: Array<{ title: string; severity: string }>
    moduleRecommendations: Array<{ moduleName: string; implementationOrder: number; implementationImpact: string }>
    discoveryAnswers?: Array<{ question: string; answer: string; category: string }>
  }
): Promise<ScopeEstimationResult> {
  const modulesStr = context.moduleRecommendations.length
    ? `\nRecommended Modules (ordered by phase):\n${context.moduleRecommendations
        .sort((a, b) => a.implementationOrder - b.implementationOrder)
        .map((m) => `- Phase ${m.implementationOrder}: ${m.moduleName} (${m.implementationImpact})`)
        .join('\n')}`
    : '\nModules: No module recommendations captured yet.'

  const requirementsStr = `\nRequirements (${context.requirements.length} total):\n${context.requirements
    .filter((r) => r.priority === 'CRITICAL' || r.priority === 'HIGH')
    .slice(0, 15)
    .map((r) => `- [${r.priority}] ${r.title}`)
    .join('\n')}`

  const answersStr = context.discoveryAnswers?.length
    ? `\n\nKey Discovery Answers:\n${context.discoveryAnswers
        .filter((a) => ['FINANCE', 'INTEGRATION', 'MANUFACTURING', 'REPORTING'].includes(a.category))
        .slice(0, 10)
        .map((a) => `[${a.category}] Q: ${a.question}\nA: ${a.answer}`)
        .join('\n\n')}`
    : ''

  const userMessage = `Project: ${context.projectName}
Project Type: ${context.projectType}
${requirementsStr}
${modulesStr}
${answersStr}

Estimate the implementation scope and return the JSON object.`

  return callStructuredAi<ScopeEstimationResult>(SYSTEM_PROMPT, userMessage, { maxTokens: 5000 })
}
