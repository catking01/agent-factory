# Research Record

## 2026-06-19 19:40:14 CST

- Task: create a repository contributor guide at `AGENTS.md`.
- Scope inspected: `README.md`, `package.json`, `tsconfig.json`, `vite.config.ts`, `src/`, `tests/`, recent Git commit subjects.
- Findings: project is a React 18 + TypeScript + Vite app; tests use Vitest, Testing Library for UI, and opt-in Ollama tests gated by `AGENT_FOUNDRY_ENABLE_OLLAMA=1`; source is organized by `sim`, `game`, `data`, `ui`, `ai`, `i18n`, and `styles`; recent commit subjects use milestone-style prefixes (`G27: ...`) and imperative fixes (`Fix ...`).
- Decision: generate a concise Markdown contributor guide tailored to the observed repository structure and scripts.
- Verification pending at write time: word count, Markdown diff check, Git status, hygiene gate.

## 2026-06-19 19:40:14 CST Validation Update

- `AGENTS.md` word count: 358 words, within the requested 200-400 word range.
- `git diff --check`: PASS.
- Scoped hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode scoped --paths AGENTS.md .codex/research_record.md .codex/research_report.md`.
- Scoped hygiene result: PASS for `AGENTS.md`, `.codex/research_record.md`, and `.codex/research_report.md`.
- Git status after writes: `AGENTS.md` and `.codex/` are new untracked files.

## 2026-06-19 20:38:54 CST

- Task: implement `G27-S1_MACHINE_READABLE_STUDY_ARTIFACT_SEAL`.
- Scope inspected: `src/sim/orgMultiSeedStudy.ts`, `src/sim/orgScenarioRunner.ts`, `src/sim/orgModel.ts`, `src/data/orgStudyOrders.ts`, `tests/sim/orgMultiSeedStudy.test.ts`, and `verification/G27/`.
- Finding: G27's actual matrix shape is `8 seeds x 2 modes x 3 order classes x 3 concrete order instances per class = 144 runs`; the extra dimension is `orderClassInstanceIndex`.
- Decision: treat 144 runs as a documented superset of the original 48-run minimum, not as a failed implementation, provided machine-readable artifacts and recompute evidence are present.
- Added evidence generator: `scripts/generateG27Artifacts.ts`.
- Added seal/export logic: `src/sim/orgStudyArtifactSeal.ts`.
- Added test coverage in `tests/sim/orgMultiSeedStudy.test.ts` for raw matrix shape, required flattened fields, aggregate recompute PASS, complexity breakdown, coordination curve coverage, and artifact completeness assertion.
- Generated artifacts: `ORG_MULTI_SEED_MATRIX.json`, `FLAT_VS_HIERARCHY_AGGREGATES.json`, `ORDER_COMPLEXITY_BREAKDOWN.json`, `COORDINATION_COST_CURVE.json`, `AGGREGATE_RECOMPUTE_CHECK.json`, `G27_CONTRACT_DELTA.md`, `RAW_MATRIX_SCHEMA.md`, `WORKTREE_HYGIENE_REPORT.md`, and `G27_SEAL_VERDICT.md`.
- Risk semantics update: `detectedOverclaimFindings` remains a detection metric; `latentRiskEstimate` remains the risk/exposure comparison metric; derived `auditCoverageRate` and `undetectedOverclaimExposure` are artifact-level proxies only.
- Validation: `npm run test` PASS with 46 test files passed, 375 tests passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with chunk-size warning.
- Hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Hygiene result: PASS with no warnings; scope statement is active baseline warning state only, not full repository cleanliness.

## 2026-06-19 21:02:08 CST

- Task: implement `G28_ORGANIZATION_INTERVENTION_EXPERIMENTS`.
- Scope inspected: G27-S1 memory event `G27-S1-771a58b`, `src/sim/orgScenarioRunner.ts`, `src/sim/orgStudyArtifactSeal.ts`, `src/data/orgStudyOrders.ts`, `src/data/starterOrg.ts`, and G27 verification artifacts.
- Work contract: deterministic research-runner intervention study only; no UI, no Ollama, no Runtime Lab, no main gameplay pipeline change, and no real-world organization claim.
- Design decision: G28 uses one representative order per complexity class and six interventions for a 144-run MVP: `8 seeds x 3 representative orders x 6 interventions`.
- Design decision: G28 applies deterministic intervention transforms to the matching G27 hierarchical baseline study record instead of changing the G26/G27 core runner.
- Added data definitions: `src/data/orgInterventions.ts`.
- Added study implementation: `src/sim/orgInterventionStudy.ts`.
- Added generator: `scripts/generateG28Artifacts.ts`.
- Added tests: `tests/sim/orgInterventionStudy.test.ts`, including matrix shape, baseline linkage, delta recomputation, intervention effect, risk semantics, aggregate, ranking, and artifact checks.
- Generated artifacts: `ORG_INTERVENTION_MATRIX.json`, `INTERVENTION_AGGREGATES.json`, `INTERVENTION_DELTA_REPORT.json`, `INTERVENTION_BY_ORDER_COMPLEXITY.json`, `INTERVENTION_RANKING.json`, `BASELINE_LINKAGE_TO_G27.md`, `INTERVENTION_RISK_SEMANTICS.md`, `INTERVENTION_FINDINGS.md`, `NON_CLAIMS.md`, `TEST_OUTPUT.txt`, and `BUILD_OUTPUT.txt`.
- Validation: focused G28 test PASS with 14 tests; `npm run test` PASS with 47 test files passed, 389 tests passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with chunk-size warning.
- G28 source-only Ollama/network scan: PASS; no `ollama`, `AGENT_FOUNDRY_ENABLE_OLLAMA`, or `fetch(` references in G28 source/test/generator files.
- Hygiene command before staging: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Hygiene result before staging: PASS with no warnings; note that untracked `verification/G28/` was skipped as a directory, so staged hygiene must be rerun before close.
- Staged hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Staged hygiene result: PASS with no warnings; scanned G28 source, tests, scripts, and `verification/G28` artifact files.

## 2026-06-19 22:51:00 CST

- Task: implement `G29_ORG_STUDY_UI_AND_RESEARCH_DASHBOARD`.
- Scope inspected: `src/App.tsx`, existing UI components/styles, G27/G28 verification artifacts, existing UI tests, and current `.codex` records.
- Work contract: read-only Research Dashboard only; no new organization simulation logic, no G27/G28 result changes, no main gameplay pipeline replacement, no Ollama, no external APIs, no Runtime Lab, and no real-world organization claim.
- Design decision: use compact static TypeScript summaries in `src/data/orgStudySummaries.ts` instead of browser-side external fetches or raw matrix bundling.
- Added UI: `src/ui/ResearchDashboard.tsx`.
- Updated navigation: `src/App.tsx` now includes a `Research` tab that renders the read-only dashboard.
- Added tests: `tests/data/orgStudySummaries.test.ts` and `tests/ui/ResearchDashboard.test.tsx`.
- Generated artifacts: `G29_ORG_STUDY_UI.md`, `RESEARCH_DASHBOARD_SCREENFLOW.md`, `G27_G28_DATA_PROVENANCE.md`, `RISK_SEMANTICS_UI_RECHECK.md`, `READ_ONLY_BOUNDARY_RECHECK.md`, `NON_CLAIMS.md`, `TEST_OUTPUT.txt`, and `BUILD_OUTPUT.txt`.
- Validation: focused G29 tests PASS with 2 test files and 8 tests; `npm run test` PASS with 49 test files passed, 397 tests passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with the existing chunk-size warning.
- G29 source/data/test boundary scan: PASS; no `applyPlayerAction`, `onDispatch`, `setState`, `fetch(`, `ollama`, `AGENT_FOUNDRY_ENABLE_OLLAMA`, `PlayerAction`, or `GameState` references in the G29 source/data/test path.
- Non-claims preserved: deterministic simulator summaries only; no real organization proof, no real AI agents, no Runtime Lab validation, no production governance claim, and no claim that hierarchy or a G28 intervention is generally better in real organizations.
- Hygiene command before staging: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Hygiene result before staging: PASS, but untracked `tests/data` and `verification/G29` directories were skipped as directories.
- Staged hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Staged hygiene result: PASS with no skipped paths; scanned G29 source, tests, evidence artifacts, and `.codex` records.

## 2026-06-20 15:40:51 CST

- Task: implement `G30_ORG_POLICY_SEARCH`.
- Scope inspected: G27/G28 organization study code, `src/data/orgStudyOrders.ts`, `src/data/orgInterventions.ts`, `src/sim/orgInterventionStudy.ts`, `src/sim/orgMultiSeedStudy.ts`, `src/sim/orgStudyArtifactSeal.ts`, G28 artifact generator, G28 tests, G29 evidence records, and local repository guidance.
- Project memory recall: no matching graph-memory events were returned for G27-S1 through G29, so local `.codex` records and repository artifacts were used as the verified evidence source.
- Work contract: deterministic policy search runner only; no UI, no new real LLM agents, no Ollama, no Runtime Lab, no main gameplay pipeline change, no public demo gameplay behavior change, and no real-world organization conclusion.
- TDD evidence: focused G30 tests were written first and initially failed because `src/data/orgPolicyConfigs.ts`, `src/sim/orgPolicySearch.ts`, and `src/sim/paretoFrontier.ts` did not exist.
- Added policy definitions: `src/data/orgPolicyConfigs.ts` with 12 curated policies and 5 scoring objectives.
- Added Pareto logic: `src/sim/paretoFrontier.ts` with dominance and frontier computation.
- Added policy search runner: `src/sim/orgPolicySearch.ts`, producing a 288-run matrix and derived aggregate/ranking/Pareto artifacts.
- Added generator: `scripts/generateG30Artifacts.ts`.
- Added tests: `tests/sim/orgPolicySearch.test.ts` and `tests/sim/paretoFrontier.test.ts`.
- Generated artifacts: `ORG_POLICY_SEARCH_MATRIX.json`, `POLICY_AGGREGATES.json`, `PARETO_FRONTIER.json`, `POLICY_RANKING_BY_OBJECTIVE.json`, `POLICY_BY_ORDER_COMPLEXITY.json`, `AGGREGATE_RECOMPUTE_CHECK.json`, `G30_ORG_POLICY_SEARCH.md`, `POLICY_SENSITIVITY_REPORT.md`, `SEARCH_SPACE.md`, `SCORING_POLICY.md`, `BASELINE_LINKAGE_TO_G28.md`, `NON_CLAIMS.md`, `TEST_OUTPUT.txt`, and `BUILD_OUTPUT.txt`.
- Artifact evidence: `ORG_POLICY_SEARCH_MATRIX.json` has 288 runs, 12 policies, 8 seeds, 3 order classes, 5 objectives, and `AGGREGATE_RECOMPUTE_CHECK.json` reports PASS.
- Validation: focused G30 tests PASS with 2 test files and 13 tests; `npm run test` PASS with 51 test files passed, 410 tests passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with the existing chunk-size warning.
- G30 runtime/source boundary scan: PASS; no `fetch(`, `AGENT_FOUNDRY_ENABLE_OLLAMA`, AI import, or `ollama` reference in `src/data/orgPolicyConfigs.ts`, `src/sim/orgPolicySearch.ts`, or `src/sim/paretoFrontier.ts`; the artifact generator has no `fetch(` or Ollama environment switch.
- Non-claims preserved: deterministic simulator policy search only; no single best real-world organization policy, no real AI agents, no Runtime Lab validation, no public demo gameplay change, and detected overclaim findings remain a detection metric.
- Hygiene command before staging: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Hygiene result before staging: PASS, but untracked `verification/G30` was skipped as a directory.
- Staged hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Staged hygiene result: PASS with no skipped paths; scanned G30 source, tests, generator, evidence artifacts, and `.codex` records.
