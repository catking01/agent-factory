import {
  G30_POLICY_CONFIGS,
  G30_POLICY_OBJECTIVES,
  G30_STUDY_ORDERS,
  G30_TOTAL_RUNS,
  type OrgPolicyConfig,
  type OrgPolicyId,
  type PolicyObjective,
} from '../data/orgPolicyConfigs'
import { STUDY_SEEDS } from '../data/orgStudyOrders'
import type { OrgStudyOrder, StudyMode } from '../data/orgStudyOrders'
import { runFlatOrgScenario, runHierarchicalOrgScenario } from './orgScenarioRunner'
import type { OrgRunResult } from './orgModel'
import { round2 } from './orgMultiSeedStudy'
import { computeParetoFrontier, type ParetoFrontierResult, type ParetoPoint } from './paretoFrontier'

export interface OrgPolicyRunRecord {
  runId: string
  policyId: OrgPolicyId
  policyLabel: string
  seed: number
  orderClass: 'simple' | 'medium' | 'complex'
  orderInstanceId: string
  orderTitle: string
  orderComplexity: number
  mode: StudyMode
  deliveryTicks: number
  finalQuality: number
  finalEvidenceStrength: number
  finalClaimLevel: number
  claimEvidenceGap: number
  detectedOverclaimFindings: number
  latentRiskEstimate: number
  undetectedOverclaimExposure: number
  auditCoverageRate: number
  coordinationCost: number
  handoffCount: number
  fanoutCount: number
  subtaskCount: number
  mergeDelay: number
  leadUtilization: number
  workerUtilization: number
  parallelWaste: number
  riskAdjustedQuality: number
  coordinationEfficiency: number
  qualityPerTick: number
  evidencePerTick: number
  speedScore: number
  qualityScore: number
  riskReductionScore: number
  coordinationEfficiencyScore: number
  balancedScore: number
  policyEffectNote: string
}

export interface PolicyStats {
  mean: number
  min: number
  max: number
  std: number
  count: number
}

export interface PolicyAggregateGroup {
  key: string
  count: number
  stats: Record<string, PolicyStats>
}

export interface PolicyRankingEntry {
  policyId: OrgPolicyId
  rank: number
  score: number
  runCount: number
}

export type PolicyRankingByObjective = Record<PolicyObjective, PolicyRankingEntry[]>

export interface OrgPolicySearchMatrix {
  meta: {
    milestone: 'G30'
    baselineMilestone: 'G28'
    totalRuns: number
    expectedRuns: number
    seeds: number[]
    orderClasses: string[]
    orderInstancesPerClass: number
    policyIds: OrgPolicyId[]
    objectives: PolicyObjective[]
    shape: string
    scoringPolicy: Record<string, string>
    riskSemantics: {
      detectedOverclaimFindings: string
      latentRiskEstimate: string
      undetectedOverclaimExposure: string
      auditCoverageRate: string
    }
  }
  policies: OrgPolicyConfig[]
  runs: OrgPolicyRunRecord[]
  aggregates: {
    byPolicy: PolicyAggregateGroup[]
    byPolicyAndOrderClass: PolicyAggregateGroup[]
  }
  rankingByObjective: PolicyRankingByObjective
  pareto: ParetoFrontierResult
}

export interface G30Artifacts {
  raw: OrgPolicySearchMatrix & { generatedAt: string }
  aggregates: {
    source: string
    byPolicy: PolicyAggregateGroup[]
    byPolicyAndOrderClass: PolicyAggregateGroup[]
  }
  pareto: ParetoFrontierResult & {
    source: string
    policyScores: ParetoPoint[]
  }
  rankingByObjective: PolicyRankingByObjective
  byOrderComplexity: {
    source: string
    classes: Array<{
      orderClass: string
      policyId: OrgPolicyId
      runCount: number
      meanFinalQuality: number
      meanLatentRiskEstimate: number
      meanCoordinationCost: number
      meanDeliveryTicks: number
      meanRiskAdjustedQuality: number
      meanBalancedScore: number
    }>
  }
  recomputeCheck: {
    source: string
    checks: Array<{
      name: string
      passed: boolean
      expected: number | string | string[] | number[]
      actual: number | string | string[] | number[]
    }>
    verdict: 'PASS' | 'FAIL'
  }
}

