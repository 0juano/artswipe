import { PrismaClient } from '@prisma/client'
import { generateTestImage } from '../lib/ai/fal'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

interface TestImageSpec {
  id: number
  subject?: string
  style?: string
  palette?: string
  complexity?: string
  testCategory: 'style' | 'complexity' | 'subject' | 'color'
}

// Systematic 60 test images with controlled variables
const TEST_IMAGE_SPECS: TestImageSpec[] = [
  // ============ STYLE DISCOVERY SET (24 images) ============
  // Test different styles using consistent subjects and neutral palette
  
  // Abstract circles as neutral subject (8 styles)
  { id: 1, testCategory: 'style', subject: 'abstract circular composition', style: 'minimalist', palette: 'neutral grays' },
  { id: 2, testCategory: 'style', subject: 'abstract circular composition', style: 'bold brushstrokes', palette: 'neutral grays' },
  { id: 3, testCategory: 'style', subject: 'abstract circular composition', style: 'geometric precise', palette: 'neutral grays' },
  { id: 4, testCategory: 'style', subject: 'abstract circular composition', style: 'soft watercolor', palette: 'neutral grays' },
  { id: 5, testCategory: 'style', subject: 'abstract circular composition', style: 'photorealistic', palette: 'neutral grays' },
  { id: 6, testCategory: 'style', subject: 'abstract circular composition', style: 'single line art', palette: 'neutral grays' },
  { id: 7, testCategory: 'style', subject: 'abstract circular composition', style: 'textured impasto', palette: 'neutral grays' },
  { id: 8, testCategory: 'style', subject: 'abstract circular composition', style: 'digital gradient', palette: 'neutral grays' },
  
  // Mountain landscape as natural subject (8 styles)
  { id: 9, testCategory: 'style', subject: 'mountain landscape', style: 'minimalist', palette: 'neutral grays' },
  { id: 10, testCategory: 'style', subject: 'mountain landscape', style: 'impressionist brushwork', palette: 'neutral grays' },
  { id: 11, testCategory: 'style', subject: 'mountain landscape', style: 'geometric angular', palette: 'neutral grays' },
  { id: 12, testCategory: 'style', subject: 'mountain landscape', style: 'photographic realistic', palette: 'neutral grays' },
  { id: 13, testCategory: 'style', subject: 'mountain landscape', style: 'watercolor wash', palette: 'neutral grays' },
  { id: 14, testCategory: 'style', subject: 'mountain landscape', style: 'line drawing', palette: 'neutral grays' },
  { id: 15, testCategory: 'style', subject: 'mountain landscape', style: 'vintage poster', palette: 'neutral grays' },
  { id: 16, testCategory: 'style', subject: 'mountain landscape', style: 'abstract interpretation', palette: 'neutral grays' },
  
  // Botanical leaf as organic subject (8 styles)  
  { id: 17, testCategory: 'style', subject: 'botanical leaf pattern', style: 'minimalist', palette: 'neutral grays' },
  { id: 18, testCategory: 'style', subject: 'botanical leaf pattern', style: 'detailed scientific', palette: 'neutral grays' },
  { id: 19, testCategory: 'style', subject: 'botanical leaf pattern', style: 'abstract organic', palette: 'neutral grays' },
  { id: 20, testCategory: 'style', subject: 'botanical leaf pattern', style: 'watercolor botanical', palette: 'neutral grays' },
  { id: 21, testCategory: 'style', subject: 'botanical leaf pattern', style: 'geometric stylized', palette: 'neutral grays' },
  { id: 22, testCategory: 'style', subject: 'botanical leaf pattern', style: 'photographic macro', palette: 'neutral grays' },
  { id: 23, testCategory: 'style', subject: 'botanical leaf pattern', style: 'line illustration', palette: 'neutral grays' },
  { id: 24, testCategory: 'style', subject: 'botanical leaf pattern', style: 'impressionist', palette: 'neutral grays' },
  
  // ============ COMPLEXITY TEST SET (15 images) ============
  // Same style and subject, varying complexity levels
  
  // Abstract geometric shapes complexity progression
  { id: 25, testCategory: 'complexity', subject: 'abstract geometric shapes', style: 'modern', complexity: 'single element minimal', palette: 'neutral' },
  { id: 26, testCategory: 'complexity', subject: 'abstract geometric shapes', style: 'modern', complexity: '2-3 simple shapes', palette: 'neutral' },
  { id: 27, testCategory: 'complexity', subject: 'abstract geometric shapes', style: 'modern', complexity: '5 overlapping elements', palette: 'neutral' },
  { id: 28, testCategory: 'complexity', subject: 'abstract geometric shapes', style: 'modern', complexity: '7-8 layered shapes', palette: 'neutral' },
  { id: 29, testCategory: 'complexity', subject: 'abstract geometric shapes', style: 'modern', complexity: '10+ intricate details', palette: 'neutral' },
  
  // Nature scene complexity progression
  { id: 30, testCategory: 'complexity', subject: 'nature scene', style: 'contemporary', complexity: 'single tree minimal', palette: 'neutral' },
  { id: 31, testCategory: 'complexity', subject: 'nature scene', style: 'contemporary', complexity: 'simple forest 3 trees', palette: 'neutral' },
  { id: 32, testCategory: 'complexity', subject: 'nature scene', style: 'contemporary', complexity: 'medium forest 7 trees', palette: 'neutral' },
  { id: 33, testCategory: 'complexity', subject: 'nature scene', style: 'contemporary', complexity: 'dense forest many trees', palette: 'neutral' },
  { id: 34, testCategory: 'complexity', subject: 'nature scene', style: 'contemporary', complexity: 'intricate forest ecosystem', palette: 'neutral' },
  
  // Abstract pattern complexity progression
  { id: 35, testCategory: 'complexity', subject: 'abstract pattern', style: 'modern', complexity: 'single line', palette: 'neutral' },
  { id: 36, testCategory: 'complexity', subject: 'abstract pattern', style: 'modern', complexity: 'simple 3 line pattern', palette: 'neutral' },
  { id: 37, testCategory: 'complexity', subject: 'abstract pattern', style: 'modern', complexity: 'moderate 10 line weave', palette: 'neutral' },
  { id: 38, testCategory: 'complexity', subject: 'abstract pattern', style: 'modern', complexity: 'complex 20 line mesh', palette: 'neutral' },
  { id: 39, testCategory: 'complexity', subject: 'abstract pattern', style: 'modern', complexity: 'intricate detailed lattice', palette: 'neutral' },
  
  // ============ SUBJECT PREFERENCE SET (15 images) ============
  // Same minimalist style, different subjects
  
  { id: 40, testCategory: 'subject', style: 'minimalist clean', subject: 'geometric shapes', palette: 'neutral' },
  { id: 41, testCategory: 'subject', style: 'minimalist clean', subject: 'ocean waves', palette: 'neutral' },
  { id: 42, testCategory: 'subject', style: 'minimalist clean', subject: 'mountain peaks', palette: 'neutral' },
  { id: 43, testCategory: 'subject', style: 'minimalist clean', subject: 'botanical leaves', palette: 'neutral' },
  { id: 44, testCategory: 'subject', style: 'minimalist clean', subject: 'architectural lines', palette: 'neutral' },
  { id: 45, testCategory: 'subject', style: 'minimalist clean', subject: 'human silhouette', palette: 'neutral' },
  { id: 46, testCategory: 'subject', style: 'minimalist clean', subject: 'abstract shapes', palette: 'neutral' },
  { id: 47, testCategory: 'subject', style: 'minimalist clean', subject: 'celestial moon sun', palette: 'neutral' },
  { id: 48, testCategory: 'subject', style: 'minimalist clean', subject: 'animal forms', palette: 'neutral' },
  { id: 49, testCategory: 'subject', style: 'minimalist clean', subject: 'cityscape skyline', palette: 'neutral' },
  { id: 50, testCategory: 'subject', style: 'minimalist clean', subject: 'desert cactus', palette: 'neutral' },
  { id: 51, testCategory: 'subject', style: 'minimalist clean', subject: 'tropical palm', palette: 'neutral' },
  { id: 52, testCategory: 'subject', style: 'minimalist clean', subject: 'coffee cup', palette: 'neutral' },
  { id: 53, testCategory: 'subject', style: 'minimalist clean', subject: 'musical notes', palette: 'neutral' },
  { id: 54, testCategory: 'subject', style: 'minimalist clean', subject: 'zen stones', palette: 'neutral' },
  
  // ============ COLOR PALETTE SET (6 images) ============
  // Same composition, different color schemes
  
  { id: 55, testCategory: 'color', subject: 'abstract flowing shapes', style: 'modern', palette: 'black and white high contrast' },
  { id: 56, testCategory: 'color', subject: 'abstract flowing shapes', style: 'modern', palette: 'warm earth tones terracotta sage' },
  { id: 57, testCategory: 'color', subject: 'abstract flowing shapes', style: 'modern', palette: 'ocean blues and teals' },
  { id: 58, testCategory: 'color', subject: 'abstract flowing shapes', style: 'modern', palette: 'sunset oranges and pinks' },
  { id: 59, testCategory: 'color', subject: 'abstract flowing shapes', style: 'modern', palette: 'soft pastels lavender mint' },
  { id: 60, testCategory: 'color', subject: 'abstract flowing shapes', style: 'modern', palette: 'jewel tones emerald sapphire' },
]

