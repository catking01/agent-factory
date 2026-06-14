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

type TabId = 'dashboard' | 'orders' | 'workshops' | 'agents' | 'tasks' | 'artifacts' | 'ledger' | 'debugger'

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialState(42))
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

  const tabs: { id: TabId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'agents', label: 'AI Agents' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'artifacts', label: 'Artifacts' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'debugger', label: 'Debugger' },
  ]

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div>
          <h1>
            群智工坊：Agent Foundry
            <span className="subtitle">AI Company Simulation</span>
          </h1>
        </div>
        <div className="header-actions">
          <button onClick={handleAdvanceTick} disabled={state.gameOver || autoRun}>
            Tick {state.tick} →
          </button>
          <button
            onClick={() => setAutoRun(!autoRun)}
            className={autoRun ? 'danger' : ''}
            disabled={state.gameOver}
          >
            {autoRun ? '⏸ Stop' : '▶ Auto'}
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
            Export
          </button>
          <button onClick={handleNewGame} className="small danger">
            New Game
          </button>
        </div>
      </header>

      {/* Game Over */}
      {state.gameOver && (
        <div className="game-over-overlay">
          <h2>Game Over</h2>
          <p>{state.gameOverReason}</p>
          <p>
            Final Score: {state.metrics.totalRevenue - state.metrics.totalCost} |{' '}
            Reputation: {state.reputation} | Orders: {state.metrics.totalOrdersCompleted}
          </p>
          <button onClick={handleNewGame} className="primary">
            Start New Game
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
    </div>
  )
}
