import type { Order, Artifact } from '../sim/types'
import type { ShadowAuditContext } from './promptBuilders'
import { buildShadowAuditContext } from './promptBuilders'

// ============================================================
// G15: Shadow Audit Benchmark Categories
// ============================================================

export type BenchmarkCategory =
  | 'clean_high_evidence'
  | 'obvious_overclaim'
  | 'evidence_gap'
  | 'hidden_failure'
  | 'low_quality'
  | 'borderline'
  | 'false_positive_trap'

export interface BenchmarkCase {
  id: string
  category: BenchmarkCategory
  description: string

  /** The expected semantic assessment */
  expectedSemanticPass: boolean
  /** Whether overclaim SHOULD be detected */
  expectedOverclaimDetected: boolean
  /** Whether evidence gap SHOULD be detected */
  expectedEvidenceGapDetected: boolean
  /** Whether hidden failure concern SHOULD be flagged */
  expectedHiddenFailureConcern: boolean
  /** Expected risk level */
  expectedRiskLevel: 'low' | 'medium' | 'high'

  /** Context built from order + artifact */
  context: ShadowAuditContext
}

// ============================================================
// Base order template
// ============================================================

function baseOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'bench-order',
    title: 'Build a landing page',
    domain: 'web',
    complexity: 5,
    ambiguity: 3,
    risk: 2,
    deadlineTick: 20,
    reward: 2000,
    penalty: 500,
    acceptanceCriteria: ['Responsive layout', 'Contact form', 'Accessible'],
    status: 'in_progress',
    acceptedAtTick: 1,
    ...overrides,
  }
}

function baseArtifact(overrides: Partial<Artifact> = {}): Artifact {
  return {
    id: 'bench-artifact',
    orderId: 'bench-order',
    taskId: 'bench-task',
    routeId: null,
    kind: 'code',
    quality: 8,
    evidenceStrength: 8,
    defectCount: 0,
    claimLevel: 8,
    createdByAgentIds: ['agent-1'],
    createdAtTick: 5,
    hash: 'bench-hash',
    validationPassed: true,
    validationScore: 85,
    auditPassed: true,
    auditResult: {
      passed: true,
      overclaimDetected: false,
      evidenceGapDetected: false,
      hiddenFailureDetected: false,
      riskLevel: 'low',
      reason: 'Clean artifact',
    },
    ...overrides,
  }
}

function makeCase(
  id: string,
  category: BenchmarkCategory,
  description: string,
  orderOverrides: Partial<Order>,
  artifactOverrides: Partial<Artifact>,
  hasHiddenFailures: boolean,
  routeCount: number,
  loserCount: number,
  expected: {
    semanticPass: boolean
    overclaimDetected: boolean
    evidenceGapDetected: boolean
    hiddenFailureConcern: boolean
    riskLevel: 'low' | 'medium' | 'high'
  },
): BenchmarkCase {
  const order = baseOrder(orderOverrides)
  const artifact = baseArtifact(artifactOverrides)
  const context = buildShadowAuditContext(
    order, artifact, hasHiddenFailures, routeCount, loserCount,
  )
  return {
    id, category, description,
    expectedSemanticPass: expected.semanticPass,
    expectedOverclaimDetected: expected.overclaimDetected,
    expectedEvidenceGapDetected: expected.evidenceGapDetected,
    expectedHiddenFailureConcern: expected.hiddenFailureConcern,
    expectedRiskLevel: expected.riskLevel,
    context,
  }
}

// ============================================================
// Benchmark Set — 24 cases
// ============================================================

