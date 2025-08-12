import { GET } from '@/app/api/models/route'
import { NextResponse } from 'next/server'

// Mock the fetch function
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('/api/models', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return models data when API call is successful', async () => {
    const mockModelsData = {
      models: [
        { id: 'model1', name: 'Test Model 1' },
        { id: 'model2', name: 'Test Model 2' }
      ]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockModelsData
    } as Response)

    const response = await GET()
    const data = await response.json()

    expect(mockFetch).toHaveBeenCalledWith('https://app.fireworks.ai/api/models/mini-playground')
    expect(response.status).toBe(200)
    expect(data).toEqual(mockModelsData)
  })

  it('should return error when API call fails with non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    } as Response)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch models' })
  })

  it('should return error when API call throws an exception', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch models' })
  })

  it('should handle 404 status from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    } as Response)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Failed to fetch models' })
  })

  it('should handle 403 status from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403
    } as Response)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Failed to fetch models' })
  })
})
