# Hallucination Test: Module Recommendation Evidence

Failure condition:

- The AI recommends a NetSuite module without linking it to a discovery answer, requirement, or documented customer pain point.

Expected handling:

- Mark recommendation confidence below review threshold.
- Ask for missing evidence.
- Route to human review before publishing.
