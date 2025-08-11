import { NextResponse } from 'next/server'

type InMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export const runtime = 'edge'

export async function POST(req: Request) {
  const { model, messages } = (await req.json()) as {
    model: string
    messages: InMessage[]
  }

  if (!process.env.FIREWORKS_API_KEY)
    return new Response('Missing FIREWORKS_API_KEY', { status: 500 })

  if (!model || !Array.isArray(messages) || messages.length === 0)
    return new Response('Invalid payload', { status: 400 })

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(`https://api.fireworks.ai/inference/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            stream: true,
            messages,
          }),
        })

        if (!res.ok || !res.body) {
          const text = await res.text()
          const errorMessage = extractErrorMessage(text, res.status)
          controller.enqueue(encodeSSE({ type: 'error', error: errorMessage }))
          controller.close()
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data:')) continue
            const payload = line.slice(5).trim()
            if (payload === '[DONE]') continue
            try {
              const json = JSON.parse(payload)
              // Fireworks streaming format includes choices[0].delta.content
              const delta = json?.choices?.[0]?.delta?.content
              if (typeof delta === 'string' && delta.length > 0) {
                controller.enqueue(encodeSSE({ type: 'content.delta', delta }))
              }
            } catch {
              // ignore non-json heartbeats
            }
          }
        }

        controller.enqueue(encodeSSE({ type: 'done' }))
        controller.close()
      } catch (e: any) {
        const errorMessage = extractErrorMessage(e?.message || 'Stream error', 500)
        controller.enqueue(encodeSSE({ type: 'error', error: errorMessage }))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

function encodeSSE(obj: Record<string, unknown>) {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`)
}

function extractErrorMessage(errorText: string, status: number): string {
  // Try to parse JSON error response
  try {
    const json = JSON.parse(errorText)
    if (json.error?.message) return json.error.message
    if (json.message) return json.message
    if (json.error) return json.error
  } catch {
    // Not JSON, continue with text processing
  }

  // Common error patterns to extract meaningful messages
  const patterns = [
    /"message":\s*"([^"]+)"/,
    /"error":\s*"([^"]+)"/,
    /error:\s*(.+?)(?:\n|$)/i,
    /failed:\s*(.+?)(?:\n|$)/i,
  ]

  for (const pattern of patterns) {
    const match = errorText.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // Fallback based on status codes
  const statusMessages: Record<number, string> = {
    400: 'Invalid request',
    401: 'Authentication failed',
    403: 'Access denied',
    404: 'Model not found',
    429: 'Rate limit exceeded',
    500: 'Server error',
    502: 'Bad gateway',
    503: 'Service unavailable',
  }

  if (statusMessages[status]) {
    return statusMessages[status]
  }

  // If all else fails, return a clean version of the error text
  const cleanText = errorText
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200) // Limit length

  return cleanText || 'An error occurred'
}


