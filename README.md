# Social Media Composer + Scheduler

An AI-powered social media management application that generates platform-specific content using OpenAI and publishes/schedules posts across multiple social media platforms using the Late API.

## Features

- **AI Content Generation**: Create platform-optimized copy for LinkedIn, Instagram, Twitter/X, and Facebook
- **Multi-Platform Publishing**: Connect and post to multiple social media accounts simultaneously
- **Media Upload**: Upload images and media files through Late's API
- **Scheduling**: Publish immediately or schedule posts for optimal engagement times
- **Account Management**: Connect and manage multiple social media accounts per platform

## Supported Platforms

- Instagram
- LinkedIn
- Facebook
- Twitter/X (requires BYOK - Bring Your Own Keys)
- TikTok
- YouTube
- Threads

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Vercel Edge Functions
- **AI**: OpenAI GPT-4o-mini for content generation
- **Social Media API**: Late API for connections and publishing
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
\`\`\`


### 2. Installation

\`\`\`bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
\`\`\`

### 3. Connect Social Media Accounts

1. Navigate to `/dashboard/create-post`
2. Use the "Connect" buttons to link your social media accounts through Late's OAuth flow
3. Each platform will redirect you through their respective authorization process

## Usage

### Creating and Publishing Posts

1. **Navigate to Dashboard**: Go to `/dashboard/create-post`

2. **Generate Content**:
   - Enter your topic/prompt in the text area
   - Optionally add a link to include in the post
   - Select the tone (Professional, Friendly, Authoritative, Concise)
   - Click "Generate AI Copy"

3. **Upload Media** (Optional):
   - Select an image file
   - Click "Upload to Late" to ```md file="README.md"
# Social Media Composer + Scheduler

An AI-powered social media management application that generates platform-specific content using OpenAI and publishes/schedules posts across multiple social media platforms using the Late API.

## Features

- **AI Content Generation**: Create platform-optimized copy for LinkedIn, Instagram, Twitter/X, and Facebook
- **Multi-Platform Publishing**: Connect and post to multiple social media accounts simultaneously
- **Media Upload**: Upload images and media files through Late's API
- **Scheduling**: Publish immediately or schedule posts for optimal engagement times
- **Account Management**: Connect and manage multiple social media accounts per platform

## Supported Platforms

- Instagram
- LinkedIn
- Facebook
- Twitter/X (requires BYOK - Bring Your Own Keys)
- TikTok
- YouTube
- Threads

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Vercel Edge Functions
- **AI**: OpenAI GPT-4o-mini for content generation
- **Social Media API**: Late API for connections and publishing
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
\`\`\`


### 2. Installation

\`\`\`bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
\`\`\`

### 3. Connect Social Media Accounts

1. Navigate to `/dashboard/create-post`
2. Use the "Connect" buttons to link your social media accounts through Late's OAuth flow
3. Each platform will redirect you through their respective authorization process

## Usage

### Creating and Publishing Posts

1. **Navigate to Dashboard**: Go to `/dashboard/create-post`

2. **Generate Content**:
   - Enter your topic/prompt in the text area
   - Optionally add a link to include in the post
   - Select the tone (Professional, Friendly, Authoritative, Concise)
   - Click "Generate AI Copy"

3. **Upload Media** (Optional):
   - Select an image file
   - Click "Upload to Late" to process the media

4. **Select Accounts**:
   - Choose which connected social media accounts to post to
   - You can select multiple accounts per platform

5. **Publish or Schedule**:
   - Choose "Publish now" for immediate posting
   - Or select "Schedule for" and pick a date/time with timezone
   - Click "Publish Now" or "Schedule"

### Platform-Specific Features

- **Twitter/X**: Supports thread creation for longer content
- **LinkedIn**: Optimized for professional content with first comments
- **Instagram**: Includes hashtag optimization and first comments
- **Facebook**: Supports longer-form content

## API Routes

The application includes several API endpoints:

- `/api/compose` - Generates AI content for all platforms
- `/api/upload` - Uploads media files to Late
- `/api/post` - Publishes or schedules posts
- `/api/late/connect` - Initiates OAuth connection flow
- `/api/late/accounts` - Retrieves connected accounts

## Character Limits

The AI respects platform-specific character limits:

- **Twitter/X**: 280 characters
- **Instagram**: ~2,200 characters
- **LinkedIn**: ~3,000 characters
- **Facebook**: ~63,000 characters

## Error Handling

The application handles various error scenarios:

- **API Rate Limits**: Displays user-friendly messages when limits are reached
- **Upload Failures**: Shows specific error messages for file size or type issues
- **Partial Success**: When some platforms succeed and others fail (HTTP 207)
- **Authentication Issues**: Clear guidance for reconnecting accounts

## Development

### Project Structure

\`\`\`
/app
  /api
    /compose/route.ts          # AI content generation
    /upload/route.ts           # Media upload to Late
    /post/route.ts             # Publishing and scheduling
    /late
      /connect/route.ts        # OAuth connection initiation
      /accounts/route.ts       # Account listing
  /dashboard
    /create-post/page.tsx      # Main dashboard interface
  page.tsx                     # Homepage
  layout.tsx                   # Root layout
  globals.css                  # Global styles
\`\`\`

### Adding New Platforms

To add support for additional platforms:

1. Add the platform to the connect buttons in the dashboard
2. Update the type definitions for supported platforms
3. Add platform-specific content generation rules in the AI prompt
4. Handle any platform-specific API requirements in the post route

## Troubleshooting

### Common Issues

1. **"No accounts connected"**: Make sure you've completed the OAuth flow for at least one platform
2. **"Compose failed"**: Check your OpenAI API key and rate limits
3. **"Upload failed"**: Verify file size is under Late's limits (typically 5GB max)
4. **Twitter/X not working**: Ensure BYOK is configured in your Late dashboard

### Rate Limits

- **OpenAI**: Varies by plan (check your OpenAI dashboard)
- **Late API**: Varies by tier (Free: 60 rpm, Advanced: 1200 rpm)

### Large File Uploads

For files larger than ~4-10MB, Late provides a tokenized upload flow. The current implementation uses direct upload for simplicity.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **OpenAI**: Check [OpenAI's documentation](https://platform.openai.com/docs)
- **This application**: Open an issue in the repository
