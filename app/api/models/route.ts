import { NextResponse } from 'next/server'

// Minimal proxy to avoid CORS and hide API key if needed (public models endpoint provided in the prompt)
export async function GET() {
  try {
    const res = await fetch('https://app.fireworks.ai/api/models/mini-playground')
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch models' }, { status: res.status })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}


