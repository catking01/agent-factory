# G30 Search Space

G30 uses a curated deterministic policy set instead of an unbounded factorial search.

## Policies

## baseline_hierarchical

- label: Baseline hierarchical
- mode: hierarchical
- cellLeadCount: 1
- workerCount: 4
- spanOfControl: 4
- fanoutStrategy: balanced
- mergeJudgmentBonus: 0
- handoffClarityBonus: 0
- auditCoverageBonus: 0
- validationStrictnessBonus: 0
- coordinationCostMultiplier: 1
- riskTolerance: medium

## speed_flat_like

- label: Speed flat-like
- mode: flat
- cellLeadCount: 0
- workerCount: 3
- spanOfControl: 6
- fanoutStrategy: conservative
- mergeJudgmentBonus: 0
- handoffClarityBonus: 0.25
- auditCoverageBonus: 0
- validationStrictnessBonus: 0
- coordinationCostMultiplier: 0.5
- riskTolerance: high

## quality_hierarchy

- label: Quality hierarchy
- mode: hierarchical
- cellLeadCount: 1
- workerCount: 4
- spanOfControl: 4
- fanoutStrategy: balanced
- mergeJudgmentBonus: 0.75
- handoffClarityBonus: 0.1
- auditCoverageBonus: 0.1
- validationStrictnessBonus: 0.3
- coordinationCostMultiplier: 1.15
- riskTolerance: medium

## audit_heavy

- label: Audit heavy
- mode: hierarchical
- cellLeadCount: 1
- workerCount: 4
- spanOfControl: 3
- fanoutStrategy: balanced
- mergeJudgmentBonus: 0.2
- handoffClarityBonus: 0.05
- auditCoverageBonus: 0.8
- validationStrictnessBonus: 0.45
- coordinationCostMultiplier: 1.25
- riskTolerance: low

## handoff_optimized

- label: Handoff optimized
- mode: hierarchical
- cellLeadCount: 1
- workerCount: 4
- spanOfControl: 4
- fanoutStrategy: balanced
- mergeJudgmentBonus: 0.1
- handoffClarityBonus: 0.85
- auditCoverageBonus: 0.05
- validationStrictnessBonus: 0.1
- coordinationCostMultiplier: 0.75
- riskTolerance: medium

## merge_optimized

- label: Merge optimized
- mode: hierarchical
- cellLeadCount: 1
- workerCount: 4
- spanOfControl: 4
- fanoutStrategy: balanced
- mergeJudgmentBonus: 0.9
- handoffClarityBonus: 0.15
- auditCoverageBonus: 0.1
- validationStrictnessBonus: 0.2
- coordinationCostMultiplier: 1.1
- riskTolerance: medium

## low_coordination

- label: Low coordination
- mode: hierarchical
- cellLeadCount: 1
- workerCount: 3
- spanOfControl: 6
- fanoutStrategy: conservative
- mergeJudgmentBonus: 0.1
- handoffClarityBonus: 0.45
- auditCoverageBonus: 0
- validationStrictnessBonus: 0
- coordinationCostMultiplier: 0.65
- riskTolerance: medium

## high_fanout

- label: High fan-out
- mode: hierarchical
- cellLeadCount: 1
- workerCount: 6
- spanOfControl: 5
- fanoutStrategy: aggressive
- mergeJudgmentBonus: 0.3
- handoffClarityBonus: 0.05
- auditCoverageBonus: 0
- validationStrictnessBonus: 0.05
- coordinationCostMultiplier: 1.2
- riskTolerance: high

## extra_worker

- label: Extra worker
- mode: hierarchical
- cellLeadCount: 1
- workerCount: 6
- spanOfControl: 4
- fanoutStrategy: balanced
- mergeJudgmentBonus: 0.2
- handoffClarityBonus: 0.1
- auditCoverageBonus: 0
- validationStrictnessBonus: 0.05
- coordinationCostMultiplier: 1.1
- riskTolerance: medium

## extra_lead

- label: Extra lead
- mode: hierarchical
- cellLeadCount: 2
- workerCount: 4
- spanOfControl: 3
- fanoutStrategy: balanced
- mergeJudgmentBonus: 0.25
- handoffClarityBonus: 0.2
- auditCoverageBonus: 0.15
- validationStrictnessBonus: 0.2
- coordinationCostMultiplier: 1.2
- riskTolerance: low

## balanced_org

- label: Balanced org
- mode: hierarchical
- cellLeadCount: 2
- workerCount: 5
- spanOfControl: 4
- fanoutStrategy: balanced
- mergeJudgmentBonus: 0.35
- handoffClarityBonus: 0.35
- auditCoverageBonus: 0.25
- validationStrictnessBonus: 0.25
- coordinationCostMultiplier: 1
- riskTolerance: medium

## risk_averse_org

- label: Risk-averse org
- mode: hierarchical
- cellLeadCount: 2
- workerCount: 4
- spanOfControl: 3
- fanoutStrategy: conservative
- mergeJudgmentBonus: 0.25
- handoffClarityBonus: 0.25
- auditCoverageBonus: 0.65
- validationStrictnessBonus: 0.7
- coordinationCostMultiplier: 1.35
- riskTolerance: low


## Matrix

```text
12 policies x 8 seeds x 3 representative orders = 288 runs
```

The representative orders are the same simple, medium, and complex midpoint orders used by the G28 MVP.
