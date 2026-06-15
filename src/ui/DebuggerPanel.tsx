import React, { useState, useMemo } from 'react'
import type { GameState } from '../sim/types'
import { explainRun, type RunExplanation } from '../sim/explainRun'
import { STRATEGIES, type StrategyProfile } from '../data/strategyScenarios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import ShadowAdvisoryPanel from './ShadowAdvisoryPanel'
import type { CalibratedShadowAudit } from '../ai/shadowAuditCalibration'

interface Props {
  state: GameState
}

export default function DebuggerPanel({ state }: Props) {
  const [seed, setSeed] = useState(42)
  const [horizon, setHorizon] = useState(60)
  const [strategyId, setStrategyId] = useState('balanced')

  const explanation = useMemo(() => {
    const profile = STRATEGIES[strategyId]
    if (!profile) return null
    return explainRun(seed, horizon, profile)
  }, [seed, horizon, strategyId])

  return (
    <div>
      {/* Controls */}
      <div className="panel">
        <h2>Scenario Debugger</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>Seed</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value) || 0)}
              style={{
                background: 'var(--bg-card)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 4,
                padding: '4px 8px', fontSize: 13, width: 80,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>Horizon</label>
            <input
              type="number"
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value) || 1)}
              style={{
                background: 'var(--bg-card)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 4,
                padding: '4px 8px', fontSize: 13, width: 70,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>Strategy</label>
            <select
              value={strategyId}
              onChange={(e) => setStrategyId(e.target.value)}
              style={{
                background: 'var(--bg-card)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 4,
                padding: '4px 8px', fontSize: 13,
              }}
            >
              {Object.values(STRATEGIES).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {explanation && (
        <>
          {/* Outcome Summary */}
          <div className="metrics-bar">
            <div className="metric">
              <span className="label">Outcome</span>
              <span className={`value ${explanation.gameOver ? 'bad' : 'good'}`}>
                {explanation.gameOver ? 'GAME OVER' : 'Active'}
              </span>
            </div>
            <div className="metric">
              <span className="label">Cash</span>
              <span className={`value ${explanation.cashEnd < 0 ? 'bad' : explanation.cashEnd < 20000 ? 'warn' : 'good'}`}>
                ${explanation.cashEnd.toLocaleString()}
              </span>
            </div>
            <div className="metric">
              <span className="label">Reputation</span>
              <span className={`value ${explanation.reputationEnd < 30 ? 'bad' : explanation.reputationEnd < 60 ? 'warn' : 'good'}`}>
                {explanation.reputationEnd.toFixed(1)}
              </span>
            </div>
            <div className="metric">
              <span className="label">Evidence</span>
              <span className={`value ${explanation.evidenceIntegrityEnd < 30 ? 'bad' : explanation.evidenceIntegrityEnd < 60 ? 'warn' : 'good'}`}>
                {explanation.evidenceIntegrityEnd}
              </span>
            </div>
            <div className="metric">
              <span className="label">Orders</span>
              <span className="value">{explanation.ordersCompleted}</span>
            </div>
          </div>

          {/* Game Over Reason */}
          {explanation.gameOver && (
            <div className="panel" style={{ borderColor: 'var(--red)' }}>
              <h2 style={{ color: 'var(--red)' }}>Game Over</h2>
              <p style={{ color: 'var(--text)' }}>{explanation.gameOverReason}</p>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="grid-2col">
            <div className="panel">
              <h2>Cash Breakdown</h2>
              <CashBreakdownTable exp={explanation} />
            </div>

            {/* Bottlenecks */}
            <div className="panel">
              <h2>Bottlenecks</h2>
              <BottleneckView exp={explanation} />
            </div>
          </div>

          {/* Negative Events & Critical Artifacts */}
          <div className="grid-2col">
            <div className="panel">
              <h2>Top Negative Events ({explanation.topNegativeEvents.length})</h2>
              <div className="scrollable" style={{ maxHeight: 300 }}>
                {explanation.topNegativeEvents.slice(0, 15).map((e, i) => (
                  <NegativeEventCard key={i} event={e} />
                ))}
                {explanation.topNegativeEvents.length === 0 && (
                  <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>
                    No negative events recorded.
                  </div>
                )}
              </div>
            </div>

            <div className="panel">
              <h2>Critical Artifacts ({explanation.criticalArtifacts.length})</h2>
              <div className="scrollable" style={{ maxHeight: 300 }}>
                {explanation.criticalArtifacts.map((a) => (
                  <CriticalArtifactCard key={a.id} artifact={a} />
                ))}
                {explanation.criticalArtifacts.length === 0 && (
                  <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>
                    No critical artifacts.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Evidence & Reputation Timeline — simulated from drops */}
          <div className="panel">
            <h2>Trust Timeline</h2>
            <TrustTimeline exp={explanation} />
          </div>

          {/* Event Summary */}
          <div className="panel">
            <h2>Event Summary</h2>
            <div className="grid-3col">
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Evidence Drops</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: explanation.evidenceDrops.length > 0 ? 'var(--red)' : 'var(--green)' }}>
                  {explanation.evidenceDrops.length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Reputation Penalties</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: explanation.reputationPenalties.length > 0 ? 'var(--orange)' : 'var(--green)' }}>
                  {explanation.reputationPenalties.length}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Total Ledger Events</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-bright)' }}>
                  {explanation.totalLedgerEvents}
                </div>
              </div>
            </div>
          </div>

          {/* Shadow Advisory (sample — does not call Ollama) */}
          <ShadowAdvisorySample />
        </>
      )}
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function CashBreakdownTable({ exp }: { exp: RunExplanation }) {
  const { cashBreakdown: cb } = exp
  const rows = [
    { label: 'Salaries', value: cb.totalSalaries, color: 'var(--red)' },
    { label: 'Maintenance', value: cb.totalMaintenance, color: 'var(--orange)' },
    { label: 'Parallel Routes', value: cb.totalParallelRouteCost, color: 'var(--yellow)' },
    { label: 'Upgrades', value: cb.totalUpgradeCost, color: 'var(--purple)' },
    { label: 'Total Costs', value: cb.totalCost, color: 'var(--red)' },
    { label: 'Revenue', value: cb.totalRevenue, color: 'var(--green)' },
    { label: 'Net Position', value: cb.netPosition, color: cb.netPosition >= 0 ? 'var(--green)' : 'var(--red)' },
  ]

  return (
    <table className="data-table">
      <thead>
        <tr><th>Category</th><th>Amount</th></tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td>{r.label}</td>
            <td style={{ color: r.color, fontWeight: r.label === 'Total Costs' || r.label === 'Net Position' ? 600 : 400 }}>
              ${r.value.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function BottleneckView({ exp }: { exp: RunExplanation }) {
  const maxTicks = Math.max(...exp.bottlenecks.map((b) => b.totalQueuedTicks), 1)

  return (
    <div>
      {exp.bottlenecks.map((b) => (
        <div key={b.stage} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{b.stage}</span>
            <span style={{ color: 'var(--text-dim)' }}>
              Max queue: {b.maxQueueDepth} | Total queued ticks: {b.totalQueuedTicks}
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div
              className="fill"
              style={{
                width: `${(b.totalQueuedTicks / maxTicks) * 100}%`,
                background: b.stage === exp.bottlenecks[0]?.stage ? 'var(--red)' : 'var(--yellow)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function NegativeEventCard({ event }: { event: RunExplanation['topNegativeEvents'][0] }) {
  const severityColor =
    event.severity === 'high' ? 'var(--red)' :
    event.severity === 'medium' ? 'var(--orange)' : 'var(--yellow)'

  return (
    <div className="card" style={{ borderLeft: `3px solid ${severityColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-bright)' }}>
          {event.eventType}
        </span>
        <span className={`badge badge-${event.severity === 'high' ? 'high' : event.severity === 'medium' ? 'medium' : 'low'}`}>
          {event.severity}
        </span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
        Tick {event.tick} · {event.detail}
      </div>
    </div>
  )
}

function CriticalArtifactCard({ artifact }: { artifact: RunExplanation['criticalArtifacts'][0] }) {
  const gapColor =
    artifact.overclaimGap > 4 ? 'var(--red)' :
    artifact.overclaimGap > 1 ? 'var(--orange)' : 'var(--text-dim)'

  return (
    <div className="card" style={artifact.overclaimGap > 3 ? { borderLeft: '3px solid var(--red)' } : undefined}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>
        {artifact.id.split('-').slice(0, 4).join('-')}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 11, flexWrap: 'wrap' }}>
        <span>Q: <span style={{ color: artifact.quality < 4 ? 'var(--red)' : 'var(--green)' }}>{artifact.quality.toFixed(1)}</span></span>
        <span>Evidence: {artifact.evidenceStrength.toFixed(1)}</span>
        <span>Claim: {artifact.claimLevel.toFixed(1)}</span>
        <span>Gap: <span style={{ color: gapColor, fontWeight: 600 }}>{artifact.overclaimGap.toFixed(1)}</span></span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: 10 }}>
        {artifact.validationPassed !== null && (
          <span className={`badge ${artifact.validationPassed ? 'badge-pass' : 'badge-fail'}`}>
            Val: {artifact.validationPassed ? 'PASS' : 'FAIL'}
          </span>
        )}
        {artifact.auditPassed !== null && (
          <span className={`badge ${artifact.auditPassed ? 'badge-pass' : 'badge-fail'}`}>
            Audit: {artifact.auditPassed ? 'PASS' : 'FAIL'}
          </span>
        )}
        {artifact.riskLevel && (
          <span className={`badge badge-${artifact.riskLevel}`}>{artifact.riskLevel}</span>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Trust Timeline (simulated from explanation data points)
// ============================================================

function TrustTimeline({ exp }: { exp: RunExplanation }) {
  // Build timeline points from evidence/reputation drops
  const points: Array<{ tick: number; reputation: number; evidence: number }> = []

  let currentRep = 70 // starting reputation
  let currentEvi = 80 // starting evidence integrity

  // Combine all deltas sorted by tick
  const allDeltas: Array<{ tick: number; type: 'rep' | 'evi'; delta: number; reason: string }> = [
    ...exp.evidenceDrops.map((d) => ({ tick: d.tick, type: 'evi' as const, delta: d.delta, reason: d.reason })),
    ...exp.reputationPenalties.map((p) => ({ tick: p.tick, type: 'rep' as const, delta: p.delta, reason: p.reason })),
  ].sort((a, b) => a.tick - b.tick)

  // Add initial point
  points.push({ tick: 0, reputation: 70, evidence: 80 })

  // Apply deltas
  let lastTick = 0
  for (const d of allDeltas) {
    // Fill in ticks between deltas (carry forward values)
    if (d.tick > lastTick + 1 && lastTick > 0) {
      points.push({ tick: lastTick + 1, reputation: currentRep, evidence: currentEvi })
    }
    if (d.type === 'rep') currentRep = Math.max(0, Math.min(100, currentRep + d.delta))
    if (d.type === 'evi') currentEvi = Math.max(0, Math.min(100, currentEvi + d.delta))
    points.push({ tick: d.tick, reputation: currentRep, evidence: currentEvi })
    lastTick = d.tick
  }

  // Add final point
  if (lastTick < exp.finalTick) {
    points.push({ tick: exp.finalTick, reputation: Math.round(currentRep * 10) / 10, evidence: Math.round(currentEvi) })
  }

  if (points.length <= 1) {
    return (
      <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>
        No trust metric changes recorded.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={points} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="tick" stroke="var(--text-dim)" fontSize={11} />
        <YAxis domain={[0, 100]} stroke="var(--text-dim)" fontSize={11} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: 11,
          }}
        />
        <Legend />
        <Line
          type="stepAfter"
          dataKey="reputation"
          stroke="var(--accent-bright)"
          name="Reputation"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="stepAfter"
          dataKey="evidence"
          stroke="var(--green)"
          name="Evidence"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// Shadow Advisory Sample (no Ollama — static example data)
// ============================================================

const SAMPLE_OVERCLAIM_ADVISORY: CalibratedShadowAudit = {
  advisoryLevel: 'critical',
  primaryIssue: 'overclaim',
  secondaryIssues: ['evidence_gap', 'quality'],
  shouldBlockDelivery: false,
  shouldRequestHumanReview: true,
  falsePositiveRisk: 'low',
  explanation:
    'Shadow audit: The artifact significantly overclaims its capabilities. ' +
    'Advisory: critical, primary=overclaim. Also flagged: evidence_gap, quality. ' +
    'Recommendation: human review suggested.',
  modelConfidence: 8,
  callSucceeded: true,
  model: 'qwen2.5-coder:14b',
}

const SAMPLE_CLEAN_ADVISORY: CalibratedShadowAudit = {
  advisoryLevel: 'info',
  primaryIssue: 'clean',
  secondaryIssues: [],
  shouldBlockDelivery: false,
  shouldRequestHumanReview: false,
  falsePositiveRisk: 'low',
  explanation:
    'Shadow audit: The artifact meets the criteria with strong evidence. ' +
    'Advisory: info, primary=clean.',
  modelConfidence: 9,
  callSucceeded: true,
  model: 'qwen2.5-coder:14b',
}

function ShadowAdvisorySample() {
  const [showSample, setShowSample] = useState(false)
  const [sampleType, setSampleType] = useState<'overclaim' | 'clean'>('overclaim')

  const sample = sampleType === 'overclaim' ? SAMPLE_OVERCLAIM_ADVISORY : SAMPLE_CLEAN_ADVISORY

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <button className="small" onClick={() => setShowSample(!showSample)}>
          {showSample ? 'Hide' : 'Show'} Shadow Advisory (sample)
        </button>
        {showSample && (
          <select
            value={sampleType}
            onChange={(e) => setSampleType(e.target.value as 'overclaim' | 'clean')}
            style={{
              background: 'var(--bg-card)', color: 'var(--text)',
              border: '1px solid var(--border)', borderRadius: 4,
              padding: '3px 8px', fontSize: 11,
            }}
          >
            <option value="overclaim">Overclaim sample</option>
            <option value="clean">Clean sample</option>
          </select>
        )}
      </div>
      {showSample && <ShadowAdvisoryPanel advisory={sample} />}
    </div>
  )
}
