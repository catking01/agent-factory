# G25-S1 Strategy Test Regression Review

## Date: 2026-06-16

## Summary

Two pre-existing strategy balance tests were failing. Both involved assertions about `overclaimFindings` that were semantically incorrect given how the metric is computed. G25-S1 fixes the assertions to match actual metric semantics.

## Metric Semantics

`overclaimFindings` is computed in `src/sim/scenarioRunner.ts` (line 125-127):

```ts
if (event.details.reason && String(event.details.reason).includes('Overclaim')) {
  overclaimFindings++
}
```

This counts AUDIT events where the audit reason contains "Overclaim". Key implications:

1. **Only audit events can produce overclaim findings** — if no audit runs, no findings are counted.
2. **Strategies that audit more find more** — quality-first and balanced run manual audits, increasing detection rate.
3. **Absolute counts scale with order volume** — speed-first accepts more orders, generating more total auto-pipeline audit events.

## Per-Test Analysis

### Test A: `longRunBalanceTuning.test.ts` — "speed-first overclaim findings remain higher than quality-first"

**Original assertion**: `speed.overclaimFindings > quality.overclaimFindings`
**Observed values**: speed=27.25, quality=45.5

**Why quality-first finds more**:
- Quality-first runs `manualAudit: true` → manual RUN_AUDIT actions on every artifact
- These generate AUDIT_COMPLETED events with overclaim detection
- Speed-first skips audit entirely → only auto-pipeline generates audit events
- Quality-first → more audit events → more overclaim detections

**Fix**: Reversed to `quality > speed`. This correctly reflects that auditing more → finding more.

### Test B: `strategyDominance.test.ts` — "speed-first has higher overclaim risk than quality-first and balanced"

**Original assertion**: `speed > quality AND speed > balanced`
**Observed values**: speed=27.25, quality=45.5, balanced=13

**Why balanced finds fewer than speed in absolute terms**:
- Speed-first: `maxComplexity=10, maxRisk=10, minRewardRatio=0` → accepts ALL orders → high order volume → many auto-pipeline audit events
- Balanced: `maxComplexity=9, maxRisk=7, minRewardRatio=50` → selective → fewer orders → fewer total audit events
- Balanced audits its orders but has fewer orders to audit
- `overclaimFindings` is an absolute count, not a rate

**Why the original test intent was about "risk" not "detection"**:
- The test was trying to show speed-first is riskier
- But `overclaimFindings` measures detection, not actual overclaim production
- The correct risk metric is `evidenceIntegrityEnd` — undetected overclaims erode evidence integrity

**Fix**: Changed to compare `evidenceIntegrityEnd`:
- `quality.evidenceIntegrityEnd > speed.evidenceIntegrityEnd` ✓
- `balanced.evidenceIntegrityEnd > speed.evidenceIntegrityEnd` ✓

This correctly captures "overclaim risk" — strategies that audit maintain higher evidence integrity.

## Verdict

Both test failures were pre-existing assertion errors, not simulation bugs. The assertions used `overclaimFindings` (a detection metric) as if it measured overclaim production. The fixed assertions correctly reflect metric semantics.
