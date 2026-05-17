# Skill: Agent Registry Loader

## Purpose

Implement the runtime agent registry — the system that reads agent definition files from `ai/agents/`, validates them, and exposes a typed registry that the AI orchestration layer uses to look up agents by slug at runtime.

## When To Use

Use when implementing or modifying the AI orchestration layer's ability to discover and load agent definitions. This is a Phase 2 implementation target.

## Required Inputs

- Agent definition files in `ai/agents/` and `ai/agents/development/`
- Agent registry SSOT (`app/.ssot/ai/AGENT_REGISTRY.md`)
- Database schema for AiAgent entity

## Process

1. Define the `AgentDefinition` TypeScript interface matching the agent file structure.
2. Implement a loader that reads the database-registered agents (not the markdown files at runtime — markdown is the source of truth for writing, database is the runtime source).
3. Implement `getAgentBySlug(slug: string): AgentDefinition | null`.
4. Implement `listAgents(): AgentDefinition[]`.
5. Validate that agents in the database match the markdown definitions at startup.
6. Cache the registry in memory with a configurable TTL.

## Output Format

```typescript
// app/backend/ai/registry/agent-registry.ts
export interface AgentDefinition {
  id: string
  slug: string
  name: string
  description: string
  allowedSkillSlugs: string[]
  isActive: boolean
}

export class AgentRegistry {
  private static cache: Map<string, AgentDefinition> = new Map()

  static async load(): Promise<void> {
    const agents = await prisma.aiAgent.findMany({ where: { isActive: true } })
    agents.forEach(a => this.cache.set(a.slug, { ...a, allowedSkillSlugs: [] }))
  }

  static getBySlug(slug: string): AgentDefinition | null {
    return this.cache.get(slug) ?? null
  }

  static list(): AgentDefinition[] {
    return Array.from(this.cache.values())
  }
}
```

## Validation Rules

- Every agent slug in the database must have a corresponding markdown definition file
- The loader must fail loudly at startup if registered agents are missing their definition files
- The cache must be invalidated when agent configuration changes

## Risk Checks

- Flag if the registry is loaded on every request (performance issue — must be cached)
- Flag if unknown agent slugs are silently ignored rather than logged as warnings

## Do Not Do

- Do not parse markdown files at runtime — use database as runtime source
- Do not allow the registry to return stale data after an agent is deactivated

## Example Output

> `AgentRegistry.getBySlug('presales')` returns `{ id: 'uuid', slug: 'presales', name: 'Presales Agent', description: '...', allowedSkillSlugs: ['presales/discovery', 'presales/qualification', ...], isActive: true }`. Returns null if slug not found.
