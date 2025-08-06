import { PrismaClient } from '@prisma/client'
import { generateTestImage } from '../lib/ai/fal'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

interface PremiumTestSpec {
  id: number
  category: 'style' | 'complexity' | 'subject' | 'color'
  prompt: string
  metadata: {
    style?: string
    subject?: string
    complexity?: string
    palette?: string
  }
}

// Premium test specifications - 60 total images designed to look like real wall art
const PREMIUM_TEST_SPECS: PremiumTestSpec[] = [
  // ============ STYLE DISCOVERY (24 images) ============
  // Each style tested with 3 different subjects for better calibration
  
  // Minimalist Modern (3 images)
  {
    id: 1,
    category: 'style',
    prompt: 'Minimalist geometric architecture, Tadao Ando inspired concrete and light interplay, museum quality wall art, gallery print, sophisticated modern interior design piece',
    metadata: { style: 'minimalist modern', subject: 'architecture' }
  },
  {
    id: 2,
    category: 'style',
    prompt: 'Minimalist ink wash mountain landscape, traditional Japanese sumi-e technique, negative space composition, zen aesthetic, luxury wall art for modern home',
    metadata: { style: 'minimalist modern', subject: 'landscape' }
  },
  {
    id: 3,
    category: 'style',
    prompt: 'Minimalist single line face drawing, Picasso one-line style, elegant portrait, sophisticated wall art, gallery quality print',
    metadata: { style: 'minimalist modern', subject: 'portrait' }
  },

  // Abstract Expressionist (3 images)
  {
    id: 4,
    category: 'style',
    prompt: 'Abstract expressionist color field painting, Rothko-inspired emotional depth, rich burgundy and gold layers, museum quality canvas art, prestigious gallery piece',
    metadata: { style: 'abstract expressionist', subject: 'color field' }
  },
  {
    id: 5,
    category: 'style',
    prompt: 'Abstract ocean waves, dynamic brushstrokes like Zao Wou-Ki, turquoise and white energy, contemporary wall art, luxury coastal home decor',
    metadata: { style: 'abstract expressionist', subject: 'seascape' }
  },
  {
    id: 6,
    category: 'style',
    prompt: 'Abstract floral explosion, Willem de Kooning energy, vibrant botanical forms, high-end gallery artwork, statement piece for modern interior',
    metadata: { style: 'abstract expressionist', subject: 'botanical' }
  },

  // Photorealistic Contemporary (3 images)
  {
    id: 7,
    category: 'style',
    prompt: 'Hyperrealistic dewdrops on succulent leaves, macro photography style, incredible detail, National Geographic quality, premium botanical wall art',
    metadata: { style: 'photorealistic', subject: 'botanical' }
  },
  {
    id: 8,
    category: 'style',
    prompt: 'Photorealistic golden hour cityscape, architectural photography, Manhattan skyline through mist, luxury urban wall art, penthouse decor quality',
    metadata: { style: 'photorealistic', subject: 'cityscape' }
  },
  {
    id: 9,
    category: 'style',
    prompt: 'Hyperrealistic portrait of weathered hands crafting pottery, Rembrandt lighting, fine art photography, gallery exhibition quality, emotional storytelling',
    metadata: { style: 'photorealistic', subject: 'portrait' }
  },

  // Impressionist Modern (3 images)
  {
    id: 10,
    category: 'style',
    prompt: 'Modern impressionist garden path, Monet-inspired but contemporary, dappled sunlight through trees, luxury estate artwork, Sothebys quality painting',
    metadata: { style: 'impressionist modern', subject: 'landscape' }
  },
  {
    id: 11,
    category: 'style',
    prompt: 'Impressionist rain on city windows, bokeh lights, David Hockney pool reflections style, contemporary gallery piece, sophisticated urban art',
    metadata: { style: 'impressionist modern', subject: 'urban' }
  },
  {
    id: 12,
    category: 'style',
    prompt: 'Contemporary impressionist still life, wine bottles and fruit, Cezanne meets modern design, upscale restaurant artwork, sommelier collection',
    metadata: { style: 'impressionist modern', subject: 'still life' }
  },

  // Geometric Abstract (3 images)
  {
    id: 13,
    category: 'style',
    prompt: 'Bauhaus-inspired geometric composition, primary colors and black lines, Mondrian evolution, museum of modern art quality, designer showcase piece',
    metadata: { style: 'geometric abstract', subject: 'pure abstract' }
  },
  {
    id: 14,
    category: 'style',
    prompt: 'Sacred geometry mandala, gold foil accents on deep navy, luxury meditation room art, high-end wellness center decor, precision geometric patterns',
    metadata: { style: 'geometric abstract', subject: 'spiritual' }
  },
  {
    id: 15,
    category: 'style',
    prompt: 'Art deco geometric sunset, Miami Beach architecture inspiration, coral and teal palette, boutique hotel artwork, vintage luxury revival',
    metadata: { style: 'geometric abstract', subject: 'landscape' }
  },

  // Botanical Illustration (3 images)
  {
    id: 16,
    category: 'style',
    prompt: 'Scientific botanical illustration of rare orchid, vintage naturalist drawing style, museum archive quality, parchment texture, collectors edition print',
    metadata: { style: 'botanical illustration', subject: 'flowers' }
  },
  {
    id: 17,
    category: 'style',
    prompt: 'Modern botanical study of monstera deliciosa, contemporary scientific art, clean white background, Scandinavian design aesthetic, premium wall print',
    metadata: { style: 'botanical illustration', subject: 'tropical plants' }
  },
  {
    id: 18,
    category: 'style',
    prompt: 'Pressed flower herbarium art, vintage apothecary style, aged paper texture, French countryside aesthetic, boutique hotel room artwork',
    metadata: { style: 'botanical illustration', subject: 'pressed flowers' }
  },

  // Street Art Contemporary (3 images)
  {
    id: 19,
    category: 'style',
    prompt: 'Banksy-inspired stencil art with social commentary, urban wall texture, thought-provoking imagery, contemporary gallery street art, collectors piece',
    metadata: { style: 'street art', subject: 'social commentary' }
  },
  {
    id: 20,
    category: 'style',
    prompt: 'Graffiti art portrait with vibrant colors, Basquiat energy, neo-expressionist style, high-end urban gallery piece, hip boutique hotel art',
    metadata: { style: 'street art', subject: 'portrait' }
  },
  {
    id: 21,
    category: 'style',
    prompt: 'Contemporary mural art style, KAWS meets Japanese pop art, designer toy aesthetic, limited edition print quality, trendy gallery wall art',
    metadata: { style: 'street art', subject: 'pop culture' }
  },

  // Nordic Minimalist (3 images)
  {
    id: 22,
    category: 'style',
    prompt: 'Scandinavian forest in fog, minimalist nature photography, hygge aesthetic, muted earth tones, premium Nordic design wall art, Copenhagen gallery style',
    metadata: { style: 'nordic minimalist', subject: 'nature' }
  },
  {
    id: 23,
    category: 'style',
    prompt: 'Nordic abstract shapes in sage and terracotta, modern Scandinavian design, Marimekko inspiration, designer textile art, luxury minimalist decor',
    metadata: { style: 'nordic minimalist', subject: 'abstract' }
  },
  {
    id: 24,
    category: 'style',
    prompt: 'Minimalist Nordic still life, ceramic vases with single stems, natural light, Finnish design aesthetic, high-end interior photography art',
    metadata: { style: 'nordic minimalist', subject: 'still life' }
  },

  // ============ COMPLEXITY TESTS (15 images) ============
  // 5 complexity levels × 3 different subjects
  
  // Ultra Minimal (3 images)
  {
    id: 25,
    category: 'complexity',
    prompt: 'Single black circle on white canvas, zen minimalism, gallery white space, sophisticated simplicity, high-end minimalist art',
    metadata: { complexity: 'ultra minimal', subject: 'geometric' }
  },
  {
    id: 26,
    category: 'complexity',
    prompt: 'Solitary tree silhouette against empty sky, extreme minimalism, meditation room art, peaceful simplicity, luxury zen decor',
    metadata: { complexity: 'ultra minimal', subject: 'nature' }
  },
  {
    id: 27,
    category: 'complexity',
    prompt: 'Single brushstroke on canvas, Japanese calligraphy inspiration, museum quality simplicity, prestigious minimal art',
    metadata: { complexity: 'ultra minimal', subject: 'abstract' }
  },

  // Simple Clean (3 images)
  {
    id: 28,
    category: 'complexity',
    prompt: 'Three overlapping transparent circles in pastel colors, clean modern design, sophisticated simplicity, contemporary wall art',
    metadata: { complexity: 'simple clean', subject: 'geometric' }
  },
  {
    id: 29,
    category: 'complexity',
    prompt: 'Mountain range outline with sun, simple two-tone design, modern minimalist landscape, clean wall art for modern home',
    metadata: { complexity: 'simple clean', subject: 'landscape' }
  },
  {
    id: 30,
    category: 'complexity',
    prompt: 'Simple line drawing of woman profile with flowers, elegant minimalist portrait, sophisticated bedroom art',
    metadata: { complexity: 'simple clean', subject: 'portrait' }
  },

  // Balanced Moderate (3 images)
  {
    id: 31,
    category: 'complexity',
    prompt: 'Modern living room interior with balanced composition, mid-century furniture, architectural digest photography, designer showcase art',
    metadata: { complexity: 'balanced moderate', subject: 'interior' }
  },
  {
    id: 32,
    category: 'complexity',
    prompt: 'Abstract landscape with 5-7 color fields, balanced composition, contemporary museum piece, sophisticated color harmony',
    metadata: { complexity: 'balanced moderate', subject: 'abstract landscape' }
  },
  {
    id: 33,
    category: 'complexity',
    prompt: 'Botanical arrangement with 5 different plants, balanced composition, modern botanical art, upscale home decor',
    metadata: { complexity: 'balanced moderate', subject: 'botanical' }
  },

  // Rich Detailed (3 images)
  {
    id: 34,
    category: 'complexity',
    prompt: 'Detailed architectural facade of Art Nouveau building, ornate ironwork and tiles, European travel photography art, luxury hotel lobby artwork',
    metadata: { complexity: 'rich detailed', subject: 'architecture' }
  },
  {
    id: 35,
    category: 'complexity',
    prompt: 'Rich tapestry of autumn forest, multiple layers of foliage, detailed nature photography, National Geographic quality wall art',
    metadata: { complexity: 'rich detailed', subject: 'nature' }
  },
  {
    id: 36,
    category: 'complexity',
    prompt: 'Detailed market scene with produce and flowers, vibrant lifestyle photography, gourmet kitchen wall art, chef restaurant decor',
    metadata: { complexity: 'rich detailed', subject: 'lifestyle' }
  },

  // Maximum Complexity (3 images)
  {
    id: 37,
    category: 'complexity',
    prompt: 'Intricate mandala with hundreds of details, sacred geometry, gold accents, meditation center masterpiece, museum quality spiritual art',
    metadata: { complexity: 'maximum', subject: 'spiritual' }
  },
  {
    id: 38,
    category: 'complexity',
    prompt: 'Dense tropical rainforest canopy, thousands of leaves and details, biodiversity showcase, natural history museum quality art',
    metadata: { complexity: 'maximum', subject: 'nature' }
  },
  {
    id: 39,
    category: 'complexity',
    prompt: 'Complex city intersection from above, hundreds of people and cars, urban density art, metropolitan museum photography',
    metadata: { complexity: 'maximum', subject: 'urban' }
  },

  // ============ SUBJECT PREFERENCE (15 images) ============
  // Popular wall art subjects that actually sell
  
  {
    id: 40,
    category: 'subject',
    prompt: 'Majestic mountain peaks at sunrise, alpenglow on snow, epic landscape photography, National Geographic cover quality, luxury lodge artwork',
    metadata: { subject: 'mountains' }
  },
  {
    id: 41,
    category: 'subject',
    prompt: 'Ocean waves crashing on rocks, long exposure photography, serene seascape, coastal home premium wall art, meditation space decor',
    metadata: { subject: 'ocean' }
  },
  {
    id: 42,
    category: 'subject',
    prompt: 'Monstera leaves with dramatic shadows, tropical botanical photography, modern plant parent art, trendy urban jungle decor',
    metadata: { subject: 'tropical plants' }
  },
  {
    id: 43,
    category: 'subject',
    prompt: 'Modern architecture with leading lines, contemporary building photography, architectural digest quality, designer office art',
    metadata: { subject: 'architecture' }
  },
  {
    id: 44,
    category: 'subject',
    prompt: 'Abstract feminine form in flowing fabric, artistic nude silhouette, fine art photography, gallery exhibition piece, sophisticated boudoir art',
    metadata: { subject: 'figure study' }
  },
  {
    id: 45,
    category: 'subject',
    prompt: 'Wine country vineyard rows at golden hour, Tuscany landscape, luxury wine cellar art, sommelier collection piece',
    metadata: { subject: 'vineyard' }
  },
  {
    id: 46,
    category: 'subject',
    prompt: 'Cosmic nebula with stars, deep space photography, NASA quality imagery, modern astronomy art, science museum quality',
    metadata: { subject: 'space' }
  },
  {
    id: 47,
    category: 'subject',
    prompt: 'Minimalist desert landscape with single Joshua tree, American Southwest art, modern Western decor, boutique hotel artwork',
    metadata: { subject: 'desert' }
  },
  {
    id: 48,
    category: 'subject',
    prompt: 'Fresh coffee and croissant flat lay, lifestyle photography, cafe wall art, French bistro decor, culinary artwork',
    metadata: { subject: 'food & drink' }
  },
  {
    id: 49,
    category: 'subject',
    prompt: 'Majestic lion portrait in golden light, wildlife photography, African safari art, luxury den or study artwork',
    metadata: { subject: 'wildlife' }
  },
  {
    id: 50,
    category: 'subject',
    prompt: 'Rain on window with bokeh city lights, moody urban photography, cozy apartment art, hygge aesthetic wall decor',
    metadata: { subject: 'urban mood' }
  },
  {
    id: 51,
    category: 'subject',
    prompt: 'Zen stones balanced in water, meditation photography, spa and wellness center art, peaceful bathroom decor',
    metadata: { subject: 'zen & wellness' }
  },
  {
    id: 52,
    category: 'subject',
    prompt: 'Vintage travel poster style illustration of Paris, retro tourism art, nostalgic wall decor, boutique hotel artwork',
    metadata: { subject: 'travel' }
  },
  {
    id: 53,
    category: 'subject',
    prompt: 'Modern abstract faces in Matisse cutout style, contemporary portrait art, creative studio wall decor, gallery quality print',
    metadata: { subject: 'abstract portraits' }
  },
  {
    id: 54,
    category: 'subject',
    prompt: 'Luxury sports car in dramatic lighting, automotive photography, man cave art, high-end garage decor, collectors piece',
    metadata: { subject: 'automotive' }
  },

  // ============ COLOR PALETTE TESTS (6 images) ============
  // Most popular color schemes for wall art
  
  {
    id: 55,
    category: 'color',
    prompt: 'Sophisticated black and white abstract composition, high contrast geometric shapes, monochrome gallery art, timeless modern decor',
    metadata: { palette: 'black and white' }
  },
  {
    id: 56,
    category: 'color',
    prompt: 'Warm earth tones abstract landscape, terracotta sage and cream, boho chic wall art, natural organic palette, pottery barn aesthetic',
    metadata: { palette: 'earth tones' }
  },
  {
    id: 57,
    category: 'color',
    prompt: 'Ocean blues and teals abstract waves, coastal color palette, beach house wall art, serene water colors, hamptons style decor',
    metadata: { palette: 'ocean blues' }
  },
  {
    id: 58,
    category: 'color',
    prompt: 'Blush pink and gold abstract composition, feminine luxury palette, bedroom wall art, rose gold accents, glamorous decor',
    metadata: { palette: 'blush and gold' }
  },
  {
    id: 59,
    category: 'color',
    prompt: 'Deep emerald and navy abstract, jewel tone sophistication, luxury library art, rich color palette, opulent home decor',
    metadata: { palette: 'jewel tones' }
  },
  {
    id: 60,
    category: 'color',
    prompt: 'Soft sage and cream minimalist composition, calming neutral palette, spa-like serenity, Nordic color scheme, peaceful wall art',
    metadata: { palette: 'soft neutrals' }
  }
]