const NUMERIC_FIELDS: Array<keyof OrgPolicyRunRecord> = [
  'seed',
  'orderComplexity',
  'deliveryTicks',
  'finalQuality',
  'finalEvidenceStrength',
  'finalClaimLevel',
  'claimEvidenceGap',
  'detectedOverclaimFindings',
  'latentRiskEstimate',
  'undetectedOverclaimExposure',
  'auditCoverageRate',
  'coordinationCost',
  'handoffCount',
  'fanoutCount',
  'subtaskCount',
  'mergeDelay',
  'leadUtilization',
  'workerUtilization',
  'parallelWaste',
  'riskAdjustedQuality',
  'coordinationEfficiency',
  'qualityPerTick',
  'evidencePerTick',
  'speedScore',
  'qualityScore',
  'riskReductionScore',
  'coordinationEfficiencyScore',
  'balancedScore',
]

export function runOrgPolicySearch(): OrgPolicySearchMatrix {
  const runs: OrgPolicyRunRecord[] = []

  for (const seed of STUDY_SEEDS) {
    for (const order of G30_STUDY_ORDERS) {
      for (const policy of G30_POLICY_CONFIGS) {
        runs.push(runPolicyScenario(seed, order, policy))
      }
    }
  }

  const aggregates = {
    byPolicy: groupRuns(runs, (run) => run.policyId),
    byPolicyAndOrderClass: groupRuns(runs, (run) => `${run.policyId}:${run.orderClass}`),
  }
  const rankingByObjective = rankPolicies(runs)
  const pareto = computeParetoFrontier(buildParetoPoints(runs))

  return {
    meta: {
      milestone: 'G30',
      baselineMilestone: 'G28',
      totalRuns: runs.length,
      expectedRuns: G30_TOTAL_RUNS,
      seeds: [...STUDY_SEEDS],
      orderClasses: ['simple', 'medium', 'complex'],
      orderInstancesPerClass: 1,
      policyIds: G30_POLICY_CONFIGS.map((policy) => policy.id),
      objectives: [...G30_POLICY_OBJECTIVES],
      shape: '12 policies x 8 seeds x 3 representative orders = 288 runs',
      scoringPolicy: {
        speedScore: '-deliveryTicks',
        qualityScore: 'finalQuality + finalEvidenceStrength * 0.5',
        riskReductionScore: '-latentRiskEstimate - undetectedOverclaimExposure',
        coordinationEfficiencyScore: 'riskAdjustedQuality / max(1, coordinationCost)',
        balancedScore: 'riskAdjustedQuality + finalEvidenceStrength * 0.5 - deliveryTicks * 0.1 - coordinationCost * 0.05',
      },
      riskSemantics: {
        detectedOverclaimFindings: 'DETECTION metric: findings surfaced by deterministic audit coverage, not actual generated risk.',
        latentRiskEstimate: 'EXPOSURE metric: estimated hidden risk used for risk comparison.',
        undetectedOverclaimExposure: 'Derived proxy: latentRiskEstimate x (1 - auditCoverageRate).',
        auditCoverageRate: 'Deterministic structural coverage proxy used only inside study artifacts.',
      },
    },
    policies: G30_POLICY_CONFIGS,
    runs,
    aggregates,
    rankingByObjective,
    pareto,
  }
}

export function filterPolicyRuns(matrix: OrgPolicySearchMatrix, policyId: OrgPolicyId | string): OrgPolicyRunRecord[] {
  return matrix.runs.filter((run) => run.policyId === policyId)
}

export function buildG30Artifacts(matrix: OrgPolicySearchMatrix, generatedAt: string): G30Artifacts {
  return {
    raw: {
      ...matrix,
      generatedAt,
    },
    aggregates: {
      source: 'verification/G30/ORG_POLICY_SEARCH_MATRIX.json',
      byPolicy: matrix.aggregates.byPolicy,
      byPolicyAndOrderClass: matrix.aggregates.byPolicyAndOrderClass,
    },
    pareto: {
      source: 'verification/G30/ORG_POLICY_SEARCH_MATRIX.json',
      policyScores: buildParetoPoints(matrix.runs),
      ...matrix.pareto,
    },
    rankingByObjective: matrix.rankingByObjective,
    byOrderComplexity: buildByOrderComplexity(matrix),
    recomputeCheck: buildRecomputeCheck(matrix),
  }
}

