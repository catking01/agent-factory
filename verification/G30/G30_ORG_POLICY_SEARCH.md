# G30: Organization Policy Search

## Study Design

```text
Baseline:      G28 deterministic intervention study baseline
Policies:      12
Seeds:         8
Order classes: simple, medium, complex
Orders:        1 representative order per class
Total runs:    288
```

## Matrix Shape

```text
12 policies x 8 seeds x 3 representative orders = 288 runs
```

## Policy Set

- `baseline_hierarchical`: G28-linked hierarchical baseline with no policy adjustment.
- `speed_flat_like`: Flat-mode policy optimized for delivery speed and low coordination.
- `quality_hierarchy`: Hierarchical policy with stronger merge judgment and validation.
- `audit_heavy`: Policy that spends coordination budget on audit coverage and validation.
- `handoff_optimized`: Policy emphasizing clearer handoffs and lower coordination drag.
- `merge_optimized`: Policy emphasizing lead selection and final artifact merge quality.
- `low_coordination`: Hierarchical policy constrained to minimize coordination overhead.
- `high_fanout`: Policy that fans out more work and accepts higher coordination load.
- `extra_worker`: Policy adding worker capacity while keeping one lead.
- `extra_lead`: Policy adding one cell lead to reduce bottlenecks on review-heavy work.
- `balanced_org`: Policy balancing merge quality, handoff clarity, audit coverage, and staffing.
- `risk_averse_org`: Policy prioritizing latent-risk reduction and evidence discipline.

## Objective Outputs

- Speed ranking
- Quality ranking
- Risk reduction ranking
- Coordination efficiency ranking
- Balanced score ranking
- Pareto frontier over quality, risk reduction, speed, and coordination efficiency

## Current Artifact Verdict

```text
machine-readable artifacts: generated
aggregate recompute: PASS
validation status: see TEST_OUTPUT.txt and BUILD_OUTPUT.txt
```

## Boundary

G30 searches deterministic policy transforms inside Agent Foundry's organization simulator. It does not claim a real-world best organization policy.
