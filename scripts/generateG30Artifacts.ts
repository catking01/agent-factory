import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  buildG30Artifacts,
  runOrgPolicySearch,
  type OrgPolicySearchMatrix,
  type PolicyAggregateGroup,
} from '../src/sim/orgPolicySearch'
import { G30_POLICY_CONFIGS } from '../src/data/orgPolicyConfigs'

const outDir = join(process.cwd(), 'verification', 'G30')
const generatedAt = new Date().toISOString()
const matrix = runOrgPolicySearch()
const artifacts = buildG30Artifacts(matrix, generatedAt)

if (artifacts.recomputeCheck.verdict !== 'PASS') {
  throw new Error('G30 aggregate recompute check failed')
}

mkdirSync(outDir, { recursive: true })

writeJson('ORG_POLICY_SEARCH_MATRIX.json', artifacts.raw)
writeJson('POLICY_AGGREGATES.json', artifacts.aggregates)
writeJson('PARETO_FRONTIER.json', artifacts.pareto)
writeJson('POLICY_RANKING_BY_OBJECTIVE.json', artifacts.rankingByObjective)
writeJson('POLICY_BY_ORDER_COMPLEXITY.json', artifacts.byOrderComplexity)
writeJson('AGGREGATE_RECOMPUTE_CHECK.json', artifacts.recomputeCheck)
writeText('G30_ORG_POLICY_SEARCH.md', mainReport(matrix))
writeText('POLICY_SENSITIVITY_REPORT.md', sensitivityReport(matrix))
writeText('SEARCH_SPACE.md', searchSpace())
writeText('SCORING_POLICY.md', scoringPolicy(matrix))
writeText('BASELINE_LINKAGE_TO_G28.md', baselineLinkage())
writeText('NON_CLAIMS.md', nonClaims())

console.log(`G30 artifacts generated in ${outDir}`)
console.log(`Runs: ${matrix.runs.length}`)
console.log(`Recompute check: ${artifacts.recomputeCheck.verdict}`)
console.log(`Pareto frontier policies: ${matrix.pareto.frontierPolicyIds.join(', ')}`)

function writeJson(fileName: string, value: unknown): void {
  writeFileSync(join(outDir, fileName), `${JSON.stringify(value, null, 2)}\n`)
}

function writeText(fileName: string, value: string): void {
  writeFileSync(join(outDir, fileName), value)
}

function mainReport(matrix: OrgPolicySearchMatrix): string {
  return `# G30: Organization Policy Search

## Study Design

\`\`\`text
Baseline:      G28 deterministic intervention study baseline
Policies:      ${matrix.policies.length}
Seeds:         ${matrix.meta.seeds.length}
Order classes: simple, medium, complex
Orders:        1 representative order per class
Total runs:    ${matrix.runs.length}
\`\`\`

## Matrix Shape

\`\`\`text
12 policies x 8 seeds x 3 representative orders = 288 runs
\`\`\`

## Policy Set

${matrix.policies.map((policy) => `- \`${policy.id}\`: ${policy.description}`).join('\n')}

## Objective Outputs

- Speed ranking
- Quality ranking
- Risk reduction ranking
- Coordination efficiency ranking
- Balanced score ranking
- Pareto frontier over quality, risk reduction, speed, and coordination efficiency

## Current Artifact Verdict

\`\`\`text
machine-readable artifacts: generated
aggregate recompute: ${buildG30Artifacts(matrix, generatedAt).recomputeCheck.verdict}
validation status: see TEST_OUTPUT.txt and BUILD_OUTPUT.txt
\`\`\`

## Boundary

G30 searches deterministic policy transforms inside Agent Foundry's organization simulator. It does not claim a real-world best organization policy.
`
}