function buildEnhancedPrompt(spec: TestImageSpec): string {
  const parts: string[] = []
  
  // Start with subject
  if (spec.subject) {
    parts.push(spec.subject)
  }
  
  // Add style with more detail
  if (spec.style) {
    parts.push(`${spec.style} style`)
  }
  
  // Add complexity description
  if (spec.complexity) {
    parts.push(spec.complexity)
  }
  
  // Add palette with detail
  if (spec.palette) {
    parts.push(`${spec.palette} color palette`)
  }
  
  // Add consistent quality suffixes
  parts.push(
    'wall art',
    'high quality',
    'professional composition',
    'suitable for home decor',
    'clean background',
    'minimal distractions'
  )
  
  return parts.join(', ')
}

async function generateTestDeck() {
  console.log('========================================')
  console.log('   ArtSwipe Test Image Generation')
  console.log('========================================')
  console.log(`Total images to generate: ${TEST_IMAGE_SPECS.length}`)
  console.log(`Estimated cost: $${(TEST_IMAGE_SPECS.length * 0.003).toFixed(2)} (using FLUX-schnell)`)
  console.log('----------------------------------------\n')
  
  const results: any[] = []
  let successCount = 0
  let errorCount = 0
  const batchSize = 5 // Process in batches to avoid rate limits
  
  // Process in batches
  for (let i = 0; i < TEST_IMAGE_SPECS.length; i += batchSize) {
    const batch = TEST_IMAGE_SPECS.slice(i, Math.min(i + batchSize, TEST_IMAGE_SPECS.length))
    console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(TEST_IMAGE_SPECS.length/batchSize)}`)
    
    // Process batch sequentially to avoid rate limits
    for (const spec of batch) {
      console.log(`\n[${spec.id}/${TEST_IMAGE_SPECS.length}] Generating ${spec.testCategory} test...`)
      console.log(`  Subject: ${spec.subject || 'N/A'}`)
      console.log(`  Style: ${spec.style || 'N/A'}`)
      console.log(`  Complexity: ${spec.complexity || 'N/A'}`)
      console.log(`  Palette: ${spec.palette || 'N/A'}`)
      
      try {
        const prompt = buildEnhancedPrompt(spec)
        console.log(`  Prompt: "${prompt.substring(0, 80)}..."`)
        
        // Generate the image with seed for reproducibility
        const imageUrl = await generateTestImage(spec, spec.id * 1000)
        
        // Save to database
        const dbRecord = await prisma.testImage.create({
          data: {
            imageUrl: imageUrl,
            style: spec.style || null,
            subject: spec.subject || null,
            palette: spec.palette || null,
            complexity: spec.complexity || null,
            testCategory: spec.testCategory,
            promptUsed: prompt,
          }
        })
        
        results.push({
          ...spec,
          imageUrl,
          promptUsed: prompt,
          dbId: dbRecord.id
        })
        
        successCount++
        console.log(`  ✅ Success! Image saved with ID: ${dbRecord.id}`)
        
      } catch (error) {
        errorCount++
        console.error(`  ❌ Failed:`, error)
        results.push({
          ...spec,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      
      // Small delay between images
      if (spec.id < TEST_IMAGE_SPECS.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // Longer delay between batches
    if (i + batchSize < TEST_IMAGE_SPECS.length) {
      console.log(`\n⏳ Waiting 3 seconds before next batch...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  // Save backup JSON
  const backupPath = resolve(__dirname, '../test_images_backup.json')
  fs.writeFileSync(backupPath, JSON.stringify(results, null, 2))
  console.log(`\n💾 Backup saved to: ${backupPath}`)
  
  // Print summary
  console.log('\n========================================')
  console.log('           GENERATION COMPLETE')
  console.log('========================================')
  console.log(`✅ Success: ${successCount}/${TEST_IMAGE_SPECS.length}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`💰 Total cost: $${(successCount * 0.003).toFixed(2)}`)
  
  // Print category breakdown
  const categories = results.reduce((acc, img) => {
    if (!img.error) {
      acc[img.testCategory] = (acc[img.testCategory] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  console.log('\n📊 Images by category:')
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} images`)
  })
  
  console.log('\n🎉 Test deck ready for use!')
  console.log('   Users will now see real AI-generated images')
  console.log('   during the taste discovery phase.')
  
  await prisma.$disconnect()
}

// Run the generation
generateTestDeck()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    prisma.$disconnect()
    process.exit(1)
  })