// Enhanced generation function for FLUX-dev
async function generatePremiumTestImage(spec: PremiumTestSpec): Promise<any> {
  // CRITICAL: Large close-up of artwork filling most of the frame
  const enhancedPrompt = `Close-up view of a large framed artwork on white wall, filling 80% of the image, the artwork shows: ${spec.prompt}, elegant thin black frame, artwork takes up most of the view, minimal white wall visible around edges, professional art photography, gallery close-up shot, museum quality`
  
  // Add negative prompt to avoid room context and other distractions
  const negativePrompt = 'bedroom, living room, furniture, bed, sofa, table, lamp, plant, person, multiple frames, room interior, floor, ceiling, distant view, small artwork, amateur, low quality, blurry, stock photo, watermark'
  
  const response = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: enhancedPrompt,
      negative_prompt: negativePrompt,
      image_size: 'square_hd',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
      seed: spec.id * 1000, // Consistent seed for reproducibility
    }),
  })

  if (!response.ok) {
    throw new Error(`FAL API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.images[0].url
}

async function generatePremiumTestDeck() {
  console.log('========================================')
  console.log('   ArtSwipe Premium Test Image Generation')
  console.log('   Using FLUX-dev for Gallery Quality')
  console.log('========================================')
  console.log(`Total images to generate: ${PREMIUM_TEST_SPECS.length}`)
  console.log(`Model: FLUX-dev (premium quality)`)
  console.log(`Estimated cost: $${(PREMIUM_TEST_SPECS.length * 0.015).toFixed(2)}`)
  console.log(`Estimated time: ${Math.ceil(PREMIUM_TEST_SPECS.length * 10 / 60)} minutes`)
  console.log('----------------------------------------\n')

  // Clear existing test images (cascade will handle choices)
  console.log('🗑️  Clearing existing test data...')
  // First delete choices that reference test images
  await prisma.choice.deleteMany({})
  console.log('   - Cleared choice records')
  // Now we can safely delete test images
  await prisma.testImage.deleteMany({})
  console.log('✅ Database cleared\n')

  const results: any[] = []
  let successCount = 0
  let errorCount = 0

  for (const spec of PREMIUM_TEST_SPECS) {
    console.log(`\n[${spec.id}/${PREMIUM_TEST_SPECS.length}] Generating ${spec.category} test...`)
    console.log(`  Prompt preview: "${spec.prompt.substring(0, 80)}..."`)
    
    try {
      // Generate the premium image
      const imageUrl = await generatePremiumTestImage(spec)
      
      // Save to database
      const dbRecord = await prisma.testImage.create({
        data: {
          imageUrl: imageUrl,
          style: spec.metadata.style || null,
          subject: spec.metadata.subject || null,
          palette: spec.metadata.palette || null,
          complexity: spec.metadata.complexity || null,
          testCategory: spec.category,
          promptUsed: spec.prompt,
        }
      })
      
      results.push({
        ...spec,
        imageUrl,
        dbId: dbRecord.id
      })
      
      successCount++
      console.log(`  ✅ Success! Premium image saved with ID: ${dbRecord.id}`)
      console.log(`  💰 Running cost: $${(successCount * 0.015).toFixed(2)}`)
      
    } catch (error) {
      errorCount++
      console.error(`  ❌ Failed:`, error)
      results.push({
        ...spec,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Longer delay for FLUX-dev (it's slower)
    if (spec.id < PREMIUM_TEST_SPECS.length) {
      console.log('  ⏳ Waiting 3 seconds before next generation...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  // Save results to backup file
  const backupPath = resolve(__dirname, '../premium-test-images-backup.json')
  fs.writeFileSync(backupPath, JSON.stringify(results, null, 2))
  console.log(`\n💾 Backup saved to: ${backupPath}`)

  // Print summary
  console.log('\n========================================')
  console.log('       PREMIUM GENERATION COMPLETE')
  console.log('========================================')
  console.log(`✅ Success: ${successCount}/${PREMIUM_TEST_SPECS.length}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`💰 Total cost: $${(successCount * 0.015).toFixed(2)}`)
  console.log(`🎨 Quality: Gallery-ready wall art`)
  
  // Print category breakdown
  const categories = results.reduce((acc, img) => {
    if (!img.error) {
      acc[img.category] = (acc[img.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  console.log('\n📊 Images by category:')
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} images`)
  })
  
  console.log('\n🎉 Premium test deck ready!')
  console.log('   Your users will now see museum-quality')
  console.log('   test images that look like real wall art.')
  
  await prisma.$disconnect()
}

// Run the generation
generatePremiumTestDeck()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    prisma.$disconnect()
    process.exit(1)
  })