import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const testImages = await prisma.testImage.findMany({
      orderBy: {
        id: 'asc'
      }
    })
    
    return NextResponse.json(testImages)
  } catch (error) {
    console.error('Error fetching test images:', error)
    return NextResponse.json({ error: 'Failed to fetch test images' }, { status: 500 })
  }
}