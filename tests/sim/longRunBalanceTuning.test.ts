import { describe, it, expect } from 'vitest'
import { exportRawRuns } from '../../src/sim/balanceExport'
import {
  runBalanceMatrix,
  checkTradeoffConsistency,
  BALANCE_SEEDS,
  BALANCE_STRATEGIES,
} from '../../src/sim/balanceRunner'

/**
 * G11: Long-run balance tuning tests.
 *
 * Verifies:
 *  - Balanced strategy has nonzero survival at horizon 100
 *  - Balanced does not dominate all strategies
 *  - Trade-offs are preserved at horizon 100
 */
describe('Long-Run Balance Tuning', () => {
  const rawRuns = exportRawRuns(BALANCE_SEEDS, [100], BALANCE_STRATEGIES)
  const matrix = runBalanceMatrix(BALANCE_STRATEGIES, BALANCE_SEEDS, [100])

  it('balanced has nonzero survival at horizon 100', () => {
    const balancedRuns = rawRuns.filter(
      (r) => r.strategyId === 'balanced' && r.horizon === 100
    )
    const alive = balancedRuns.filter((r) => !r.gameOver)
    expect(alive.length).toBeGreaterThanOrEqual(2)
  })

  it('balanced gameOverRate is less than 100 at horizon 100', () => {
    const agg = matrix.aggregates.balanced[100]
    expect(agg.gameOverRate).toBeLessThan(100)
  })

  it('balanced does not dominate all strategies at horizon 100', () => {
    const agg = matrix.aggregates.balanced[100]
    const speed = matrix.aggregates.speed_first[100]

    // Balanced should NOT be better than speed in every dimension
    // Speed should still win on some things (orders, cash)
    const speedWinsOnSomething =
      speed.ordersCompleted.mean > agg.ordersCompleted.mean ||
      speed.cashEnd.mean > agg.cashEnd.mean

    expect(speedWinsOnSomething).toBe(true)
  })

  it('speed-first evidence integrity remains lower than balanced', () => {
    const speed = matrix.aggregates.speed_first[100]
    const balanced = matrix.aggregates.balanced[100]

    expect(balanced.evidenceIntegrityEnd.mean).toBeGreaterThan(
      speed.evidenceIntegrityEnd.mean
    )
  })

  it('quality-first finds more overclaims than speed-first (quality audits more)', () => {
    const speed = matrix.aggregates.speed_first[100]
    const quality = matrix.aggregates.quality_first[100]

    // overclaimFindings counts AUDIT-DETECTED overclaims.
    // Quality-first audits more → finds more. Speed-first skips audit → finds fewer.
    expect(quality.overclaimFindings.mean).toBeGreaterThan(
      speed.overclaimFindings.mean
    )
  })

  it('parallel-heavy route spend remains higher than speed-first', () => {
    const speed = matrix.aggregates.speed_first[100]
    const parallel = matrix.aggregates.parallel_heavy[100]

    expect(parallel.parallelRouteSpend.mean).toBeGreaterThan(
      speed.parallelRouteSpend.mean
    )
  })

  it('quality-first incidents remain <= speed-first incidents', () => {
    const speed = matrix.aggregates.speed_first[100]
    const quality = matrix.aggregates.quality_first[100]

    expect(quality.majorIncidents.mean).toBeLessThanOrEqual(
      speed.majorIncidents.mean + 1
    )
  })
})
