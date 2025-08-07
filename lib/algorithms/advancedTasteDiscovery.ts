import { TestImage, UserPreferences } from '@/types'
import { prisma } from '@/lib/database/prisma'

interface ChoiceData {
  chosen: TestImage
  rejected: TestImage
  responseTimeMs: number
  choiceNumber: number
}

interface StyleCorrelation {
  style: string
  subject: string
  strength: number
}

export class AdvancedTasteDiscovery {
  private statedOrientation: string
  private statedPalette: string
  
  // Advanced tracking
  private styleScores: Map<string, number>
  private subjectScores: Map<string, number>
  private paletteScores: Map<string, number>
  private complexityValues: number[]
  private responseTimeWeights: number[]
  
  // Correlation tracking
  private styleSubjectCorrelations: StyleCorrelation[]
  private consistencyScore: number
  private confidenceScore: number
  
  // Pair selection optimization
  private shownPairs: Set<string>
  private uncertainPairs: Array<{left: number, right: number, uncertainty: number}>
  
  constructor(statedPreferences: {
    orientation: string
    palette: string
  }, sessionId?: string) {
    this.statedOrientation = statedPreferences.orientation
    this.statedPalette = statedPreferences.palette
    
    this.styleScores = new Map()
    this.subjectScores = new Map()
    this.paletteScores = new Map()
    this.complexityValues = []
    this.responseTimeWeights = []
    
    this.styleSubjectCorrelations = []
    this.consistencyScore = 1.0
    this.confidenceScore = 0
    
    this.shownPairs = new Set()
    this.uncertainPairs = []
  }

  /**
   * Calculate weight based on response time
   * Quick decisions (< 2s) = higher confidence
   * Slow decisions (> 5s) = uncertainty, lower weight
   */
  private calculateResponseTimeWeight(responseTimeMs: number): number {
    if (responseTimeMs < 1000) return 1.5  // Very quick, strong preference
    if (responseTimeMs < 2000) return 1.2  // Quick, confident
    if (responseTimeMs < 3500) return 1.0  // Normal
    if (responseTimeMs < 5000) return 0.8  // Slower, some uncertainty
    return 0.6  // Very slow, high uncertainty
  }

  /**
   * Calculate choice weight based on multiple factors
   */
  private calculateChoiceWeight(responseTimeMs: number, choiceNumber: number): number {
    const timeWeight = this.calculateResponseTimeWeight(responseTimeMs)
    
    // Later choices get slightly more weight as user understands the system
    const experienceWeight = Math.min(1.2, 0.8 + (choiceNumber * 0.02))
    
    // Consistency bonus (if user is being consistent)
    const consistencyBonus = this.consistencyScore
    
    return timeWeight * experienceWeight * consistencyBonus
  }

  /**
   * Process a single choice with advanced weighting
   */
  processChoice(
    leftImage: TestImage,
    rightImage: TestImage,
    choice: 'left' | 'right',
    responseTimeMs: number,
    choiceNumber: number
  ) {
    const chosen = choice === 'left' ? leftImage : rightImage
    const rejected = choice === 'left' ? rightImage : leftImage
    const weight = this.calculateChoiceWeight(responseTimeMs, choiceNumber)
    
    // Track response time patterns
    this.responseTimeWeights.push(weight)
    
    // Update style scores with weighted voting
    if (chosen.style && rejected.style) {
      this.styleScores.set(chosen.style, 
        (this.styleScores.get(chosen.style) || 0) + weight)
      this.styleScores.set(rejected.style, 
        (this.styleScores.get(rejected.style) || 0) - (weight * 0.5))
      
      // Track style-subject correlations
      if (chosen.subject) {
        this.updateCorrelation(chosen.style, chosen.subject, weight)
      }
    }
    
    // Update subject scores with weighted voting
    if (chosen.subject && rejected.subject) {
      this.subjectScores.set(chosen.subject,
        (this.subjectScores.get(chosen.subject) || 0) + weight)
      
      // Small penalty for rejected, not as strong as reward
      if (chosen.subject !== rejected.subject) {
        this.subjectScores.set(rejected.subject,
          (this.subjectScores.get(rejected.subject) || 0) - (weight * 0.3))
      }
    }
    
    // Track palette preferences (even though stated, behavior might differ)
    if (chosen.palette && rejected.palette && chosen.palette !== rejected.palette) {
      this.paletteScores.set(chosen.palette,
        (this.paletteScores.get(chosen.palette) || 0) + (weight * 0.7))
    }
    
    // Track complexity with weighted average
    if (chosen.complexity) {
      const complexityValue = this.parseComplexity(chosen.complexity)
      this.complexityValues.push(complexityValue * weight)
    }
    
    // Update consistency score
    this.updateConsistencyScore(chosen, rejected, responseTimeMs)
    
    // Update confidence score
    this.updateConfidenceScore(responseTimeMs, weight)
  }

  /**
   * Track correlations between styles and subjects
   */
  private updateCorrelation(style: string, subject: string, weight: number) {
    const existing = this.styleSubjectCorrelations.find(
      c => c.style === style && c.subject === subject
    )
    
    if (existing) {
      existing.strength += weight
    } else {
      this.styleSubjectCorrelations.push({
        style,
        subject,
        strength: weight
      })
    }
  }

