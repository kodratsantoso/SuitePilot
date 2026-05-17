# ADR-0002 — AI Agent Architecture

**Status:** Accepted
**Date:** 2026-05-13
**Authors:** Engineering Team

---

## Context

The platform requires an AI orchestration architecture that:

- Supports multiple specialized agents with different roles
- Can invoke specific skills within each agent
- Supports multiple AI providers (Anthropic, OpenAI, Gemini) interchangeably
- Persists all AI conversations and outputs for audit purposes
- Enforces a review workflow lifecycle on AI outputs
- Can incorporate RAG (retrieval-augmented generation) in Phase 9
- Can be evaluated and tested systematically

We considered:
- Using a third-party framework (LangChain, LlamaIndex, Autogen) vs. building a custom orchestration layer
- Single agent vs. multi-agent architecture
- Provider-specific vs. provider-agnostic implementation

---

## Decision

**Build a custom, lightweight AI orchestration layer** rather than adopting a third-party framework.

**Multi-agent, skill-based architecture:**
- Each agent has a defined role, persona, and set of allowed skills
- Skills are the atomic unit of AI invocation — each skill has specific inputs, a prompt template, and a defined output format
- The orchestration layer maps incoming requests to the correct agent + skill combination

**Provider-agnostic abstraction:**
- All AI provider interactions go through a `AIProvider` interface
- Implementation-specific code (Anthropic SDK, OpenAI SDK) is behind this interface
- Switching providers or using different providers for different skills requires only configuration changes

**Persistence-first:**
- Every AI invocation creates an `AiConversation` record before the call is made
- Every output creates an `AiGeneratedOutput` record immediately upon completion
- No AI output exists only in memory — all outputs are durable

---

## Consequences

**Positive:**
- Full control over the orchestration logic — we can implement NetSuite-specific reasoning patterns
- No dependency on third-party frameworks that may change APIs or pricing
- Clean audit trail by design
- Provider abstraction protects us from vendor lock-in

**Negative:**
- More initial engineering work compared to using LangChain
- We must implement our own RAG retrieval integration in Phase 9
- We miss out on pre-built LangChain agents and tools (but we don't need most of them)

---

## Alternatives Considered and Rejected

- **LangChain:** Broad and well-resourced, but overly abstracted for our domain-specific needs. Rapid API changes between versions have caused production issues for other teams. Rejected in favor of a controlled custom implementation.
- **LlamaIndex:** Excellent for RAG, but focused narrowly on document retrieval. We'll draw inspiration from its RAG patterns without adopting the framework.
- **Autogen / CrewAI:** Multi-agent frameworks that are interesting but still maturing. The overhead of adapting their agent models to our domain-specific roles outweighs the benefits.
