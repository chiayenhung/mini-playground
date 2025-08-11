import { useEffect, useState } from 'react'

export type Model = {
  id: string
  title?: string
  display_name?: string
  description?: string
}

export function useModels() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch('/api/models')
        if (!res.ok) throw new Error('Failed to load models')
        
        const raw = (await res.json()) as any[]
        const normalized: Model[] = (raw || [])
          .map((m: any) => {
            const id = m?.id ?? m?.name ?? m?.model ?? m?.slug
            const title = m?.title ?? m?.display_name ?? m?.name ?? id
            const description = m?.description ?? ''
            return id ? ({ id, title, description } as Model) : null
          })
          .filter(Boolean) as Model[]

        setModels(normalized)
      } catch (e: any) {
        setError(e?.message ?? 'Unable to fetch models')
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  return { models, loading, error }
}
