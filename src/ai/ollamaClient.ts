// ============================================================
// G14: Ollama HTTP Client
// ============================================================

const DEFAULT_OLLAMA_URL = 'http://localhost:11434'

export interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream: false
  format?: 'json'
  options?: {
    temperature?: number
    num_predict?: number
  }
}

export interface OllamaGenerateResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  eval_count?: number
}

/**
 * Check whether Ollama is reachable at the given URL.
 * Returns the set of available models if reachable, null otherwise.
 */
export async function checkOllamaAvailable(
  baseUrl: string = DEFAULT_OLLAMA_URL,
): Promise<string[] | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) return null

    const data = (await response.json()) as {
      models?: Array<{ name: string }>
    }
    return (data.models ?? []).map((m) => m.name)
  } catch {
    return null
  }
}

/**
 * Send a generate request to Ollama and return the parsed response.
 * Returns null if Ollama is unreachable or returns an error.
 */
export async function ollamaGenerate(
  request: OllamaGenerateRequest,
  baseUrl: string = DEFAULT_OLLAMA_URL,
): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000) // 60s timeout

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) return null

    const data = (await response.json()) as OllamaGenerateResponse
    return data.response
  } catch {
    return null
  }
}

/**
 * Check if Ollama is explicitly enabled via environment variable.
 * This gate prevents accidental network calls in CI or from the browser.
 */
export function isOllamaEnabled(): boolean {
  // In browser context, never allow Ollama calls
  if (typeof window !== 'undefined') return false

  // In Node.js context, check env var
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env.AGENT_FOUNDRY_ENABLE_OLLAMA === '1' ||
      process.env.AGENT_FOUNDRY_ENABLE_OLLAMA === 'true'
    )
  }

  return false
}
