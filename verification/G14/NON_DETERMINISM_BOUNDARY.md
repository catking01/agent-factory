# G14 Non-Determinism Boundary

## Principle

The deterministic simulation core (`src/sim/`) is the source of truth.
Ollama shadow audit runs alongside but NEVER mutates GameState.

## What Ollama CAN do

- Read order, artifact, validation, audit context
- Return a structured ShadowAuditResult
- Be displayed in the debugger UI as a comparison column
- Be logged as advisory-only metadata

## What Ollama CANNOT do

- Mutate `state.cash`, `state.reputation`, `state.evidenceIntegrity`
- Mutate `artifact.auditPassed`, `artifact.auditResult`
- Mutate `state.ledger`
- Affect the replay hash
- Run in browser context
- Run without explicit env var opt-in

## Enforcement

| Layer | Mechanism |
|---|---|
| Function signature | `shadowAudit()` takes `Order` + `Artifact`, returns `ShadowAuditResult` |
| No state access | `shadowAudit()` never imports or receives `GameState` |
| Env gate | `isOllamaEnabled()` checks `AGENT_FOUNDRY_ENABLE_OLLAMA` |
| Browser gate | `typeof window !== 'undefined'` check returns default |
| Test isolation | Opt-in tests use `.runIf(isOllamaEnabled() && hasOllama)` |

## Why this matters

If Ollama could mutate GameState:
- Replay would break (different hash per run)
- Multi-seed balance evidence would be invalid
- Hard gates would become non-deterministic

By keeping Ollama strictly as a shadow evaluator:
- All existing 189 tests remain deterministic
- Replay hash is unaffected
- Balance evidence remains valid
- Ollama can be safely added or removed without breaking the core
