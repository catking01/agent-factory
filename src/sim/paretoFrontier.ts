export interface ParetoScores {
  qualityScore: number
  riskReductionScore: number
  speedScore: number
  coordinationEfficiencyScore: number
}

export interface ParetoPoint {
  id: string
  scores: ParetoScores
}

export interface DominancePair {
  dominatorPolicyId: string
  dominatedPolicyId: string
}

export interface ParetoFrontierResult {
  frontierPolicyIds: string[]
  dominatedPolicyIds: string[]
  dominancePairs: DominancePair[]
  objectiveDimensions: Array<keyof ParetoScores>
}

const OBJECTIVE_DIMENSIONS: Array<keyof ParetoScores> = [
  'qualityScore',
  'riskReductionScore',
  'speedScore',
  'coordinationEfficiencyScore',
]

export function dominates(a: ParetoPoint, b: ParetoPoint): boolean {
  if (a.id === b.id) return false

  const allAtLeastEqual = OBJECTIVE_DIMENSIONS.every((dimension) => a.scores[dimension] >= b.scores[dimension])
  const oneStrictlyBetter = OBJECTIVE_DIMENSIONS.some((dimension) => a.scores[dimension] > b.scores[dimension])
  return allAtLeastEqual && oneStrictlyBetter
}

export function computeParetoFrontier(points: ParetoPoint[]): ParetoFrontierResult {
  const dominancePairs: DominancePair[] = []
  const dominated = new Set<string>()

  for (const candidate of points) {
    for (const challenger of points) {
      if (dominates(challenger, candidate)) {
        dominated.add(candidate.id)
        dominancePairs.push({
          dominatorPolicyId: challenger.id,
          dominatedPolicyId: candidate.id,
        })
      }
    }
  }

  return {
    frontierPolicyIds: points
      .filter((point) => !dominated.has(point.id))
      .map((point) => point.id),
    dominatedPolicyIds: points
      .filter((point) => dominated.has(point.id))
      .map((point) => point.id),
    dominancePairs,
    objectiveDimensions: [...OBJECTIVE_DIMENSIONS],
  }
}
