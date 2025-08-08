# Mini Model Playground

A simple chat interface for interacting with Fireworks AI models. Built with Next.js, TypeScript, and Tailwind CSS.

🚀 **Live Demo**: [https://mini-playground.vercel.app/](https://mini-playground.vercel.app/)

## Features

- **Model Selection**: Dropdown to choose from available Fireworks models
- **Real-time Streaming**: Stream responses as they're generated
- **Chat Interface**: Clean, responsive chat UI with user/assistant message bubbles
- **Auto-scroll**: Automatically scrolls to new messages with pause/resume control
- **Performance Metrics**: Shows timing information for each response
- **Error Handling**: Graceful error handling with user-friendly messages

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Fireworks AI Chat Completions API
- **State Management**: React hooks with custom abstractions

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
│   │   ├── chat/route.ts      # Chat completions endpoint
│   │   └── models/route.ts    # Models list endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main chat interface
├── hooks/
│   ├── use-chat.ts            # Chat functionality hook
│   └── use-models.ts          # Models fetching hook
└── package.json
```

## Custom Hooks

### `useModels()`
Manages model fetching with loading and error states.

### `useChat()`
Handles chat functionality including:
- Message state management
- Streaming responses
- Auto-scroll control
- Performance timing
- Error handling

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
