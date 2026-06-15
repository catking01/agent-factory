// ============================================================
// G14: Ollama Shadow Audit — Types & Schemas
// ============================================================

/**
 * Structured result returned by the Ollama shadow semantic auditor.
 * This is a READ-ONLY evaluation — it must never mutate GameState.
 */
export interface ShadowAuditResult {
  /** Whether the artifact passes semantic quality review */
  semanticPass: boolean

  /** Whether overclaim was detected (claim exceeds evidence) */
  overclaimDetected: boolean

  /** Whether evidence gaps were found */
  evidenceGapDetected: boolean

  /** Whether hidden or failed parallel routes are a concern */
  hiddenFailureConcern: boolean

  /** Overall risk assessment */
  riskLevel: 'low' | 'medium' | 'high'

  /** Human-readable explanation */
  reason: string

  /** Model's self-reported confidence in its assessment (0-10) */
  confidence: number

  /** The model name used (e.g. 'llama3.2') */
  model: string

  /** Raw response time in ms */
  responseTimeMs: number

  /** Whether the Ollama call succeeded at all */
  callSucceeded: boolean

  /** Error message if call failed */
  errorMessage: string | null
}

/**
 * Default result when Ollama is unavailable or call fails.
 */
export function shadowAuditDefault(
  model: string,
  errorMessage: string | null,
): ShadowAuditResult {
  return {
    semanticPass: true, // default pass — shadow audit doesn't block
    overclaimDetected: false,
    evidenceGapDetected: false,
    hiddenFailureConcern: false,
    riskLevel: 'low',
    reason: errorMessage
      ? `Shadow audit unavailable: ${errorMessage}`
      : 'Shadow audit skipped (Ollama not available)',
    confidence: 0,
    model,
    responseTimeMs: 0,
    callSucceeded: false,
    errorMessage,
  }
}

/**
 * JSON schema for the expected Ollama response format.
 * We ask the model to return JSON matching this shape.
 */
export const SHADOW_AUDIT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    semanticPass: {
      type: 'boolean',
      description:
        'Whether the artifact passes semantic quality review overall',
    },
    overclaimDetected: {
      type: 'boolean',
      description:
        'Whether the artifact claims exceed the evidence provided',
    },
    evidenceGapDetected: {
      type: 'boolean',
      description: 'Whether there are gaps in the evidence supporting claims',
    },
    hiddenFailureConcern: {
      type: 'boolean',
      description:
        'Whether hidden or failed parallel routes raise concerns about this artifact',
    },
    riskLevel: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      description: 'Overall risk assessment',
    },
    reason: {
      type: 'string',
      description:
        'Concise explanation of findings (max 200 chars)',
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 10,
      description:
        'How confident are you in this assessment? 0 = guessing, 10 = very certain',
    },
  },
  required: [
    'semanticPass',
    'overclaimDetected',
    'evidenceGapDetected',
    'hiddenFailureConcern',
    'riskLevel',
    'reason',
    'confidence',
  ],
}
