import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function GET() {
  try {
    // Get all algorithm metrics
    const metrics = await prisma.algorithmMetrics.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Last 100 sessions
    })

    // Aggregate by algorithm version
    const aggregated = metrics.reduce((acc, metric) => {
      const version = metric.algorithmVersion
      
      if (!acc[version]) {
        acc[version] = {
          version,
          totalSessions: 0,
          avgCompletionTime: 0,
          avgResponseTime: 0,
          avgConfidence: 0,
          avgConsistency: 0,
          quickDecisionRate: 0,
          slowDecisionRate: 0,
          completionTimes: [],
          responseTimes: [],
          confidenceScores: [],
        }
      }
      
      const v = acc[version]
      v.totalSessions++
      v.completionTimes.push(metric.completionTimeMs || 0)
      v.responseTimes.push(metric.avgResponseTimeMs)
      v.confidenceScores.push(metric.confidenceScore)
      
      const totalDecisions = metric.quickDecisions + metric.slowDecisions + 
                            (metric.totalChoices - metric.quickDecisions - metric.slowDecisions)
      
      if (totalDecisions > 0) {
        v.quickDecisionRate += metric.quickDecisions / totalDecisions
        v.slowDecisionRate += metric.slowDecisions / totalDecisions
      }
      
      return acc
    }, {} as Record<string, any>)

    // Calculate averages
    Object.values(aggregated).forEach((v: any) => {
      if (v.totalSessions > 0) {
        v.avgCompletionTime = v.completionTimes.reduce((a: number, b: number) => a + b, 0) / v.totalSessions
        v.avgResponseTime = v.responseTimes.reduce((a: number, b: number) => a + b, 0) / v.totalSessions
        v.avgConfidence = v.confidenceScores.reduce((a: number, b: number) => a + b, 0) / v.totalSessions
        v.quickDecisionRate = v.quickDecisionRate / v.totalSessions
        v.slowDecisionRate = v.slowDecisionRate / v.totalSessions
        
        // Clean up arrays
        delete v.completionTimes
        delete v.responseTimes
        delete v.confidenceScores
      }
    })

    // Get recent sessions for trend analysis
    const recentSessions = await prisma.session.findMany({
      where: {
        completedAt: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        profile: true,
        metrics: true,
      }
    })

    return NextResponse.json({
      aggregated,
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        algorithmVersion: s.algorithmVersion,
        completedAt: s.completedAt,
        confidence: s.profile?.confidenceScore,
        avgResponseTime: s.metrics?.avgResponseTimeMs,
        totalChoices: s.metrics?.totalChoices,
      })),
      summary: {
        totalSessions: metrics.length,
        algorithmsInUse: Object.keys(aggregated),
        bestPerforming: Object.entries(aggregated)
          .sort((a, b) => b[1].avgConfidence - a[1].avgConfidence)[0]?.[0],
      }
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}