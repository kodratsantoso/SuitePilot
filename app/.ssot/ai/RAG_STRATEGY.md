# RAG Strategy

> Last updated: 2026-05-14 (updated Prompt 06)
> Status: Strategy defined — full vector RAG in Phase 9. Structured domain context in prompts is active as of Prompt 06.

RAG (Retrieval-Augmented Generation) is the mechanism by which AI agents access verified knowledge from the platform's knowledge base rather than relying solely on their training data.

---

## Why RAG

NetSuite has thousands of configuration options, frequent release updates, industry-specific best practices, and implementation patterns that evolve over time. Relying on model training data alone leads to:

- Stale or incorrect feature descriptions
- Missing knowledge of custom modules or industry editions
- Inability to reference client-specific decisions and history
- Hallucinations on obscure configuration details

RAG grounds AI outputs in current, verified, domain-specific knowledge.

---

## Knowledge Domains

| Domain | Location | Contents |
|---|---|---|
| NetSuite core | `ai/knowledge/netsuite/` | Module guides, configuration options, release notes |
| Implementation methodology | `ai/knowledge/implementation/` | Delivery methodology, best practices, lessons learned |
| Industry verticals | `ai/knowledge/industry/` | Industry-specific process patterns and compliance notes |
| Templates | `ai/knowledge/templates/` | Document templates, checklists, standard structures |

---

## Retrieval Architecture

**Phase 9 initial implementation:**
- Vector store: pgvector (PostgreSQL extension)
- Embeddings model: OpenAI `text-embedding-3-small` or Anthropic equivalent
- Chunk size: adaptive by document type (300–800 tokens per chunk)
- Retrieval: top-k semantic search with metadata filters (domain, module, version)

**Scale path (Phase 14+):**
- Migrate to dedicated vector database (Pinecone or Weaviate) if pgvector shows performance limits
- Add hybrid search (BM25 + semantic) for precise NetSuite terminology lookup

---

## Chunking Strategy

| Document Type | Chunking Approach |
|---|---|
| Module guides | Section-by-section (by heading level) |
| Configuration tables | Row-by-row with table header context |
| Process flows | Step-by-step with process header context |
| Code examples | Full function as a single chunk |
| Templates | Template section by section |

---

## Knowledge Base Maintenance

- New knowledge is ingested through an admin pipeline (Phase 9)
- Knowledge items have version tags (NetSuite release version, methodology version)
- Outdated knowledge must be explicitly deprecated, not silently replaced
- All knowledge items have a source reference (document name, URL, consultant who added it)

---

## Quality Controls

- AI outputs citing retrieved knowledge must include the source reference
- Governance Agent checks that retrieved knowledge matches the output claims
- Retrieval confidence scores are logged alongside outputs
- Low-confidence retrievals trigger a hallucination flag

---

## Prompt 06: Structured Domain Context (Pre-RAG Approach)

Full vector RAG is planned for Phase 9, but Prompt 06 introduces the first form of domain-grounded AI in the platform: **structured domain context embedded directly in skill system prompts**.

### What is in the prompts (not yet external RAG)

Each of the 5 presales skill system prompts contains curated NetSuite domain knowledge that would otherwise require RAG retrieval:

| Skill | Embedded Domain Knowledge |
|---|---|
| analyze-requirements | NetSuite module taxonomy (Finance, Supply Chain, CRM, HR, Reporting, Integrations); examples of FIT vs. GAP vs. PARTIAL_FIT assessments; common requirement patterns per module |
| classify-pain-points | Standard business area taxonomy; common root causes by area; NetSuite capabilities that address specific pain points |
| recommend-modules | Full `NetsuiteModuleCatalog` (20 modules) injected from DB at request time; typical use case patterns per module; cross-module dependency notes |
| estimate-scope | Complexity tier reference ranges for NetSuite implementations (SIMPLE: 8–12 weeks / 2–3 people; MODERATE: 16–24 weeks / 4–6 people; COMPLEX: 30–52 weeks / 7–12 people; HIGHLY_COMPLEX: 52+ weeks / 12+ people); common risk drivers by complexity |
| generate-proposal-draft | NetSuite implementation proposal structure; section-by-section guidance; tone and terminology appropriate for executive audiences |

### NetsuiteModuleCatalog as Lightweight Knowledge Base

The `NetsuiteModuleCatalog` table (seeded with 20 modules) serves as the platform's first structured knowledge store. It is queried at runtime and injected into relevant skill prompts. This is the precursor to the full RAG knowledge base:

| RAG Phase | Approach | Status |
|---|---|---|
| Pre-Phase 9 (current) | Structured catalog + prompt-embedded domain context | ACTIVE (Prompt 06) |
| Phase 9 | pgvector semantic search over chunked module guides and methodology docs | PLANNED |
| Phase 14+ | Dedicated vector DB (Pinecone/Weaviate) + hybrid BM25/semantic search | PLANNED |

### Gap Analysis: What the Current Approach Cannot Do

The embedded prompt approach has known limitations vs. full RAG:

- Cannot retrieve specific NetSuite release notes or version-specific behavior
- Cannot reference client-specific history or previous project decisions
- Cannot retrieve from the full implementation methodology knowledge base
- Module catalog covers 20 modules only — not the full NetSuite module set
- Domain knowledge in prompts is static — does not update automatically when NetSuite releases new features

These gaps are accepted for Phase 1 and will be addressed progressively from Phase 9 onwards.
