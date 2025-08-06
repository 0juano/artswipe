import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { AdvancedTasteDiscovery } from '@/lib/algorithms/advancedTasteDiscovery'
import { ABTestingFramework } from '@/lib/algorithms/abTesting'

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

    // Use advanced algorithm
    const discovery = new AdvancedTasteDiscovery({
      orientation: session.statedOrientation,
      palette: session.statedPalette,
      size: session.statedSize,
    }, sessionId)

    // Track metrics
    let quickDecisions = 0
    let slowDecisions = 0
    let totalResponseTime = 0

    // Process all choices with response time data
    for (const c of allChoices) {
      discovery.processChoice(
        c.leftImage, 
        c.rightImage, 
        c.choice as 'left' | 'right',
        c.responseTimeMs,
        c.choiceNumber
      )

      // Track metrics
      totalResponseTime += c.responseTimeMs
      if (c.responseTimeMs < 2000) quickDecisions++
      if (c.responseTimeMs > 5000) slowDecisions++
    }

    // Check if we've reached 20 comparisons
    if (choiceNumber >= 20) {
      const preferences = discovery.getFinalPreferences()
      
      // Save user profile with extended data
      await prisma.userProfile.upsert({
        where: { sessionId: sessionId },
        update: {
          preferredStyle: preferences.style,
          preferredComplexity: preferences.complexity,
          preferredSubjects: JSON.stringify(preferences.subjects),
          preferredPalette: preferences.palette,
          explanationText: preferences.explanationText,
          confidenceScore: preferences.confidence,
          secondaryStyles: preferences.secondaryStyles ? JSON.stringify(preferences.secondaryStyles) : null,
          styleCorrelations: preferences.correlations ? JSON.stringify(preferences.correlations) : null,
        },
        create: {
          sessionId: sessionId,
          preferredStyle: preferences.style,
          preferredComplexity: preferences.complexity,
          preferredSubjects: JSON.stringify(preferences.subjects),
          preferredPalette: preferences.palette,
          explanationText: preferences.explanationText,
          confidenceScore: preferences.confidence,
          secondaryStyles: preferences.secondaryStyles ? JSON.stringify(preferences.secondaryStyles) : null,
          styleCorrelations: preferences.correlations ? JSON.stringify(preferences.correlations) : null,
        }
      })

      // Save algorithm metrics
      const avgResponseTime = totalResponseTime / allChoices.length
      
      await prisma.algorithmMetrics.create({
        data: {
          sessionId: sessionId,
          algorithmVersion: 'advanced',
          totalChoices: allChoices.length,
          avgResponseTimeMs: avgResponseTime,
          confidenceScore: preferences.confidence,
          consistencyScore: null, // Would need to expose from algorithm
          completionTimeMs: Date.now() - session.createdAt.getTime(),
          quickDecisions,
          slowDecisions,
          uncertainPairs: 0, // Would need to track in algorithm
        }
      })

      // Mark session as completed
      await prisma.session.update({
        where: { id: sessionId },
        data: { completedAt: new Date() }
      })

      // Track with AB testing framework
      ABTestingFramework.trackMetrics({
        version: 'advanced',
        sessionId,
        completionTime: Date.now() - session.createdAt.getTime(),
        confidenceScore: preferences.confidence,
      })

      return NextResponse.json({
        complete: true,
        preferences,
        confidence: preferences.confidence,
        explanation: preferences.explanationText,
      })
    }

    // Get next pair using smart selection
    const nextPair = await discovery.getNextPair(choiceNumber)

    return NextResponse.json({
      complete: false,
      nextPair,
      progress: choiceNumber / 20,
      confidenceLevel: discovery['confidenceScore'] || 0, // Access private field for progress tracking
    })
  } catch (error) {
    console.error('Error processing choice:', error)
    return NextResponse.json(
      { error: 'Failed to process choice' },
      { status: 500 }
    )
  }
}