  /**
   * Update consistency score based on choice patterns
   */
  private updateConsistencyScore(chosen: TestImage, rejected: TestImage, responseTimeMs: number) {
    // If user picks similar styles consistently, increase score
    if (chosen.style && this.styleScores.get(chosen.style)! > 2) {
      this.consistencyScore = Math.min(1.5, this.consistencyScore + 0.05)
    }
    
    // If response time is very inconsistent, decrease score
    const avgResponseTime = this.responseTimeWeights.reduce((a, b) => a + b, 0) / 
                           this.responseTimeWeights.length
    const variance = Math.abs(this.calculateResponseTimeWeight(responseTimeMs) - avgResponseTime)
    
    if (variance > 0.5) {
      this.consistencyScore = Math.max(0.5, this.consistencyScore - 0.02)
    }
  }

  /**
   * Update overall confidence in the preference model
   */
  private updateConfidenceScore(responseTimeMs: number, weight: number) {
    // Quick, weighted choices increase confidence
    if (responseTimeMs < 2000 && weight > 1.0) {
      this.confidenceScore = Math.min(1.0, this.confidenceScore + 0.05)
    }
    
    // Slow choices decrease confidence
    if (responseTimeMs > 5000) {
      this.confidenceScore = Math.max(0, this.confidenceScore - 0.02)
    }
  }

  /**
   * Smart pair selection for maximum information gain
   */
  async getNextPair(interactionNumber: number): Promise<{ left: TestImage; right: TestImage }> {
    // Adaptive category selection based on confidence
    let category: string
    
    if (this.confidenceScore < 0.3) {
      // Low confidence: focus on clear style differences
      category = 'style'
    } else if (interactionNumber < 8) {
      category = 'style'
    } else if (interactionNumber < 13) {
      category = 'complexity'
    } else if (interactionNumber < 18) {
      category = 'subject'
    } else {
      category = 'color'
    }
    
    // For later interactions, sometimes revisit uncertain pairs
    if (interactionNumber > 15 && this.uncertainPairs.length > 0 && Math.random() < 0.3) {
      // 30% chance to revisit an uncertain pair
      const uncertainPair = this.uncertainPairs.shift()
      if (uncertainPair) {
        const [left, right] = await prisma.testImage.findMany({
          where: {
            id: { in: [uncertainPair.left, uncertainPair.right] }
          }
        })
        
        if (left && right) {
          return { left, right }
        }
      }
    }
    
    const images = await prisma.testImage.findMany({
      where: { testCategory: category }
    })
    
    if (!images || images.length < 2) {
      return this.getMockPair(category)
    }
    
    // Smart pair selection: maximize information gain
    let bestPair = { left: images[0], right: images[1] }
    let maxInfoGain = 0
    
    // Try multiple random pairs and pick the most informative
    for (let i = 0; i < 10; i++) {
      const shuffled = [...images].sort(() => Math.random() - 0.5)
      const left = shuffled[0]
      const right = shuffled[1]
      
      // Skip if already shown
      const pairKey = `${Math.min(left.id, right.id)}-${Math.max(left.id, right.id)}`
      if (this.shownPairs.has(pairKey)) continue
      
      // Calculate information gain
      const infoGain = this.calculateInformationGain(left, right)
      
      if (infoGain > maxInfoGain) {
        maxInfoGain = infoGain
        bestPair = { left, right }
      }
    }
    
    // Mark as shown
    const pairKey = `${Math.min(bestPair.left.id, bestPair.right.id)}-${Math.max(bestPair.left.id, bestPair.right.id)}`
    this.shownPairs.add(pairKey)
    
    return bestPair
  }

  /**
   * Calculate how much information we'd gain from comparing two images
   */
  private calculateInformationGain(left: TestImage, right: TestImage): number {
    let gain = 0
    
    // Different styles = high information
    if (left.style !== right.style) gain += 2
    
    // Different subjects = good information
    if (left.subject !== right.subject) gain += 1.5
    
    // Different complexity = useful information
    if (left.complexity !== right.complexity) gain += 1
    
    // If we're uncertain about either style, boost gain
    const leftStyleScore = this.styleScores.get(left.style || '') || 0
    const rightStyleScore = this.styleScores.get(right.style || '') || 0
    
    if (Math.abs(leftStyleScore - rightStyleScore) < 1) {
      gain += 1.5  // We're uncertain, so this comparison is valuable
    }
    
    return gain
  }

