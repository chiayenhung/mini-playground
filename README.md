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
- **Error Handling**: Graceful error handling with inline error display
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
Handles chat completions with streaming support.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat completions endpoint with streaming
│   │   └── models/route.ts    # Models list endpoint
│   ├── globals.css            # Global styles with dark theme
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main chat interface (orchestration only)
├── components/
│   ├── chat-input.tsx         # Message input form with keyboard shortcuts
│   ├── chat-message.tsx       # Individual message display with markdown
│   ├── markdown-components.tsx # Markdown styling configuration
│   └── model-selector.tsx     # Model selection dropdown
├── hooks/
│   ├── use-chat.ts            # Chat functionality with streaming & timing
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
- Message state management with TypeScript types
- Real-time streaming with SSE (Server-Sent Events)
- Auto-scroll control with pause/resume
- Performance timing (TTFB, total time, tokens per second)
- Token counting during streaming
- Graceful error handling

### Components

#### `ModelSelector`
- Dropdown interface for model selection
- Loading states and error display
- Type-safe props with proper interfaces

#### `ChatMessage`
- Individual message rendering with role-based styling
- Full markdown support including tables, code blocks, lists
- Performance metrics display
- Responsive sizing (60-90% width)

#### `ChatInput`
- Message composition with multi-line support
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Form validation and submission handling
- Integrated send/stop button logic

#### `markdownComponents`
- Custom markdown rendering configuration
- Dark theme optimized styling
- Table support with responsive design
- Code syntax highlighting

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
