import { POST } from '@/app/api/chat/route'

// Mock the fetch function
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock ReadableStream
const mockReadableStream = {
  getReader: jest.fn().mockReturnValue({
    read: jest.fn(),
    cancel: jest.fn(),
  }),
}

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variable
    process.env.FIREWORKS_API_KEY = 'test-api-key'
  })

  it('should return 500 when FIREWORKS_API_KEY is missing', async () => {
    delete process.env.FIREWORKS_API_KEY

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    const response = await POST(request)
    const text = await response.text()

    expect(response.status).toBe(500)
    expect(text).toBe('Missing FIREWORKS_API_KEY')
  })

  it('should return 400 when model is missing', async () => {
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    const response = await POST(request)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Invalid payload')
  })

  it('should return 400 when messages array is empty', async () => {
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: []
      })
    })

    const response = await POST(request)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Invalid payload')
  })

  it('should return 400 when messages is not an array', async () => {
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: 'not an array'
      })
    })

    const response = await POST(request)
    const text = await response.text()

    expect(response.status).toBe(400)
    expect(text).toBe('Invalid payload')
  })

  it('should handle API error responses', async () => {
    const errorResponse = {
      error: {
        message: 'Rate limit exceeded',
        type: 'rate_limit_error'
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => JSON.stringify(errorResponse)
    } as Response)

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    const response = await POST(request)
    
    // Test that the API returns a streaming response even for errors
    expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    const response = await POST(request)
    
    // Test that the API returns a streaming response for network errors
    expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8')
  })

  it('should handle successful streaming response', async () => {
    const mockReader = {
      read: jest.fn()
        .mockResolvedValueOnce({
          value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'),
          done: false
        })
        .mockResolvedValueOnce({
          value: new TextEncoder().encode('data: [DONE]\n\n'),
          done: true
        }),
      cancel: jest.fn()
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: jest.fn().mockReturnValue(mockReader)
      }
    } as Response)

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    const response = await POST(request)
    
    expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8')
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-transform')
    expect(response.headers.get('Connection')).toBe('keep-alive')
  })

  it('should handle malformed JSON in streaming response', async () => {
    const mockReader = {
      read: jest.fn()
        .mockResolvedValueOnce({
          value: new TextEncoder().encode('data: invalid json\n\n'),
          done: false
        })
        .mockResolvedValueOnce({
          value: new TextEncoder().encode('data: [DONE]\n\n'),
          done: true
        }),
      cancel: jest.fn()
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: jest.fn().mockReturnValue(mockReader)
      }
    } as Response)

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    const response = await POST(request)
    
    expect(response.status).toBe(200)
  })

  it('should handle empty delta content in streaming response', async () => {
    const mockReader = {
      read: jest.fn()
        .mockResolvedValueOnce({
          value: new TextEncoder().encode('data: {"choices":[{"delta":{}}]}\n\n'),
          done: false
        })
        .mockResolvedValueOnce({
          value: new TextEncoder().encode('data: [DONE]\n\n'),
          done: true
        }),
      cancel: jest.fn()
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: jest.fn().mockReturnValue(mockReader)
      }
    } as Response)

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    const response = await POST(request)
    
    expect(response.status).toBe(200)
  })
})

// Test the extractErrorMessage function
describe('extractErrorMessage', () => {
  // We need to import the function, but it's not exported
  // Let's test it indirectly through the API behavior
  
  it('should handle JSON error responses', async () => {
    const errorResponse = {
      error: {
        message: 'Rate limit exceeded'
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => JSON.stringify(errorResponse)
    } as Response)

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    const response = await POST(request)
    
    // Test that the API returns a streaming response for JSON errors
    expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8')
  })

  it('should handle plain text error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal server error'
    } as Response)

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    const response = await POST(request)
    
    // Test that the API returns a streaming response for text errors
    expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8')
  })
})
