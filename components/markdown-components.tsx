import type { Components } from 'react-markdown'

// Normal theme colors
const normalColors = {
  h1: 'text-white',
  h2: 'text-white', 
  h3: 'text-white',
  p: 'text-neutral-100',
  ul: 'text-neutral-100',
  ol: 'text-neutral-100',
  li: 'text-neutral-100',
  code: 'text-yellow-200',
  pre: 'text-green-200',
  blockquote: 'text-neutral-300',
  strong: 'text-white',
  em: 'text-neutral-200',
  hr: 'text-neutral-600',
  th: 'text-white',
  td: 'text-neutral-100',
  codeBg: 'bg-neutral-800',
  preBg: 'bg-neutral-800',
  tableBorder: 'border-neutral-600',
  theadBg: 'bg-neutral-800',
  tbodyBg: 'bg-neutral-900/50',
  trBorder: 'border-neutral-700',
  thBorder: 'border-neutral-700',
  tdBorder: 'border-neutral-700',
  blockquoteBorder: 'border-neutral-600',
}

// Error theme colors
const errorColors = {
  h1: '#fca5a5',
  h2: '#fca5a5',
  h3: '#fca5a5', 
  p: '#f87171',
  ul: '#f87171',
  ol: '#f87171',
  li: '#f87171',
  code: '#fecaca',
  pre: '#fecaca',
  blockquote: '#fca5a5',
  strong: '#fca5a5',
  em: '#fca5a5',
  hr: '#dc2626',
  th: '#fca5a5',
  td: '#f87171',
  codeBg: 'bg-red-950/50',
  preBg: 'bg-red-950/50',
  tableBorder: 'border-red-600',
  theadBg: 'bg-red-950/50',
  tbodyBg: 'bg-red-900/30',
  trBorder: 'border-red-700',
  thBorder: 'border-red-700',
  tdBorder: 'border-red-700',
  blockquoteBorder: 'border-red-600',
}

export function createMarkdownComponents({ showError = false }: { showError?: boolean } = {}): Components {
  const colors = showError ? errorColors : normalColors
  
  return {
    h1: ({ children }) => (
      <h1 className="text-lg font-bold mb-2" style={showError ? { color: colors.h1 } : undefined}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-semibold mb-2" style={showError ? { color: colors.h2 } : undefined}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-medium mb-1" style={showError ? { color: colors.h3 } : undefined}>
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className={`mb-2 last:mb-0 ${!showError ? colors.p : ''}`} style={showError ? { color: colors.p } : undefined}>
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className={`list-disc list-inside mb-2 space-y-1 ${!showError ? colors.ul : ''}`} style={showError ? { color: colors.ul } : undefined}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className={`list-decimal list-inside mb-2 space-y-1 ${!showError ? colors.ol : ''}`} style={showError ? { color: colors.ol } : undefined}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className={`text-sm ${!showError ? colors.li : ''}`} style={showError ? { color: colors.li } : undefined}>
        {children}
      </li>
    ),
    code: ({ children }) => (
      <code className={`${colors.codeBg} px-1 py-0.5 rounded text-xs ${!showError ? colors.code : ''}`} style={showError ? { color: colors.code } : undefined}>
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className={`${colors.preBg} p-2 rounded overflow-x-auto text-xs mb-2 ${!showError ? colors.pre : ''}`} style={showError ? { color: colors.pre } : undefined}>
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`border-l-2 ${colors.blockquoteBorder} pl-3 italic mb-2 ${!showError ? colors.blockquote : ''}`} style={showError ? { color: colors.blockquote } : undefined}>
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className={`font-semibold ${!showError ? colors.strong : ''}`} style={showError ? { color: colors.strong } : undefined}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className={`italic ${!showError ? colors.em : ''}`} style={showError ? { color: colors.em } : undefined}>
        {children}
      </em>
    ),
    hr: () => (
      <div className="flex justify-center my-3">
        <div className={`text-xs font-mono ${!showError ? colors.hr : ''}`} style={showError ? { color: colors.hr } : undefined}>···</div>
      </div>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4 -mx-2 sm:mx-0">
        <table className={`min-w-full border ${colors.tableBorder} rounded-lg`}>{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className={colors.theadBg}>{children}</thead>,
    tbody: ({ children }) => <tbody className={colors.tbodyBg}>{children}</tbody>,
    tr: ({ children }) => <tr className={`border-b ${colors.trBorder}`}>{children}</tr>,
    th: ({ children }) => (
      <th className={`px-2 sm:px-3 py-2 text-left text-xs font-semibold border-r ${colors.thBorder} last:border-r-0 ${!showError ? colors.th : ''}`} style={showError ? { color: colors.th } : undefined}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className={`px-2 sm:px-3 py-2 text-xs border-r ${colors.tdBorder} last:border-r-0 ${!showError ? colors.td : ''}`} style={showError ? { color: colors.td } : undefined}>
        {children}
      </td>
    ),
  }
}

// Export the default normal components for backward compatibility
export const markdownComponents = createMarkdownComponents({ showError: false })
