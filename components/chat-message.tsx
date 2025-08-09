import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { markdownComponents } from './markdown-components'
import type { ChatMessage as ChatMessageType, ChatTiming } from '@/hooks/use-chat'

interface ChatMessageProps {
  message: ChatMessageType
  timing?: ChatTiming
}

export function ChatMessage({ message, timing }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`min-w-[60%] max-w-[90%] whitespace-pre-wrap rounded-md px-3 py-2 ${
          message.role === 'user' ? 'bg-neutral-800' : 'bg-neutral-900 border border-neutral-800'
        }`}
      >
        <div className="mb-1 text-xs uppercase tracking-wide text-neutral-400">{message.role}</div>
        <div
          className={`text-sm leading-relaxed ${
            message.role === 'assistant' && message.content.startsWith('Error:') ? 'text-red-400' : ''
          }`}
        >
          {message.role === 'assistant' ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            message.content
          )}
        </div>
        {message.role === 'assistant' && timing?.finishedAt && (
          <div className="mt-2 text-[10px] text-neutral-500">
            {(() => {
              const ttfb = timing.firstTokenAt ? Math.max(0, timing.firstTokenAt - timing.startedAt) : null
              const total = Math.max(0, timing.finishedAt - timing.startedAt)
              return `time to first token: ${ttfb ? ttfb.toFixed(0) : '—'} ms · total: ${total.toFixed(0)} ms`
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
