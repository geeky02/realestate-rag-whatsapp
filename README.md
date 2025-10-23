# WhatsApp AI Agent for Real Estate Brokers

A production-ready WhatsApp AI agent system that helps real estate brokers manage conversations, upload property documents, and provide intelligent responses using RAG (Retrieval-Augmented Generation).

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Convex (Real-time database, vector search, serverless functions)
- **WhatsApp Integration**: Evolution API
- **AI/ML**: OpenAI (embeddings, transcription)
- **Storage**: Convex Storage

## 📋 Features

- 📱 WhatsApp Integration for sending/receiving messages
- 📄 Document upload and management
- 🤖 AI-powered responses using RAG
- 🎙️ Audio transcription support
- 💬 Real-time conversation tracking
- 🏠 Property management
- 👤 Broker profile management
- 📊 Vector search for semantic document retrieval

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Evolution API account
- OpenAI API key
- Convex account

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys.

3. Initialize Convex:

```bash
npx convex dev
```

This will:
- Create a new Convex project (or link to existing)
- Generate your Convex URL
- Set up the database schema
- Deploy your functions

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
├── convex/                 # Convex backend
│   ├── schema.ts          # Database schema
│   ├── properties.ts      # Property-related functions
│   ├── brokers.ts         # Broker management
│   ├── messages.ts        # Message handling
│   ├── documents.ts       # Document management
│   ├── whatsapp.ts        # WhatsApp integration
│   ├── agent.ts           # RAG agent implementation
│   ├── http.ts            # HTTP endpoints for webhooks
│   └── lib/               # Shared utilities
├── src/
│   ├── components/        # React components
│   │   ├── DocumentUpload.tsx
│   │   ├── Conversations.tsx
│   │   ├── ChatInterface.tsx
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Frontend utilities
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
└── package.json
```

## 🔧 Configuration

### Convex Setup

The Convex backend is configured with:
- **Vector search** for semantic document retrieval
- **Storage** for uploaded files
- **Real-time subscriptions** for live updates
- **HTTP endpoints** for Evolution API webhooks

### Evolution API Setup

Configure your Evolution API webhook to point to:
```
https://your-convex-deployment.convex.site/whatsapp/webhook
```

## 🎯 Usage

### Document Upload

1. Navigate to the "Document Upload" tab
2. Select broker and property
3. Upload PDF, DOCX, or text files
4. Documents are automatically processed and vectorized

### Conversations

1. Navigate to the "Conversations" tab
2. View all WhatsApp conversations
3. AI agent automatically responds using RAG
4. View conversation history and context

## 🔐 Security

- Environment variables for sensitive data
- Type-safe API calls
- Input validation
- Secure file upload handling

## 📝 Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Deploying Convex

```bash
npm run convex:deploy
```

## 🤝 Contributing

This is a production system. Follow TypeScript best practices and ensure all changes are type-safe.

## 📄 License

Private - All rights reserved

