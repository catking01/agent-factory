# Research Report

## Current Stable Findings

- The repository root for implementation work is `agent-foundry/`.
- The project is a private React 18, TypeScript, Vite application with Vitest tests.
- Main commands are declared in `package.json`: `npm run dev`, `npm run build`, `npm run test`, `npm run test:watch`, `npm run test:ollama`, and `npm run test:shadow-benchmark`.
- Contributor guidance has been added in `AGENTS.md` based on inspected project files and recent commit history.
- `AGENTS.md` is 358 words and passed whitespace validation.
- Scoped pre-close hygiene passed for `AGENTS.md`, `.codex/research_record.md`, and `.codex/research_report.md`.
- G27-S1 machine-readable study artifacts have been generated for the deterministic flat-vs-hierarchy study.
- G27's actual matrix shape is documented as `8 seeds x 2 modes x 3 order classes x 3 concrete order instances per class = 144 runs`.
- `verification/G27/AGGREGATE_RECOMPUTE_CHECK.json` reports PASS for raw-matrix run count, coverage, missing combinations, and aggregate mean recomputation.
- G27-S1 validation passed locally: `npm run test` (46 files, 375 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with a chunk-size warning only.
- G28 organization intervention experiments have been implemented as a deterministic study layer linked to the G27-S1 hierarchical baseline.
- G28 matrix shape is `8 seeds x 3 representative orders x 6 interventions = 144 runs`.
- G28 intervention artifacts include raw matrix, aggregates, delta report, complexity breakdown, ranking, baseline linkage, risk semantics, findings, non-claims, test output, and build output.
- G28 validation passed locally: focused G28 tests (14 passed), `npm run test` (47 files, 389 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with the existing chunk-size warning.
- G29 organization study UI has been implemented as a read-only Research tab over compact local G27/G28 summary data.
- G29 Research Dashboard shows deterministic study results, G27 flat-vs-hierarchy summary, G28 intervention ranking, delta metrics, complexity highlights, risk semantics, and non-claims.
- G29 validation passed locally: focused G29 tests (2 files, 8 passed), `npm run test` (49 files, 397 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with the existing chunk-size warning.
- G30 organization policy search has been implemented as a deterministic research runner over 12 curated organization policies.
- G30 matrix shape is `12 policies x 8 seeds x 3 representative orders = 288 runs`.
- G30 artifacts include raw policy matrix, policy aggregates, objective rankings, order complexity breakdown, Pareto frontier, aggregate recompute check, search-space documentation, scoring-policy documentation, baseline linkage, sensitivity report, non-claims, test output, and build output.
- G30 validation passed locally: focused G30 tests (2 files, 13 passed), `npm run test` (51 files, 410 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with the existing chunk-size warning.

## Open Risks

- G27-S1 does not claim hierarchy is better than flat, does not generalize to real organizations, and does not use real LLM agents.
- G28 intervention transforms are deterministic research-layer model adjustments, not new real agent capabilities.
- G28 does not claim any intervention is better for real organizations.
- G29 is a static summary UI; it does not expose raw G27/G28 matrix downloads and does not generate new study runs.
- G29 does not claim real-world organization validity, real AI-agent capability, Runtime Lab validation, or production governance readiness.
- G30 searches a curated deterministic policy set, not an exhaustive organization-design space.
- G30 reports objective-specific rankings and Pareto frontier; it does not claim a single best real-world organization policy.
- G30 does not update the G29 Research UI; a future G31 can add policy search visualization.
- The Vite build still reports the existing chunk-size warning for the main bundle.
