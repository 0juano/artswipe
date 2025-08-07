import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { TasteDiscovery } from '@/lib/algorithms/tasteDiscovery'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, leftId, rightId, choice, choiceNumber, responseTime } = body

    // Save the choice
    await prisma.choice.create({
      data: {
        sessionId: sessionId,
        shownLeftId: leftId,
        shownRightId: rightId,
        choice: choice,
        choiceNumber: choiceNumber,
        responseTimeMs: responseTime,
      }
    })

    // Get session data
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      throw new Error('Session not found')
    }

    // Get all previous choices with related test images
    const allChoices = await prisma.choice.findMany({
      where: { sessionId: sessionId },
      include: {
        leftImage: true,
        rightImage: true,
      },
      orderBy: { choiceNumber: 'asc' }
    })

    // Initialize taste discovery with session preferences
    const discovery = new TasteDiscovery({
      orientation: session.statedOrientation,
      palette: session.statedPalette,
    })

    // Process all choices
    for (const c of allChoices) {
      discovery.processChoice(c.leftImage, c.rightImage, c.choice as 'left' | 'right')
    }

    // Check if we've reached 20 comparisons
    if (choiceNumber >= 20) {
      const preferences = discovery.getFinalPreferences()
      
      // Save user profile (convert array to JSON string for SQLite)
      await prisma.userProfile.upsert({
        where: { sessionId: sessionId },
        update: {
          preferredStyle: preferences.style,
          preferredComplexity: preferences.complexity,
          preferredSubjects: JSON.stringify(preferences.subjects),
          preferredPalette: preferences.palette,
        },
        create: {
          sessionId: sessionId,
          preferredStyle: preferences.style,
          preferredComplexity: preferences.complexity,
          preferredSubjects: JSON.stringify(preferences.subjects),
          preferredPalette: preferences.palette,
        }
      })

      return NextResponse.json({
        complete: true,
        preferences,
      })
    }

    // Get next pair
    const nextPair = await discovery.getNextPair(choiceNumber)

    return NextResponse.json({
      complete: false,
      nextPair,
    })
  } catch (error) {
    console.error('Error processing choice:', error)
    return NextResponse.json(
      { error: 'Failed to process choice' },
      { status: 500 }
    )
  }
}