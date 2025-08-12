// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.FIREWORKS_API_KEY = 'test-api-key'

// Mock fetch globally for API tests
global.fetch = jest.fn()

// Mock Request for API tests
global.Request = class Request {
  constructor(url, init = {}) {
    this.url = url
    this.method = init.method || 'GET'
    this.body = init.body
    this.headers = new Map(Object.entries(init.headers || {}))
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }
}

// Mock Next.js Response
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.headers = new Map(Object.entries(init.headers || {}))
    this.ok = this.status >= 200 && this.status < 300
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
}

// Mock NextResponse
global.NextResponse = {
  json: (data, init) => {
    return new Response(JSON.stringify(data), {
      status: init?.status || 200,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      }
    })
  }
}

// Mock ReadableStream for streaming tests
global.ReadableStream = class ReadableStream {
  constructor(init) {
    this.init = init
  }
}

// Mock TextEncoder/TextDecoder
global.TextEncoder = class TextEncoder {
  encode(text) {
    return new Uint8Array(Buffer.from(text, 'utf8'))
  }
}

global.TextDecoder = class TextDecoder {
  decode(bytes, options = {}) {
    return Buffer.from(bytes).toString('utf8')
  }
}
