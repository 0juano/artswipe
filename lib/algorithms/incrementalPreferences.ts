import { prisma } from '@/lib/database/prisma'

interface PreferenceState {
  styleScores: Record<string, number>
  subjectScores: Record<string, number>
  complexitySum: number
  complexityCount: number
  paletteScores: Record<string, number>
  processedChoices: number
  lastChoiceId?: number
}

/**
 * Incremental preference calculation system
 * Stores and updates preference state without reprocessing all choices
 */
export class IncrementalPreferenceTracker {
  private sessionId: string
  private state: PreferenceState
  
  constructor(sessionId: string) {
    this.sessionId = sessionId
    this.state = {
      styleScores: {},
      subjectScores: {},
      complexitySum: 0,
      complexityCount: 0,
      paletteScores: {},
      processedChoices: 0,
    }
  }

  /**
   * Load existing state from database or cache
   */
  async loadState(): Promise<void> {
    // Try to load from database (could be Redis in production)
    const existingProfile = await prisma.userProfile.findUnique({
      where: { sessionId: this.sessionId },
      select: {
        preferredStyle: true,
        preferredSubjects: true,
        preferredComplexity: true,
        styleDistribution: true,
        subjectScores: true,
      }
    })

    if (existingProfile?.styleDistribution) {
      try {
        const cached = JSON.parse(existingProfile.styleDistribution)
        if (cached.state) {
          this.state = cached.state
        }
      } catch (e) {
        // Start fresh if parsing fails
      }
    }

    // Get the last processed choice
    const lastChoice = await prisma.choice.findFirst({
      where: { sessionId: this.sessionId },
      orderBy: { choiceNumber: 'desc' },
      select: { id: true, choiceNumber: true }
    })

    if (lastChoice) {
      this.state.lastChoiceId = lastChoice.id
      this.state.processedChoices = lastChoice.choiceNumber
    }
  }

  /**
   * Process only new choices incrementally
   */
  async processNewChoice(
    leftImage: any,
    rightImage: any,
    choice: 'left' | 'right',
    responseTimeMs: number
  ): Promise<void> {
    const chosen = choice === 'left' ? leftImage : rightImage
    const rejected = choice === 'left' ? rightImage : leftImage

    // Calculate weight based on response time
    const weight = this.calculateResponseWeight(responseTimeMs)

    // Update style scores
    if (chosen.style) {
      this.state.styleScores[chosen.style] = 
        (this.state.styleScores[chosen.style] || 0) + weight
    }
    if (rejected.style) {
      this.state.styleScores[rejected.style] = 
        (this.state.styleScores[rejected.style] || 0) - (weight * 0.5)
    }

    // Update subject scores
    if (chosen.subject) {
      this.state.subjectScores[chosen.subject] = 
        (this.state.subjectScores[chosen.subject] || 0) + weight
    }

    // Update complexity
    if (chosen.complexity) {
      const complexityValue = this.parseComplexity(chosen.complexity)
      this.state.complexitySum += complexityValue * weight
      this.state.complexityCount += weight
    }

    // Update palette scores
    if (chosen.palette) {
      this.state.paletteScores[chosen.palette] = 
        (this.state.paletteScores[chosen.palette] || 0) + weight
    }

    this.state.processedChoices++

    // Save state immediately
    await this.saveState()
  }

  /**
   * Save current state to database for next request
   */
  async saveState(): Promise<void> {
    const stateJson = JSON.stringify({
      state: this.state,
      timestamp: Date.now()
    })

    await prisma.userProfile.upsert({
      where: { sessionId: this.sessionId },
      update: {
        styleDistribution: stateJson,
      },
      create: {
        sessionId: this.sessionId,
        preferredStyle: this.getTopStyle(),
        preferredComplexity: this.getAverageComplexity(),
        preferredSubjects: JSON.stringify(this.getTopSubjects()),
        preferredPalette: this.getTopPalette(),
        styleDistribution: stateJson,
      }
    })
  }

  /**
   * Get final preferences without reprocessing
   */
  getPreferences() {
    return {
      style: this.getTopStyle(),
      subjects: this.getTopSubjects(),
      complexity: this.getAverageComplexity(),
      palette: this.getTopPalette(),
      styleDistribution: this.getNormalizedStyleDistribution(),
      subjectScores: this.state.subjectScores,
      processedChoices: this.state.processedChoices,
    }
  }

  private calculateResponseWeight(responseTimeMs: number): number {
    if (responseTimeMs < 1000) return 1.5
    if (responseTimeMs < 2000) return 1.2
    if (responseTimeMs < 3500) return 1.0
    if (responseTimeMs < 5000) return 0.8
    return 0.6
  }

  private parseComplexity(complexity: string): number {
    const complexityMap: Record<string, number> = {
      'single element': 0.2,
      '3 simple shapes': 0.4,
      '5-7 layered elements': 0.6,
      '10+ intricate details': 0.8,
      'dense maximum complexity': 1.0,
    }
    return complexityMap[complexity] || 0.5
  }

  private getTopStyle(): string {
    const sorted = Object.entries(this.state.styleScores)
      .sort(([,a], [,b]) => b - a)
    return sorted[0]?.[0] || 'minimalist'
  }

  private getTopSubjects(): string[] {
    const sorted = Object.entries(this.state.subjectScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([subject]) => subject)
    
    // Add defaults if needed
    while (sorted.length < 3) {
      const defaults = ['nature elements', 'geometric shapes', 'abstract patterns']
      for (const d of defaults) {
        if (!sorted.includes(d)) {
          sorted.push(d)
          break
        }
      }
    }
    
    return sorted
  }

  private getAverageComplexity(): number {
    if (this.state.complexityCount === 0) return 0.5
    return this.state.complexitySum / this.state.complexityCount
  }

  private getTopPalette(): string {
    const sorted = Object.entries(this.state.paletteScores)
      .sort(([,a], [,b]) => b - a)
    return sorted[0]?.[0] || 'neutral'
  }

  private getNormalizedStyleDistribution(): Record<string, number> {
    const total = Object.values(this.state.styleScores)
      .reduce((sum, score) => sum + Math.max(0, score), 0)
    
    if (total === 0) return { minimalist: 1.0 }
    
    const distribution: Record<string, number> = {}
    for (const [style, score] of Object.entries(this.state.styleScores)) {
      if (score > 0) {
        distribution[style] = score / total
      }
    }
    
    return distribution
  }
}