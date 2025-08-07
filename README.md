# ArtSwipe MVP

Discover your art DNA in 60 seconds through smart image comparisons, then get 12 personalized artworks you can download or print.

## 🚀 Quick Links

- **Main App**: [http://localhost:3000](http://localhost:3000) - The main ArtSwipe experience
- **Test Images Gallery**: [http://localhost:3000/test-images.html](http://localhost:3000/test-images.html) - View/regenerate the 60 test images
- **Algorithm Metrics Dashboard**: [http://localhost:3000/metrics](http://localhost:3000/metrics) - Compare algorithm performance

## Quick Start

### 1. Set up environment variables
Copy `.env.local.example` to `.env.local` and add your API keys:
```bash
cp .env.local.example .env.local
```

Required keys:
- `FAL_API_KEY` - Get from [fal.ai](https://fal.ai)
- `OPENROUTER_API_KEY` - Get from [openrouter.ai](https://openrouter.ai)
- `DATABASE_URL` - SQLite connection (default: `file:./dev.db`)

### 2. Install dependencies
```bash
npm install
```

### 3. Set up database
```bash
npx prisma generate
npx prisma db push
```
This creates a local SQLite database with all required tables.

### 4. Generate test images
```bash
npm run generate-premium-images
```
This will create 60 high-quality test images for the comparison phase (one-time setup, ~$0.60).

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

1. **Quick Intake** (10 seconds) - Answer 3 questions about orientation, colors, and size
2. **Taste Discovery** (45 seconds) - Choose between 20 pairs of images
   - Uses advanced algorithm with response time weighting
   - Quick decisions (<2s) indicate stronger preferences
   - Tracks style-subject correlations
3. **Results** - Get your Art DNA explanation and 12 personalized artworks
   - Diversified generation: Primary style (40%), Secondary preferences (30%), Creative mixes (20%), Variations (10%)
   - Each artwork available in framed and clean versions

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **AI**: FAL.ai FLUX models (image generation), OpenRouter (explanations)
- **Algorithms**: Advanced taste discovery with A/B testing framework

## Cost Structure

- **Setup**: ~$0.60 (one-time for 60 test images using FLUX-schnell)
- **Per User Session**: 
  - ~$0.005 for preference analysis (OpenRouter)
  - ~$0.18 for 12 artworks (FAL.ai FLUX-dev at $0.015/image)
  - Total: ~$0.19 per complete session

## Key Features

### 🧠 Advanced Algorithm
- **Response Time Weighting**: Quick decisions get 1.5x weight, slow ones 0.6x
- **Style-Subject Correlation**: Tracks which styles work with which subjects
- **Confidence Scoring**: Measures consistency of preferences
- **A/B Testing**: Automatically assigns users to different algorithm versions

### 🎨 Diversified Generation
- Generates 12 artworks reflecting full preference spectrum
- Not just repetitions of top choice
- Grouped by type in results gallery

### 📊 Metrics Dashboard
- Compare algorithm performance
- Track user engagement metrics
- Monitor confidence scores and response times

## Project Structure

```
app/                    # Next.js app directory
├── api/               # API routes
│   ├── choice/        # Basic preference tracking
│   ├── choice-v2/     # Advanced algorithm endpoint
│   ├── generate/      # Artwork generation
│   └── metrics/       # Algorithm metrics
├── metrics/           # Dashboard page
└── page.tsx           # Main app

components/            # React components
├── IntakeForm.tsx     # Initial preferences
├── ImageComparison.tsx # A/B testing interface
└── ResultsGallery.tsx # Grouped artwork display

lib/                   # Core logic
├── algorithms/        # Preference learning algorithms
│   ├── tasteDiscovery.ts       # Basic algorithm
│   ├── advancedTasteDiscovery.ts # Advanced with response time
│   └── abTesting.ts            # A/B testing framework
├── ai/               # AI integrations
│   ├── fal.ts                  # FAL.ai image generation
│   ├── diversifiedGeneration.ts # Variety planning
│   └── openrouter.ts           # Explanation generation
└── database/         # Prisma ORM setup

scripts/              # Utility scripts
├── generate-premium-test-images.ts
└── populate-test-images.ts

public/
└── test-images.html  # Gallery for viewing/regenerating test images
```

See `CLAUDE.md` for detailed development instructions.