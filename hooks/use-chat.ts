import { useCallback, useRef, useState } from 'react'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ChatTiming = {
  startedAt: number
  firstTokenAt?: number
  finishedAt?: number
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timings, setTimings] = useState<Record<string, ChatTiming>>({})
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
    setTimings((t) => ({ ...t, [assistantId]: { startedAt } }))

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
                return prev?.firstTokenAt
                  ? t
                  : { ...t, [assistantId]: { ...prev, firstTokenAt: performance.now() } }
              })
              setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + evt.delta } : m)))
            } else if (evt.type === 'error' && evt.error) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: `Error: ${evt.error}` } : m)),
              )
            }
          } catch {}
        }
      }
      setTimings((t) => ({ ...t, [assistantId]: { ...t[assistantId], finishedAt: performance.now() } }))
    } catch (e: any) {
      const msg = e?.message ?? 'Unexpected error'
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: `Error: ${msg}` } : m)))
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

  return {
    messages,
    loading,
    error,
    timings,
    sendMessage,
    stop,
    clearMessages,
  }
}
