# Mini Model Playground

A simple chat interface for interacting with Fireworks AI models. Built with Next.js, TypeScript, and Tailwind CSS.

🚀 **Live Demo**: [https://mini-playground.vercel.app/](https://mini-playground.vercel.app/)

## Features

- **Model Selection**: Dropdown to choose from available Fireworks models with auto-selection
- **Real-time Streaming**: Stream responses as they're generated with live token counting
- **Chat Interface**: Clean, responsive chat UI with adaptive message bubbles (60-90% width)
- **Markdown Support**: Full markdown rendering for assistant responses with tables, code blocks, and formatting
- **Auto-scroll**: Automatically scrolls to new messages with pause/resume control
- **Performance Metrics**: Comprehensive timing data including TTFB, total time, and tokens per second
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new lines
- **Error Handling**: Graceful error handling with clean error messages displayed in red text
- **Mobile-Friendly**: Fully responsive design optimized for mobile devices with touch-friendly controls
- **Component Architecture**: Modular design with reusable components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown with remark-gfm for GitHub Flavored Markdown
- **API**: Fireworks AI Chat Completions API
- **State Management**: React hooks with custom abstractions
- **Architecture**: Component-based design with separation of concerns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Fireworks AI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chiayenhung/mini-playground.git
cd mini-playground
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Fireworks API key to `.env.local`:
```
FIREWORKS_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### `/api/models`
Fetches available models from Fireworks API.

### `/api/chat`
Handles chat completions with streaming support and error handling.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat completions endpoint with streaming & error handling
│   │   └── models/route.ts    # Models list endpoint
│   ├── page.tsx               # Main chat interface (orchestration only)
│   ├── globals.css            # Global styles with dark theme & mobile optimizations
│   └── layout.tsx             # Root layout with mobile viewport configuration
├── components/
│   ├── chat-input.tsx         # Message input form with keyboard shortcuts & mobile optimization
│   ├── chat-message.tsx       # Individual message display with markdown & error styling
│   ├── markdown-components.tsx # Markdown styling configuration
│   └── model-selector.tsx     # Model selection dropdown with mobile optimization
├── hooks/
│   ├── use-chat.ts            # Chat functionality with streaming, timing & error handling
│   └── use-models.ts          # Models fetching with error handling
└── package.json
```

## Architecture

### Custom Hooks

#### `useModels()`
Manages model fetching with loading and error states:
- Fetches and normalizes model data from Fireworks API
- Handles loading states and error recovery
- Auto-selects first available model

#### `useChat()`
Comprehensive chat functionality including:
- Message state management with TypeScript types including error message types
- Real-time streaming with SSE (Server-Sent Events)
- Auto-scroll control with pause/resume
- Performance timing (TTFB, total time, tokens per second)
- Token counting during streaming
- Graceful error handling with clean error message extraction
- Error message type classification for proper styling

### Components

#### `ModelSelector`
- Dropdown interface for model selection
- Loading states and error display
- Type-safe props with proper interfaces
- Mobile-optimized touch targets

#### `ChatMessage`
- Individual message rendering with role-based styling
- Full markdown support including tables, code blocks, lists
- Performance metrics display
- Responsive sizing (60-90% width)
- Error message styling with red text and red-themed markdown components
- Mobile-optimized layout

#### `ChatInput`
- Message composition with multi-line support
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Form validation and submission handling
- Integrated send/stop button logic
- Mobile-optimized with touch-friendly buttons and reduced textarea height

#### `markdownComponents`
- Custom markdown rendering configuration
- Dark theme optimized styling
- Table support with responsive design
- Code syntax highlighting
- Error-specific red-themed markdown components

## Mobile Optimizations

### Viewport Configuration
- Proper mobile viewport settings to prevent unwanted zooming
- Device-width scaling with initial scale of 1
- User-scalable disabled for consistent experience

### Touch-Friendly Design
- All interactive elements have minimum 44px height for easy tapping
- Optimized button and input sizes for mobile screens
- Responsive padding and spacing adjustments

### Mobile-Specific Features
- Reduced textarea height (2 rows instead of 3) on mobile
- Smaller padding and margins for better space utilization
- Improved chat message width (85% on mobile vs 60% on desktop)
- Touch-optimized scrolling with `-webkit-overflow-scrolling: touch`

### Input Optimization
- Font size set to 16px on mobile to prevent iOS zoom on focus
- Touch-friendly form controls with proper sizing
- Responsive layout that adapts to different screen sizes

## Error Handling

### Clean Error Messages
- Extracts meaningful error messages from API responses
- Removes technical details and stack traces
- Provides user-friendly error descriptions
- Supports common error patterns and HTTP status codes

### Visual Error Indicators
- Error messages displayed in red text
- Red-themed markdown components for error content
- Red border and background tint for error message containers
- Consistent error styling across all markdown elements

### Error Types Supported
- API errors (rate limiting, authentication, etc.)
- Network errors
- Model-specific errors
- Server errors with appropriate status code mapping

## Potential Improvements

### Data & State Management
- **React Query**: Implement `@tanstack/react-query` for better server state management, caching, and background refetching of models and chat history
- **Persistent Storage**: Add local storage or database integration for chat history persistence
- **Optimistic Updates**: Implement optimistic UI updates for better perceived performance

### User Experience
- **Internationalization (i18n)**: Add multi-language support using `next-intl` or similar for global accessibility
- **New Chat Threads**: Create multiple chat sessions with sidebar navigation and thread management
- **Chat History**: Save and restore previous conversations with search and filtering capabilities
- **Export Functionality**: Allow users to export chat conversations as Markdown, PDF, or JSON

### Enhanced Features
- **Message Actions**: Add copy, edit, delete, and regenerate options for individual messages
- **Model Comparison**: Side-by-side comparison of responses from different models
- **Custom Prompts**: Predefined prompt templates and user-saved prompts
- **File Uploads**: Support for image, document, and code file uploads

### Performance & Monitoring
- **Real Token Counting**: Integrate with tiktoken or model-specific tokenizers for accurate counts
- **Analytics**: Track usage patterns, model performance, and user interactions
- **Error Tracking**: Implement Sentry or similar for production error monitoring
- **Rate Limiting**: Add client-side rate limiting and queue management

### Developer Experience
- **Testing**: Add unit tests (Jest), integration tests (Playwright), and component tests (Testing Library)
- **Storybook**: Component documentation and visual testing
- **API Documentation**: OpenAPI/Swagger documentation for the chat API
- **CI/CD Pipeline**: Automated testing, linting, and deployment workflows

## Deployment

This project can be deployed to Vercel, Netlify, or any other Next.js-compatible platform.

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add your `FIREWORKS_API_KEY` environment variable
3. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
