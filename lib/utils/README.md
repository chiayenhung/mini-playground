# Shared Utilities

This directory contains shared utilities used across the application.

## Error Handling (`error-handling.ts`)

### `extractErrorMessage(errorText, status?)`

Extracts clean, user-friendly error messages from various error response formats.

```typescript
import { extractErrorMessage } from '@/lib/utils'

// JSON error response
const jsonError = '{"error": {"message": "Rate limit exceeded"}}'
const message = extractErrorMessage(jsonError, 429)
// Returns: "Rate limit exceeded"

// Plain text error
const textError = 'Internal server error occurred'
const message = extractErrorMessage(textError, 500)
// Returns: "Internal server error"
```

### `classifyError(status, message)`

Classifies errors by type for consistent handling.

```typescript
import { classifyError, ErrorTypes } from '@/lib/utils'

const type = classifyError(429, 'Rate limit exceeded')
// Returns: ErrorTypes.RATE_LIMIT
```

### `createError(message, status, originalError?)`

Creates standardized error objects with metadata.

```typescript
import { createError } from '@/lib/utils'

const error = createError('Network failed', 500, originalError)
// Returns: {
//   message: "Network failed",
//   status: 500,
//   type: "server",
//   originalError: "TypeError: fetch failed",
//   timestamp: "2024-01-01T00:00:00.000Z"
// }
```

### Error Types

```typescript
import { ErrorTypes } from '@/lib/utils'

ErrorTypes.NETWORK        // Network connectivity issues
ErrorTypes.AUTHENTICATION // 401/403 errors
ErrorTypes.RATE_LIMIT     // 429 rate limiting
ErrorTypes.VALIDATION     // 400 validation errors
ErrorTypes.SERVER         // 5xx server errors
ErrorTypes.UNKNOWN        // Unclassified errors
```

## Usage Examples

### API Route Error Handling

```typescript
// app/api/example/route.ts
import { extractErrorMessage } from '@/lib/utils'

export async function GET() {
  try {
    const res = await fetch('https://api.example.com/data')
    if (!res.ok) {
      const errorText = await res.text()
      const errorMessage = extractErrorMessage(errorText, res.status)
      return NextResponse.json({ error: errorMessage }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (e) {
    const errorMessage = extractErrorMessage(e instanceof Error ? e.message : 'Unknown error', 500)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
```

### Client-Side Error Handling

```typescript
// hooks/use-example.ts
import { extractErrorMessage, createError } from '@/lib/utils'

const handleError = (error: any, status: number) => {
  const cleanMessage = extractErrorMessage(error.message, status)
  const errorObj = createError(cleanMessage, status, error)
  
  // Log error for debugging
  console.error('API Error:', errorObj)
  
  // Show user-friendly message
  setError(cleanMessage)
}
```
