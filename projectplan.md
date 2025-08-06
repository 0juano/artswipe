# ArtSwipe Project Plan

## Project Overview
ArtSwipe learns what art you like in 60 seconds through smart image comparisons, explains your taste in plain English, then generates 10-15 personalized artworks you can download or print.

**Start Date**: August 2025  
**Target Launch**: 3 weeks  
**Budget**: <$100 setup + $0.15/user variable costs

---

## Phase 1: Foundation Setup ✅
**Status**: COMPLETED  
**Target**: Day 1-3

### Tasks:
- [x] Create projectplan.md file
- [x] Initialize Next.js project with TypeScript
- [x] Configure Tailwind CSS
- [x] Set up Supabase project structure
- [x] Create database schema
- [x] Set up environment variables
- [x] Create CLAUDE.md instructions

### Notes:
- Using Next.js 14 with App Router for modern React patterns
- Supabase for both PostgreSQL and file storage
- TypeScript for type safety
- All base components created and styled

---

## Phase 2: Test Image Generation
**Status**: Not Started  
**Target**: Day 4-5

### Tasks:
- [ ] Create FAL.ai account and API setup
- [ ] Write test image generation script
- [ ] Generate 60 test images covering:
  - [ ] 24 style variations
  - [ ] 15 complexity variations
  - [ ] 15 subject variations
  - [ ] 6 color palette variations
- [ ] Upload images to Supabase storage
- [ ] Populate test_images table with metadata

### Test Image Categories:
1. **Style Tests** (24 images)
   - Minimalist, Bold brushstrokes, Geometric, Watercolor, Photographic, Line art
   - Applied to: Abstract circles, Mountain landscapes, Leaf patterns

2. **Complexity Tests** (15 images)
   - Single element → Dense maximum complexity
   - Same abstract style, varying detail levels

3. **Subject Tests** (15 images)
   - Geometric shapes, Nature, Architecture, Figures, Abstract patterns
   - All in minimalist style for consistency

4. **Color Tests** (6 images)
   - B&W, Earth tones, Ocean blues, Warm sunset, Pastels, Jewel tones
   - Same abstract composition

---

## Phase 3: Core User Flow
**Status**: Not Started  
**Target**: Day 6-10

### Tasks:
- [ ] Build intake form component
  - [ ] Room selection (Living Room, Bedroom, Office, etc.)
  - [ ] Color preference selection
  - [ ] Size selection
- [ ] Create image comparison interface
  - [ ] Side-by-side image display
  - [ ] Click/tap to choose
  - [ ] Progress indicator (1-20)
  - [ ] Smooth transitions
- [ ] Implement preference learning algorithm
  - [ ] Vote counting system
  - [ ] Adaptive pair selection
  - [ ] Preference calculation

### Components to Build:
```
components/
├── IntakeForm.tsx
├── ImageComparison.tsx
├── ProgressBar.tsx
└── ChoiceTracker.tsx
```

---

## Phase 4: AI Integration
**Status**: Not Started  
**Target**: Day 11-13

### Tasks:
- [ ] OpenRouter Integration
  - [ ] API setup
  - [ ] Taste explanation prompt engineering
  - [ ] Response formatting
- [ ] FAL.ai Final Generation
  - [ ] Prompt construction from preferences
  - [ ] Batch generation (10-15 images)
  - [ ] Error handling and retries
- [ ] Results Gallery
  - [ ] Grid layout for generated images
  - [ ] Download functionality
  - [ ] Prompt transparency display
  - [ ] Email capture (optional)

### API Endpoints:
```
/api/session/start     - Initialize session
/api/choice           - Record user choice
/api/generate         - Generate final artworks
/api/explain          - Get taste explanation
```

---

## Phase 5: Polish & Deploy
**Status**: Not Started  
**Target**: Day 14-15

### Tasks:
- [ ] UI/UX Polish
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Mobile responsiveness
  - [ ] Smooth animations
- [ ] Performance Optimization
  - [ ] Image lazy loading
  - [ ] API response caching
  - [ ] Database query optimization
- [ ] Testing
  - [ ] Complete user flow testing
  - [ ] Load testing (100 concurrent users)
  - [ ] Mobile device testing
- [ ] Deployment
  - [ ] Deploy to Vercel
  - [ ] Configure production environment
  - [ ] Set up monitoring (Vercel Analytics)

---

## Technical Architecture

### Database Schema (PostgreSQL/Supabase):
```sql
- test_images (pre-generated comparison images)
- sessions (user session tracking)
- choices (user selections during discovery)
- generated_artworks (final AI-generated images)
- user_profiles (learned preferences)
```

### Tech Stack:
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Image Generation**: FAL.ai (FLUX models)
- **LLM**: OpenRouter (GPT-4o-mini)
- **Hosting**: Vercel
- **Storage**: Supabase Storage

### Cost Breakdown (Per User):
- Taste Discovery: $0 (pre-generated)
- LLM Explanation: $0.002
- Image Generation: $0.15 (10 images)
- **Total**: $0.152

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Completion Rate | >70% | - |
| Time to Complete | <90 seconds | - |
| "Love It" Rate | >60% | - |
| Conversion | >10% | - |

---

## Daily Progress Log

### Day 1 (Completed)
- Created project structure
- Set up projectplan.md
- Defined implementation roadmap
- Initialized Next.js with TypeScript and Tailwind
- Created all UI components (IntakeForm, ImageComparison, ResultsGallery)
- Built preference learning algorithm
- Integrated OpenRouter and FAL.ai
- Created all API endpoints
- Set up database schema
- Created CLAUDE.md documentation

### Day 2
- _Ready for testing and deployment_

### Day 3
- _To be updated_

---

## Blockers & Issues
- None currently

---

## Post-MVP Features (Future)
1. User accounts & saved preferences
2. Print fulfillment (Printful integration)
3. Room mockups with AR
4. Social sharing of "Art DNA"
5. Collaborative filtering for better recommendations

---

## Resources & Documentation
- [FAL.ai Docs](https://fal.ai/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js 14 Docs](https://nextjs.org/docs)

---

## Notes & Decisions
- Using pre-generated test images instead of real-time generation for speed
- Simple vote counting instead of complex Bayesian models for MVP
- FLUX-schnell for test images (fast), FLUX-dev for final images (quality)
- GPT-4o-mini for cost-effective taste explanations