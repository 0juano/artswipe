import { TasteDiscovery } from './tasteDiscovery'
import { AdvancedTasteDiscovery } from './advancedTasteDiscovery'
import { prisma } from '@/lib/database/prisma'

export type AlgorithmVersion = 'basic' | 'advanced' | 'experimental'

interface AlgorithmMetrics {
  version: AlgorithmVersion
  sessionId: string
  completionTime: number
  confidenceScore: number
  userSatisfaction?: number
  generatedArtworkEngagement?: number
  consistencyScore?: number
}

export class ABTestingFramework {
  /**
   * Randomly assign an algorithm version to a new session
   * Can be weighted to favor certain algorithms
   */
  static assignAlgorithm(sessionId: string): AlgorithmVersion {
    // Get distribution from environment or use defaults
    const distribution = {
      basic: 0.3,      // 30% get basic algorithm
      advanced: 0.6,   // 60% get advanced algorithm
      experimental: 0.1 // 10% get experimental features
    }
    
    const random = Math.random()
    
    if (random < distribution.basic) {
      this.trackAssignment(sessionId, 'basic')
      return 'basic'
    } else if (random < distribution.basic + distribution.advanced) {
      this.trackAssignment(sessionId, 'advanced')
      return 'advanced'
    } else {
      this.trackAssignment(sessionId, 'experimental')
      return 'experimental'
    }
  }

  /**
   * Track which algorithm was assigned to which session
   */
  private static async trackAssignment(sessionId: string, version: AlgorithmVersion) {
    // Store in session metadata or separate tracking table
    // For now, we'll add it to the session
    try {
      await prisma.session.update({
        where: { id: sessionId },
        data: { 
          // We'll need to add an algorithmVersion field to the Session model
          // For now, we can store it in a JSON field or comment
        }
      })
    } catch (error) {
      console.error('Error tracking algorithm assignment:', error)
    }
  }

  /**
   * Get the appropriate algorithm instance based on version
   */
  static getAlgorithm(
    version: AlgorithmVersion,
    statedPreferences: { room: string; palette: string; size: string }
  ) {
    switch (version) {
      case 'basic':
        return new TasteDiscovery(statedPreferences)
      
      case 'advanced':
        return new AdvancedTasteDiscovery(statedPreferences)
      
      case 'experimental':
        // Could be an even more advanced version or testing specific features
        return new ExperimentalTasteDiscovery(statedPreferences)
      
      default:
        return new TasteDiscovery(statedPreferences)
    }
  }

  /**
   * Track metrics for algorithm performance
   */
  static async trackMetrics(metrics: AlgorithmMetrics) {
    // In a real implementation, this would go to an analytics service
    // For now, we'll log it
    console.log('Algorithm Metrics:', {
      ...metrics,
      timestamp: new Date().toISOString()
    })
    
    // Could also store in a metrics table
    try {
      // await prisma.algorithmMetrics.create({ data: metrics })
    } catch (error) {
      console.error('Error tracking metrics:', error)
    }
  }

  /**
   * Compare algorithm performance
   */
  static async comparePerformance(startDate: Date, endDate: Date) {
    // This would query metrics and generate a comparison report
    const report = {
      basic: {
        sessions: 0,
        avgCompletionTime: 0,
        avgConfidence: 0,
        avgSatisfaction: 0
      },
      advanced: {
        sessions: 0,
        avgCompletionTime: 0,
        avgConfidence: 0,
        avgSatisfaction: 0
      }
    }
    
    // Query and aggregate metrics...
    
    return report
  }
}

/**
 * Experimental version for testing new features
 */
class ExperimentalTasteDiscovery extends AdvancedTasteDiscovery {
  // Additional experimental features
  private emotionalTones: Map<string, number>
  private culturalPreferences: Map<string, number>
  
  constructor(statedPreferences: { room: string; palette: string; size: string }) {
    super(statedPreferences)
    this.emotionalTones = new Map()
    this.culturalPreferences = new Map()
  }
  
  // Override methods to add experimental behavior
  processChoice(
    leftImage: any,
    rightImage: any,
    choice: 'left' | 'right',
    responseTimeMs: number,
    choiceNumber: number
  ) {
    super.processChoice(leftImage, rightImage, choice, responseTimeMs, choiceNumber)
    
    // Experimental: Track emotional responses based on quick choices
    if (responseTimeMs < 1500) {
      const chosen = choice === 'left' ? leftImage : rightImage
      
      // Infer emotional preference from style
      if (chosen.style === 'minimalist') {
        this.emotionalTones.set('calm', (this.emotionalTones.get('calm') || 0) + 1)
      } else if (chosen.style === 'maximalist') {
        this.emotionalTones.set('energetic', (this.emotionalTones.get('energetic') || 0) + 1)
      }
    }
  }
}