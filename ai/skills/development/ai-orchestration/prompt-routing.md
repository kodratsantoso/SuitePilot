# Skill: Prompt Routing

## Purpose

Implement the prompt construction and routing layer — the system that takes an agent slug, a skill slug, a context object (customer, project, inputs), and knowledge base snippets, and assembles the final prompt that is sent to the AI provider. Prompt routing enforces all prompt governance rules before any API call is made.

## When To Use

Use when implementing the core skill invocation pipeline. Every AI call goes through this layer.

## Required Inputs

- Skill definition (from SkillRegistry)
- Prompt template file for the skill (`ai/prompts/workflows/[skill-slug].md`)
- System prompt for the agent (`ai/prompts/system/[agent-slug].md`)
- Context object (project, customer, discovery session, etc.)
- RAG snippets (if Phase 9+ — empty array otherwise)
- Prompt governance rules (`app/.ssot/ai/PROMPT_GOVERNANCE.md`)

## Process

1. Load the system prompt for the agent.
2. Load the workflow prompt template for the skill.
3. Inject context variables into the template (replace placeholders).
4. Prepend RAG snippets as context if available.
5. Validate the assembled prompt against governance rules (no secrets, no PII passthrough, assumption language required).
6. Return the assembled prompt array (system + user messages).

## Output Format

```typescript
// app/backend/ai/prompts/prompt-router.ts
export interface AssembledPrompt {
  system: string
  userMessages: Array<{ role: 'user'; content: string }>
  metadata: {
    agentSlug: string
    skillSlug: string
    templateVersion: string
    ragSnippetCount: number
  }
}

export async function routePrompt(
  agentSlug: string,
  skillSlug: string,
  context: Record<string, unknown>,
  ragSnippets: string[] = []
): Promise<AssembledPrompt> {
  const systemPrompt = await loadSystemPrompt(agentSlug)
  const workflowTemplate = await loadWorkflowTemplate(skillSlug)
  const userContent = injectContext(workflowTemplate, context)
  const ragContext = ragSnippets.length > 0 ? formatRagContext(ragSnippets) : ''

  return {
    system: systemPrompt,
    userMessages: [{ role: 'user', content: `${ragContext}\n\n${userContent}`.trim() }],
    metadata: { agentSlug, skillSlug, templateVersion: '1.0', ragSnippetCount: ragSnippets.length },
  }
}
```

## Validation Rules

- System prompt must always be loaded — never send a user message without a system prompt
- Prompt governance rules from PROMPT_GOVERNANCE.md must be validated before sending
- Context injection must use safe string interpolation (no eval, no template literals with untrusted input)
- The final prompt must not contain any hardcoded API keys, passwords, or tokens

## Risk Checks

- Flag if context injection is using string concatenation without escaping
- Flag if the system prompt file is missing for a registered agent
- Flag if a prompt exceeds the model's context window limit (log a warning)

## Do Not Do

- Do not build prompts by free-form string concatenation in route handlers
- Do not skip system prompt loading
- Do not inject raw user-provided text directly into the system prompt section

## Example Output

> For `presales/module-recommendation` skill: system prompt loaded from `ai/prompts/system/presales.md`; workflow template loaded from `ai/prompts/workflows/presales/module-recommendation.md`; context variables `{customerName, industry, painPoints, discoveryNotes}` injected; 3 RAG snippets prepended as a "Knowledge Base Context" section; assembled prompt returned for AI provider call.
