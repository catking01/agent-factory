# G30 Policy Sensitivity Report

## Objective Leaders

- Speed: `speed_flat_like`
- Quality: `merge_optimized`
- Risk reduction: `speed_flat_like`
- Coordination efficiency: `speed_flat_like`
- Balanced: `speed_flat_like`

## Pareto Frontier

```text
speed_flat_like, quality_hierarchy, audit_heavy, handoff_optimized, merge_optimized, extra_worker, balanced_org, risk_averse_org
```

## Policy Means

- `audit_heavy`: quality 7.65, latent risk 3.78, coordination 42.49, balanced score 4.28
- `balanced_org`: quality 7.97, latent risk 4.7, coordination 34.93, balanced score 4.07
- `baseline_hierarchical`: quality 7.29, latent risk 5.47, coordination 31.67, balanced score 2.57
- `extra_lead`: quality 7.75, latent risk 4.5, coordination 41.04, balanced score 3.53
- `extra_worker`: quality 7.7, latent risk 5.52, coordination 36.33, balanced score 2.86
- `handoff_optimized`: quality 7.44, latent risk 5.13, coordination 22.87, balanced score 3.71
- `high_fanout`: quality 7.83, latent risk 5.98, coordination 41.11, balanced score 2.18
- `low_coordination`: quality 7.42, latent risk 5.7, coordination 20.14, balanced score 3.08
- `merge_optimized`: quality 8.47, latent risk 5.19, coordination 36.4, balanced score 3.89
- `quality_hierarchy`: quality 8.31, latent risk 5.14, coordination 38.06, balanced score 3.7
- `risk_averse_org`: quality 7.88, latent risk 3.54, coordination 48.2, balanced score 4.5
- `speed_flat_like`: quality 6.83, latent risk 2.96, coordination 0, balanced score 6.97

## Interpretation Rule

Objective leaders are deterministic simulator outputs. A policy can rank high on one objective and still lose on another. G30 therefore reports the Pareto frontier instead of one universal best policy.
