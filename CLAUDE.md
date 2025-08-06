# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Available MCP Tools
When you need to look up documentation for libraries or APIs, use the context7 MCP server:
- Use `mcp__context7__resolve-library-id` to find the library ID
- Use `mcp__context7__get-library-docs` to retrieve documentation

## Project Overview
ArtSwipe is an MVP web application that learns user art preferences through image comparisons and generates personalized artwork. The app follows a 3-step flow: intake → discovery → results.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI Services**: 
  - FAL.ai for image generation (FLUX models)
  - OpenRouter for LLM explanations (GPT-4o-mini)
- **Deployment**: Vercel

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production bundle
npm run start        # Start production server
```

### Database Setup
1. Create a Supabase project at supabase.com
2. Run the schema from `lib/database/schema.sql` in Supabase SQL editor
3. Copy credentials to `.env.local`

### Generate Test Images
```bash
npm run generate-test-images   # Generates 60 test images for comparisons
```

## Project Structure
```
app/
├── api/              # API endpoints (session, choice, generate)
├── page.tsx          # Main app flow component
├── layout.tsx        # Root layout with metadata
└── globals.css       # Global styles

components/
├── IntakeForm.tsx    # Step 1: Room, color, size selection
├── ImageComparison.tsx # Step 2: Side-by-side image choice
├── ProgressBar.tsx   # Progress indicator
└── ResultsGallery.tsx # Step 3: Generated artworks display

lib/
├── ai/               # AI service integrations
│   ├── fal.ts       # FAL.ai image generation
│   └── openrouter.ts # OpenRouter LLM
├── algorithms/       # Core logic
│   └── tasteDiscovery.ts # Preference learning
└── database/         # Database client and schema
    └── supabase.ts
```

## Key Algorithms

### Taste Discovery
- Simple vote counting system (not Bayesian)
- 20 total comparisons divided into phases:
  - Comparisons 1-8: Style testing
  - Comparisons 9-13: Complexity testing  
  - Comparisons 14-18: Subject testing
  - Comparisons 19-20: Color confirmation
- Tracks preferences with counters and averages

### Image Generation
- Pre-generated test images for instant loading
- Final artworks use FLUX-dev for quality
- Generates 12 variations based on learned preferences

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
FAL_API_KEY
OPENROUTER_API_KEY
```

## Testing Workflow
1. Set up environment variables
2. Run database schema in Supabase
3. Generate test images: `npm run generate-test-images`
4. Start dev server: `npm run dev`
5. Test complete flow locally

## Cost Considerations
- Test image generation: ~$0.60 one-time (60 images)
- Per user: ~$0.15 (explanation + 12 generated images)
- Keep FAL.ai on FLUX-schnell for tests, FLUX-dev for final

## Common Issues & Solutions

### Images not loading
- Check Supabase storage CORS settings
- Verify FAL.ai API key is valid
- Check next.config.mjs image domains

### Database connection errors
- Verify Supabase credentials in .env.local
- Check if tables exist (run schema.sql)
- Ensure service key is used for admin operations

### Slow generation
- FAL.ai rate limits: Add delays between requests
- Consider batching image generation
- Use FLUX-schnell for testing

## Next Steps for Development
1. Add payment integration for high-res downloads
2. Implement user accounts to save preferences
3. Add social sharing features
4. Optimize image loading with CDN
5. Add analytics tracking