import Anthropic from '@anthropic-ai/sdk'
import { env } from './env.js'
import { AppError } from './errors.js'

let _client: Anthropic | null = null

export function getAiClient(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw new AppError(
      'AI_NOT_CONFIGURED',
      'AI service not configured. Set ANTHROPIC_API_KEY to enable AI analysis.',
      503
    )
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  }
  return _client
}

export interface AiCallOptions {
  model?: string
  maxTokens?: number
}

export async function callStructuredAi<T>(
  systemPrompt: string,
  userMessage: string,
  options: AiCallOptions = {}
): Promise<T> {
  const client = getAiClient()
  const model = options.model ?? 'claude-sonnet-4-6'
  const maxTokens = options.maxTokens ?? 4096

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const firstBlock = response.content[0]
  if (!firstBlock || firstBlock.type !== 'text') {
    throw new AppError('AI_RESPONSE_ERROR', 'AI returned unexpected response format', 500)
  }

  // Extract JSON from the response (handle markdown code blocks)
  const raw = firstBlock.text.trim()
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = jsonMatch?.[1]?.trim() ?? raw

  try {
    return JSON.parse(jsonStr) as T
  } catch {
    throw new AppError(
      'AI_PARSE_ERROR',
      `Failed to parse AI response as JSON. Raw: ${raw.slice(0, 200)}`,
      500
    )
  }
}

export function confidenceLabel(score: number): string {
  if (score >= 90) return 'Very High'
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}
