import { useCallback, useRef, useState } from 'react'

function extractErrorMessage(errorText: string, status: number = 500): string {
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

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: 'error' | 'normal'
}

export type ChatTiming = {
  startedAt: number
  firstTokenAt?: number
  finishedAt?: number
  tokenCount?: number
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timings, setTimings] = useState<Record<string, ChatTiming>>({})
  const [autoScroll, setAutoScroll] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (model: string, input: string) => {
    if (!model || !input.trim()) return

    setError(null)
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    setMessages((m) => [...m, userMsg])

    const assistantId = crypto.randomUUID()
    setMessages((m) => [...m, { id: assistantId, role: 'assistant', content: '' }])
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller
    const startedAt = performance.now()
    setTimings((t) => ({ ...t, [assistantId]: { startedAt, tokenCount: 0 } }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: 'user', content: userMsg.content },
          ],
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const text = await res.text()
        throw new Error(text || 'Request failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          if (!part.startsWith('data:')) continue
          const payload = part.slice(5).trim()
          if (payload === '[DONE]') continue
          try {
            const evt = JSON.parse(payload) as { type: string; delta?: string; error?: string }
            if (evt.type === 'content.delta' && evt.delta) {
              setTimings((t) => {
                const prev = t[assistantId]
                const tokenCount = (prev?.tokenCount || 0) + 1 // Increment token count
                return prev?.firstTokenAt
                  ? { ...t, [assistantId]: { ...prev, tokenCount } }
                  : { ...t, [assistantId]: { ...prev, firstTokenAt: performance.now(), tokenCount } }
              })
              setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + evt.delta } : m)))
            } else if (evt.type === 'error' && evt.error) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: evt.error || 'Unknown error', type: 'error' } : m)),
              )
            }
          } catch {}
        }
      }
      setTimings((t) => ({ ...t, [assistantId]: { ...t[assistantId], finishedAt: performance.now() } }))
    } catch (e: any) {
      const msg = extractErrorMessage(e?.message ?? 'Unexpected error', 500)
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: msg, type: 'error' } : m)))
      setTimings((t) => ({ ...t, [assistantId]: { ...t[assistantId], finishedAt: performance.now() } }))
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [messages])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setTimings({})
    setError(null)
  }, [])

  const toggleAutoScroll = useCallback(() => {
    setAutoScroll(prev => !prev)
  }, [])

  return {
    messages,
    loading,
    error,
    timings,
    autoScroll,
    sendMessage,
    stop,
    clearMessages,
    toggleAutoScroll,
  }
}
