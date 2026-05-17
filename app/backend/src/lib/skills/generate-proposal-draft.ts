import { callStructuredAi } from '../ai-engine.js'

export interface ProposalSection {
  sectionType:
    | 'EXECUTIVE_SUMMARY'
    | 'CHALLENGES'
    | 'PROPOSED_SOLUTION'
    | 'SCOPE'
    | 'TIMELINE'
    | 'ASSUMPTIONS'
    | 'RISKS'
    | 'DELIVERABLES'
    | 'NEXT_STEPS'
  title: string
  content: string
  sortOrder: number
}

export interface ProposalDraftResult {
  proposalTitle: string
  sections: ProposalSection[]
  overallConfidenceScore: number
}

const SYSTEM_PROMPT = `You are a NetSuite sales engineer writing a formal implementation proposal draft.
Generate structured proposal draft sections based on the discovery data.

Write in a professional, consulting tone. Each section must be substantive, specific, and reference actual customer context.
Do NOT write generic filler content. Every paragraph must be specific to this customer's situation.

Required sections (in order):
1. EXECUTIVE_SUMMARY: Customer name, their business, key challenges identified, proposed NetSuite solution, expected business outcomes
2. CHALLENGES: Specific operational pain points discovered, their business impact, root causes
3. PROPOSED_SOLUTION: How NetSuite addresses each identified challenge, specific modules and capabilities
4. SCOPE: Implementation scope — modules, customizations, integrations, data migration, reporting
5. TIMELINE: Proposed implementation phases with duration estimates
6. ASSUMPTIONS: Key assumptions underlying this proposal
7. RISKS: Identified implementation risks and proposed mitigations
8. DELIVERABLES: What will be delivered at the end of the project
9. NEXT_STEPS: Immediate next steps to move forward (discovery signoff, SOW, workshops, etc.)

Return a JSON object with EXACTLY these fields:
{
  "proposalTitle": "string (e.g. 'NetSuite Implementation Proposal — [Company Name]')",
  "sections": [
    {
      "sectionType": "EXECUTIVE_SUMMARY|CHALLENGES|PROPOSED_SOLUTION|SCOPE|TIMELINE|ASSUMPTIONS|RISKS|DELIVERABLES|NEXT_STEPS",
      "title": "string (section heading)",
      "content": "string (3-6 paragraph section content in markdown format)",
      "sortOrder": number (1-9)
    }
  ],
  "overallConfidenceScore": number (0-100, based on completeness of discovery data)
}`

export async function generateProposalDraft(
  context: {
    projectName: string
    projectType: string
    customerName: string
    requirements: Array<{ title: string; priority: string; source: string }>
    painPoints: Array<{ title: string; severity: string }>
    moduleRecommendations: Array<{ moduleName: string; rationale: string; implementationOrder: number }>
    scopeEstimation?: {
      estimatedComplexity: string
      implementationApproach: string
      assumptions: string
      risks: string
      workstreams?: Array<{ name: string; phase: string; estimatedEffort: string }>
    }
    discoveryAnswers?: Array<{ question: string; answer: string; category: string }>
  }
): Promise<ProposalDraftResult> {
  const modulesStr = context.moduleRecommendations.length
    ? context.moduleRecommendations
        .sort((a, b) => a.implementationOrder - b.implementationOrder)
        .map((m) => `- ${m.moduleName}: ${m.rationale.slice(0, 150)}...`)
        .join('\n')
    : 'No module recommendations yet.'

  const painPointsStr = context.painPoints
    .sort((a) => (a.severity === 'CRITICAL' ? -1 : a.severity === 'HIGH' ? 0 : 1))
    .slice(0, 10)
    .map((p) => `- [${p.severity}] ${p.title}`)
    .join('\n')

  const requirementsStr = context.requirements
    .filter((r) => r.priority === 'CRITICAL' || r.priority === 'HIGH')
    .slice(0, 15)
    .map((r) => `- [${r.priority}] ${r.title}`)
    .join('\n')

  const scopeStr = context.scopeEstimation
    ? `\nScope Estimation:
Complexity: ${context.scopeEstimation.estimatedComplexity}
Approach: ${context.scopeEstimation.implementationApproach}
Key Assumptions: ${context.scopeEstimation.assumptions?.slice(0, 300)}
Key Risks: ${context.scopeEstimation.risks?.slice(0, 300)}`
    : ''

  const answersStr = context.discoveryAnswers?.length
    ? `\n\nKey Discovery Answers:\n${context.discoveryAnswers.slice(0, 15).map((a) => `[${a.category}] Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}`
    : ''

  const userMessage = `Project: ${context.projectName}
Project Type: ${context.projectType}
Customer: ${context.customerName}

Key Requirements (High/Critical only):
${requirementsStr || 'None captured yet.'}

Pain Points Identified:
${painPointsStr || 'None captured yet.'}

Recommended NetSuite Modules:
${modulesStr}
${scopeStr}
${answersStr}

Generate a comprehensive, customer-specific proposal draft and return the JSON object.`

  return callStructuredAi<ProposalDraftResult>(SYSTEM_PROMPT, userMessage, { maxTokens: 8000 })
}
