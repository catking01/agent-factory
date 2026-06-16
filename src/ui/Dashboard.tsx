import React from 'react'
import type { GameState } from '../sim/types'
import { computeFinalScore } from '../sim/scoring'
import { useLang } from '../i18n/LanguageContext'
import {
  getActiveOrderCount,
  getWorkingAgents,
  getQueuedTasks,
} from '../game/selectors'

interface Props {
  state: GameState
}

export default function Dashboard({ state }: Props) {
  const { t } = useLang()
  const m = state.metrics
  const activeOrders = getActiveOrderCount(state)
  const workingAgents = getWorkingAgents(state)
  const queuedTasks = getQueuedTasks(state)
  const totalAgents = Object.keys(state.agents).length
  const totalOrders = Object.keys(state.orders).length

  const cashClass =
    state.cash < 0 ? 'bad' : state.cash < 2000 ? 'warn' : 'good'
  const repClass =
    state.reputation < 30 ? 'bad' : state.reputation < 60 ? 'warn' : 'good'
  const eviClass =
    state.evidenceIntegrity < 30
      ? 'bad'
      : state.evidenceIntegrity < 60
      ? 'warn'
      : 'good'

  return (
    <div>
      <div className="metrics-bar">
        <div className="metric">
          <span className="label">{t('cash')}</span>
          <span className={`value ${cashClass}`}>${state.cash}</span>
        </div>
        <div className="metric">
          <span className="label">{t('reputation')}</span>
          <span className={`value ${repClass}`}>{Math.round(state.reputation)}</span>
        </div>
        <div className="metric">
          <span className="label">{t('evidence')}</span>
          <span className={`value ${eviClass}`}>{Math.round(state.evidenceIntegrity)}</span>
        </div>
        <div className="metric">
          <span className="label">{t('tick')}</span>
          <span className="value">{state.tick}</span>
        </div>
        <div className="metric">
          <span className="label">{t('score')}</span>
          <span className="value">{computeFinalScore(state)}</span>
        </div>
      </div>

      <div className="grid-2col">
        <div className="panel">
          <h2>{t('orders')}</h2>
          <div className="grid-3col" style={{ marginBottom: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-bright)' }}>
                {m.totalOrdersCompleted}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('completed')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--yellow)' }}>
                {activeOrders}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('active')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>
                {m.totalOrdersFailed}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('failed')}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            {t('total')} {t('orders')}: {totalOrders}
          </div>
        </div>

        <div className="panel">
          <h2>{t('agents')}</h2>
          <div className="grid-3col" style={{ marginBottom: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>
                {totalAgents - workingAgents.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('idle')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-bright)' }}>
                {workingAgents.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('working')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>
                {Math.round(m.agentUtilization * 100)}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('utilization')}</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>{t('quality')}</h2>
          <div style={{ marginBottom: 8 }}>
            <div className="skill-row">
              <span className="skill-label">{t('avgQuality')}</span>
              <div className="skill-bar">
                <div className="skill-fill" style={{ width: `${(m.averageQuality / 10) * 100}%`, background: m.averageQuality >= 7 ? 'var(--green)' : m.averageQuality >= 4 ? 'var(--yellow)' : 'var(--red)' }} />
              </div>
              <span className="skill-value">{m.averageQuality.toFixed(1)}</span>
            </div>
            <div className="skill-row">
              <span className="skill-label">{t('reworkRate')}</span>
              <div className="skill-bar">
                <div className="skill-fill" style={{ width: `${m.reworkRate * 100}%`, background: m.reworkRate < 0.2 ? 'var(--green)' : m.reworkRate < 0.5 ? 'var(--yellow)' : 'var(--red)' }} />
              </div>
              <span className="skill-value">{Math.round(m.reworkRate * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>{t('risks')}</h2>
          <div style={{ marginBottom: 8 }}>
            <div className="skill-row">
              <span className="skill-label">{t('majorIncidents')}</span>
              <span className="skill-value" style={{ color: m.majorIncidents <= 2 ? 'var(--green)' : m.majorIncidents <= 5 ? 'var(--yellow)' : 'var(--red)' }}>
                {m.majorIncidents}
              </span>
            </div>
            <div className="skill-row">
              <span className="skill-label">{t('queuedTasks')}</span>
              <span className="skill-value" style={{ color: queuedTasks.length < 5 ? 'var(--green)' : queuedTasks.length < 10 ? 'var(--yellow)' : 'var(--red)' }}>
                {queuedTasks.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>{t('financialSummary')}</h2>
        <div className="grid-3col">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('revenue')}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>${m.totalRevenue}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('costs')}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)' }}>${m.totalCost}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('net')}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.totalRevenue - m.totalCost >= 0 ? 'var(--green)' : 'var(--red)' }}>
              ${m.totalRevenue - m.totalCost}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