function sensitivityReport(matrix: OrgPolicySearchMatrix): string {
  const byPolicy = matrix.aggregates.byPolicy
  return `# G30 Policy Sensitivity Report

## Objective Leaders

- Speed: \`${matrix.rankingByObjective.speed[0].policyId}\`
- Quality: \`${matrix.rankingByObjective.quality[0].policyId}\`
- Risk reduction: \`${matrix.rankingByObjective.risk_reduction[0].policyId}\`
- Coordination efficiency: \`${matrix.rankingByObjective.coordination_efficiency[0].policyId}\`
- Balanced: \`${matrix.rankingByObjective.balanced[0].policyId}\`

## Pareto Frontier

\`\`\`text
${matrix.pareto.frontierPolicyIds.join(', ')}
\`\`\`

## Policy Means

${byPolicy.map(formatAggregate).join('\n')}

## Interpretation Rule

Objective leaders are deterministic simulator outputs. A policy can rank high on one objective and still lose on another. G30 therefore reports the Pareto frontier instead of one universal best policy.
`
}

function formatAggregate(group: PolicyAggregateGroup): string {
  return `- \`${group.key}\`: quality ${stat(group, 'finalQuality')}, latent risk ${stat(group, 'latentRiskEstimate')}, coordination ${stat(group, 'coordinationCost')}, balanced score ${stat(group, 'balancedScore')}`
}

function stat(group: PolicyAggregateGroup, field: string): number {
  return group.stats[field]?.mean ?? 0
}

function searchSpace(): string {
  return `# G30 Search Space

G30 uses a curated deterministic policy set instead of an unbounded factorial search.

## Policies

${G30_POLICY_CONFIGS.map((policy) => `## ${policy.id}

- label: ${policy.label}
- mode: ${policy.mode}
- cellLeadCount: ${policy.cellLeadCount}
- workerCount: ${policy.workerCount}
- spanOfControl: ${policy.spanOfControl}
- fanoutStrategy: ${policy.fanoutStrategy}
- mergeJudgmentBonus: ${policy.mergeJudgmentBonus}
- handoffClarityBonus: ${policy.handoffClarityBonus}
- auditCoverageBonus: ${policy.auditCoverageBonus}
- validationStrictnessBonus: ${policy.validationStrictnessBonus}
- coordinationCostMultiplier: ${policy.coordinationCostMultiplier}
- riskTolerance: ${policy.riskTolerance}
`).join('\n')}

## Matrix

\`\`\`text
12 policies x 8 seeds x 3 representative orders = 288 runs
\`\`\`

The representative orders are the same simple, medium, and complex midpoint orders used by the G28 MVP.
`
}

function scoringPolicy(matrix: OrgPolicySearchMatrix): string {
  return `# G30 Scoring Policy

All objective scores are deterministic transformations of each raw run.

## Formulas

${Object.entries(matrix.meta.scoringPolicy).map(([key, formula]) => `- \`${key}\`: \`${formula}\``).join('\n')}

## Ranking

Each objective ranks policies by the mean score across the 24 runs for that policy:

\`\`\`text
8 seeds x 3 representative orders = 24 policy runs
\`\`\`

## Pareto Frontier

Pareto dominance uses:

- qualityScore
- riskReductionScore
- speedScore
- coordinationEfficiencyScore

A policy dominates another only when it is at least as good on all four dimensions and strictly better on at least one.
`
}

function baselineLinkage(): string {
  return `# G30 Baseline Linkage To G28

G30 keeps \`baseline_hierarchical\` aligned with the G28 deterministic hierarchical baseline shape:

\`\`\`text
8 seeds x 3 representative orders x baseline_hierarchical = 24 baseline runs
\`\`\`

G30 does not rewrite G28 artifacts. It reuses the same deterministic scenario runner and representative order selection, then evaluates additional curated policy transforms.

## G28 Commit

\`\`\`text
ad23f428806018f28631438e30888a51394ed955
\`\`\`

## G29 Commit

\`\`\`text
fba76b3a27c076ea2bf70dc7f4013cf9183d6e23
\`\`\`
`
}

function nonClaims(): string {
  return `# G30 Non-Claims

G30 does not claim:

1. A single best organization policy exists
2. Any policy is better in real organizations
3. Agent Foundry validates real multi-agent organization theory
4. Real AI agents, real supervisors, or live LLM workers were implemented
5. Ollama participates in the core policy search
6. Runtime Lab is integrated or validated
7. Public demo gameplay behavior changed
8. Detected overclaim findings are actual generated risk

G30 is a deterministic policy search inside the Agent Foundry research simulator.
`
}
