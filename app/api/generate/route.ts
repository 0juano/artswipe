import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { generateTasteExplanation } from '@/lib/ai/openrouter'
import { generatePersonalizedArtworks } from '@/lib/ai/fal'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, preferences } = body

    // Get the number of choices made
    const choiceCount = await prisma.choice.count({
      where: { sessionId: sessionId }
    })

    // Generate taste explanation
    const explanation = await generateTasteExplanation(preferences, choiceCount || 20)

    // Update user profile with explanation
    await prisma.userProfile.update({
      where: { sessionId: sessionId },
      data: { explanationText: explanation }
    })

    // Generate diversified collection of 12 artworks
    const artworks = await generatePersonalizedArtworks(preferences, 12)

    // Save generated artworks to database with variation types
    const artworkData = artworks.map((artwork, index) => ({
      sessionId: sessionId,
      imageUrl: artwork.imageUrl,
      cleanImageUrl: artwork.cleanImageUrl,
      prompt: artwork.prompt,
      orderIndex: index,
      variationType: artwork.variationType,
      description: artwork.description,
    }))

    await prisma.generatedArtwork.createMany({
      data: artworkData
    })

    return NextResponse.json({
      explanation,
      artworks,
    })
  } catch (error) {
    console.error('Error generating results:', error)
    return NextResponse.json(
      { error: 'Failed to generate results' },
      { status: 500 }
    )
  }
}