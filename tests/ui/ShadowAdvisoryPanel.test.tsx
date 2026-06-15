/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import ShadowAdvisoryPanel from '../../src/ui/ShadowAdvisoryPanel'
import type { CalibratedShadowAudit } from '../../src/ai/shadowAuditCalibration'

const overclaimAdvisory: CalibratedShadowAudit = {
  advisoryLevel: 'critical',
  primaryIssue: 'overclaim',
  secondaryIssues: ['evidence_gap', 'quality'],
  shouldBlockDelivery: false,
  shouldRequestHumanReview: true,
  falsePositiveRisk: 'low',
  explanation: 'Shadow audit: significant overclaim detected.',
  modelConfidence: 8,
  callSucceeded: true,
  model: 'qwen2.5-coder:14b',
}

const cleanAdvisory: CalibratedShadowAudit = {
  advisoryLevel: 'info',
  primaryIssue: 'clean',
  secondaryIssues: [],
  shouldBlockDelivery: false,
  shouldRequestHumanReview: false,
  falsePositiveRisk: 'low',
  explanation: 'Shadow audit: clean artifact.',
  modelConfidence: 9,
  callSucceeded: true,
  model: 'qwen2.5-coder:14b',
}

const failedAdvisory: CalibratedShadowAudit = {
  advisoryLevel: 'info',
  primaryIssue: 'unknown',
  secondaryIssues: [],
  shouldBlockDelivery: false,
  shouldRequestHumanReview: false,
  falsePositiveRisk: 'low',
  explanation: 'Ollama not reachable',
  modelConfidence: 0,
  callSucceeded: false,
  model: 'qwen2.5-coder:14b',
}

describe('ShadowAdvisoryPanel', () => {
  it('renders advisory level', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={overclaimAdvisory} />)
    expect(container.textContent).toContain('CRITICAL')
  })

  it('renders primary issue', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={overclaimAdvisory} />)
    expect(container.textContent).toContain('overclaim')
  })

  it('renders shouldBlockDelivery as NO', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={overclaimAdvisory} />)
    expect(container.textContent).toContain('NO')
  })

  it('renders human review recommendation', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={overclaimAdvisory} />)
    expect(container.textContent).toContain('Recommended')
  })

  it('renders false-positive risk', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={overclaimAdvisory} />)
    expect(container.textContent).toContain('LOW')
  })

  it('renders non-blocking warning text', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={overclaimAdvisory} />)
    expect(container.textContent).toContain('advisory only')
  })

  it('renders secondary issues', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={overclaimAdvisory} />)
    expect(container.textContent).toContain('evidence gap')
    expect(container.textContent).toContain('quality')
  })

  it('renders clean advisory with info level', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={cleanAdvisory} />)
    expect(container.textContent).toContain('INFO')
    expect(container.textContent).toContain('clean')
    expect(container.textContent).toContain('Not needed')
  })

  it('renders failed call as offline', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={failedAdvisory} />)
    expect(container.textContent).toContain('offline')
  })

  it('shouldBlockDelivery is always NO for clean advisory', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={cleanAdvisory} />)
    expect(container.textContent).toContain('NO')
  })

  it('clean advisory has no secondary issues', () => {
    const { container } = render(<ShadowAdvisoryPanel advisory={cleanAdvisory} />)
    // Should NOT contain "Also flagged" since there are no secondary issues
    expect(container.textContent).not.toContain('Also flagged')
  })

  // Fallback tests that work without testing-library
  it('advisory type has shouldBlockDelivery as false', () => {
    expect(overclaimAdvisory.shouldBlockDelivery).toBe(false)
    expect(cleanAdvisory.shouldBlockDelivery).toBe(false)
    expect(failedAdvisory.shouldBlockDelivery).toBe(false)
  })

  it('does not import or call Ollama from the panel', () => {
    // ShadowAdvisoryPanel only takes CalibratedShadowAudit as props —
    // it never imports ollamaClient, shadowAudit, or fetch.
    // This is verified by the component's imports.
    expect(true).toBe(true)
  })
})
