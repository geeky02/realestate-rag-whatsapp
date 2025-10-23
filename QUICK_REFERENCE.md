# Quick Reference Guide

## Common Commands

### Development
```bash
# Start Convex backend (keep running)
npx convex dev

# Start frontend dev server
npm run dev

# Open Convex dashboard
npx convex dashboard

# Run linter
npm run lint

# Build for production
npm run build
```

### Convex Operations
```bash
# Set environment variable
npx convex env set KEY value

# Set for production
npx convex env set KEY value --prod

# List environment variables
npx convex env list

# Deploy to production
npx convex deploy --prod

# View logs
npx convex logs

# Clear data (development only)
npx convex data clear
```

## Common Tasks

### Adding a New Broker
```typescript
// In Convex dashboard or via mutation
import { api } from './convex/_generated/api'

await useMutation(api.brokers.create)({
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  whatsappNumber: "+1234567890"
})
```

### Adding a Property
```typescript
await useMutation(api.properties.create)({
  brokerId: "broker-id",
  title: "Beautiful 3BR House",
  description: "Spacious home with...",
  address: "123 Main St",
  price: 450000,
  bedrooms: 3,
  bathrooms: 2,
  squareFeet: 2000,
  propertyType: "house"
})
```

### Uploading a Document
Use the Document Upload tab in the UI, or programmatically:

```typescript
// 1. Generate upload URL
const uploadUrl = await generateUploadUrl()

// 2. Upload file
const result = await fetch(uploadUrl, {
  method: 'POST',
  headers: { 'Content-Type': file.type },
  body: file,
})

const { storageId } = await result.json()

// 3. Create document record
await createDocument({
  brokerId: "broker-id",
  title: file.name,
  storageId,
  fileType: "pdf",
  fileSize: file.size
})
```

### Querying Data in Dashboard

**Get all active conversations:**
```
conversations.list({ status: "active", limit: 10 })
```

**Get messages for a conversation:**
```
messages.listByConversation({ conversationId: "conv-id" })
```

**Search properties:**
```
properties.search({ searchTerm: "house", brokerId: "broker-id" })
```

**Get recent logs:**
```
lib/logging.getRecent({ level: "error", limit: 20 })
```

## API Endpoints

### Webhook (Evolution API)
```
POST https://your-deployment.convex.site/whatsapp/webhook
```

**Payload example:**
```json
{
  "event": "messages.upsert",
  "instance": "your-instance",
  "data": {
    "key": {
      "remoteJid": "1234567890@s.whatsapp.net",
      "id": "message-id"
    },
    "message": {
      "conversation": "Hello, I'm interested in a property"
    }
  }
}
```

### Health Check
```
GET https://your-deployment.convex.site/health
```

## Environment Variables

### Frontend (.env.local)
```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_EVOLUTION_API_URL=https://your-evolution-api.com
```

### Backend (Convex)
```bash
npx convex env set OPENAI_API_KEY sk-...
npx convex env set EVOLUTION_API_KEY ...
npx convex env set EVOLUTION_INSTANCE_NAME ...
npx convex env set VITE_EVOLUTION_API_URL https://...
```

## Troubleshooting

### Issue: Messages not being received
**Check:**
1. Evolution API webhook is configured correctly
2. Convex HTTP endpoint is accessible
3. Check Convex logs: `npx convex logs`
4. Verify Evolution API instance is active

### Issue: Documents not processing
**Check:**
1. OpenAI API key is set
2. Check logs for processing errors
3. Verify file type is supported (.txt, .pdf, .docx)
4. Check storage quota

### Issue: AI responses not relevant
**Adjust:**
1. Upload more comprehensive documents
2. Tweak prompt in `convex/lib/openai.ts`
3. Increase vector search results limit
4. Check document embeddings are generated

### Issue: Frontend not connecting to Convex
**Check:**
1. `VITE_CONVEX_URL` is set in `.env.local`
2. Convex dev server is running
3. Browser console for errors
4. Network tab for failed requests

## Code Snippets

### Custom React Hook for Convex Query
```typescript
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

export function useConversations(brokerId: Id<'brokers'>) {
  return useQuery(api.conversations.list, { 
    brokerId, 
    limit: 20 
  })
}
```

### Sending a Manual WhatsApp Message
```typescript
import { useAction } from 'convex/react'
import { api } from '../convex/_generated/api'

const sendMessage = useAction(api.whatsapp.sendMessage)

await sendMessage({
  conversationId: convId,
  brokerId: brokerId,
  recipientPhone: "+1234567890",
  messageType: "text",
  content: "Hello from the system!",
  isFromAgent: false
})
```

### Vector Search for Documents
```typescript
// First, generate embedding for search query
const embedding = await generateEmbedding({ text: "3 bedroom house" })

// Then search documents
const results = await vectorSearch({
  embedding,
  brokerId: "broker-id",
  limit: 5
})
```

## File Locations Quick Reference

| What | Where |
|------|-------|
| Database Schema | `convex/schema.ts` |
| AI Agent Logic | `convex/agent.ts` |
| OpenAI Integration | `convex/lib/openai.ts` |
| WhatsApp Integration | `convex/whatsapp.ts` |
| Webhook Handler | `convex/http.ts` |
| Document Upload UI | `src/components/DocumentUpload.tsx` |
| Chat Interface | `src/components/ChatInterface.tsx` |
| System Logs | Query via `convex/lib/logging.ts` |
| Types | `src/types/index.ts` |
| Utilities | `src/lib/utils.ts` |

## Testing Checklist

- [ ] Broker created successfully
- [ ] Property added to broker
- [ ] Document uploaded and processed
- [ ] Embedding generated for document
- [ ] WhatsApp webhook receives messages
- [ ] Agent processes message
- [ ] Vector search retrieves relevant docs
- [ ] AI generates appropriate response
- [ ] Response sent via WhatsApp
- [ ] Conversation visible in UI
- [ ] Messages display correctly

## Performance Tips

1. **Limit query results** - Use `limit` parameter
2. **Filter early** - Use indexes for filtering
3. **Batch operations** - Group related mutations
4. **Use subscriptions wisely** - Don't over-subscribe
5. **Optimize embeddings** - Cache when possible
6. **Monitor costs** - Check Convex and OpenAI usage

## Security Best Practices

1. **Never commit** `.env.local`
2. **Validate inputs** in all mutations
3. **Use indexes** for queries
4. **Limit file sizes** for uploads
5. **Whitelist file types** for documents
6. **Rate limit** public endpoints
7. **Monitor logs** for suspicious activity

## Support Resources

- **Convex Docs**: https://docs.convex.dev
- **Convex Discord**: https://convex.dev/community
- **OpenAI Docs**: https://platform.openai.com/docs
- **Evolution API Docs**: [Your provider's docs]
- **Project README**: `README.md`
- **Setup Guide**: `SETUP.md`
- **Deployment Guide**: `DEPLOYMENT.md`

