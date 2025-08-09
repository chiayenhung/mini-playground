import { useState } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onStop: () => void
  loading: boolean
  disabled: boolean
}

export function ChatInput({ onSendMessage, onStop, loading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const canSend = !loading && !disabled && input.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return
    onSendMessage(input.trim())
    setInput('')
  }

  return (
    <form className="flex items-end gap-2" onSubmit={handleSubmit}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your prompt…"
        rows={3}
        className="flex-1 resize-none rounded-md border border-neutral-700 bg-neutral-900 p-3 text-sm outline-none focus:border-neutral-500"
        disabled={disabled}
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
          <button 
            type="button" 
            onClick={onStop} 
            className="rounded-md border border-neutral-700 px-3 py-2 text-sm"
          >
            Stop
          </button>
        )}
      </div>
    </form>
  )
}
