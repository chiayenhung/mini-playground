import type { Model } from '@/hooks/use-models'

interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  onModelChange: (modelId: string) => void
  loading: boolean
  error: string | null
}

export function ModelSelector({ 
  models, 
  selectedModel, 
  onModelChange, 
  loading, 
  error 
}: ModelSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
      <label className="text-sm text-neutral-300">Model</label>
      <select
        className="w-full sm:w-auto rounded-md bg-neutral-900 border border-neutral-700 px-2 py-2 text-sm min-h-[44px]"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={loading}
      >
        {loading ? (
          <option>Loading models...</option>
        ) : (
          models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title ?? m.display_name ?? m.id}
            </option>
          ))
        )}
      </select>
      {error && (
        <div className="text-xs text-red-400 sm:ml-2 whitespace-normal break-words">Failed to load models: {error}</div>
      )}
    </div>
  )
}
