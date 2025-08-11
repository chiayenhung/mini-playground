'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { useModels } from '@/hooks/use-models'
import { useChat } from '@/hooks/use-chat'
import { ModelSelector } from '@/components/model-selector'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'

export default function Page() {
  const { models, loading: modelsLoading, error: modelsError } = useModels()
  const { messages, loading, timings, autoScroll, sendMessage, stop, toggleAutoScroll } = useChat()
  const [selectedModel, setSelectedModel] = useState<string>('')
  const chatRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive or content updates
  useEffect(() => {
    if (autoScroll && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, autoScroll])

  const handleSendMessage = async (message: string) => {
    await sendMessage(selectedModel, message)
  }

  const handleStop = () => {
    stop()
  }

  // Auto-select first model when models load
  if (models.length > 0 && !selectedModel) {
    setSelectedModel(models[0].id)
  }

  return (
    <main className="mx-auto max-w-3xl p-3 sm:p-6 space-y-3 sm:space-y-4 min-h-screen flex flex-col">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-lg sm:text-xl font-semibold">Mini Model Playground</h1>
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          loading={modelsLoading}
          error={modelsError}
        />
      </header>

      <div className="relative flex-1">
        <section 
          ref={chatRef}
          className="h-[45vh] sm:h-[60vh] overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/50 p-2 sm:p-4 space-y-2 sm:space-y-3"
        >
          {messages.length === 0 && (
            <div className="text-sm text-neutral-400">Ask anything to get started.</div>
          )}
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              message={m}
              timing={timings[m.id]}
            />
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

      <ChatInput
        onSendMessage={handleSendMessage}
        onStop={handleStop}
        loading={loading}
        disabled={!selectedModel}
      />
    </main>
  )
}


