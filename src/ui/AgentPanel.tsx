import React from 'react'
import type { GameState, Agent } from '../sim/types'
import { useLang } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

const ROLE_MAP: Record<string, TranslationKey> = {
  planner: 'planner', engineer: 'engineer', validator: 'validator',
  auditor: 'auditor', generalist: 'generalist',
}
const STATUS_MAP: Record<string, TranslationKey> = {
  idle: 'idleStatus', working: 'workingStatus', fatigued: 'fatiguedStatus',
}

interface Props { state: GameState }

export default function AgentPanel({ state }: Props) {
  const agents = Object.values(state.agents)

  return (
    <div>
      <div className="grid-3col">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  const { t } = useLang()
  const statusColor =
    agent.status === 'working'
      ? 'var(--accent-bright)'
      : agent.status === 'fatigued'
      ? 'var(--red)'
      : 'var(--green)'

  const fatigueColor =
    agent.fatigue >= 7
      ? 'var(--red)'
      : agent.fatigue >= 4
      ? 'var(--yellow)'
      : 'var(--green)'

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, border: 'none', padding: 0, fontSize: 13 }}>
          {agent.name}
        </h2>
        <span
          className="badge"
          style={{
            background: statusColor,
            color: '#fff',
          }}
        >
          {t(STATUS_MAP[agent.status] || 'idleStatus')}
        </span>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
        {t(ROLE_MAP[agent.role] || 'generalist')} · ${agent.salaryPerTick}/tick
      </div>

      {/* Specializations */}
      <div style={{ marginTop: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {agent.specialization.map((s) => (
          <span key={s} className={`badge badge-${s}`}>
            {s}
          </span>
        ))}
      </div>

      {/* Skill bars */}
      <div style={{ marginTop: 8 }}>
        <SkillBar label={t('planning')} value={agent.planning} />
        <SkillBar label={t('coding')} value={agent.coding} />
        <SkillBar label={t('validation')} value={agent.validation} />
        <SkillBar label={t('auditing')} value={agent.auditing} />
        <SkillBar label={t('creativity')} value={agent.creativity} />
        <SkillBar label={t('reliability')} value={agent.reliability} />
        <SkillBar label={t('speed')} value={agent.speed} />
      </div>

      {/* Risk indicators */}
      <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11 }}>
        <div>
          <span style={{ color: 'var(--text-dim)' }}>{t('overclaimRisk')}: </span>
          <span
            style={{
              color:
                agent.overclaimRisk >= 6
                  ? 'var(--red)'
                  : agent.overclaimRisk >= 3
                  ? 'var(--yellow)'
                  : 'var(--green)',
            }}
          >
            {agent.overclaimRisk}/10
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)' }}>{t('fatigue')}: </span>
          <span style={{ color: fatigueColor }}>
            {agent.fatigue.toFixed(1)}/10
          </span>
        </div>
      </div>

      {/* Fatigue bar */}
      <div className="progress-bar" style={{ marginTop: 4 }}>
        <div
          className="fill"
          style={{
            width: `${(agent.fatigue / 10) * 100}%`,
            background: fatigueColor,
          }}
        />
      </div>

      {agent.currentTaskId && (
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: 'var(--accent)',
          }}
        >
          {t('currentTask')}: {agent.currentTaskId.split('-').slice(0, 4).join('-')}
        </div>
      )}
    </div>
  )
}

function SkillBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 7 ? 'var(--green)' : value >= 4 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div className="skill-row">
      <span className="skill-label">{label}</span>
      <div className="skill-bar">
        <div
          className="skill-fill"
          style={{ width: `${(value / 10) * 100}%`, background: color }}
        />
      </div>
      <span className="skill-value">{value}</span>
    </div>
  )
}
