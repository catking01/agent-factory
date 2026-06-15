// ============================================================
// G14: Shadow Semantic Audit
// ============================================================

import type { Artifact, Order } from '../sim/types'
import type { ShadowAuditResult } from './ollamaSchemas'
import { shadowAuditDefault } from './ollamaSchemas'
import { isOllamaEnabled, checkOllamaAvailable, ollamaGenerate } from './ollamaClient'
import {
  buildShadowAuditContext,
  buildSystemPrompt,
  buildUserPrompt,
} from './promptBuilders'

const DEFAULT_MODEL = 'llama3.2'
const DEFAULT_OLLAMA_URL = 'http://localhost:11434'

/**
 * Run a shadow semantic audit using a local Ollama model.
 *
 * IMPORTANT BOUNDARIES:
 * - This function does NOT mutate GameState.
 * - It does NOT affect the replay hash.
 * - It is NOT required for normal operation.
 * - It only runs when AGENT_FOUNDRY_ENABLE_OLLAMA=1 is set.
 * - It is only available in Node.js context, never in the browser.
 *
 * Returns a ShadowAuditResult that can be displayed alongside
 * the deterministic audit for comparison, but never replaces it.
 */
export async function shadowAudit(
  order: Order,
  artifact: Artifact,
  hasHiddenFailures: boolean,
  routeCount: number,
  loserCount: number,
  model: string = DEFAULT_MODEL,
  baseUrl: string = DEFAULT_OLLAMA_URL,
): Promise<ShadowAuditResult> {
  const startTime = Date.now()

  // Gate 1: Must be explicitly enabled
  if (!isOllamaEnabled()) {
    return shadowAuditDefault(
      model,
      'Ollama not enabled (set AGENT_FOUNDRY_ENABLE_OLLAMA=1)',
    )
  }

  // Gate 2: Must be in Node.js context (not browser)
  if (typeof window !== 'undefined') {
    return shadowAuditDefault(model, 'Ollama unavailable in browser context')
  }

  // Gate 3: Ollama must be reachable
  const availableModels = await checkOllamaAvailable(baseUrl)
  if (!availableModels) {
    return shadowAuditDefault(model, 'Ollama not reachable at ' + baseUrl)
  }

  // Gate 4: Requested model must be available (or fall back to first available)
  let effectiveModel = model
  if (!availableModels.some((m) => m.startsWith(model) || m === model)) {
    if (availableModels.length === 0) {
      return shadowAuditDefault(model, 'No models available in Ollama')
    }
    effectiveModel = availableModels[0] // fall back to first available
  }

  // Build context and prompts
  const ctx = buildShadowAuditContext(
    order,
    artifact,
    hasHiddenFailures,
    routeCount,
    loserCount,
  )
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(ctx)
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

  // Call Ollama
  const response = await ollamaGenerate(
    {
      model: effectiveModel,
      prompt: fullPrompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.1,
        num_predict: 512,
      },
    },
    baseUrl,
  )

  const responseTimeMs = Date.now() - startTime

  if (!response) {
    return {
      ...shadowAuditDefault(effectiveModel, 'Ollama returned no response'),
      responseTimeMs,
    }
  }

  // Parse the JSON response
  try {
    const parsed = JSON.parse(response.trim())

    return {
      semanticPass:
        typeof parsed.semanticPass === 'boolean'
          ? parsed.semanticPass
          : true,
      overclaimDetected:
        typeof parsed.overclaimDetected === 'boolean'
          ? parsed.overclaimDetected
          : false,
      evidenceGapDetected:
        typeof parsed.evidenceGapDetected === 'boolean'
          ? parsed.evidenceGapDetected
          : false,
      hiddenFailureConcern:
        typeof parsed.hiddenFailureConcern === 'boolean'
          ? parsed.hiddenFailureConcern
          : false,
      riskLevel: ['low', 'medium', 'high'].includes(parsed.riskLevel)
        ? (parsed.riskLevel as 'low' | 'medium' | 'high')
        : 'low',
      reason:
        typeof parsed.reason === 'string'
          ? parsed.reason
          : 'Model returned unparseable reason',
      confidence:
        typeof parsed.confidence === 'number'
          ? Math.max(0, Math.min(10, parsed.confidence))
          : 0,
      model: effectiveModel,
      responseTimeMs,
      callSucceeded: true,
      errorMessage: null,
    }
  } catch {
    return {
      ...shadowAuditDefault(
        effectiveModel,
        'Failed to parse Ollama JSON response',
      ),
      responseTimeMs,
    }
  }
}
