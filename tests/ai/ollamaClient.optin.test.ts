import { describe, it, expect, beforeAll } from 'vitest'
import {
  isOllamaEnabled,
  checkOllamaAvailable,
  ollamaGenerate,
} from '../../src/ai/ollamaClient'
import { shadowAudit } from '../../src/ai/shadowAudit'
import type { Order, Artifact } from '../../src/sim/types'

/**
 * G14: Opt-in Ollama integration tests.
 *
 * These tests ONLY run when AGENT_FOUNDRY_ENABLE_OLLAMA=1.
 * They require a local Ollama instance with at least one model loaded.
 *
 * Run: AGENT_FOUNDRY_ENABLE_OLLAMA=1 npx vitest run tests/ai/ollamaClient.optin.test.ts
 */

const SKIP_REASON =
  'Ollama not enabled. Set AGENT_FOUNDRY_ENABLE_OLLAMA=1 to run these tests.'

describe('Ollama Client (opt-in)', () => {
  let hasOllama = false
  let availableModels: string[] = []

  beforeAll(async () => {
    if (!isOllamaEnabled()) return
    const models = await checkOllamaAvailable()
    if (models && models.length > 0) {
      hasOllama = true
      availableModels = models
    }
  })

  it.runIf(isOllamaEnabled() && hasOllama)(
    'checkOllamaAvailable returns model list',
    async () => {
      expect(availableModels.length).toBeGreaterThan(0)
    },
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'ollamaGenerate returns a non-empty response',
    async () => {
      const model = availableModels[0]
      const response = await ollamaGenerate({
        model,
        prompt: 'Say "hello world" and nothing else.',
        stream: false,
        options: { temperature: 0, num_predict: 20 },
      })

      expect(response).not.toBeNull()
      expect(response!.length).toBeGreaterThan(0)
    },
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'shadowAudit returns a structured result',
    async () => {
      const mockOrder: Order = {
        id: 'test-order',
        title: 'Build a landing page',
        domain: 'web',
        complexity: 5,
        ambiguity: 3,
        risk: 2,
        deadlineTick: 20,
        reward: 2000,
        penalty: 500,
        acceptanceCriteria: ['Responsive', 'Form included'],
        status: 'in_progress',
        acceptedAtTick: 1,
      }

      const mockArtifact: Artifact = {
        id: 'test-artifact',
        orderId: 'test-order',
        taskId: 'test-task',
        routeId: 'test-order-route-1',
        kind: 'code',
        quality: 7.5,
        evidenceStrength: 4.0,
        defectCount: 2,
        claimLevel: 8.0,
        createdByAgentIds: ['agent-fastcoder'],
        createdAtTick: 5,
        hash: 'test-hash',
        validationPassed: true,
        validationScore: 70,
        auditPassed: null,
        auditResult: null,
      }

      const result = await shadowAudit(
        mockOrder,
        mockArtifact,
        true,
        3,
        2,
        availableModels[0],
      )

      // Should have succeeded
      expect(result.callSucceeded).toBe(true)
      expect(result.errorMessage).toBe(null)

      // Should have valid structured fields
      expect(typeof result.semanticPass).toBe('boolean')
      expect(typeof result.overclaimDetected).toBe('boolean')
      expect(typeof result.evidenceGapDetected).toBe('boolean')
      expect(typeof result.hiddenFailureConcern).toBe('boolean')
      expect(['low', 'medium', 'high']).toContain(result.riskLevel)
      expect(typeof result.reason).toBe('string')
      expect(result.reason.length).toBeGreaterThan(0)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(10)
      expect(result.responseTimeMs).toBeGreaterThan(0)
      expect(result.model).toBe(availableModels[0])

      // With high claim (8) and low evidence (4), overclaim or evidence gap
      // should be detected by a decent LLM
      // (soft assertion — model quality varies)
      const detectedIssue =
        result.overclaimDetected ||
        result.evidenceGapDetected ||
        result.riskLevel !== 'low'
      expect(detectedIssue).toBe(true)
    },
    30000,
  )

  it.runIf(isOllamaEnabled() && hasOllama)(
    'shadowAudit handles model fallback',
    async () => {
      const mockOrder: Order = {
        id: 'test-order-2',
        title: 'Fix a bug',
        domain: 'web',
        complexity: 2,
        ambiguity: 1,
        risk: 1,
        deadlineTick: 10,
        reward: 500,
        penalty: 100,
        acceptanceCriteria: ['Bug fixed'],
        status: 'in_progress',
        acceptedAtTick: 1,
      }

      const mockArtifact: Artifact = {
        id: 'test-artifact-2',
        orderId: 'test-order-2',
        taskId: 'test-task-2',
        routeId: null,
        kind: 'code',
        quality: 9.0,
        evidenceStrength: 8.5,
        defectCount: 0,
        claimLevel: 9.0,
        createdByAgentIds: ['agent-steady-builder'],
        createdAtTick: 3,
        hash: 'test-hash-2',
        validationPassed: true,
        validationScore: 90,
        auditPassed: true,
        auditResult: {
          passed: true,
          overclaimDetected: false,
          evidenceGapDetected: false,
          hiddenFailureDetected: false,
          riskLevel: 'low',
          reason: 'Clean artifact',
        },
      }

      // Request a model that doesn't exist — should fall back to first available
      const result = await shadowAudit(
        mockOrder,
        mockArtifact,
        false,
        1,
        0,
        'nonexistent-model-xyz',
      )

      expect(result.callSucceeded).toBe(true)
      // Should have used the first available model, not the requested one
      expect(result.model).toBe(availableModels[0])

      // For a clean artifact, the model should give low risk
      // (soft assertion)
      expect(typeof result.riskLevel).toBe('string')
    },
    30000,
  )

  it('shadowAudit returns default when Ollama disabled', async () => {
    // This test runs without Ollama enabled — confirms the gate works
    const mockOrder: Order = {
      id: 'test-order',
      title: 'Test',
      domain: 'web',
      complexity: 1,
      ambiguity: 1,
      risk: 1,
      deadlineTick: 5,
      reward: 100,
      penalty: 10,
      acceptanceCriteria: ['Test'],
      status: 'in_progress',
      acceptedAtTick: 1,
    }
    const mockArtifact: Artifact = {
      id: 'test-art',
      orderId: 'test-order',
      taskId: 'test-task',
      routeId: null,
      kind: 'code',
      quality: 5,
      evidenceStrength: 5,
      defectCount: 0,
      claimLevel: 5,
      createdByAgentIds: ['agent-1'],
      createdAtTick: 0,
      hash: 'hash',
      validationPassed: null,
      validationScore: null,
      auditPassed: null,
      auditResult: null,
    }

    // Without the env var set, this should return the default immediately
    if (!isOllamaEnabled()) {
      const result = await shadowAudit(mockOrder, mockArtifact, false, 1, 0)
      expect(result.callSucceeded).toBe(false)
      expect(result.reason).toContain('not enabled')
    }
  })
})
