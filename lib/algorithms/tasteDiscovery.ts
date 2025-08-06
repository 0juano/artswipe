import { TestImage, UserPreferences } from '@/types'
import { prisma } from '@/lib/database/prisma'

export class TasteDiscovery {
  private statedRoom: string
  private statedPalette: string
  private statedSize: string
  private styleVotes: Map<string, number>
  private subjectVotes: Map<string, number>
  private complexitySum: number
  private complexityCount: number
  private shownPairs: Set<string>

  constructor(statedPreferences: {
    room: string
    palette: string
    size: string
  }) {
    this.statedRoom = statedPreferences.room
    this.statedPalette = statedPreferences.palette
    this.statedSize = statedPreferences.size
    
    this.styleVotes = new Map()
    this.subjectVotes = new Map()
    this.complexitySum = 0
    this.complexityCount = 0
    this.shownPairs = new Set()
  }

  async getNextPair(interactionNumber: number): Promise<{ left: TestImage; right: TestImage }> {
    let category: string
    
    if (interactionNumber < 8) {
      category = 'style'
    } else if (interactionNumber < 13) {
      category = 'complexity'
    } else if (interactionNumber < 18) {
      category = 'subject'
    } else {
      category = 'color'
    }

    // Fetch test images from the category
    const images = await prisma.testImage.findMany({
      where: { testCategory: category }
    })

    if (!images || images.length < 2) {
      // If no test images exist, create mock ones for testing
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

    // Simple random selection avoiding shown pairs
    let left: TestImage
    let right: TestImage
    let attempts = 0
    
    do {
      const shuffled = [...images].sort(() => Math.random() - 0.5)
      left = shuffled[0]
      right = shuffled[1]
      attempts++
    } while (
      this.shownPairs.has(`${left.id}-${right.id}`) ||
      this.shownPairs.has(`${right.id}-${left.id}`) &&
      attempts < 20
    )

    this.shownPairs.add(`${left.id}-${right.id}`)
    
    return { left, right }
  }

  processChoice(leftImage: TestImage | any, rightImage: TestImage | any, choice: 'left' | 'right') {
    const chosen = choice === 'left' ? leftImage : rightImage
    const rejected = choice === 'left' ? rightImage : leftImage

    // Update style votes
    if (chosen.style && rejected.style && chosen.style !== rejected.style) {
      this.styleVotes.set(chosen.style, (this.styleVotes.get(chosen.style) || 0) + 1)
      this.styleVotes.set(rejected.style, (this.styleVotes.get(rejected.style) || 0) - 0.5)
    }

    // Update subject votes
    if (chosen.subject && rejected.subject && chosen.subject !== rejected.subject) {
      this.subjectVotes.set(chosen.subject, (this.subjectVotes.get(chosen.subject) || 0) + 1)
    }

    // Update complexity
    if (chosen.complexity) {
      const complexityValue = this.parseComplexity(chosen.complexity)
      this.complexitySum += complexityValue
      this.complexityCount++
    }
  }

  private parseComplexity(complexity: string): number {
    const complexityMap: { [key: string]: number } = {
      'single element': 0.2,
      '3 simple shapes': 0.4,
      '5-7 layered elements': 0.6,
      '10+ intricate details': 0.8,
      'dense maximum complexity': 1.0,
    }
    return complexityMap[complexity] || 0.5
  }

  getFinalPreferences(): UserPreferences {
    // Get top style
    let topStyle = 'minimalist' // default
    let maxStyleVotes = -Infinity
    
    for (const [style, votes] of this.styleVotes.entries()) {
      if (votes > maxStyleVotes) {
        maxStyleVotes = votes
        topStyle = style
      }
    }

    // Get top subjects
    const sortedSubjects = Array.from(this.subjectVotes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([subject]) => subject)

    // If we don't have enough subjects, add defaults
    while (sortedSubjects.length < 3) {
      const defaults = ['nature elements', 'geometric shapes', 'abstract patterns']
      for (const d of defaults) {
        if (!sortedSubjects.includes(d)) {
          sortedSubjects.push(d)
          break
        }
      }
    }

    // Calculate average complexity
    const avgComplexity = this.complexityCount > 0
      ? this.complexitySum / this.complexityCount
      : 0.5

    return {
      style: topStyle,
      subjects: sortedSubjects,
      complexity: avgComplexity,
      palette: this.statedPalette,
      room: this.statedRoom,
    }
  }

  getComplexityDescriptor(complexity: number): string {
    if (complexity < 0.3) return 'very minimal'
    if (complexity < 0.5) return 'simple and clean'
    if (complexity < 0.7) return 'balanced detail'
    if (complexity < 0.9) return 'richly detailed'
    return 'highly complex'
  }
}