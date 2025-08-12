import { NextResponse } from 'next/server'
import { extractErrorMessage } from '@/lib/utils'

// Minimal proxy to avoid CORS and hide API key if needed (public models endpoint provided in the prompt)
export async function GET() {
  try {
    const res = await fetch('https://app.fireworks.ai/api/models/mini-playground')
    if (!res.ok) {
      const errorText = await res.text()
      const errorMessage = extractErrorMessage(errorText, res.status)
      return NextResponse.json({ error: errorMessage }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    const errorMessage = extractErrorMessage(e instanceof Error ? e.message : 'Failed to fetch models', 500)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}


