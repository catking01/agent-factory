import { describe, expect, it } from 'vitest'
import {
  computeParetoFrontier,
  dominates,
  type ParetoPoint,
} from '../../src/sim/paretoFrontier'

describe('Pareto frontier dominance logic', () => {
  const points: ParetoPoint[] = [
    {
      id: 'balanced',
      scores: {
        qualityScore: 8,
        riskReductionScore: 7,
        speedScore: 6,
        coordinationEfficiencyScore: 6,
      },
    },
    {
      id: 'dominated',
      scores: {
        qualityScore: 7,
        riskReductionScore: 7,
        speedScore: 5,
        coordinationEfficiencyScore: 6,
      },
    },
    {
      id: 'speed_specialist',
      scores: {
        qualityScore: 6,
        riskReductionScore: 5,
        speedScore: 9,
        coordinationEfficiencyScore: 4,
      },
    },
  ]

  it('detects dominance only when all objectives are at least as good and one is better', () => {
    expect(dominates(points[0], points[1])).toBe(true)
    expect(dominates(points[1], points[0])).toBe(false)
    expect(dominates(points[0], points[0])).toBe(false)
    expect(dominates(points[0], points[2])).toBe(false)
  })

  it('returns frontier, dominated policies, and dominance pairs', () => {
    const frontier = computeParetoFrontier(points)

    expect(frontier.frontierPolicyIds).toEqual(['balanced', 'speed_specialist'])
    expect(frontier.dominatedPolicyIds).toEqual(['dominated'])
    expect(frontier.dominancePairs).toContainEqual({
      dominatorPolicyId: 'balanced',
      dominatedPolicyId: 'dominated',
    })
  })
})