export const SHADOW_AUDIT_BENCHMARKS: BenchmarkCase[] = [
  // === clean_high_evidence (4 cases) ===
  makeCase('C01', 'clean_high_evidence', 'Perfect artifact, everything matches',
    {}, { quality: 10, evidenceStrength: 10, claimLevel: 10, defectCount: 0 },
    false, 1, 0,
    { semanticPass: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'low' }),

  makeCase('C02', 'clean_high_evidence', 'High quality web app, evidence-backed',
    { title: 'Build API mock', domain: 'web', complexity: 4 },
    { quality: 9, evidenceStrength: 9, claimLevel: 8, defectCount: 0, kind: 'spec' },
    false, 1, 0,
    { semanticPass: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'low' }),

  makeCase('C03', 'clean_high_evidence', 'Research paper summary, strong evidence',
    { title: 'Summarize research paper', domain: 'research', complexity: 6 },
    { quality: 9, evidenceStrength: 9, claimLevel: 9, defectCount: 0, kind: 'report' },
    false, 1, 0,
    { semanticPass: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'low' }),

  makeCase('C04', 'clean_high_evidence', 'Data cleaning plan, clean execution',
    { title: 'Design CSV cleaning plan', domain: 'data', complexity: 3 },
    { quality: 9, evidenceStrength: 8, claimLevel: 8, defectCount: 1, kind: 'plan' },
    false, 1, 0,
    { semanticPass: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'low' }),

  // === obvious_overclaim (4 cases) ===
  makeCase('O01', 'obvious_overclaim', 'Huge overclaim: claim=10, evidence=1',
    { title: 'Build recommendation system', domain: 'web', complexity: 7 },
    { quality: 6, evidenceStrength: 1, claimLevel: 10, defectCount: 5, kind: 'code' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: true, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'high' }),

  makeCase('O02', 'obvious_overclaim', 'API spec with inflated claims',
    { title: 'Create API mock specification', domain: 'web', complexity: 5 },
    { quality: 5, evidenceStrength: 2, claimLevel: 9, defectCount: 4, kind: 'spec' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: true, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'high' }),

  makeCase('O03', 'obvious_overclaim', 'Research comparison with fake evidence',
    { title: 'Compare two hypotheses', domain: 'research', complexity: 8 },
    { quality: 4, evidenceStrength: 1, claimLevel: 9, defectCount: 6, kind: 'report' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: true, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'high' }),

  makeCase('O04', 'obvious_overclaim', 'Dashboard spec claiming full coverage',
    { title: 'Design dashboard spec', domain: 'data', complexity: 4 },
    { quality: 5, evidenceStrength: 2, claimLevel: 8, defectCount: 3, kind: 'spec' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: true, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'high' }),

  // === evidence_gap (4 cases) ===
  makeCase('E01', 'evidence_gap', 'Claim exceeds evidence by large margin',
    { title: 'Build landing page', domain: 'web', complexity: 5 },
    { quality: 7, evidenceStrength: 3, claimLevel: 8, defectCount: 2, kind: 'code' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: true, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'high' }),

  makeCase('E02', 'evidence_gap', 'Moderate overclaim, evidence is thin',
    { title: 'Write test suite', domain: 'web', complexity: 6 },
    { quality: 6, evidenceStrength: 3, claimLevel: 7, defectCount: 2, kind: 'checklist' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: true, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'medium' }),

  makeCase('E03', 'evidence_gap', 'Data validation report with weak backing',
    { title: 'Build validation report', domain: 'data', complexity: 3 },
    { quality: 5, evidenceStrength: 2, claimLevel: 6, defectCount: 3, kind: 'report' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: false, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'medium' }),

  makeCase('E04', 'evidence_gap', 'Runtime contract with insufficient evidence',
    { title: 'Draft task contract', domain: 'runtime', complexity: 4 },
    { quality: 6, evidenceStrength: 2, claimLevel: 7, defectCount: 1, kind: 'spec' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: true, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'high' }),

  // === hidden_failure (4 cases) ===
  makeCase('H01', 'hidden_failure', '3 routes, 2 failed, best artifact selected',
    { title: 'Build landing page', domain: 'web', complexity: 5 },
    { quality: 8, evidenceStrength: 8, claimLevel: 8, defectCount: 0, routeId: 'route-1' },
    true, 3, 2,
    { semanticPass: false, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: true, riskLevel: 'medium' }),

  makeCase('H02', 'hidden_failure', 'Multi-route competition with hidden losers',
    { title: 'Create API mock specification', domain: 'web', complexity: 6 },
    { quality: 7, evidenceStrength: 6, claimLevel: 7, defectCount: 1, routeId: 'route-1' },
    true, 3, 2,
    { semanticPass: false, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: true, riskLevel: 'medium' }),

  makeCase('H03', 'hidden_failure', 'Overclaim + hidden failures combined',
    { title: 'Summarize research paper', domain: 'research', complexity: 7 },
    { quality: 5, evidenceStrength: 2, claimLevel: 8, defectCount: 4, routeId: 'route-1' },
    true, 3, 2,
    { semanticPass: false, overclaimDetected: true, evidenceGapDetected: true, hiddenFailureConcern: true, riskLevel: 'high' }),

  makeCase('H04', 'hidden_failure', 'Single route — no hidden failures to flag',
    { title: 'Fix login form validation bug', domain: 'web', complexity: 2 },
    { quality: 8, evidenceStrength: 8, claimLevel: 8, defectCount: 0 },
    false, 1, 0,
    { semanticPass: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'low' }),

  // === low_quality (3 cases) ===
  makeCase('L01', 'low_quality', 'Low quality artifact despite matched evidence',
    { title: 'Build landing page', domain: 'web', complexity: 5 },
    { quality: 2, evidenceStrength: 2, claimLevel: 2, defectCount: 8, kind: 'code' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'medium' }),

  makeCase('L02', 'low_quality', 'Very low quality, many defects',
    { title: 'Write test suite', domain: 'web', complexity: 6 },
    { quality: 1, evidenceStrength: 3, claimLevel: 4, defectCount: 10, kind: 'checklist' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'high' }),

  makeCase('L03', 'low_quality', 'Low quality data work',
    { title: 'Clean CSV dataset', domain: 'data', complexity: 3 },
    { quality: 3, evidenceStrength: 3, claimLevel: 3, defectCount: 6, kind: 'dataset' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'medium' }),

  // === borderline (3 cases) ===
  makeCase('B01', 'borderline', 'Gap=1.5 — borderline overclaim',
    { title: 'Build landing page', domain: 'web', complexity: 5 },
    { quality: 7, evidenceStrength: 5, claimLevel: 6.5, defectCount: 1, kind: 'code' },
    false, 1, 0,
    { semanticPass: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'low' }),

  makeCase('B02', 'borderline', 'Gap=2 — mild but noticeable',
    { title: 'Design component library', domain: 'web', complexity: 5 },
    { quality: 6, evidenceStrength: 4, claimLevel: 6, defectCount: 2, kind: 'spec' },
    false, 1, 0,
    { semanticPass: true, overclaimDetected: false, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'medium' }),

  makeCase('B03', 'borderline', 'Gap=3 — moderate risk, low complexity',
    { title: 'Fix a UI bug', domain: 'web', complexity: 2 },
    { quality: 6, evidenceStrength: 4, claimLevel: 7, defectCount: 1, kind: 'code' },
    false, 1, 0,
    { semanticPass: false, overclaimDetected: false, evidenceGapDetected: true, hiddenFailureConcern: false, riskLevel: 'medium' }),

  // === false_positive_trap (2 cases) ===
  makeCase('F01', 'false_positive_trap', 'High complexity task, good evidence',
    { title: 'Design experiment plan', domain: 'research', complexity: 9 },
    { quality: 8, evidenceStrength: 8, claimLevel: 8, defectCount: 1, kind: 'plan' },
    false, 1, 0,
    { semanticPass: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'low' }),

  makeCase('F02', 'false_positive_trap', 'Runtime order — complex but well-executed',
    { title: 'Build governance checklist', domain: 'runtime', complexity: 7 },
    { quality: 9, evidenceStrength: 8, claimLevel: 9, defectCount: 0, kind: 'checklist' },
    false, 1, 0,
    { semanticPass: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureConcern: false, riskLevel: 'low' }),
]
