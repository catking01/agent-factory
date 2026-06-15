import React from 'react'
import type { CalibratedShadowAudit } from '../ai/shadowAuditCalibration'

interface Props {
  advisory: CalibratedShadowAudit
}

const ADVISORY_COLORS: Record<string, string> = {
  info: 'var(--green)',
  caution: 'var(--yellow)',
  warning: 'var(--orange)',
  critical: 'var(--red)',
}

const FP_RISK_COLORS: Record<string, string> = {
  low: 'var(--green)',
  medium: 'var(--yellow)',
  high: 'var(--orange)',
}

/**
 * Displays a calibrated shadow audit advisory.
 * This is a READ-ONLY display — it does not call Ollama,
 * does not mutate GameState, and does not affect delivery.
 */
export default function ShadowAdvisoryPanel({ advisory }: Props) {
  const levelColor = ADVISORY_COLORS[advisory.advisoryLevel] || 'var(--text-dim)'

  return (
    <div className="panel" style={{ borderLeft: `3px solid ${levelColor}` }}>
      {/* Header with non-blocking warning */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0, border: 'none', padding: 0, fontSize: 13 }}>
          Shadow Advisory
          <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 8, fontWeight: 400 }}>
            (advisory only — does not affect delivery, audit, or replay)
          </span>
        </h2>
        <span className="badge" style={{ background: 'var(--purple)', color: '#fff' }}>
          {advisory.callSucceeded ? advisory.model : 'offline'}
        </span>
      </div>

      {/* Outcome row */}
      <div className="metrics-bar" style={{ marginBottom: 8 }}>
        <div className="metric" style={{ borderColor: levelColor }}>
          <span className="label">Level</span>
          <span className="value" style={{ color: levelColor, fontSize: 14 }}>
            {advisory.advisoryLevel.toUpperCase()}
          </span>
        </div>
        <div className="metric">
          <span className="label">Primary Issue</span>
          <span className="value" style={{ fontSize: 13, color: 'var(--text-bright)' }}>
            {advisory.primaryIssue.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="metric">
          <span className="label">Confidence</span>
          <span className={`value ${advisory.modelConfidence >= 7 ? 'good' : advisory.modelConfidence >= 4 ? 'warn' : 'bad'}`}>
            {advisory.modelConfidence}/10
          </span>
        </div>
        <div className="metric">
          <span className="label">Block Delivery?</span>
          <span className="value good" style={{ fontSize: 14 }}>
            NO
          </span>
        </div>
      </div>

      {/* Secondary issues */}
      {advisory.secondaryIssues.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Also flagged: </span>
          {advisory.secondaryIssues.map((issue) => (
            <span key={issue} className="badge badge-medium" style={{ marginLeft: 4 }}>
              {issue.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Human review + FP risk */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 11 }}>
        <div>
          <span style={{ color: 'var(--text-dim)' }}>Human Review: </span>
          <span style={{ color: advisory.shouldRequestHumanReview ? 'var(--orange)' : 'var(--green)', fontWeight: 600 }}>
            {advisory.shouldRequestHumanReview ? 'Recommended' : 'Not needed'}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)' }}>False-Positive Risk: </span>
          <span style={{ color: FP_RISK_COLORS[advisory.falsePositiveRisk] || 'var(--text-dim)', fontWeight: 600 }}>
            {advisory.falsePositiveRisk.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div style={{ fontSize: 11, color: 'var(--text)', padding: '6px 8px', background: 'var(--bg)', borderRadius: 4, marginBottom: 8 }}>
        {advisory.explanation}
      </div>

      {/* Call status */}
      {!advisory.callSucceeded && (
        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontStyle: 'italic' }}>
          Shadow audit unavailable — advisory based on default assessment.
        </div>
      )}
    </div>
  )
}
