import type { Components } from 'react-markdown'

export const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-white">{children}</h3>,
  p: ({ children }) => <p className="mb-2 last:mb-0 text-neutral-100">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-neutral-100">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-neutral-100">{children}</ol>,
  li: ({ children }) => <li className="text-sm text-neutral-100">{children}</li>,
  code: ({ children }) => <code className="bg-neutral-800 px-1 py-0.5 rounded text-xs text-yellow-200">{children}</code>,
  pre: ({ children }) => <pre className="bg-neutral-800 p-2 rounded overflow-x-auto text-xs mb-2 text-green-200">{children}</pre>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-neutral-600 pl-3 italic mb-2 text-neutral-300">{children}</blockquote>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-neutral-200">{children}</em>,
  hr: () => <div className="flex justify-center my-3"><div className="text-neutral-600 text-xs font-mono">···</div></div>,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4 -mx-2 sm:mx-0">
      <table className="min-w-full border border-neutral-600 rounded-lg">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-neutral-800">{children}</thead>,
  tbody: ({ children }) => <tbody className="bg-neutral-900/50">{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-neutral-700">{children}</tr>,
  th: ({ children }) => (
    <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold text-white border-r border-neutral-700 last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 sm:px-3 py-2 text-xs text-neutral-100 border-r border-neutral-700 last:border-r-0">
      {children}
    </td>
  ),
}
