# Project Structure

```
whatsapp-realstate-ai-agent/
├── convex/                          # Convex backend (serverless functions)
│   ├── _generated/                  # Auto-generated Convex files
│   ├── lib/                         # Shared backend utilities
│   │   ├── openai.ts               # OpenAI integration (embeddings, chat)
│   │   ├── transcription.ts        # Audio transcription with Whisper
│   │   └── logging.ts              # System logging utilities
│   ├── schema.ts                   # Database schema definitions
│   ├── brokers.ts                  # Broker CRUD operations
│   ├── properties.ts               # Property management
│   ├── documents.ts                # Document upload & vector search
│   ├── conversations.ts            # Conversation management
│   ├── messages.ts                 # Message CRUD & queue
│   ├── whatsapp.ts                 # WhatsApp API integration
│   ├── agent.ts                    # RAG agent implementation
│   ├── http.ts                     # HTTP endpoints (webhooks)
│   ├── internal.ts                 # Internal queries
│   ├── tsconfig.json               # TypeScript config for backend
│   └── convex.json                 # Convex configuration
│
├── src/                            # React frontend
│   ├── components/                 # React components
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Tabs.tsx           # Radix UI tabs wrapper
│   │   │   ├── Button.tsx         # Button component
│   │   │   ├── Input.tsx          # Input component
│   │   │   ├── Select.tsx         # Select dropdown
│   │   │   ├── Card.tsx           # Card layouts
│   │   │   ├── Loading.tsx        # Loading states
│   │   │   └── EmptyState.tsx     # Empty state placeholders
│   │   ├── DocumentUpload.tsx     # Document upload interface
│   │   ├── Conversations.tsx      # Conversation list view
│   │   └── ChatInterface.tsx      # WhatsApp-style chat UI
│   │
│   ├── hooks/                      # Custom React hooks
│   │   └── useConvexQuery.ts      # Type-safe Convex query wrapper
│   │
│   ├── lib/                        # Frontend utilities
│   │   └── utils.ts               # Helper functions
│   │
│   ├── types/                      # TypeScript type definitions
│   │   └── index.ts               # Shared types
│   │
│   ├── App.tsx                     # Main application component
│   ├── main.tsx                    # Application entry point
│   ├── index.css                   # Global styles + Tailwind
│   └── vite-env.d.ts              # Vite environment types
│
├── public/                         # Static assets
│
├── .github/                        # GitHub configuration (optional)
│   └── workflows/                  # CI/CD workflows
│
├── node_modules/                   # Dependencies (git-ignored)
├── dist/                           # Production build (git-ignored)
│
├── package.json                    # Project dependencies & scripts
├── package-lock.json              # Dependency lock file
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json             # TypeScript config for Node
├── vite.config.ts                  # Vite bundler configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── .eslintrc.cjs                   # ESLint configuration
├── convex.json                     # Convex project config
│
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment (git-ignored)
├── .gitignore                      # Git ignore rules
│
├── README.md                       # Project overview & quick start
├── SETUP.md                        # Detailed setup instructions
├── DEPLOYMENT.md                   # Production deployment guide
└── PROJECT_STRUCTURE.md           # This file
```

## Key Directories Explained

### `/convex` - Backend (Convex)
All serverless backend code. Convex handles:
- Real-time database with TypeScript schema
- Vector search for RAG
- File storage
- HTTP endpoints for webhooks
- Scheduled tasks

### `/src` - Frontend (React)
Modern React 18 application with:
- TypeScript for type safety
- Vite for fast builds
- Tailwind CSS for styling
- Radix UI for accessible components
- Convex React hooks for real-time data

### `/convex/lib` - Backend Utilities
Shared backend logic:
- OpenAI API calls (embeddings, chat completion)
- Audio transcription
- System logging

### `/src/components/ui` - UI Components
Reusable, styled components following design system patterns.

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │  Document  │  │Conversations│  │  Chat Interface │   │
│  │   Upload   │  │    List     │  │   (Messages)    │   │
│  └──────┬─────┘  └──────┬──────┘  └────────┬────────┘   │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
          │ Convex React   │                  │
          │ Subscriptions  │                  │
          │                │                  │
┌─────────▼────────────────▼──────────────────▼───────────┐
│              Convex Backend (Serverless)                 │
│  ┌──────────┐  ┌───────────┐  ┌────────────────────┐   │
│  │ Mutations│  │  Queries  │  │  Actions (async)   │   │
│  └────┬─────┘  └─────┬─────┘  └──────┬─────────────┘   │
│       │              │                │                  │
│       ▼              ▼                ▼                  │
│  ┌────────────────────────────────────────────────┐    │
│  │          Database (with Vector Index)          │    │
│  └────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────┐    │
│  │              Convex Storage                     │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────┬─────────────────────────────────┘
                       │
                       │ HTTP Webhooks
                       │
           ┌───────────▼────────────┐
           │    Evolution API       │
           │  (WhatsApp Gateway)    │
           └───────────┬────────────┘
                       │
                       │
           ┌───────────▼────────────┐
           │      WhatsApp          │
           │   (End User Client)    │
           └────────────────────────┘
```

## Key Features by File

### Document Management
- `convex/documents.ts` - Upload, storage, vector embeddings
- `src/components/DocumentUpload.tsx` - UI for uploads

### Conversation Handling
- `convex/conversations.ts` - Conversation CRUD
- `convex/messages.ts` - Message management
- `src/components/Conversations.tsx` - List view
- `src/components/ChatInterface.tsx` - Chat UI

### AI Agent (RAG)
- `convex/agent.ts` - Main RAG logic
- `convex/lib/openai.ts` - OpenAI API calls
- Vector search in `convex/documents.ts`

### WhatsApp Integration
- `convex/whatsapp.ts` - Send/receive messages
- `convex/http.ts` - Webhook endpoints
- Evolution API as gateway

### Property Management
- `convex/properties.ts` - Property CRUD
- `convex/brokers.ts` - Broker management

## Tech Stack Summary

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Convex React SDK

**Backend:**
- Convex (serverless platform)
- TypeScript
- Vector Search
- Real-time subscriptions

**Integrations:**
- Evolution API (WhatsApp)
- OpenAI (embeddings, GPT-4, Whisper)

**Development:**
- ESLint
- Hot reload (Vite + Convex)
- Type-safe end-to-end

## Environment Setup

1. **Development**: `.env.local` + `npx convex dev`
2. **Production**: Environment variables in hosting + `npx convex deploy --prod`

## Getting Started

See `SETUP.md` for detailed instructions.

Quick start:
```bash
npm install
npx convex dev      # Terminal 1
npm run dev         # Terminal 2
```

