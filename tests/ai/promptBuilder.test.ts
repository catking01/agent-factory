import { describe, it, expect } from 'vitest'
import {
  buildShadowAuditContext,
  buildSystemPrompt,
  buildUserPrompt,
} from '../../src/ai/promptBuilders'
import type { Order, Artifact } from '../../src/sim/types'

describe('Prompt Builders (no Ollama required)', () => {
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

  it('buildShadowAuditContext extracts correct fields', () => {
    const ctx = buildShadowAuditContext(mockOrder, mockArtifact, true, 3, 2)

    expect(ctx.orderTitle).toBe('Build a landing page')
    expect(ctx.orderDomain).toBe('web')
    expect(ctx.orderComplexity).toBe(5)
    expect(ctx.artifactQuality).toBe(7.5)
    expect(ctx.artifactEvidenceStrength).toBe(4.0)
    expect(ctx.artifactClaimLevel).toBe(8.0)
    expect(ctx.validationPassed).toBe(true)
    expect(ctx.auditPassed).toBe(null)
    expect(ctx.hasHiddenFailures).toBe(true)
    expect(ctx.routeCount).toBe(3)
    expect(ctx.loserCount).toBe(2)
  })

  it('buildSystemPrompt returns a non-empty string with expected keywords', () => {
    const prompt = buildSystemPrompt()
    expect(prompt.length).toBeGreaterThan(100)
    expect(prompt).toContain('auditor')
    expect(prompt).toContain('overclaim')
    expect(prompt).toContain('evidence')
    expect(prompt).toContain('JSON')
  })

  it('buildUserPrompt includes artifact context and schema', () => {
    const ctx = buildShadowAuditContext(mockOrder, mockArtifact, false, 1, 0)
    const prompt = buildUserPrompt(ctx)

    // Should contain order info
    expect(prompt).toContain('Build a landing page')
    expect(prompt).toContain('web')
    expect(prompt).toContain('5/10')

    // Should contain artifact info
    expect(prompt).toContain('7.5/10')
    expect(prompt).toContain('4/10')
    expect(prompt).toContain('8/10')

    // Should contain context
    expect(prompt).toContain('PASSED')
    expect(prompt).toContain('not run') // audit is null

    // Should contain overclaim gap
    expect(prompt).toContain('4.0') // 8.0 - 4.0

    // Should contain JSON schema
    expect(prompt).toContain('semanticPass')
    expect(prompt).toContain('riskLevel')
    expect(prompt).toContain('"type": "object"')
  })

  it('buildUserPrompt handles null validation', () => {
    const artifact = { ...mockArtifact, validationPassed: null, validationScore: null }
    const ctx = buildShadowAuditContext(mockOrder, artifact, false, 1, 0)
    const prompt = buildUserPrompt(ctx)

    expect(prompt).toContain('not run')
  })

  it('buildUserPrompt handles failed audit', () => {
    const artifact = { ...mockArtifact, auditPassed: false }
    const ctx = buildShadowAuditContext(mockOrder, artifact, false, 1, 0)
    const prompt = buildUserPrompt(ctx)

    expect(prompt).toContain('FAILED')
  })
})
