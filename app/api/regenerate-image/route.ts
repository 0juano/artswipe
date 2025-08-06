import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    
    // Get the existing image data
    const existingImage = await prisma.testImage.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (!existingImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    
    // Generate with a new random seed
    const newSeed = Math.floor(Math.random() * 1000000)
    
    // Reconstruct the prompt with close-up framing
    const enhancedPrompt = `Close-up view of a large framed artwork on white wall, filling 80% of the image, the artwork shows: ${existingImage.promptUsed}, elegant thin black frame, artwork takes up most of the view, minimal white wall visible around edges, professional art photography, gallery close-up shot, museum quality`
    
    const negativePrompt = 'bedroom, living room, furniture, bed, sofa, table, lamp, plant, person, multiple frames, room interior, floor, ceiling, distant view, small artwork, amateur, low quality, blurry, stock photo, watermark'
    
    console.log(`Regenerating image ID ${id} with new seed ${newSeed}`)
    
    // Call FAL API
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
        seed: newSeed,
      }),
    })

    if (!response.ok) {
      throw new Error(`FAL API error: ${response.statusText}`)
    }

    const data = await response.json()
    const newImageUrl = data.images[0].url
    
    // Update the database with new image URL
    const updatedImage = await prisma.testImage.update({
      where: { id: parseInt(id) },
      data: { imageUrl: newImageUrl }
    })
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: newImageUrl,
      id: updatedImage.id 
    })
    
  } catch (error) {
    console.error('Error regenerating image:', error)
    return NextResponse.json({ 
      error: 'Failed to regenerate image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}