import React, { useState } from 'react'
import { useLang } from '../i18n/LanguageContext'

interface Props {
  onStart: () => void
  onSkip: () => void
}

type Phase = 1 | 2 | 3 | 4

export default function OnboardingOverlay({ onStart, onSkip }: Props) {
  const { t } = useLang()
  const [phase, setPhase] = useState<Phase>(1)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '28px 32px', maxWidth: 520, width: '90%',
        fontSize: 14, lineHeight: 1.7, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        {phase === 1 && <Phase1 onNext={() => setPhase(2)} onSkip={onSkip} t={t} />}
        {phase === 2 && <Phase2 onNext={() => setPhase(3)} onSkip={onSkip} t={t} />}
        {phase === 3 && <Phase3 onNext={() => setPhase(4)} onSkip={onSkip} t={t} />}
        {phase === 4 && <Phase4 onStart={onStart} t={t} />}
      </div>
    </div>
  )
}

function Dots({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: 4,
          background: i === current ? 'var(--accent-bright)' : 'var(--border)',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  )
}

function Phase1({ onNext, onSkip, t }: { onNext: () => void; onSkip: () => void; t: (k: Parameters<typeof import('../i18n/translations').t>[0]) => string }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, color: 'var(--text-bright)', marginBottom: 14 }}>欢迎来到 Agent Foundry</h2>
      <p style={{ color: 'var(--text)', marginBottom: 12 }}>
        你经营一家由<b>模拟 AI 员工</b>组成的小公司。
      </p>
      <p style={{ color: 'var(--text)', marginBottom: 12 }}>
        客户会提出需求，AI 员工会自动领取任务，把需求变成交付成果。
      </p>
      <p style={{ color: 'var(--text)', marginBottom: 12 }}>
        你的工作不是亲自写代码，而是<b>管理</b>：
        接什么样的单、用多少人、要不要验证、要不要审计。
      </p>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 20 }}>
        提示：所有 AI 员工都是模拟的，不是真实 LLM。你做出的每个管理决策都会影响公司的现金、声誉和证据完整性。
      </p>
      <Dots current={1} />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="small" onClick={onSkip}>跳过教程</button>
        <button className="primary" onClick={onNext}>继续 →</button>
      </div>
    </div>
  )
}

function Phase2({ onNext, onSkip, t }: { onNext: () => void; onSkip: () => void; t: (k: Parameters<typeof import('../i18n/translations').t>[0]) => string }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, color: 'var(--text-bright)', marginBottom: 14 }}>每个订单经过 5 个车间</h2>
      <div style={{ color: 'var(--text)', marginBottom: 14 }}>
        <FlowStep color="var(--accent-bright)" title="规划 Planning" desc="理解需求，拆分任务" />
        <FlowArrow />
        <FlowStep color="var(--green)" title="工程 Engineering" desc="AI 员工生成交付成果" />
        <FlowArrow />
        <FlowStep color="var(--yellow)" title="验证 Validation" desc="检查缺陷和格式问题" />
        <FlowArrow />
        <FlowStep color="var(--orange)" title="审计 Audit" desc="检查是否吹牛过度（overclaim）" />
        <FlowArrow />
        <FlowStep color="var(--purple)" title="交付 Delivery" desc="打包发送给客户" />
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 20 }}>
        跳过验证和审计可以更快赚钱，但长期会导致声誉崩盘或证据完整性崩溃。
      </p>
      <Dots current={2} />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="small" onClick={onSkip}>跳过教程</button>
        <button className="primary" onClick={onNext}>继续 →</button>
      </div>
    </div>
  )
}

function Phase3({ onNext, onSkip, t }: { onNext: () => void; onSkip: () => void; t: (k: Parameters<typeof import('../i18n/translations').t>[0]) => string }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, color: 'var(--text-bright)', marginBottom: 14 }}>你需要看懂的关键指标</h2>
      <div style={{ marginBottom: 14 }}>
        <MetricRow color="var(--accent-bright)" name="现金 Cash" desc="付工资和维护费。花光了就破产。" />
        <MetricRow color="var(--green)" name="声誉 Reputation" desc="客户对你的信任。太低就没人找你。" />
        <MetricRow color="var(--orange)" name="证据完整性 Evidence" desc="交付物是否有足够证据支撑其声明。过低说明吹牛太多。" />
        <MetricRow color="var(--red)" name="吹牛 Overclaim" desc="AI 员工的声明超过了证据。审计可以帮你发现。" />
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 20 }}>
        你的目标不是只追求快，而是在<b>速度、质量、证据和信誉之间做取舍</b>。
      </p>
      <Dots current={3} />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="small" onClick={onSkip}>跳过教程</button>
        <button className="primary" onClick={onNext}>继续 →</button>
      </div>
    </div>
  )
}

function Phase4({ onStart, t }: { onStart: () => void; t: (k: Parameters<typeof import('../i18n/translations').t>[0]) => string }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, color: 'var(--text-bright)', marginBottom: 14 }}>准备好了吗？</h2>
      <p style={{ color: 'var(--text)', marginBottom: 14 }}>
        现在我们来完成<b>第一单</b>。
      </p>
      <p style={{ color: 'var(--text)', marginBottom: 6 }}>
        左侧会出现一个任务清单，引导你：
      </p>
      <ul style={{ color: 'var(--text)', paddingLeft: 20, marginBottom: 14, lineHeight: 2 }}>
        <li>接取第一个订单</li>
        <li>观察 AI 员工开始工作</li>
        <li>等待产出物（artifact）生成</li>
        <li>观察验证（validation）和审计（audit）</li>
        <li>完成第一单交付</li>
      </ul>
      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 20 }}>
        不用担心——系统会自动分配员工、推进车间。你只需要接单和观察。
      </p>
      <Dots current={4} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="primary" onClick={onStart}>开始第一单 →</button>
      </div>
    </div>
  )
}

function FlowStep({ color, title, desc }: { color: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
      <div style={{ width: 10, height: 10, borderRadius: 5, background: color, flexShrink: 0 }} />
      <div>
        <span style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: 13 }}>{title}</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 12, marginLeft: 8 }}>{desc}</span>
      </div>
    </div>
  )
}

function FlowArrow() {
  return <div style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4, lineHeight: 1 }}>  ↓</div>
}

function MetricRow({ color, name, desc }: { color: string; name: string; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '3px 0' }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: color, flexShrink: 0 }} />
      <span style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: 13, minWidth: 120 }}>{name}</span>
      <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{desc}</span>
    </div>
  )
}
