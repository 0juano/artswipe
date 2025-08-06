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
  count: number = 12
): Promise<GeneratedArtwork[]> {
  const prompts = generatePromptVariations(preferences, count)
  const results: GeneratedArtwork[] = []

  // Generate images in parallel batches of 3 to avoid rate limiting
  const batchSize = 3
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize)
    const batchPromises = batch.map(prompt => generateSingleArtwork(prompt, i))
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }

  return results
}

async function generateSingleArtwork(prompt: string, orderIndex: number): Promise<GeneratedArtwork> {
  try {
    const response = await fetch('https://fal.run/fal-ai/flux/dev', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${getFalApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`FAL API error: ${response.statusText}`)
    }

    const data: FalResponse = await response.json()
    
    return {
      imageUrl: data.images[0].url,
      prompt,
      orderIndex,
    }
  } catch (error) {
    console.error('Error generating artwork:', error)
    // Return placeholder in case of error
    return {
      imageUrl: 'https://via.placeholder.com/1024x1024?text=Generation+Failed',
      prompt,
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

function generatePromptVariations(preferences: UserPreferences, count: number): string[] {
  const { style, subjects, complexity, palette, room } = preferences
  const complexityDesc = getComplexityDescriptor(complexity)
  const paletteDesc = palette.replace('-', ' ')
  const roomDesc = room?.replace('-', ' ') || 'living room'

  const baseVariations = [
    // Core preference
    `${style} style ${subjects[0]}`,
    
    // Mix top two subjects
    `${style} style ${subjects[0]} with ${subjects[1]} elements`,
    
    // Vary complexity slightly
    `${style} style ${subjects[0]}, slightly more minimal`,
    `${style} style ${subjects[0]}, slightly more detailed`,
    
    // Try different moods
    `${style} style ${subjects[0]}, soft morning light`,
    `${style} style ${subjects[0]}, dramatic evening shadows`,
    
    // Mix in secondary subject
    `${style} style ${subjects[1]}`,
    
    // Abstract interpretation
    `abstract interpretation of ${subjects[0]} in ${style} style`,
    
    // Seasonal variations
    `${style} style ${subjects[0]}, autumn atmosphere`,
    `${style} style ${subjects[0]}, spring freshness`,
    
    // Texture variations
    `${style} style ${subjects[0]}, smooth textures`,
    `${style} style ${subjects[0]}, rich textures`,
    
    // Third subject if available
    subjects[2] ? `${style} style ${subjects[2]}` : `${style} style abstract composition`,
    
    // Geometric variation
    `${style} style geometric interpretation of ${subjects[0]}`,
    
    // Organic variation
    `${style} style organic flowing ${subjects[0]}`,
  ]

  // Take only the requested number of variations
  const selectedVariations = baseVariations.slice(0, count)

  // Add complexity, palette, and room context to each
  return selectedVariations.map(base => {
    return `${base}, ${complexityDesc}, ${paletteDesc} color palette, high quality wall art for ${roomDesc}, professional photography, museum quality`
  })
}

function getComplexityDescriptor(complexity: number): string {
  if (complexity < 0.3) return 'very minimal composition'
  if (complexity < 0.5) return 'simple clean composition'
  if (complexity < 0.7) return 'balanced detail level'
  if (complexity < 0.9) return 'richly detailed composition'
  return 'highly complex and intricate'
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