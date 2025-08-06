# ArtSwipe MVP

Discover your art DNA in 60 seconds through smart image comparisons, then get 10-15 personalized artworks you can download or print.

## Quick Start

### 1. Set up environment variables
Copy `.env.local.example` to `.env.local` and add your API keys:
```bash
cp .env.local.example .env.local
```

Required keys:
- Supabase credentials (create project at supabase.com)
- FAL.ai API key (get from fal.ai)
- OpenRouter API key (get from openrouter.ai)

### 2. Install dependencies
```bash
npm install
```

### 3. Set up database
1. Create a Supabase project
2. Run the SQL schema from `lib/database/schema.sql` in Supabase SQL editor
3. Copy your Supabase URL and keys to `.env.local`

### 4. Generate test images
```bash
npm run generate-test-images
```
This will create 60 test images for the comparison phase (one-time setup).

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

1. **Quick Intake** (10 seconds) - Answer 3 questions about room, colors, and size
2. **Taste Discovery** (45 seconds) - Choose between 20 pairs of images
3. **Results** (30 seconds) - Get your Art DNA explanation and 10-15 personalized artworks

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: FAL.ai (image generation), OpenRouter (explanations)

## Cost Structure

- **Setup**: ~$0.60 (one-time for 60 test images)
- **Per User**: ~$0.15 (explanation + generated artworks)

## Project Structure

```
app/           # Next.js app directory
components/    # React components
lib/           # Core logic and integrations
scripts/       # Utility scripts
types/         # TypeScript definitions
```

See `CLAUDE.md` for detailed development instructions.