function runPolicyScenario(seed: number, order: OrgStudyOrder, policy: OrgPolicyConfig): OrgPolicyRunRecord {
  const result = policy.mode === 'flat'
    ? runFlatOrgScenario(seed, {
      id: order.id,
      title: order.title,
      complexity: order.complexity,
    })
    : runHierarchicalOrgScenario(seed, {
      id: order.id,
      title: order.title,
      complexity: order.complexity,
    })

  return finalizePolicyRecord(applyPolicyConfig(toPolicyBaseRecord(seed, order, policy, result), policy), policy)
}

function toPolicyBaseRecord(
  seed: number,
  order: OrgStudyOrder,
  policy: OrgPolicyConfig,
  result: OrgRunResult
): OrgPolicyRunRecord {
  const quality = result.metrics.finalQuality ?? 0
  const evidence = result.metrics.finalEvidenceStrength ?? 0
  const claim = result.metrics.finalClaimLevel ?? 0
  const latentRisk = result.metrics.latentRiskEstimate
  const auditCoverageRate = estimateAuditCoverage(result, policy.mode)

  return {
    runId: `g30-${seed}-${order.id}-${policy.id}`,
    policyId: policy.id,
    policyLabel: policy.label,
    seed,
    orderClass: order.class,
    orderInstanceId: order.id,
    orderTitle: order.title,
    orderComplexity: order.complexity,
    mode: policy.mode,
    deliveryTicks: result.metrics.totalTicks,
    finalQuality: quality,
    finalEvidenceStrength: evidence,
    finalClaimLevel: claim,
    claimEvidenceGap: round2(claim - evidence),
    detectedOverclaimFindings: result.metrics.detectedOverclaimFindings,
    latentRiskEstimate: latentRisk,
    undetectedOverclaimExposure: round2(latentRisk * (1 - auditCoverageRate)),
    auditCoverageRate,
    coordinationCost: result.metrics.coordinationCost,
    handoffCount: result.metrics.handoffCount,
    fanoutCount: result.metrics.fanoutCount,
    subtaskCount: result.metrics.subtaskCount,
    mergeDelay: result.metrics.mergeDelay,
    leadUtilization: result.metrics.leadUtilization,
    workerUtilization: result.metrics.workerUtilization,
    parallelWaste: result.metrics.parallelWaste,
    riskAdjustedQuality: round2(quality - latentRisk),
    coordinationEfficiency: 0,
    qualityPerTick: 0,
    evidencePerTick: 0,
    speedScore: 0,
    qualityScore: 0,
    riskReductionScore: 0,
    coordinationEfficiencyScore: 0,
    balancedScore: 0,
    policyEffectNote: policy.description,
  }
}

