# Deployment Guide

## Production Deployment Checklist

### 1. Convex Backend Deployment

```bash
# Deploy to production
npx convex deploy --prod

# Set production environment variables
npx convex env set OPENAI_API_KEY sk-your_key --prod
npx convex env set EVOLUTION_API_KEY your_key --prod
npx convex env set EVOLUTION_INSTANCE_NAME your_instance --prod
npx convex env set VITE_EVOLUTION_API_URL https://api-url.com --prod
```

### 2. Frontend Deployment Options

#### Option A: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_CONVEX_URL
```

Or connect your GitHub repo to Vercel:
1. Import project in Vercel dashboard
2. Add environment variable: `VITE_CONVEX_URL`
3. Deploy

#### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Or connect GitHub:
1. Connect repo in Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variable: `VITE_CONVEX_URL`

#### Option C: Cloudflare Pages

1. Connect GitHub repository
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Environment variables: `VITE_CONVEX_URL`

### 3. Update Evolution API Webhook

After deployment, update your Evolution API webhook URL to point to your production Convex endpoint:

```
https://your-production-deployment.convex.site/whatsapp/webhook
```

### 4. Post-Deployment Testing

1. **Test WhatsApp Integration**
   - Send test message
   - Verify webhook receives it
   - Check agent response

2. **Test Document Upload**
   - Upload a document
   - Verify it processes
   - Check embeddings are generated

3. **Test RAG Search**
   - Send query about uploaded document
   - Verify relevant information is retrieved
   - Check response quality

### 5. Monitoring

**Convex Dashboard:**
- Monitor function execution
- Check error logs
- Review database queries

**System Logs:**
- Access via `convex/lib/logging.ts`
- Query in Convex dashboard
- Filter by level/category

### 6. Security Considerations

- [ ] API keys stored in environment variables
- [ ] Webhook endpoint uses HTTPS
- [ ] Input validation on all mutations
- [ ] Rate limiting on public endpoints
- [ ] File upload size limits
- [ ] Allowed file types whitelist

### 7. Scaling Considerations

**Convex:**
- Auto-scales with usage
- No infrastructure management needed
- Pay per usage

**Evolution API:**
- Monitor message volume
- Upgrade plan if needed
- Consider multiple instances for load balancing

### 8. Backup Strategy

**Convex Data:**
- Automatic backups by Convex
- Export data via dashboard if needed
- Version control for schema

**Documents:**
- Stored in Convex Storage
- Consider periodic exports for critical files

### 9. Performance Optimization

1. **Vector Search:**
   - Limit results to top 5-10
   - Use filters for broker/property

2. **Message Processing:**
   - Queue system prevents bottlenecks
   - Retry logic for failures

3. **Frontend:**
   - Lazy load components
   - Optimize images
   - Use Convex subscriptions efficiently

### 10. Cost Optimization

**Convex:**
- Free tier: 1M function calls/month
- Pro tier: $25/month + usage
- Monitor in dashboard

**OpenAI:**
- Embeddings: ~$0.0001 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- Consider GPT-3.5 for cost savings

**Evolution API:**
- Check pricing plan
- Monitor message volume

## Rollback Procedure

If issues occur:

```bash
# Rollback Convex deployment
npx convex deploy --prod --rollback

# Or deploy specific version
npx convex deploy --prod --version <version-number>
```

Frontend rollback depends on hosting provider.

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy Convex
        run: npx convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
      
      - name: Build Frontend
        run: npm run build
        env:
          VITE_CONVEX_URL: ${{ secrets.VITE_CONVEX_URL }}
      
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## Support & Maintenance

**Regular Tasks:**
- Review error logs weekly
- Monitor API usage/costs
- Update dependencies monthly
- Test webhook connectivity
- Review agent response quality

**Emergency Contacts:**
- Convex Support: support@convex.dev
- Evolution API Support: [your provider]
- OpenAI Status: status.openai.com

