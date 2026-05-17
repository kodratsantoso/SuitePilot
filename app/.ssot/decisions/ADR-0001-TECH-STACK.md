# ADR-0001 — Technology Stack Selection

**Status:** Accepted
**Date:** 2026-05-13
**Authors:** Engineering Team

---

## Context

We are building a new platform from scratch. We need to select a technology stack that supports:

- TypeScript throughout (type safety, developer experience)
- A modern, fast backend API
- A production-grade frontend with good developer tooling
- A mature ORM for PostgreSQL
- Multi-tenant data isolation
- Long-term SaaS readiness
- A team that is comfortable with JavaScript/TypeScript full-stack

We considered:
- Backend: Express.js vs Hono vs NestJS vs Fastify
- Frontend: Next.js vs Remix vs Nuxt (Vue) vs SvelteKit
- ORM: Prisma vs Drizzle vs TypeORM vs Sequelize
- Package manager: npm vs yarn vs pnpm

---

## Decision

**Backend:** Hono (TypeScript on Node.js)
- Rationale: Fast, minimal, TypeScript-first, edge-ready, excellent DX. Less opinionated than NestJS (which adds complexity early), but more structured than raw Express.

**Frontend:** Next.js 14+ with App Router (TypeScript)
- Rationale: Industry standard for React-based full-stack applications. App Router + React Server Components provide excellent performance. Strong ecosystem for auth, data fetching, and deployment.

**ORM:** Prisma
- Rationale: Type-safe queries generated from schema, excellent migration tooling, wide adoption. Drizzle is faster but Prisma's DX and tooling are superior for a team-level project.

**Database:** PostgreSQL 15+
- Rationale: Mature, reliable, feature-rich. pgvector extension available for Phase 9 RAG layer. Excellent managed hosting options (Neon, Supabase).

**Cache / Queue:** Redis
- Rationale: Standard for session caching, rate limiting, and job queues.

**Package manager:** pnpm
- Rationale: Fast, disk-efficient, strict about hoisting (avoids phantom dependency bugs), excellent monorepo support.

**Monorepo:** pnpm workspaces
- Rationale: Simple, no additional tooling required for Phase 1. Can adopt Turborepo if build times warrant it.

---

## Consequences

**Positive:**
- Unified TypeScript codebase reduces context switching
- Prisma's type safety catches data model errors at compile time
- Hono is lightweight enough to stay fast as the API grows
- Next.js App Router gives us excellent future options (Server Actions, streaming)

**Negative:**
- Hono is less opinionated than NestJS — we must enforce our own project structure conventions
- pnpm workspaces require all engineers to use pnpm (not npm or yarn)
- Prisma can be slow for very high-volume write workloads (can mitigate with connection pooling)

---

## Alternatives Considered and Rejected

- **NestJS:** Too much boilerplate and framework overhead for a team starting fresh; can revisit if Hono becomes limiting.
- **Drizzle ORM:** Better raw performance, but weaker migration tooling and smaller ecosystem.
- **Remix:** Solid alternative to Next.js but smaller ecosystem and fewer integrations.
