# G30 Baseline Linkage To G28

G30 keeps `baseline_hierarchical` aligned with the G28 deterministic hierarchical baseline shape:

```text
8 seeds x 3 representative orders x baseline_hierarchical = 24 baseline runs
```

G30 does not rewrite G28 artifacts. It reuses the same deterministic scenario runner and representative order selection, then evaluates additional curated policy transforms.

## G28 Commit

```text
ad23f428806018f28631438e30888a51394ed955
```

## G29 Commit

```text
fba76b3a27c076ea2bf70dc7f4013cf9183d6e23
```
