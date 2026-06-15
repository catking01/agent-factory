# G13 Interactive Scenario Debugger UI

## Repository

- **Remote**: https://github.com/catking01/agent-factory
- **Branch**: `main`
- **Target commit**: `5489a1c`

## Features

| Feature | Description |
|---|---|
| Seed input | Configurable seed for scenario replay |
| Horizon input | Configurable tick horizon |
| Strategy selector | Dropdown: Speed First, Quality First, Parallel Heavy, Balanced |
| Outcome summary | Cash, Reputation, Evidence, Orders — color-coded |
| Trust timeline | Recharts LineChart: Reputation + Evidence over ticks |
| Cash breakdown | Per-category table: salaries, maintenance, parallel, upgrades, revenue, net |
| Bottleneck view | Per-workshop horizontal bars with max queue + total queued ticks |
| Negative events | Top 15 events by severity (high/medium/low), color-coded borders |
| Critical artifacts | Overclaim gap, validation/audit status, risk level badges |
| Event summary | Evidence drops, reputation penalties, total ledger events |

## Implementation

| File | Purpose |
|---|---|
| `src/ui/DebuggerPanel.tsx` | Main debugger component with all sub-components |
| `src/App.tsx` | Added `debugger` tab + `DebuggerPanel` import |
| `package.json` | Added `recharts ^3.8.1` dependency |

## Verification Gate

| Check | Result |
|---|---|
| `npx tsc -b` | PASS |
| `npx vite build` | PASS (632 modules, 572KB JS) |
| `npx vitest run` | PASS (29 files, 177 tests) |
| Zero AGENT_ASSIGNED in verification/ | PASS |
| DebuggerPanel source exists | PASS |
| No LLM/API/backend/shell added | PASS |

## Non-Claims

- Does NOT validate Runtime Lab
- Does NOT claim real multi-agent research capability
- Does NOT contain LLM/API/backend/network/shell integration
- Debugger is deterministic — no real-time or live-agent features