function applyPolicyConfig(record: OrgPolicyRunRecord, policy: OrgPolicyConfig): OrgPolicyRunRecord {
  const adjusted = { ...record }
  const complexityFactor = adjusted.orderComplexity / 10
  const extraWorkers = policy.workerCount - 4
  const extraLeads = policy.cellLeadCount - 1
  const spanPressure = policy.spanOfControl <= 3 ? -1 : policy.spanOfControl >= 6 ? 1 : 0
  const fanoutMultiplier = policy.fanoutStrategy === 'aggressive' ? 1 : policy.fanoutStrategy === 'conservative' ? -1 : 0

  adjusted.finalQuality = clamp10(
    adjusted.finalQuality +
    policy.mergeJudgmentBonus * (0.75 + complexityFactor) +
    policy.validationStrictnessBonus * 0.25 +
    Math.max(0, extraWorkers) * 0.15 * complexityFactor +
    Math.max(0, extraLeads) * 0.1
  )
  adjusted.finalEvidenceStrength = clamp10(
    adjusted.finalEvidenceStrength +
    policy.auditCoverageBonus * 0.45 +
    policy.validationStrictnessBonus * 0.5 +
    policy.handoffClarityBonus * 0.2
  )
  adjusted.finalClaimLevel = clamp10(
    adjusted.finalClaimLevel +
    policy.mergeJudgmentBonus * 0.1 -
    policy.validationStrictnessBonus * 0.2 -
    policy.auditCoverageBonus * 0.1
  )
  adjusted.latentRiskEstimate = nonNegative(
    adjusted.latentRiskEstimate -
    policy.auditCoverageBonus * (0.85 + complexityFactor) -
    policy.validationStrictnessBonus * 0.55 -
    policy.handoffClarityBonus * 0.25 -
    Math.max(0, extraLeads) * 0.25 +
    Math.max(0, extraWorkers) * 0.05 +
    (policy.riskTolerance === 'high' ? 0.45 : policy.riskTolerance === 'low' ? -0.35 : 0) +
    (spanPressure > 0 ? 0.25 : -0.1)
  )
  adjusted.auditCoverageRate = clampUnit(
    adjusted.auditCoverageRate +
    policy.auditCoverageBonus * 0.25 +
    policy.validationStrictnessBonus * 0.08 +
    policy.handoffClarityBonus * 0.05 +
    Math.max(0, extraLeads) * 0.05
  )

  if (policy.auditCoverageBonus > 0.4 || policy.riskTolerance === 'low') {
    adjusted.detectedOverclaimFindings += adjusted.latentRiskEstimate > 0 ? 1 : 0
  }

  adjusted.fanoutCount = Math.max(0, adjusted.fanoutCount + fanoutMultiplier)
  adjusted.subtaskCount = Math.max(1, adjusted.subtaskCount + fanoutMultiplier + Math.max(0, extraWorkers))
  adjusted.handoffCount = Math.max(0, adjusted.handoffCount + Math.max(0, extraLeads) + Math.max(0, fanoutMultiplier))
  adjusted.mergeDelay = Math.max(0, adjusted.mergeDelay + Math.ceil(policy.mergeJudgmentBonus) + Math.max(0, extraLeads))

  const workerTickReduction = adjusted.orderClass === 'simple' ? 0 : Math.max(0, extraWorkers)
  const handoffTickReduction = Math.round(policy.handoffClarityBonus)
  const riskStrictnessTicks = policy.riskTolerance === 'low' ? 1 : 0
  adjusted.deliveryTicks = Math.max(
    1,
    adjusted.deliveryTicks - workerTickReduction - handoffTickReduction + riskStrictnessTicks + Math.max(0, fanoutMultiplier)
  )

  const rawCoordinationCost = (
    adjusted.coordinationCost +
    policy.mergeJudgmentBonus * 1.4 +
    policy.auditCoverageBonus * 2 +
    policy.validationStrictnessBonus * 1.2 +
    Math.max(0, extraLeads) * 2 +
    Math.max(0, extraWorkers) * 0.6 +
    Math.max(0, fanoutMultiplier) * 1.5 -
    policy.handoffClarityBonus * 1.8 -
    (policy.riskTolerance === 'high' ? 0.5 : 0)
  )
  adjusted.coordinationCost = nonNegative(rawCoordinationCost * policy.coordinationCostMultiplier)

  adjusted.leadUtilization = clamp10(
    adjusted.leadUtilization +
    policy.mergeJudgmentBonus * 0.08 +
    policy.auditCoverageBonus * 0.05 -
    Math.max(0, extraLeads) * 0.15
  )
  adjusted.workerUtilization = clamp10(
    adjusted.workerUtilization +
    Math.max(0, extraWorkers) * 0.05 -
    Math.max(0, extraLeads) * 0.02
  )
  adjusted.parallelWaste = nonNegative(
    adjusted.parallelWaste +
    Math.max(0, extraWorkers) * 0.25 +
    Math.max(0, fanoutMultiplier) * 0.35 -
    policy.handoffClarityBonus * 0.25 -
    Math.max(0, extraLeads) * 0.15
  )

  return adjusted
}

function finalizePolicyRecord(record: OrgPolicyRunRecord, policy: OrgPolicyConfig): OrgPolicyRunRecord {
  record.finalQuality = round2(record.finalQuality)
  record.finalEvidenceStrength = round2(record.finalEvidenceStrength)
  record.finalClaimLevel = round2(record.finalClaimLevel)
  record.claimEvidenceGap = round2(record.finalClaimLevel - record.finalEvidenceStrength)
  record.latentRiskEstimate = round2(record.latentRiskEstimate)
  record.auditCoverageRate = round2(record.auditCoverageRate)
  record.undetectedOverclaimExposure = round2(record.latentRiskEstimate * (1 - record.auditCoverageRate))
  record.coordinationCost = round2(record.coordinationCost)
  record.riskAdjustedQuality = round2(record.finalQuality - record.latentRiskEstimate)
  record.coordinationEfficiency = round2(record.riskAdjustedQuality / Math.max(1, record.coordinationCost))
  record.qualityPerTick = round2(record.finalQuality / Math.max(1, record.deliveryTicks))
  record.evidencePerTick = round2(record.finalEvidenceStrength / Math.max(1, record.deliveryTicks))
  record.speedScore = round2(-record.deliveryTicks)
  record.qualityScore = round2(record.finalQuality + record.finalEvidenceStrength * 0.5)
  record.riskReductionScore = round2(-record.latentRiskEstimate - record.undetectedOverclaimExposure)
  record.coordinationEfficiencyScore = record.coordinationEfficiency
  record.balancedScore = round2(
    record.riskAdjustedQuality +
    record.finalEvidenceStrength * 0.5 -
    record.deliveryTicks * 0.1 -
    record.coordinationCost * 0.05
  )
  record.policyEffectNote = `${policy.description} Deterministic policy transform only.`
  return record
}

