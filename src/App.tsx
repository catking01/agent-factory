import React, { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState } from './sim/types'
import { createInitialState } from './sim/createInitialState'
import { advanceTick } from './sim/tick'
import { applyPlayerAction } from './game/actions'
import { exportSaveFile } from './sim/replay'
import Dashboard from './ui/Dashboard'
import OrderBoard from './ui/OrderBoard'
import WorkshopMap from './ui/WorkshopMap'
import AgentPanel from './ui/AgentPanel'
import TaskBoard from './ui/TaskBoard'
import ArtifactPanel from './ui/ArtifactPanel'
import LedgerPanel from './ui/LedgerPanel'
import DebuggerPanel from './ui/DebuggerPanel'
import AgentWorkStatusFloat from './ui/AgentWorkStatusFloat'
import TutorialChecklist, {
  isTutorialDismissed,
  dismissTutorial,
} from './ui/TutorialChecklist'
import OnboardingOverlay from './ui/OnboardingOverlay'
import { useLang } from './i18n/LanguageContext'

type TabId = 'dashboard' | 'orders' | 'workshops' | 'agents' | 'tasks' | 'artifacts' | 'ledger' | 'debugger'

const ONBOARDING_KEY = 'agent-foundry-onboarding-done'

export default function App() {
  const { t, lang, toggleLang } = useLang()
  const [state, setState] = useState<GameState>(() => createInitialState(42))
  const [onboardingDone, setOnboardingDone] = useState(() => {
    try { return localStorage.getItem(ONBOARDING_KEY) === 'true' } catch { return false }
  })
  const [showOnboarding, setShowOnboarding] = useState(!onboardingDone)
  const [tutorialDismissed, setTutorialDismissed] = useState(() =>
    isTutorialDismissed() || onboardingDone,
  )
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [autoRun, setAutoRun] = useState(false)
  const [speed, setSpeed] = useState(1)
  const autoRunRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-run
  useEffect(() => {
    if (autoRun && !state.gameOver) {
      const interval = 800 / speed
      autoRunRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.gameOver) return prev
          return advanceTick(prev)
        })
      }, interval)
      return () => {
        if (autoRunRef.current) clearInterval(autoRunRef.current)
      }
    } else {
      if (autoRunRef.current) {
        clearInterval(autoRunRef.current)
        autoRunRef.current = null
      }
    }
  }, [autoRun, speed, state.gameOver])

  const handleAdvanceTick = useCallback(() => {
    setState((prev) => {
      if (prev.gameOver) return prev
      return advanceTick(prev)
    })
  }, [])

  const handleDispatch = useCallback(
    (action: Parameters<typeof applyPlayerAction>[1]) => {
      setState((prev) => applyPlayerAction(prev, action))
    },
    []
  )

  const handleExport = useCallback(() => {
    const json = exportSaveFile(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agent-foundry-run-${state.tick}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state])

  const handleNewGame = useCallback(() => {
    if (autoRunRef.current) clearInterval(autoRunRef.current)
    setAutoRun(false)
    setState(createInitialState(Date.now() % 100000))
  }, [])

  const tabs: { id: TabId; label: string; key: string }[] = [
    { id: 'dashboard', label: t('dashboard'), key: 'dashboard' },
    { id: 'orders', label: t('orders'), key: 'orders' },
    { id: 'workshops', label: t('workshops'), key: 'workshops' },
    { id: 'agents', label: t('agents'), key: 'agents' },
    { id: 'tasks', label: t('tasks'), key: 'tasks' },
    { id: 'artifacts', label: t('artifacts'), key: 'artifacts' },
    { id: 'ledger', label: t('ledger'), key: 'ledger' },
    { id: 'debugger', label: t('debugger'), key: 'debugger' },
  ]

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div>
          <h1>
            {t('appTitle')}
            <span className="subtitle">{t('appSubtitle')}</span>
          </h1>
        </div>
        <div className="header-actions">
          <button onClick={handleAdvanceTick} disabled={state.gameOver || autoRun}>
            {t('tick')} {state.tick} →
          </button>
          <button
            onClick={() => setAutoRun(!autoRun)}
            className={autoRun ? 'danger' : ''}
            disabled={state.gameOver}
          >
            {autoRun ? `⏸ ${t('stop')}` : `▶ ${t('auto')}`}
          </button>
          <button onClick={toggleLang} className="small" title={t('language')}>
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 5,
              padding: '4px 8px',
              fontSize: 12,
            }}
          >
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
            <option value={8}>8×</option>
          </select>
          <button onClick={handleExport} className="small">
            {t('export')}
          </button>
          <button onClick={handleNewGame} className="small danger">
            {t('newGame')}
          </button>
        </div>
      </header>

      {/* Game Over */}
      {state.gameOver && (
        <div className="game-over-overlay">
          <h2>{t('gameOver')}</h2>
          <p>{state.gameOverReason}</p>
          <p>
            {t('finalScore')}: {state.metrics.totalRevenue - state.metrics.totalCost} |{' '}
            {t('reputation')}: {state.reputation} | {t('orders')}: {state.metrics.totalOrdersCompleted}
          </p>
          <button onClick={handleNewGame} className="primary">
            {t('startNewGame')}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <Dashboard state={state} />}
      {activeTab === 'orders' && (
        <OrderBoard state={state} onDispatch={handleDispatch} />
      )}
      {activeTab === 'workshops' && <WorkshopMap state={state} />}
      {activeTab === 'agents' && <AgentPanel state={state} />}
      {activeTab === 'tasks' && (
        <TaskBoard state={state} onDispatch={handleDispatch} />
      )}
      {activeTab === 'artifacts' && <ArtifactPanel state={state} />}
      {activeTab === 'ledger' && <LedgerPanel state={state} />}
      {activeTab === 'debugger' && <DebuggerPanel state={state} />}

      {/* Global floating HUD — always visible, read-only */}
      <AgentWorkStatusFloat state={state} />

      {/* Concept onboarding overlay */}
      {showOnboarding && (
        <OnboardingOverlay
          onStart={() => {
            setShowOnboarding(false)
            setTutorialDismissed(false)
          }}
          onSkip={() => {
            setShowOnboarding(false)
            setTutorialDismissed(true)
            dismissTutorial()
            try { localStorage.setItem(ONBOARDING_KEY, 'true') } catch {}
            setOnboardingDone(true)
          }}
        />
      )}

      {/* First-run tutorial checklist (shown after onboarding concept intro) */}
      {!showOnboarding && (
        <TutorialChecklist
          state={state}
          dismissed={tutorialDismissed}
          onDismiss={() => {
            dismissTutorial()
            setTutorialDismissed(true)
            try { localStorage.setItem(ONBOARDING_KEY, 'true') } catch {}
            setOnboardingDone(true)
          }}
        />
      )}
    </div>
  )
}
