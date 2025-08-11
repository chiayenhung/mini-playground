import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createMarkdownComponents } from './markdown-components'
import type { ChatMessage as ChatMessageType, ChatTiming } from '@/hooks/use-chat'

interface ChatMessageProps {
  message: ChatMessageType
  timing?: ChatTiming
}

export function ChatMessage({ message, timing }: ChatMessageProps) {
  const isError = message.role === 'assistant' && message.type === 'error'

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`min-w-[85%] sm:min-w-[60%] max-w-[95%] sm:max-w-[90%] whitespace-pre-wrap rounded-md px-2 sm:px-3 py-2 ${
          message.role === 'user' ? 'bg-neutral-800' : 'bg-neutral-900 border border-neutral-800'
        } ${isError ? 'border-red-500/50 bg-red-950/20' : ''}`}
      >
        <div className="mb-1 text-xs uppercase tracking-wide text-neutral-400 hidden sm:block">{message.role}</div>
        <div
          className={`text-sm leading-relaxed whitespace-normal break-words ${
            isError ? 'text-red-400' : ''
          }`}
          style={isError ? { color: '#f87171' } : undefined}
        >
          {message.role === 'assistant' ? (
            <div style={isError ? { color: '#f87171' } : undefined}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={createMarkdownComponents({ showError: isError })}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            message.content
          )}
        </div>
        {message.role === 'assistant' && timing?.finishedAt && (
          <div className="mt-2 text-[10px] text-neutral-500 hidden sm:block">
            {(() => {
              const ttfb = timing.firstTokenAt ? Math.max(0, timing.firstTokenAt - timing.startedAt) : null
              const total = Math.max(0, timing.finishedAt - timing.startedAt)
              
              // Use actual token count if available, otherwise estimate
              const actualTokens = timing.tokenCount
              const estimatedTokens = Math.round(message.content.length / 4)
              const tokens = actualTokens || estimatedTokens
              const tokensPerSecond = total > 0 ? (tokens / (total / 1000)).toFixed(1) : '—'
              const tokenDisplay = actualTokens ? `${tokensPerSecond}` : `~${tokensPerSecond}`
              
              return `ttfb: ${ttfb ? ttfb.toFixed(0) : '—'}ms · total: ${total.toFixed(0)}ms · ${tokenDisplay} tok/s`
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
