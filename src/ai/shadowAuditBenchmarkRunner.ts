import type { Order, Artifact } from '../sim/types'
import type { ShadowAuditResult } from './ollamaSchemas'
import type { BenchmarkCase } from './shadowAuditBenchmarks'
import { shadowAudit } from './shadowAudit'

// ============================================================
// G15: Benchmark Runner
// ============================================================

export interface BenchmarkRunEntry {
  caseId: string
  category: string
  description: string

  expected: {
    semanticPass: boolean
    overclaimDetected: boolean
    evidenceGapDetected: boolean
    hiddenFailureConcern: boolean
    riskLevel: string
  }

  observed: {
    semanticPass: boolean
    overclaimDetected: boolean
    evidenceGapDetected: boolean
    hiddenFailureConcern: boolean
    riskLevel: string
    confidence: number
    reason: string
  }

  matches: {
    semanticPass: boolean
    overclaimDetected: boolean
    evidenceGapDetected: boolean
    hiddenFailureConcern: boolean
    riskLevel: boolean
    allFour: boolean
  }

  callSucceeded: boolean
  responseTimeMs: number
  model: string
  errorMessage: string | null
}

export interface ConfusionMatrix {
  truePositives: number   // expected risky, observed risky
  trueNegatives: number   // expected clean, observed clean
  falsePositives: number  // expected clean, observed risky
  falseNegatives: number  // expected risky, observed clean
  accuracy: number
  precision: number
  recall: number
  f1: number
}

export interface LatencyReport {
  min: number
  max: number
  mean: number
  median: number
  totalCalls: number
  failedCalls: number
  model: string
}

export interface BenchmarkResult {
  model: string
  totalCases: number
  succeededCases: number
  entries: BenchmarkRunEntry[]
  confusionMatrix: ConfusionMatrix
  latencyReport: LatencyReport
  categoryBreakdown: Record<string, { total: number; matched: number; accuracy: number }>
}

/**
 * Run a single benchmark case against the shadow auditor.
 * Reconstructs Order + Artifact from the ShadowAuditContext.
 */
async function runBenchmarkCase(
  c: BenchmarkCase,
  model: string,
): Promise<BenchmarkRunEntry> {
  // Reconstruct minimal Order and Artifact from context
  const order: Order = {
    id: 'bench-order',
    title: c.context.orderTitle,
    domain: c.context.orderDomain as Order['domain'],
    complexity: c.context.orderComplexity,
    ambiguity: 3,
    risk: 2,
    deadlineTick: 20,
    reward: 2000,
    penalty: 500,
    acceptanceCriteria: c.context.orderAcceptanceCriteria,
    status: 'in_progress',
    acceptedAtTick: 1,
  }

  const artifact: Artifact = {
    id: 'bench-artifact',
    orderId: 'bench-order',
    taskId: 'bench-task',
    routeId: c.context.routeCount > 1 ? 'route-1' : null,
    kind: c.context.artifactKind as Artifact['kind'],
    quality: c.context.artifactQuality,
    evidenceStrength: c.context.artifactEvidenceStrength,
    defectCount: c.context.artifactDefectCount,
    claimLevel: c.context.artifactClaimLevel,
    createdByAgentIds: ['bench-agent'],
    createdAtTick: 5,
    hash: 'bench-hash',
    validationPassed: c.context.validationPassed,
    validationScore: c.context.validationScore,
    auditPassed: c.context.auditPassed,
    auditResult: c.context.auditPassed === true
      ? { passed: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureDetected: false, riskLevel: 'low', reason: '' }
      : c.context.auditPassed === false
      ? { passed: false, overclaimDetected: true, evidenceGapDetected: false, hiddenFailureDetected: false, riskLevel: 'high', reason: '' }
      : null,
  }

  const hasHiddenFailures = c.context.hasHiddenFailures
  const routeCount = c.context.routeCount
  const loserCount = c.context.loserCount

  const result: ShadowAuditResult = await shadowAudit(
    order, artifact, hasHiddenFailures, routeCount, loserCount, model,
  )

  const observed = {
    semanticPass: result.semanticPass,
    overclaimDetected: result.overclaimDetected,
    evidenceGapDetected: result.evidenceGapDetected,
    hiddenFailureConcern: result.hiddenFailureConcern,
    riskLevel: result.riskLevel,
    confidence: result.confidence,
    reason: result.reason,
  }

  const expected = {
    semanticPass: c.expectedSemanticPass,
    overclaimDetected: c.expectedOverclaimDetected,
    evidenceGapDetected: c.expectedEvidenceGapDetected,
    hiddenFailureConcern: c.expectedHiddenFailureConcern,
    riskLevel: c.expectedRiskLevel,
  }

  const matches = {
    semanticPass: observed.semanticPass === expected.semanticPass,
    overclaimDetected: observed.overclaimDetected === expected.overclaimDetected,
    evidenceGapDetected: observed.evidenceGapDetected === expected.evidenceGapDetected,
    hiddenFailureConcern: observed.hiddenFailureConcern === expected.hiddenFailureConcern,
    riskLevel: observed.riskLevel === expected.riskLevel,
    allFour: false,
  }
  matches.allFour =
    matches.semanticPass &&
    matches.overclaimDetected &&
    matches.evidenceGapDetected &&
    matches.hiddenFailureConcern

  return {
    caseId: c.id,
    category: c.category,
    description: c.description,
    expected,
    observed,
    matches,
    callSucceeded: result.callSucceeded,
    responseTimeMs: result.responseTimeMs,
    model: result.model,
    errorMessage: result.errorMessage,
  }
}

