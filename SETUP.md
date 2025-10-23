# Setup Guide

This guide will help you set up the WhatsApp AI Agent system for real estate brokers.

## Prerequisites

1. **Node.js** (>= 18.0.0)
2. **npm** or **yarn**
3. **Convex Account** - Sign up at https://convex.dev
4. **Evolution API** - WhatsApp integration service
5. **OpenAI API Key** - For embeddings and transcription

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Convex

Initialize Convex in your project:

```bash
npx convex dev
```

This will:
- Open your browser to create/login to your Convex account
- Create a new Convex project
- Generate your deployment URL
- Set up the database schema
- Deploy your backend functions

Keep this terminal running during development.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Convex (automatically set by `npx convex dev`)
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Evolution API
VITE_EVOLUTION_API_URL=https://your-evolution-api-url.com
EVOLUTION_API_KEY=your_evolution_api_key
EVOLUTION_INSTANCE_NAME=your_instance_name

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key
```

### 4. Configure Convex Environment Variables

Set up your API keys in Convex (for backend functions):

```bash
npx convex env set OPENAI_API_KEY sk-your_openai_api_key
npx convex env set EVOLUTION_API_KEY your_evolution_api_key
npx convex env set EVOLUTION_INSTANCE_NAME your_instance_name
npx convex env set VITE_EVOLUTION_API_URL https://your-evolution-api-url.com
```

### 5. Set Up Evolution API Webhook

After deploying, get your Convex HTTP endpoint URL:

```bash
npx convex dashboard
```

Navigate to Settings > HTTP Actions, and copy your deployment URL.

Configure your Evolution API webhook to point to:
```
https://your-deployment.convex.site/whatsapp/webhook
```

### 6. Seed Initial Data (Optional)

You can create test data using the Convex dashboard or by running mutations:

```bash
# Open Convex dashboard
npx convex dashboard
```

Then in the dashboard, navigate to Functions and run:
- `brokers:create` to add a broker
- `properties:create` to add properties

### 7. Start Development Server

In a new terminal (keep `npx convex dev` running):

```bash
npm run dev
```

Visit `http://localhost:3000`

## Development Workflow

1. **Backend Changes**: Edit files in `convex/` - changes auto-deploy
2. **Frontend Changes**: Edit files in `src/` - hot reload enabled
3. **Schema Changes**: Edit `convex/schema.ts` - will trigger re-deployment

## Testing WhatsApp Integration

1. Send a WhatsApp message to your Evolution API instance
2. The message will be received via webhook
3. The AI agent will process it using RAG
4. A response will be sent back via WhatsApp

## Production Deployment

### Deploy Convex Backend

```bash
npm run convex:deploy
```

### Deploy Frontend

Build the frontend:

```bash
npm run build
```

Deploy the `dist/` folder to your hosting provider:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting

### Environment Variables for Production

Make sure to set these in your hosting provider:
- `VITE_CONVEX_URL` - Your production Convex URL

## Architecture Overview

```
┌─────────────┐
│  WhatsApp   │
│   Client    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Evolution   │
│     API     │
└──────┬──────┘
       │ Webhook
       ↓
┌─────────────────────────────┐
│      Convex Backend         │
│  ┌────────────────────────┐ │
│  │  HTTP Webhook Handler  │ │
│  └───────────┬────────────┘ │
│              ↓               │
│  ┌────────────────────────┐ │
│  │   Message Queue        │ │
│  └───────────┬────────────┘ │
│              ↓               │
│  ┌────────────────────────┐ │
│  │   AI Agent (RAG)       │ │
│  │  - Vector Search       │ │
│  │  - OpenAI Embeddings   │ │
│  │  - Document Retrieval  │ │
│  └───────────┬────────────┘ │
│              ↓               │
│  ┌────────────────────────┐ │
│  │  Response Generator    │ │
│  └───────────┬────────────┘ │
└──────────────┼──────────────┘
               ↓
       ┌───────────────┐
       │  Evolution API│
       │   (Send)      │
       └───────┬───────┘
               ↓
       ┌───────────────┐
       │   WhatsApp    │
       │    Client     │
       └───────────────┘
```

## Troubleshooting

### Convex Connection Issues
- Ensure `VITE_CONVEX_URL` is set correctly
- Check that `npx convex dev` is running

### Webhook Not Receiving Messages
- Verify Evolution API webhook URL is correct
- Check Convex logs in dashboard
- Ensure Evolution API has proper permissions

### Document Processing Not Working
- Verify OpenAI API key is set
- Check file types are supported (.txt, .pdf, .docx)
- Review logs in Convex dashboard

### Messages Not Sending
- Check Evolution API credentials
- Verify instance is active
- Check system logs

## Support

For issues:
1. Check Convex dashboard logs
2. Review Evolution API status
3. Check browser console for frontend errors
4. Review this documentation

## Next Steps

- Add more brokers and properties
- Upload property documents
- Test WhatsApp conversations
- Monitor agent responses
- Customize AI prompts in `convex/lib/openai.ts`

