import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { TasteDiscovery } from '@/lib/algorithms/tasteDiscovery'
import { AdvancedTasteDiscovery } from '@/lib/algorithms/advancedTasteDiscovery'
import { ABTestingFramework } from '@/lib/algorithms/abTesting'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orientation, palette } = body

    // Create a new session with algorithm assignment
    const session = await prisma.session.create({
      data: {
        statedOrientation: orientation,
        statedPalette: palette,
      }
    })

    // Assign algorithm version for this session
    const algorithmVersion = ABTestingFramework.assignAlgorithm(session.id)
    
    // Update session with algorithm version
    await prisma.session.update({
      where: { id: session.id },
      data: { algorithmVersion }
    })

    // Initialize appropriate discovery algorithm
    let discovery: TasteDiscovery | AdvancedTasteDiscovery
    
    if (algorithmVersion === 'advanced' || algorithmVersion === 'experimental') {
      discovery = new AdvancedTasteDiscovery({ orientation, palette }, session.id)
    } else {
      discovery = new TasteDiscovery({ orientation, palette })
    }
    
    const firstPair = await discovery.getNextPair(0)

    return NextResponse.json({
      session: {
        ...session,
        algorithmVersion
      },
      firstPair,
      algorithmVersion,
    })
  } catch (error) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}