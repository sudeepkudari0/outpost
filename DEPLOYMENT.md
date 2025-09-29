# Deployment Guide

## Vercel Deployment (Recommended)

This application is optimized for deployment on Vercel with Edge Functions.

### 1. Deploy to Vercel

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to link your project
\`\`\`

### 2. Environment Variables

In your Vercel dashboard, add the following environment variables:

- `LATE_API_KEY` - Your Late API key
- `NEXT_PUBLIC_LATE_BASE` - `https://getlate.dev/api`
- `NEXT_PUBLIC_LATE_PROFILE_ID` - Your Late profile ID
- `OPENAI_API_KEY` - Your OpenAI API key

### 3. Domain Configuration

1. Add your custom domain in Vercel dashboard
2. Update any OAuth redirect URLs in Late dashboard to use your production domain

## Alternative Deployment Options

### Docker

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Environment Variables for Production

Ensure all environment variables are properly set in your production environment:

\`\`\`bash
# Required
LATE_API_KEY=your_production_late_api_key
OPENAI_API_KEY=your_production_openai_api_key
NEXT_PUBLIC_LATE_PROFILE_ID=your_production_profile_id
NEXT_PUBLIC_LATE_BASE=https://getlate.dev/api

# Optional
NODE_ENV=production
\`\`\`

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] OAuth redirects are updated for production domain
- [ ] Test account connections work
- [ ] Test content generation
- [ ] Test media uploads
- [ ] Test publishing and scheduling
- [ ] Monitor error logs and performance
