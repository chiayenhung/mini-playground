import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { markdownComponents } from './markdown-components'
import type { ChatMessage as ChatMessageType, ChatTiming } from '@/hooks/use-chat'
import type { Components } from 'react-markdown'

function getErrorMarkdownComponents(): Components {
  return {
    h1: ({ children }) => <h1 className="text-lg font-bold mb-2" style={{ color: '#fca5a5' }}>{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-semibold mb-2" style={{ color: '#fca5a5' }}>{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-medium mb-1" style={{ color: '#fca5a5' }}>{children}</h3>,
    p: ({ children }) => <p className="mb-2 last:mb-0" style={{ color: '#f87171' }}>{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1" style={{ color: '#f87171' }}>{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1" style={{ color: '#f87171' }}>{children}</ol>,
    li: ({ children }) => <li className="text-sm" style={{ color: '#f87171' }}>{children}</li>,
    code: ({ children }) => <code className="bg-red-950/50 px-1 py-0.5 rounded text-xs" style={{ color: '#fecaca' }}>{children}</code>,
    pre: ({ children }) => <pre className="bg-red-950/50 p-2 rounded overflow-x-auto text-xs mb-2" style={{ color: '#fecaca' }}>{children}</pre>,
    blockquote: ({ children }) => <blockquote className="border-l-2 border-red-600 pl-3 italic mb-2" style={{ color: '#fca5a5' }}>{children}</blockquote>,
    strong: ({ children }) => <strong className="font-semibold" style={{ color: '#fca5a5' }}>{children}</strong>,
    em: ({ children }) => <em className="italic" style={{ color: '#fca5a5' }}>{children}</em>,
    hr: () => <div className="flex justify-center my-3"><div className="text-red-600 text-xs font-mono">···</div></div>,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4 -mx-2 sm:mx-0">
        <table className="min-w-full border border-red-600 rounded-lg">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-red-950/50">{children}</thead>,
    tbody: ({ children }) => <tbody className="bg-red-900/30">{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-red-700">{children}</tr>,
    th: ({ children }) => (
      <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold border-r border-red-700 last:border-r-0" style={{ color: '#fca5a5' }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-2 sm:px-3 py-2 text-xs border-r border-red-700 last:border-r-0" style={{ color: '#f87171' }}>
        {children}
      </td>
    ),
  }
}

interface ChatMessageProps {
  message: ChatMessageType
  timing?: ChatTiming
}

export function ChatMessage({ message, timing }: ChatMessageProps) {
  const isError = message.role === 'assistant' && message.type === 'error'

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`min-w-[80%] sm:min-w-[60%] max-w-[95%] sm:max-w-[90%] whitespace-pre-wrap rounded-md px-2 sm:px-3 py-2 ${
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
                components={isError ? getErrorMarkdownComponents() : markdownComponents}
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
