import {
  ORG_STUDY_ORDERS,
  STUDY_SEEDS,
  type OrgStudyOrder,
  type StudyMode,
} from './orgStudyOrders'

export type OrgPolicyId =
  | 'baseline_hierarchical'
  | 'speed_flat_like'
  | 'quality_hierarchy'
  | 'audit_heavy'
  | 'handoff_optimized'
  | 'merge_optimized'
  | 'low_coordination'
  | 'high_fanout'
  | 'extra_worker'
  | 'extra_lead'
  | 'balanced_org'
  | 'risk_averse_org'

export type FanoutStrategy = 'conservative' | 'balanced' | 'aggressive'
export type RiskTolerance = 'low' | 'medium' | 'high'

export type PolicyObjective =
  | 'speed'
  | 'quality'
  | 'risk_reduction'
  | 'coordination_efficiency'
  | 'balanced'

export interface OrgPolicyConfig {
  id: OrgPolicyId
  label: string
  description: string
  mode: StudyMode
  cellLeadCount: number
  workerCount: number
  spanOfControl: number
  fanoutStrategy: FanoutStrategy
  mergeJudgmentBonus: number
  handoffClarityBonus: number
  auditCoverageBonus: number
  validationStrictnessBonus: number
  coordinationCostMultiplier: number
  riskTolerance: RiskTolerance
}

export const G30_POLICY_OBJECTIVES: PolicyObjective[] = [
  'speed',
  'quality',
  'risk_reduction',
  'coordination_efficiency',
  'balanced',
]

