import { readFileSync } from 'node:fs'
import { describe, expect, it, beforeAll } from 'vitest'
import {
  G30_POLICY_CONFIGS,
  G30_POLICY_OBJECTIVES,
  G30_TOTAL_RUNS,
} from '../../src/data/orgPolicyConfigs'
import { STUDY_SEEDS } from '../../src/data/orgStudyOrders'
import {
  buildG30Artifacts,
  filterPolicyRuns,
  runOrgPolicySearch,
  type OrgPolicySearchMatrix,
} from '../../src/sim/orgPolicySearch'

let matrix: OrgPolicySearchMatrix

beforeAll(() => {
  matrix = runOrgPolicySearch()
})

describe('G30 Policy Configs', () => {
  it('defines unique policy ids', () => {
    const ids = G30_POLICY_CONFIGS.map((policy) => policy.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('baseline_hierarchical')
    expect(ids).toContain('risk_averse_org')
  })
})

describe('G30 Policy Search Matrix', () => {
  it('has expected total runs: 12 policies x 8 seeds x 3 orders = 288', () => {
    expect(matrix.meta.expectedRuns).toBe(G30_TOTAL_RUNS)
    expect(matrix.meta.totalRuns).toBe(288)
    expect(matrix.runs.length).toBe(288)
  })

  it('covers all policies, seeds, and order classes', () => {
    expect(new Set(matrix.runs.map((run) => run.policyId))).toEqual(new Set(G30_POLICY_CONFIGS.map((policy) => policy.id)))
    expect(new Set(matrix.runs.map((run) => run.seed))).toEqual(new Set(STUDY_SEEDS))
    expect(new Set(matrix.runs.map((run) => run.orderClass))).toEqual(new Set(['simple', 'medium', 'complex']))
  })

  it('is deterministic for the same policy, seed, and order class', () => {
    const first = runOrgPolicySearch().runs.find((run) => (
      run.policyId === 'balanced_org' &&
      run.seed === 42 &&
      run.orderClass === 'complex'
    ))
    const second = runOrgPolicySearch().runs.find((run) => (
      run.policyId === 'balanced_org' &&
      run.seed === 42 &&
      run.orderClass === 'complex'
    ))

    expect(second).toEqual(first)
  })
})

describe('G30 Policy Aggregates And Scores', () => {
  it('aggregate means recompute from raw matrix', () => {
    for (const aggregate of matrix.aggregates.byPolicy) {
      const runs = filterPolicyRuns(matrix, aggregate.key)
      const recomputedQuality = mean(runs.map((run) => run.finalQuality))
      const recomputedCoordination = mean(runs.map((run) => run.coordinationCost))

      expect(aggregate.stats.finalQuality.mean).toBeCloseTo(recomputedQuality, 5)
      expect(aggregate.stats.coordinationCost.mean).toBeCloseTo(recomputedCoordination, 5)
    }
  })

  it('objective rankings exist and are non-empty', () => {
    for (const objective of G30_POLICY_OBJECTIVES) {
      expect(matrix.rankingByObjective[objective].length).toBe(G30_POLICY_CONFIGS.length)
      expect(matrix.rankingByObjective[objective][0].policyId).toBeTruthy()
      expect(Number.isFinite(matrix.rankingByObjective[objective][0].score)).toBe(true)
    }
  })

  it('adds all objective scores to each raw run', () => {
    const run = matrix.runs[0]

    expect(Number.isFinite(run.speedScore)).toBe(true)
    expect(Number.isFinite(run.qualityScore)).toBe(true)
    expect(Number.isFinite(run.riskReductionScore)).toBe(true)
    expect(Number.isFinite(run.coordinationEfficiencyScore)).toBe(true)
    expect(Number.isFinite(run.balancedScore)).toBe(true)
  })
})

describe('G30 Pareto Frontier', () => {
  it('contains at least one policy and no policy dominates itself', () => {
    expect(matrix.pareto.frontierPolicyIds.length).toBeGreaterThan(0)

    for (const pair of matrix.pareto.dominancePairs) {
      expect(pair.dominatorPolicyId).not.toBe(pair.dominatedPolicyId)
    }
  })
})

describe('G30 Artifacts', () => {
  it('builds required machine-readable artifacts', () => {
    const artifacts = buildG30Artifacts(matrix, '2026-06-20T00:00:00.000Z')

    expect(artifacts.raw.runs.length).toBe(288)
    expect(artifacts.aggregates.byPolicy.length).toBe(G30_POLICY_CONFIGS.length)
    expect(artifacts.rankingByObjective.speed.length).toBe(G30_POLICY_CONFIGS.length)
    expect(artifacts.pareto.frontierPolicyIds.length).toBeGreaterThan(0)
    expect(artifacts.byOrderComplexity.classes.length).toBe(G30_POLICY_CONFIGS.length * 3)
    expect(artifacts.recomputeCheck.verdict).toBe('PASS')
  })

  it('preserves detected findings as detection metric semantics', () => {
    expect(matrix.meta.riskSemantics.detectedOverclaimFindings).toContain('DETECTION')
    expect(matrix.meta.riskSemantics.latentRiskEstimate).toContain('EXPOSURE')
    expect(matrix.runs.some((run) => run.detectedOverclaimFindings !== run.latentRiskEstimate)).toBe(true)
  })

  it('does not import Ollama or fetch external data in the policy search path', () => {
    const runtimeSource = [
      'src/data/orgPolicyConfigs.ts',
      'src/sim/orgPolicySearch.ts',
      'src/sim/paretoFrontier.ts',
    ].map((path) => readFileSync(path, 'utf8')).join('\n')
    const generatorSource = readFileSync('scripts/generateG30Artifacts.ts', 'utf8')

    expect(runtimeSource).not.toMatch(/ollama/i)
    expect(runtimeSource).not.toContain('fetch(')
    expect(runtimeSource).not.toContain('AGENT_FOUNDRY_ENABLE_OLLAMA')
    expect(generatorSource).not.toContain('fetch(')
    expect(generatorSource).not.toContain('AGENT_FOUNDRY_ENABLE_OLLAMA')
  })
})

function mean(values: number[]): number {
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100
}
