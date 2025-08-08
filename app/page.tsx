'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Model = {
  id: string
  title?: string
  display_name?: string
  description?: string
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function Page() {
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [timings, setTimings] = useState<Record<string, { startedAt: number; firstTokenAt?: number; finishedAt?: number }>>({})

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/models', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load models')
        const data = (await res.json()) as Model[]
        setModels(data)
        if (data.length > 0) setSelectedModel(data[0].id)
      } catch (e: any) {
        setError(e?.message ?? 'Unable to fetch models')
      }
    })()
  }, [])

  const canSend = useMemo(() => !loading && !!selectedModel && input.trim().length > 0, [loading, selectedModel, input])

  const onSend = async () => {
    if (!canSend) return
    setError(null)
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')

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
          model: selectedModel,
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
  }

  const onStop = () => {
    abortRef.current?.abort()
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Mini Model Playground</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-300">Model</label>
          <select
            className="rounded-md bg-neutral-900 border border-neutral-700 px-2 py-1 text-sm"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title ?? m.display_name ?? m.id}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="h-[60vh] overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-neutral-400">Ask anything to get started.</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`w-2/5 whitespace-pre-wrap rounded-md px-3 py-2 ${
                m.role === 'user' ? 'bg-neutral-800' : 'bg-neutral-900 border border-neutral-800'
              }`}
            >
              <div className="mb-1 text-xs uppercase tracking-wide text-neutral-400">{m.role}</div>
              <div
                className={`text-sm leading-relaxed ${
                  m.role === 'assistant' && m.content.startsWith('Error:') ? 'text-red-400' : ''
                }`}
              >
                {m.content}
              </div>
              {m.role === 'assistant' && timings[m.id]?.finishedAt && (
                <div className="mt-2 text-[10px] text-neutral-500">
                  {(() => {
                    const t = timings[m.id]
                    const ttfb = t.firstTokenAt ? Math.max(0, t.firstTokenAt - t.startedAt) : null
                    const total = Math.max(0, t.finishedAt! - t.startedAt)
                    return `time to first token: ${ttfb ? ttfb.toFixed(0) : '—'} ms · total: ${total.toFixed(0)} ms`
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-neutral-400 animate-pulse">Streaming…</div>
        )}
      </section>

      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSend()
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your prompt…"
          rows={3}
          className="flex-1 resize-none rounded-md border border-neutral-700 bg-neutral-900 p-3 text-sm outline-none focus:border-neutral-500"
        />
        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            Send
          </button>
          {loading && (
            <button type="button" onClick={onStop} className="rounded-md border border-neutral-700 px-3 py-2 text-sm">
              Stop
            </button>
          )}
        </div>
      </form>

      <footer className="text-xs text-neutral-500">Uses Fireworks Chat API. Add your API key in .env.local.</footer>
    </main>
  )
}


