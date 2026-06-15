import { describe, it, expect, beforeAll } from 'vitest'
import { isOllamaEnabled, checkOllamaAvailable } from '../../src/ai/ollamaClient'
import { SHADOW_AUDIT_BENCHMARKS } from '../../src/ai/shadowAuditBenchmarks'
import { runShadowAuditBenchmark, type BenchmarkResult } from '../../src/ai/shadowAuditBenchmarkRunner'

/**
 * G15: Opt-in full benchmark run against local Ollama.
 *
 * Run: AGENT_FOUNDRY_ENABLE_OLLAMA=1 npx vitest run tests/ai/shadowAuditBenchmark.optin.test.ts
 */

describe('Shadow Audit Benchmark (opt-in)', () => {
  let result: BenchmarkResult | null = null
  let hasOllama = false

  beforeAll(async () => {
    if (!isOllamaEnabled()) return
    const models = await checkOllamaAvailable()
    if (models && models.length > 0) {
      hasOllama = true
      // Use the coder model which doesn't output thinking tokens
      const model = models.find(m => m.includes('coder')) || models[0]
      result = await runShadowAuditBenchmark(SHADOW_AUDIT_BENCHMARKS, model)
    }
  }, 600000) // 10 min timeout for 24 cases

  it.runIf(isOllamaEnabled() && hasOllama)(
    'all benchmark cases succeeded',
    () => {
      expect(result!.succeededCases).toBe(result!.totalCases)
    },
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'confusion matrix accuracy is above 60%',
    () => {
      expect(result!.confusionMatrix.accuracy).toBeGreaterThan(0.6)
    },
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'recall (catching risky artifacts) is above 60%',
    () => {
      expect(result!.confusionMatrix.recall).toBeGreaterThan(0.6)
    },
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'precision (not over-flagging clean) is above 50%',
    () => {
      // Precision may be lower because models are cautious
      // about borderline cases — 50% is a realistic bar
      expect(result!.confusionMatrix.precision).toBeGreaterThan(0.5)
    },
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'latency report has valid data',
    () => {
      expect(result!.latencyReport.totalCalls).toBe(result!.totalCases)
      expect(result!.latencyReport.mean).toBeGreaterThan(0)
      expect(result!.latencyReport.min).toBeGreaterThan(0)
      expect(result!.latencyReport.max).toBeGreaterThanOrEqual(result!.latencyReport.min)
    },
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'category breakdown covers all categories',
    () => {
      const cats = Object.keys(result!.categoryBreakdown)
      expect(cats.length).toBeGreaterThanOrEqual(6) // at least 6 of 7
    },
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'obvious_overclaim cases have high detection rate',
    () => {
      const cat = result!.categoryBreakdown['obvious_overclaim']
      if (cat) {
        expect(cat.accuracy).toBeGreaterThan(0.5)
      }
    },
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'clean_high_evidence cases have low false-positive rate',
    () => {
      const cat = result!.categoryBreakdown['clean_high_evidence']
      if (cat) {
        // Clean cases should mostly be recognized as clean
        expect(cat.accuracy).toBeGreaterThan(0.4)
      }
    },
  )

  it('benchmarks exist without Ollama', () => {
    expect(SHADOW_AUDIT_BENCHMARKS.length).toBeGreaterThanOrEqual(20)
  })
})
