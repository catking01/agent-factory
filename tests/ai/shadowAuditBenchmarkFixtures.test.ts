import { describe, it, expect } from 'vitest'
import {
  SHADOW_AUDIT_BENCHMARKS,
  type BenchmarkCategory,
} from '../../src/ai/shadowAuditBenchmarks'

/**
 * G15: Benchmark fixture tests (no Ollama required).
 */
describe('Shadow Audit Benchmark Fixtures', () => {
  it('benchmark set has at least 20 cases', () => {
    expect(SHADOW_AUDIT_BENCHMARKS.length).toBeGreaterThanOrEqual(20)
  })

  it('all 7 categories are represented', () => {
    const categories = new Set(SHADOW_AUDIT_BENCHMARKS.map((c) => c.category))
    const expected: BenchmarkCategory[] = [
      'clean_high_evidence',
      'obvious_overclaim',
      'evidence_gap',
      'hidden_failure',
      'low_quality',
      'borderline',
      'false_positive_trap',
    ]
    for (const cat of expected) {
      expect(categories.has(cat)).toBe(true)
    }
  })

  it('each case has a unique id', () => {
    const ids = SHADOW_AUDIT_BENCHMARKS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each case has valid expected values', () => {
    for (const c of SHADOW_AUDIT_BENCHMARKS) {
      expect(typeof c.expectedSemanticPass).toBe('boolean')
      expect(typeof c.expectedOverclaimDetected).toBe('boolean')
      expect(typeof c.expectedEvidenceGapDetected).toBe('boolean')
      expect(typeof c.expectedHiddenFailureConcern).toBe('boolean')
      expect(['low', 'medium', 'high']).toContain(c.expectedRiskLevel)
      expect(c.description.length).toBeGreaterThan(0)
      expect(c.context).toBeDefined()
    }
  })

  it('benchmark context has required fields', () => {
    for (const c of SHADOW_AUDIT_BENCHMARKS) {
      expect(typeof c.context.orderTitle).toBe('string')
      expect(typeof c.context.orderComplexity).toBe('number')
      expect(typeof c.context.artifactQuality).toBe('number')
      expect(typeof c.context.artifactEvidenceStrength).toBe('number')
      expect(typeof c.context.artifactClaimLevel).toBe('number')
      expect(typeof c.context.artifactDefectCount).toBe('number')
      expect(typeof c.context.hasHiddenFailures).toBe('boolean')
      expect(typeof c.context.routeCount).toBe('number')
      expect(typeof c.context.loserCount).toBe('number')
    }
  })

  it('obvious_overclaim cases have expected overclaim=true', () => {
    const overclaimCases = SHADOW_AUDIT_BENCHMARKS.filter(
      (c) => c.category === 'obvious_overclaim'
    )
    for (const c of overclaimCases) {
      expect(c.expectedOverclaimDetected).toBe(true)
      expect(c.expectedSemanticPass).toBe(false)
    }
  })

  it('clean_high_evidence cases have expected overclaim=false', () => {
    const cleanCases = SHADOW_AUDIT_BENCHMARKS.filter(
      (c) => c.category === 'clean_high_evidence'
    )
    for (const c of cleanCases) {
      expect(c.expectedOverclaimDetected).toBe(false)
      expect(c.expectedSemanticPass).toBe(true)
    }
  })

  it('hidden_failure cases (except H04) have expectedHiddenFailureConcern=true', () => {
    const hfCases = SHADOW_AUDIT_BENCHMARKS.filter(
      (c) => c.category === 'hidden_failure' && c.id !== 'H04'
    )
    for (const c of hfCases) {
      expect(c.expectedHiddenFailureConcern).toBe(true)
    }
  })
})