function estimateAuditCoverage(result: OrgRunResult, mode: StudyMode): number {
  const artifacts = Math.max(1, result.metrics.artifactsProduced)
  const structuralReviews = mode === 'flat'
    ? Math.max(1, result.metrics.detectedOverclaimFindings + 1)
    : Math.max(1, result.metrics.fanoutCount + 1)
  return round2(Math.min(1, structuralReviews / artifacts))
}

function groupRuns(
  runs: OrgPolicyRunRecord[],
  getKey: (run: OrgPolicyRunRecord) => string
): PolicyAggregateGroup[] {
  const groups = new Map<string, OrgPolicyRunRecord[]>()
  for (const run of runs) {
    const key = getKey(run)
    const group = groups.get(key) ?? []
    group.push(run)
    groups.set(key, group)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, group]) => ({
      key,
      count: group.length,
      stats: computeStats(group),
    }))
}

function computeStats(runs: OrgPolicyRunRecord[]): Record<string, PolicyStats> {
  const stats: Record<string, PolicyStats> = {}
  for (const field of NUMERIC_FIELDS) {
    const values = runs
      .map((run) => run[field])
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    if (values.length > 0) {
      stats[String(field)] = statsFor(values)
    }
  }
  return stats
}

function statsFor(values: number[]): PolicyStats {
  const count = values.length
  const mean = values.reduce((sum, value) => sum + value, 0) / count
  const sorted = [...values].sort((a, b) => a - b)
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / count
  return {
    mean: round2(mean),
    min: round2(sorted[0]),
    max: round2(sorted[sorted.length - 1]),
    std: round2(Math.sqrt(variance)),
    count,
  }
}

function rankPolicies(runs: OrgPolicyRunRecord[]): PolicyRankingByObjective {
  return {
    speed: rankBy(runs, 'speedScore'),
    quality: rankBy(runs, 'qualityScore'),
    risk_reduction: rankBy(runs, 'riskReductionScore'),
    coordination_efficiency: rankBy(runs, 'coordinationEfficiencyScore'),
    balanced: rankBy(runs, 'balancedScore'),
  }
}

function rankBy(
  runs: OrgPolicyRunRecord[],
  scoreField: keyof OrgPolicyRunRecord
): PolicyRankingEntry[] {
  return G30_POLICY_CONFIGS
    .map((policy) => {
      const policyRuns = runs.filter((run) => run.policyId === policy.id)
      return {
        policyId: policy.id,
        rank: 0,
        score: meanNumber(policyRuns, scoreField),
        runCount: policyRuns.length,
      }
    })
    .sort((a, b) => b.score - a.score || a.policyId.localeCompare(b.policyId))
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))
}

function buildParetoPoints(runs: OrgPolicyRunRecord[]): ParetoPoint[] {
  return G30_POLICY_CONFIGS.map((policy) => {
    const policyRuns = runs.filter((run) => run.policyId === policy.id)
    return {
      id: policy.id,
      scores: {
        qualityScore: meanNumber(policyRuns, 'qualityScore'),
        riskReductionScore: meanNumber(policyRuns, 'riskReductionScore'),
        speedScore: meanNumber(policyRuns, 'speedScore'),
        coordinationEfficiencyScore: meanNumber(policyRuns, 'coordinationEfficiencyScore'),
      },
    }
  })
}

