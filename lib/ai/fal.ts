import { UserPreferences, GeneratedArtwork } from '@/types'

const getFalApiKey = () => {
  const key = process.env.FAL_API_KEY
  if (!key) {
    throw new Error('FAL_API_KEY environment variable is not set')
  }
  return key
}

interface FalResponse {
  images: Array<{
    url: string
    width: number
    height: number
  }>
}

export async function generatePersonalizedArtworks(
  preferences: UserPreferences,
  count: number = 4
): Promise<GeneratedArtwork[]> {
  const prompts = generatePromptVariations(preferences, count)
  const results: GeneratedArtwork[] = []

  // Generate both framed and clean versions for each artwork
  const batchSize = 2
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize)
    const batchPromises: Promise<GeneratedArtwork>[] = []
    
    for (const promptVariation of batch) {
      // Generate with frame and clean version
      batchPromises.push(generateArtworkPair(promptVariation.framed, promptVariation.clean, i, preferences.orientation || 'square'))
    }
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }

  return results
}

async function generateArtworkPair(framedPrompt: string, cleanPrompt: string, orderIndex: number, orientation: string = 'square'): Promise<GeneratedArtwork> {
  try {
    // Generate both versions in parallel
    const [framedResponse, cleanResponse] = await Promise.all([
      fetch('https://fal.run/fal-ai/flux/dev', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${getFalApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: framedPrompt,
          image_size: getImageSize(orientation),
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true,
        }),
      }),
      fetch('https://fal.run/fal-ai/flux/dev', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${getFalApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
          image_size: getImageSize(orientation),
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true,
        }),
      })
    ])

    if (!framedResponse.ok || !cleanResponse.ok) {
      throw new Error(`FAL API error`)
    }

    const framedData: FalResponse = await framedResponse.json()
    const cleanData: FalResponse = await cleanResponse.json()
    
    return {
      imageUrl: framedData.images[0].url,
      cleanImageUrl: cleanData.images[0].url,
      prompt: framedPrompt,
      orderIndex,
    }
  } catch (error) {
    console.error('Error generating artwork pair:', error)
    // Return placeholder in case of error
    return {
      imageUrl: 'https://via.placeholder.com/1024x1024?text=Generation+Failed',
      cleanImageUrl: 'https://via.placeholder.com/1024x1024?text=Generation+Failed',
      prompt: framedPrompt,
      orderIndex,
    }
  }
}

export async function generateTestImage(spec: any, seed?: number): Promise<string> {
  const prompt = buildTestImagePrompt(spec)
  
  try {
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${getFalApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square',
        num_inference_steps: 4, // Schnell is optimized for 4 steps
        num_images: 1,
        enable_safety_checker: true,
        seed: seed || Math.floor(Math.random() * 1000000), // Use provided seed or random
      }),
    })

    if (!response.ok) {
      throw new Error(`FAL API error: ${response.statusText}`)
    }

    const data: FalResponse = await response.json()
    return data.images[0].url
  } catch (error) {
    console.error('Error generating test image:', error)
    throw error
  }
}

interface PromptPair {
  framed: string
  clean: string
}

function generatePromptVariations(preferences: UserPreferences, count: number): PromptPair[] {
  const { style, subjects, complexity, palette, orientation } = preferences
  const complexityDesc = getComplexityDescriptor(complexity)
  const paletteDesc = palette.replace('-', ' ')

  const baseVariations = [
    // Core preference
    `${style} style ${subjects[0]}`,
    
    // Mix top two subjects
    `${style} style ${subjects[0]} with ${subjects[1]} elements`,
    
    // Vary complexity slightly
    `${style} style ${subjects[0]}, slightly more minimal`,
    `${style} style ${subjects[0]}, slightly more detailed`,
  ]

  // Take only the requested number of variations
  const selectedVariations = baseVariations.slice(0, count)

  // Create both framed and clean versions for each variation
  return selectedVariations.map(base => {
    const basePrompt = `${base}, ${complexityDesc}, ${paletteDesc} color palette`
    
    return {
      framed: `close-up of framed artwork on gallery wall, ${basePrompt}, elegant wooden or metal frame, professional gallery lighting, museum-quality presentation, high-end wall art, sharp focus on the artwork, professional interior photography, luxurious home decor`,
      clean: `${basePrompt}, high quality digital art, professional artwork, museum quality, clean composition, no frame, full artwork view, high resolution, masterpiece quality, perfect for wall art`
    }
  })
}

function getComplexityDescriptor(complexity: number): string {
  if (complexity < 0.3) return 'very minimal composition'
  if (complexity < 0.5) return 'simple clean composition'
  if (complexity < 0.7) return 'balanced detail level'
  if (complexity < 0.9) return 'richly detailed composition'
  return 'highly complex and intricate'
}

function getImageSize(orientation: string): 'portrait' | 'landscape' | 'square' {
  switch (orientation) {
    case 'vertical':
      return 'portrait'
    case 'landscape':
      return 'landscape'
    case 'square':
    default:
      return 'square'
  }
}

function buildTestImagePrompt(spec: any): string {
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
  
  // Add consistent quality suffixes for test images
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