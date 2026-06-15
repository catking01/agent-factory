# G14 Local Ollama Shadow AI Auditor

## Repository

- **Remote**: https://github.com/catking01/agent-factory
- **Branch**: `main`

## Goal

Add optional local Ollama-powered semantic audit that evaluates artifacts
alongside the deterministic audit pipeline — as a shadow evaluator only.

## Architecture

```
GameState (deterministic) → deterministic audit → artifact.auditPassed
                                ↑ never mutated by ↓
                          shadowAudit() → ShadowAuditResult (read-only)
```

## Implementation

| File | Purpose |
|---|---|
| `src/ai/ollamaSchemas.ts` | ShadowAuditResult type, JSON schema, default result |
| `src/ai/ollamaClient.ts` | HTTP client for localhost:11434, availability check, env gate |
| `src/ai/promptBuilders.ts` | System + user prompts from game context |
| `src/ai/shadowAudit.ts` | Main function — gates, context, prompt, parse, return |

## Non-Determinism Boundaries

| Boundary | Enforcement |
|---|---|
| No GameState mutation | `shadowAudit()` never receives or returns GameState |
| No replay hash impact | Ollama result is not stored in ledger or artifacts |
| No browser calls | `typeof window !== 'undefined'` gate returns default |
| No CI calls | `AGENT_FOUNDRY_ENABLE_OLLAMA=1` env var required |
| No required dependency | All normal tests pass without Ollama installed |

## Opt-In Usage

```bash
# Standard tests (no Ollama needed):
npm run test

# Opt-in Ollama tests (requires local Ollama):
AGENT_FOUNDRY_ENABLE_OLLAMA=1 npm run test:ollama
```

## Verification Gate

| Check | Result |
|---|---|
| `npx tsc -b` | PASS |
| `npx vite build` | PASS |
| `npx vitest run` (no Ollama) | PASS (32 files, 189 tests, 4 skipped) |
| Ollama tests skip when disabled | PASS |
| No GameState mutation | PASS |
| No replay hash changes | PASS |
| No LLM/API calls to external services | PASS (localhost only) |

## Non-Claims

- Does NOT validate Runtime Lab
- Does NOT claim real multi-agent research capability
- Ollama is a shadow evaluator — it does not affect simulation outcomes
- Model quality varies — results are advisory only
