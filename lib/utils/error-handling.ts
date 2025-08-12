/**
 * Extracts meaningful error messages from various error response formats
 * @param errorText - The raw error text or JSON string
 * @param status - HTTP status code (optional)
 * @returns Clean, user-friendly error message
 */
export function extractErrorMessage(errorText: string, status: number = 500): string {
  // Try to parse JSON error response
  try {
    const json = JSON.parse(errorText)
    if (json.error?.message) return json.error.message
    if (json.message) return json.message
    if (json.error) return json.error
  } catch {
    // Not JSON, continue with text processing
  }

  // Common error patterns to extract meaningful messages
  const patterns = [
    /"message":\s*"([^"]+)"/,
    /"error":\s*"([^"]+)"/,
    /error:\s*(.+?)(?:\n|$)/i,
    /failed:\s*(.+?)(?:\n|$)/i,
  ]

  for (const pattern of patterns) {
    const match = errorText.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // Fallback based on status codes
  const statusMessages: Record<number, string> = {
    400: 'Invalid request',
    401: 'Authentication failed',
    403: 'Access denied',
    404: 'Model not found',
    429: 'Rate limit exceeded',
    500: 'Server error',
    502: 'Bad gateway',
    503: 'Service unavailable',
  }

  if (statusMessages[status]) {
    return statusMessages[status]
  }

  // If all else fails, return a clean version of the error text
  const cleanText = errorText
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200) // Limit length

  return cleanText || 'An error occurred'
}

/**
 * Common error types for consistent error handling
 */
export const ErrorTypes = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  RATE_LIMIT: 'rate_limit',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown',
} as const

export type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes]

/**
 * Classifies error type based on status code and error message
 * @param status - HTTP status code
 * @param message - Error message
 * @returns Error type classification
 */
export function classifyError(status: number, message: string): ErrorType {
  if (status === 401 || status === 403) return ErrorTypes.AUTHENTICATION
  if (status === 429) return ErrorTypes.RATE_LIMIT
  if (status === 400) return ErrorTypes.VALIDATION
  if (status >= 500) return ErrorTypes.SERVER
  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
    return ErrorTypes.NETWORK
  }
  return ErrorTypes.UNKNOWN
}

/**
 * Creates a standardized error object
 * @param message - Error message
 * @param status - HTTP status code
 * @param originalError - Original error object (optional)
 * @returns Standardized error object
 */
export function createError(message: string, status: number = 500, originalError?: any) {
  const cleanMessage = extractErrorMessage(message, status)
  const type = classifyError(status, cleanMessage)
  
  return {
    message: cleanMessage,
    status,
    type,
    originalError: originalError ? String(originalError) : undefined,
    timestamp: new Date().toISOString(),
  }
}