function buildByOrderComplexity(matrix: OrgPolicySearchMatrix): G30Artifacts['byOrderComplexity'] {
  const classes = []
  for (const orderClass of ['simple', 'medium', 'complex'] as const) {
    for (const policy of G30_POLICY_CONFIGS) {
      const runs = matrix.runs.filter((run) => run.orderClass === orderClass && run.policyId === policy.id)
      classes.push({
        orderClass,
        policyId: policy.id,
        runCount: runs.length,
        meanFinalQuality: meanNumber(runs, 'finalQuality'),
        meanLatentRiskEstimate: meanNumber(runs, 'latentRiskEstimate'),
        meanCoordinationCost: meanNumber(runs, 'coordinationCost'),
        meanDeliveryTicks: meanNumber(runs, 'deliveryTicks'),
        meanRiskAdjustedQuality: meanNumber(runs, 'riskAdjustedQuality'),
        meanBalancedScore: meanNumber(runs, 'balancedScore'),
      })
    }
  }
  return {
    source: 'verification/G30/ORG_POLICY_SEARCH_MATRIX.json',
    classes,
  }
}

function buildRecomputeCheck(matrix: OrgPolicySearchMatrix): G30Artifacts['recomputeCheck'] {
  const policyIds = [...new Set(matrix.runs.map((run) => run.policyId))].sort()
  const seedValues = [...new Set(matrix.runs.map((run) => run.seed))].sort((a, b) => a - b)
  const orderClasses = [...new Set(matrix.runs.map((run) => run.orderClass))].sort()
  const aggregateFailures = matrix.aggregates.byPolicy.filter((aggregate) => {
    const runs = filterPolicyRuns(matrix, aggregate.key)
    return aggregate.stats.finalQuality.mean !== meanNumber(runs, 'finalQuality') ||
      aggregate.stats.coordinationCost.mean !== meanNumber(runs, 'coordinationCost')
  }).length
  const rankingMissing = G30_POLICY_OBJECTIVES.filter((objective) => matrix.rankingByObjective[objective].length === 0).length
  const checks = [
    {
      name: 'run count matches expected G30 policy matrix',
      passed: matrix.runs.length === matrix.meta.expectedRuns,
      expected: matrix.meta.expectedRuns,
      actual: matrix.runs.length,
    },
    {
      name: 'all policies covered',
      passed: sameStringSet(policyIds, [...matrix.meta.policyIds].sort()),
      expected: [...matrix.meta.policyIds].sort(),
      actual: policyIds,
    },
    {
      name: 'all seeds covered',
      passed: sameNumberSet(seedValues, matrix.meta.seeds),
      expected: matrix.meta.seeds,
      actual: seedValues,
    },
    {
      name: 'all order classes covered',
      passed: sameStringSet(orderClasses, [...matrix.meta.orderClasses].sort()),
      expected: [...matrix.meta.orderClasses].sort(),
      actual: orderClasses,
    },
    {
      name: 'aggregate means recompute from raw matrix',
      passed: aggregateFailures === 0,
      expected: 0,
      actual: aggregateFailures,
    },
    {
      name: 'objective rankings are non-empty',
      passed: rankingMissing === 0,
      expected: 0,
      actual: rankingMissing,
    },
    {
      name: 'pareto frontier exists',
      passed: matrix.pareto.frontierPolicyIds.length > 0,
      expected: 'frontier policies > 0',
      actual: matrix.pareto.frontierPolicyIds.length,
    },
    {
      name: 'detected findings are distinct from latent risk on at least one run',
      passed: matrix.runs.some((run) => run.detectedOverclaimFindings !== run.latentRiskEstimate),
      expected: 'detectedOverclaimFindings is not treated as latentRiskEstimate',
      actual: matrix.runs.some((run) => run.detectedOverclaimFindings !== run.latentRiskEstimate) ? 'distinct' : 'not distinct',
    },
  ]

  return {
    source: 'verification/G30/ORG_POLICY_SEARCH_MATRIX.json',
    checks,
    verdict: checks.every((check) => check.passed) ? 'PASS' : 'FAIL',
  }
}

function meanNumber(runs: OrgPolicyRunRecord[], field: keyof OrgPolicyRunRecord): number {
  const values = runs
    .map((run) => run[field])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (values.length === 0) return 0
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function sameStringSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function sameNumberSet(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function clamp10(value: number): number {
  return round2(Math.max(0, Math.min(10, value)))
}

function clampUnit(value: number): number {
  return round2(Math.max(0, Math.min(1, value)))
}

function nonNegative(value: number): number {
  return round2(Math.max(0, value))
}