export const G30_POLICY_CONFIGS: OrgPolicyConfig[] = [
  {
    id: 'baseline_hierarchical',
    label: 'Baseline hierarchical',
    description: 'G28-linked hierarchical baseline with no policy adjustment.',
    mode: 'hierarchical',
    cellLeadCount: 1,
    workerCount: 4,
    spanOfControl: 4,
    fanoutStrategy: 'balanced',
    mergeJudgmentBonus: 0,
    handoffClarityBonus: 0,
    auditCoverageBonus: 0,
    validationStrictnessBonus: 0,
    coordinationCostMultiplier: 1,
    riskTolerance: 'medium',
  },
  {
    id: 'speed_flat_like',
    label: 'Speed flat-like',
    description: 'Flat-mode policy optimized for delivery speed and low coordination.',
    mode: 'flat',
    cellLeadCount: 0,
    workerCount: 3,
    spanOfControl: 6,
    fanoutStrategy: 'conservative',
    mergeJudgmentBonus: 0,
    handoffClarityBonus: 0.25,
    auditCoverageBonus: 0,
    validationStrictnessBonus: 0,
    coordinationCostMultiplier: 0.5,
    riskTolerance: 'high',
  },
  {
    id: 'quality_hierarchy',
    label: 'Quality hierarchy',
    description: 'Hierarchical policy with stronger merge judgment and validation.',
    mode: 'hierarchical',
    cellLeadCount: 1,
    workerCount: 4,
    spanOfControl: 4,
    fanoutStrategy: 'balanced',
    mergeJudgmentBonus: 0.75,
    handoffClarityBonus: 0.1,
    auditCoverageBonus: 0.1,
    validationStrictnessBonus: 0.3,
    coordinationCostMultiplier: 1.15,
    riskTolerance: 'medium',
  },
  {
    id: 'audit_heavy',
    label: 'Audit heavy',
    description: 'Policy that spends coordination budget on audit coverage and validation.',
    mode: 'hierarchical',
    cellLeadCount: 1,
    workerCount: 4,
    spanOfControl: 3,
    fanoutStrategy: 'balanced',
    mergeJudgmentBonus: 0.2,
    handoffClarityBonus: 0.05,
    auditCoverageBonus: 0.8,
    validationStrictnessBonus: 0.45,
    coordinationCostMultiplier: 1.25,
    riskTolerance: 'low',
  },
  {
    id: 'handoff_optimized',
    label: 'Handoff optimized',
    description: 'Policy emphasizing clearer handoffs and lower coordination drag.',
    mode: 'hierarchical',
    cellLeadCount: 1,
    workerCount: 4,
    spanOfControl: 4,
    fanoutStrategy: 'balanced',
    mergeJudgmentBonus: 0.1,
    handoffClarityBonus: 0.85,
    auditCoverageBonus: 0.05,
    validationStrictnessBonus: 0.1,
    coordinationCostMultiplier: 0.75,
    riskTolerance: 'medium',
  },
  {
    id: 'merge_optimized',
    label: 'Merge optimized',
    description: 'Policy emphasizing lead selection and final artifact merge quality.',
    mode: 'hierarchical',
    cellLeadCount: 1,
    workerCount: 4,
    spanOfControl: 4,
    fanoutStrategy: 'balanced',
    mergeJudgmentBonus: 0.9,
    handoffClarityBonus: 0.15,
    auditCoverageBonus: 0.1,
    validationStrictnessBonus: 0.2,
    coordinationCostMultiplier: 1.1,
    riskTolerance: 'medium',
  },
  {
    id: 'low_coordination',
    label: 'Low coordination',
    description: 'Hierarchical policy constrained to minimize coordination overhead.',
    mode: 'hierarchical',
    cellLeadCount: 1,
    workerCount: 3,
    spanOfControl: 6,
    fanoutStrategy: 'conservative',
    mergeJudgmentBonus: 0.1,
    handoffClarityBonus: 0.45,
    auditCoverageBonus: 0,
    validationStrictnessBonus: 0,
    coordinationCostMultiplier: 0.65,
    riskTolerance: 'medium',
  },
  {
    id: 'high_fanout',
    label: 'High fan-out',
    description: 'Policy that fans out more work and accepts higher coordination load.',
    mode: 'hierarchical',
    cellLeadCount: 1,
    workerCount: 6,
    spanOfControl: 5,
    fanoutStrategy: 'aggressive',
    mergeJudgmentBonus: 0.3,
    handoffClarityBonus: 0.05,
    auditCoverageBonus: 0,
    validationStrictnessBonus: 0.05,
    coordinationCostMultiplier: 1.2,
    riskTolerance: 'high',
  },
  {
    id: 'extra_worker',
    label: 'Extra worker',
    description: 'Policy adding worker capacity while keeping one lead.',
    mode: 'hierarchical',
    cellLeadCount: 1,
    workerCount: 6,
    spanOfControl: 4,
    fanoutStrategy: 'balanced',
    mergeJudgmentBonus: 0.2,
    handoffClarityBonus: 0.1,
    auditCoverageBonus: 0,
    validationStrictnessBonus: 0.05,
    coordinationCostMultiplier: 1.1,
    riskTolerance: 'medium',
  },
  {
    id: 'extra_lead',
    label: 'Extra lead',
    description: 'Policy adding one cell lead to reduce bottlenecks on review-heavy work.',
    mode: 'hierarchical',
    cellLeadCount: 2,
    workerCount: 4,
    spanOfControl: 3,
    fanoutStrategy: 'balanced',
    mergeJudgmentBonus: 0.25,
    handoffClarityBonus: 0.2,
    auditCoverageBonus: 0.15,
    validationStrictnessBonus: 0.2,
    coordinationCostMultiplier: 1.2,
    riskTolerance: 'low',
  },
  {
    id: 'balanced_org',
    label: 'Balanced org',
    description: 'Policy balancing merge quality, handoff clarity, audit coverage, and staffing.',
    mode: 'hierarchical',
    cellLeadCount: 2,
    workerCount: 5,
    spanOfControl: 4,
    fanoutStrategy: 'balanced',
    mergeJudgmentBonus: 0.35,
    handoffClarityBonus: 0.35,
    auditCoverageBonus: 0.25,
    validationStrictnessBonus: 0.25,
    coordinationCostMultiplier: 1,
    riskTolerance: 'medium',
  },
  {
    id: 'risk_averse_org',
    label: 'Risk-averse org',
    description: 'Policy prioritizing latent-risk reduction and evidence discipline.',
    mode: 'hierarchical',
    cellLeadCount: 2,
    workerCount: 4,
    spanOfControl: 3,
    fanoutStrategy: 'conservative',
    mergeJudgmentBonus: 0.25,
    handoffClarityBonus: 0.25,
    auditCoverageBonus: 0.65,
    validationStrictnessBonus: 0.7,
    coordinationCostMultiplier: 1.35,
    riskTolerance: 'low',
  },
]

export const G30_STUDY_ORDERS: OrgStudyOrder[] = [
  selectRepresentativeOrder('simple'),
  selectRepresentativeOrder('medium'),
  selectRepresentativeOrder('complex'),
]

export const G30_TOTAL_RUNS = G30_POLICY_CONFIGS.length * STUDY_SEEDS.length * G30_STUDY_ORDERS.length

function selectRepresentativeOrder(orderClass: OrgStudyOrder['class']): OrgStudyOrder {
  const orders = ORG_STUDY_ORDERS.filter((order) => order.class === orderClass)
  if (orders.length === 0) {
    throw new Error(`Missing G30 representative order class: ${orderClass}`)
  }
  return orders[Math.floor(orders.length / 2)]
}
