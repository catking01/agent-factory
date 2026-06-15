import { describe, it, expect } from 'vitest'
import {
  shadowAuditDefault,
  SHADOW_AUDIT_JSON_SCHEMA,
  type ShadowAuditResult,
} from '../../src/ai/ollamaSchemas'
import { isOllamaEnabled } from '../../src/ai/ollamaClient'

describe('Shadow Audit Schema (no Ollama required)', () => {
  it('shadowAuditDefault returns a valid default result', () => {
    const result = shadowAuditDefault('llama3.2', 'test error')

    expect(result.semanticPass).toBe(true)
    expect(result.overclaimDetected).toBe(false)
    expect(result.evidenceGapDetected).toBe(false)
    expect(result.hiddenFailureConcern).toBe(false)
    expect(result.riskLevel).toBe('low')
    expect(result.reason).toContain('test error')
    expect(result.confidence).toBe(0)
    expect(result.model).toBe('llama3.2')
    expect(result.callSucceeded).toBe(false)
    expect(result.errorMessage).toBe('test error')
    expect(result.responseTimeMs).toBe(0)
  })

  it('shadowAuditDefault with null error still returns valid result', () => {
    const result = shadowAuditDefault('llama3.2', null)

    expect(result.semanticPass).toBe(true)
    expect(result.reason).toContain('skipped')
    expect(result.errorMessage).toBe(null)
  })

  it('JSON schema has all required fields', () => {
    const required = SHADOW_AUDIT_JSON_SCHEMA.required
    expect(required).toContain('semanticPass')
    expect(required).toContain('overclaimDetected')
    expect(required).toContain('evidenceGapDetected')
    expect(required).toContain('hiddenFailureConcern')
    expect(required).toContain('riskLevel')
    expect(required).toContain('reason')
    expect(required).toContain('confidence')
  })

  it('JSON schema riskLevel has correct enum values', () => {
    const riskLevel = SHADOW_AUDIT_JSON_SCHEMA.properties.riskLevel as {
      enum: string[]
    }
    expect(riskLevel.enum).toEqual(['low', 'medium', 'high'])
  })

  it('isOllamaEnabled returns false without env var set', () => {
    // In normal test environment, it should default to false
    const enabled = isOllamaEnabled()
    expect(enabled).toBe(false)
  })

  it('ShadowAuditResult type is structurally sound', () => {
    const result: ShadowAuditResult = {
      semanticPass: true,
      overclaimDetected: false,
      evidenceGapDetected: false,
      hiddenFailureConcern: false,
      riskLevel: 'low',
      reason: 'test',
      confidence: 5,
      model: 'test-model',
      responseTimeMs: 100,
      callSucceeded: true,
      errorMessage: null,
    }

    expect(result.semanticPass).toBe(true)
    expect(result.riskLevel).toBe('low')
    expect(result.confidence).toBe(5)
  })
})
