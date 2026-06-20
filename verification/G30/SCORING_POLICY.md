# G30 Scoring Policy

All objective scores are deterministic transformations of each raw run.

## Formulas

- `speedScore`: `-deliveryTicks`
- `qualityScore`: `finalQuality + finalEvidenceStrength * 0.5`
- `riskReductionScore`: `-latentRiskEstimate - undetectedOverclaimExposure`
- `coordinationEfficiencyScore`: `riskAdjustedQuality / max(1, coordinationCost)`
- `balancedScore`: `riskAdjustedQuality + finalEvidenceStrength * 0.5 - deliveryTicks * 0.1 - coordinationCost * 0.05`

## Ranking

Each objective ranks policies by the mean score across the 24 runs for that policy:

```text
8 seeds x 3 representative orders = 24 policy runs
```

## Pareto Frontier

Pareto dominance uses:

- qualityScore
- riskReductionScore
- speedScore
- coordinationEfficiencyScore

A policy dominates another only when it is at least as good on all four dimensions and strictly better on at least one.