/**
 * Run the full benchmark suite.
 */
export async function runShadowAuditBenchmark(
  cases: BenchmarkCase[],
  model: string,
): Promise<BenchmarkResult> {
  const entries: BenchmarkRunEntry[] = []
  const latencies: number[] = []
  let failedCalls = 0

  for (const c of cases) {
    const entry = await runBenchmarkCase(c, model)
    entries.push(entry)

    if (entry.callSucceeded) {
      latencies.push(entry.responseTimeMs)
    } else {
      failedCalls++
    }
  }

  // Confusion matrix: "risky" = one of overclaim/evidencegap/hiddenfailure/!semanticPass
  const isRisky = (e: { semanticPass: boolean; overclaimDetected: boolean; evidenceGapDetected: boolean; hiddenFailureConcern: boolean }) =>
    !e.semanticPass || e.overclaimDetected || e.evidenceGapDetected || e.hiddenFailureConcern

  let tp = 0, tn = 0, fp = 0, fn = 0
  for (const entry of entries) {
    const expectedRisky = isRisky(entry.expected)
    const observedRisky = isRisky(entry.observed)
    if (expectedRisky && observedRisky) tp++
    else if (!expectedRisky && !observedRisky) tn++
    else if (!expectedRisky && observedRisky) fp++
    else if (expectedRisky && !observedRisky) fn++
  }

  const total = tp + tn + fp + fn
  const accuracy = total > 0 ? (tp + tn) / total : 0
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0

  // Category breakdown
  const catMap: Record<string, { total: number; matched: number }> = {}
  for (const entry of entries) {
    if (!catMap[entry.category]) catMap[entry.category] = { total: 0, matched: 0 }
    catMap[entry.category].total++
    if (entry.matches.allFour) catMap[entry.category].matched++
  }
  const categoryBreakdown: Record<string, { total: number; matched: number; accuracy: number }> = {}
  for (const [cat, v] of Object.entries(catMap)) {
    categoryBreakdown[cat] = { ...v, accuracy: v.total > 0 ? v.matched / v.total : 0 }
  }

  // Latency report
  const sorted = [...latencies].sort((a, b) => a - b)
  const latencyReport: LatencyReport = {
    min: sorted[0] || 0,
    max: sorted[sorted.length - 1] || 0,
    mean: latencies.length > 0 ? latencies.reduce((s, v) => s + v, 0) / latencies.length : 0,
    median: sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0,
    totalCalls: entries.length,
    failedCalls,
    model,
  }

  return {
    model,
    totalCases: entries.length,
    succeededCases: entries.filter(e => e.callSucceeded).length,
    entries,
    confusionMatrix: { truePositives: tp, trueNegatives: tn, falsePositives: fp, falseNegatives: fn, accuracy, precision, recall, f1 },
    latencyReport,
    categoryBreakdown,
  }
}
