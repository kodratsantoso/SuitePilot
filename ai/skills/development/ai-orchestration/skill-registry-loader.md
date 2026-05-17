# Skill: Skill Registry Loader

## Purpose

Implement the runtime skill registry — the system that reads skill definitions from the database (seeded from `ai/skills/`), validates them, and provides the skill invoker with the metadata needed to load the correct prompt template and output format for a given skill slug.

## When To Use

Use when implementing the skill invocation layer. The skill registry loader is a prerequisite for the prompt routing skill.

## Required Inputs

- Skill registry SSOT (`app/.ssot/ai/SKILL_REGISTRY.md`)
- Database schema for AiSkill entity
- Prompt template files in `ai/prompts/`

## Process

1. Define the `SkillDefinition` TypeScript interface.
2. Implement a loader that reads from the AiSkill database table.
3. Implement `getSkillBySlug(slug: string): SkillDefinition | null`.
4. Implement `getSkillsByAgent(agentSlug: string): SkillDefinition[]`.
5. Validate that the prompt template path exists for each skill.
6. Cache with TTL.

## Output Format

```typescript
// app/backend/ai/registry/skill-registry.ts
export interface SkillDefinition {
  id: string
  agentSlug: string
  slug: string
  name: string
  description: string
  promptTemplatePath: string
  outputFormat: string
  isActive: boolean
}

export class SkillRegistry {
  private static cache: Map<string, SkillDefinition> = new Map()

  static async load(): Promise<void> {
    const skills = await prisma.aiSkill.findMany({
      where: { isActive: true },
      include: { agent: true },
    })
    skills.forEach(s => this.cache.set(s.slug, { ...s, agentSlug: s.agent.slug }))
  }

  static getBySlug(slug: string): SkillDefinition | null {
    return this.cache.get(slug) ?? null
  }
}
```

## Validation Rules

- Every skill must reference a valid agent slug
- Skill slugs must be unique across the registry
- The prompt template path must be validated at load time

## Risk Checks

- Flag if skills are loaded individually per-request (must be cached)
- Flag if a skill's prompt template file is missing (startup validation required)

## Do Not Do

- Do not load skill definitions from markdown files at runtime
- Do not allow skills from inactive agents to be invoked

## Example Output

> `SkillRegistry.getBySlug('presales/module-recommendation')` returns the skill definition including its prompt template path and output format specification, enabling the skill invoker to build the correct prompt.
