import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { TasteDiscovery } from '@/lib/algorithms/tasteDiscovery'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room, palette, size } = body

    // Create a new session
    const session = await prisma.session.create({
      data: {
        statedRoom: room,
        statedPalette: palette,
        statedSize: size,
      }
    })

    // Initialize taste discovery and get first pair
    const discovery = new TasteDiscovery({ room, palette, size })
    const firstPair = await discovery.getNextPair(0)

    return NextResponse.json({
      session,
      firstPair,
    })
  } catch (error) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}