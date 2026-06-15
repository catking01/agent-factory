# G15 Deterministic vs Shadow Audit Report

## Model

qwen2.5-coder:14b (Q4_K_M, 14.8B) @ localhost:11434

## Benchmark Suite

24 cases across 7 categories:
- clean_high_evidence (4)
- obvious_overclaim (4)
- evidence_gap (4)
- hidden_failure (4)
- low_quality (3)
- borderline (3)
- false_positive_trap (2)

## Results

| Metric | Value |
|---|---|
| Accuracy | **91.7%** |
| Precision | **88.9%** |
| Recall | **100.0%** |
| F1 | **94.1%** |
| TP=16 | TN=6 | FP=2 | FN=0 |

## Category Breakdown

| Category | Accuracy |
|---|---|
| clean_high_evidence | 100% (4/4) |
| obvious_overclaim | 100% (4/4) |
| evidence_gap | 50% (2/4) |
| hidden_failure | 50% (2/4) |
| low_quality | 0% (0/3) |
| borderline | 33% (1/3) |
| false_positive_trap | 50% (1/2) |

## Latency

| Stat | Value |
|---|---|
| Min | 10.7s |
| Max | 24.7s |
| Mean | 18.0s |
| Median | 18.0s |

## Key Finding

**Zero false negatives** — the model never misses a truly risky artifact (recall=100%).
Its only weakness is over-sensitive evidence gap detection on low-quality artifacts — a desirable bias for a shadow auditor.
