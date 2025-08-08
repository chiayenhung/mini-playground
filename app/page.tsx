'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { useModels } from '@/hooks/use-models'
import { useChat } from '@/hooks/use-chat'

export default function Page() {
  const { models, loading: modelsLoading, error: modelsError } = useModels()
  const { messages, loading, timings, autoScroll, sendMessage, stop, toggleAutoScroll } = useChat()
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  const canSend = useMemo(() => !loading && !!selectedModel && input.trim().length > 0, [loading, selectedModel, input])

  // Auto-scroll to bottom when new messages arrive or content updates
  useEffect(() => {
    if (autoScroll && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, autoScroll])

  const onSend = async () => {
    if (!canSend) return
    await sendMessage(selectedModel, input)
    setInput('')
  }

  const onStop = () => {
    stop()
  }

  // Auto-select first model when models load
  if (models.length > 0 && !selectedModel) {
    setSelectedModel(models[0].id)
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
            disabled={modelsLoading}
          >
            {modelsLoading ? (
              <option>Loading models...</option>
            ) : (
              models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title ?? m.display_name ?? m.id}
                </option>
              ))
            )}
          </select>
        </div>
      </header>

      {modelsError && (
        <div className="text-sm text-red-400">Error loading models: {modelsError}</div>
      )}

      <div className="relative">
        <section 
          ref={chatRef}
          className="h-[60vh] overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 space-y-3"
        >
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
        
        {/* Auto-scroll toggle button */}
        <button
          onClick={toggleAutoScroll}
          className={`absolute top-2 right-2 px-2 py-1 text-xs rounded border ${
            autoScroll 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-neutral-800 border-neutral-600 text-neutral-300'
          }`}
          title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
        >
          {autoScroll ? '⏸' : '▶'}
        </button>
      </div>

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
    </main>
  )
}