  /**
   * Get final preferences with confidence scores
   */
  getFinalPreferences(): UserPreferences & { 
    confidence: number, 
    explanationText?: string,
    secondaryStyles?: string[],
    correlations?: StyleCorrelation[]
  } {
    // Calculate weighted average complexity
    const weightedComplexity = this.complexityValues.length > 0
      ? this.complexityValues.reduce((a, b) => a + b, 0) / this.complexityValues.length
      : 0.5
    
    // Get top style with confidence
    const sortedStyles = Array.from(this.styleScores.entries())
      .sort((a, b) => b[1] - a[1])
    
    const topStyle = sortedStyles[0]?.[0] || 'minimalist'
    const secondaryStyles = sortedStyles.slice(1, 3).map(([style]) => style)
    
    // Get top subjects with correlation boost
    const subjectScoresWithBoost = new Map(this.subjectScores)
    
    // Boost subjects that correlate with chosen style
    for (const correlation of this.styleSubjectCorrelations) {
      if (correlation.style === topStyle) {
        const current = subjectScoresWithBoost.get(correlation.subject) || 0
        subjectScoresWithBoost.set(correlation.subject, current + (correlation.strength * 0.3))
      }
    }
    
    const sortedSubjects = Array.from(subjectScoresWithBoost.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([subject]) => subject)
    
    // Add defaults if needed
    while (sortedSubjects.length < 3) {
      const defaults = ['nature elements', 'geometric shapes', 'abstract patterns']
      for (const d of defaults) {
        if (!sortedSubjects.includes(d)) {
          sortedSubjects.push(d)
          break
        }
      }
    }
    
    // Check if user's behavior matches stated palette preference
    const behavioralPalette = Array.from(this.paletteScores.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0]
    
    const finalPalette = behavioralPalette && 
                        this.paletteScores.get(behavioralPalette)! > 2
                        ? behavioralPalette 
                        : this.statedPalette
    
    // Generate explanation
    const explanationText = this.generateExplanation(
      topStyle, 
      sortedSubjects, 
      weightedComplexity,
      this.confidenceScore
    )
    
    // Convert maps to objects for distribution data
    const styleDistribution: Record<string, number> = {}
    let totalStyleVotes = 0
    for (const [style, score] of this.styleScores.entries()) {
      if (score > 0) {
        styleDistribution[style] = score
        totalStyleVotes += score
      }
    }
    // Normalize to percentages
    for (const style in styleDistribution) {
      styleDistribution[style] = styleDistribution[style] / totalStyleVotes
    }
    
    // Convert subject scores to object
    const subjectScoresObj: Record<string, number> = {}
    for (const [subject, score] of this.subjectScores.entries()) {
      if (score > 0) {
        subjectScoresObj[subject] = score
      }
    }
    
    return {
      style: topStyle,
      subjects: sortedSubjects,
      complexity: weightedComplexity,
      palette: finalPalette,
      orientation: this.statedOrientation,
      confidence: this.confidenceScore,
      explanationText,
      secondaryStyles,
      styleDistribution,
      subjectScores: subjectScoresObj,
      correlations: this.styleSubjectCorrelations
        .filter(c => c.style === topStyle)
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3)
    }
  }

  /**
   * Generate human-readable explanation of preferences
   */
  private generateExplanation(
    style: string, 
    subjects: string[], 
    complexity: number,
    confidence: number
  ): string {
    const complexityDesc = this.getComplexityDescriptor(complexity)
    const confidenceDesc = confidence > 0.7 ? "strongly prefer" : 
                          confidence > 0.4 ? "tend to like" : 
                          "might enjoy"
    
    return `Based on your choices, you ${confidenceDesc} ${style} style artwork ` +
           `featuring ${subjects[0]} and ${subjects[1]}, ` +
           `with ${complexityDesc} composition. ` +
           `Your decision-making pattern suggests ${
             this.consistencyScore > 1.2 ? 'clear and consistent preferences' :
             this.consistencyScore > 0.8 ? 'developing preferences' :
             'you\'re still exploring your taste'
           }.`
  }

  private parseComplexity(complexity: string): number {
    const complexityMap: { [key: string]: number } = {
      'ultra minimal': 0.1,
      'simple clean': 0.3,
      'balanced moderate': 0.5,
      'rich detailed': 0.7,
      'maximum': 0.9,
      // Legacy mappings
      'single element': 0.2,
      '3 simple shapes': 0.4,
      '5-7 layered elements': 0.6,
      '10+ intricate details': 0.8,
      'dense maximum complexity': 1.0,
    }
    return complexityMap[complexity] || 0.5
  }

  private getComplexityDescriptor(complexity: number): string {
    if (complexity < 0.3) return 'very minimal'
    if (complexity < 0.5) return 'simple and clean'
    if (complexity < 0.7) return 'balanced'
    if (complexity < 0.9) return 'richly detailed'
    return 'highly complex'
  }

  private getMockPair(category: string): { left: TestImage; right: TestImage } {
    const mockLeft: TestImage = {
      id: 1,
      imageUrl: 'https://via.placeholder.com/512x512?text=Left+Image',
      style: 'minimalist',
      subject: 'abstract',
      palette: 'neutral',
      complexity: 'simple',
      testCategory: category,
      promptUsed: 'mock image left'
    }
    
    const mockRight: TestImage = {
      id: 2,
      imageUrl: 'https://via.placeholder.com/512x512?text=Right+Image',
      style: 'detailed',
      subject: 'nature',
      palette: 'warm',
      complexity: 'complex',
      testCategory: category,
      promptUsed: 'mock image right'
    }
    
    return { left: mockLeft, right: mockRight }
  }
}