import { UserPreferences, GeneratedArtwork } from '@/types'

interface ExtendedPreferences extends UserPreferences {
  styleDistribution?: Record<string, number>
  subjectScores?: Record<string, number>
  secondaryStyles?: string[]
}

interface GenerationPlanItem {
  type: 'primary' | 'secondary' | 'creative' | 'variation'
  style: string
  subject: string
  complexity: number
  palette: string
  variation: string
  description: string
}

export class DiversifiedArtGenerator {
  private preferences: ExtendedPreferences
  
  constructor(preferences: ExtendedPreferences) {
    this.preferences = preferences
  }

  /**
   * Create a diverse generation plan based on full preference profile
   */
  createGenerationPlan(count: number = 12): GenerationPlanItem[] {
    const plan: GenerationPlanItem[] = []
    
    // Extract distributions
    const styleDistribution = this.preferences.styleDistribution || 
      { [this.preferences.style]: 1.0 }
    const subjectScores = this.preferences.subjectScores || 
      this.preferences.subjects.reduce((acc, s, i) => ({ ...acc, [s]: 3 - i }), {})
    
    // Sort styles and subjects by preference
    const sortedStyles = Object.entries(styleDistribution)
      .sort((a, b) => b[1] - a[1])
    const sortedSubjects = Object.entries(subjectScores)
      .sort((a, b) => b[1] - a[1])
    
    // 1. PRIMARY PREFERENCES (40% - 5 images for count=12)
    const primaryCount = Math.ceil(count * 0.4)
    const topStyle = sortedStyles[0][0]
    const topSubject = sortedSubjects[0][0]
    
    for (let i = 0; i < primaryCount; i++) {
      const variations = [
        'morning light',
        'golden hour',
        'dramatic mood',
        'serene atmosphere',
        'vibrant energy'
      ]
      
      plan.push({
        type: 'primary',
        style: topStyle,
        subject: topSubject,
        complexity: this.preferences.complexity,
        palette: this.preferences.palette,
        variation: variations[i % variations.length],
        description: `${topStyle} ${topSubject} - ${variations[i % variations.length]}`
      })
    }
    
    // 2. SECONDARY COMBINATIONS (30% - 4 images)
    const secondaryCount = Math.floor(count * 0.3)
    
    if (sortedStyles.length > 1 || sortedSubjects.length > 1) {
      for (let i = 0; i < secondaryCount; i++) {
        // Mix secondary styles with various subjects
        const styleIndex = Math.min(1, sortedStyles.length - 1)
        const subjectIndex = Math.min(i % 3 + 1, sortedSubjects.length - 1)
        
        plan.push({
          type: 'secondary',
          style: sortedStyles[styleIndex]?.[0] || topStyle,
          subject: sortedSubjects[subjectIndex]?.[0] || topSubject,
          complexity: this.preferences.complexity,
          palette: this.preferences.palette,
          variation: 'alternative style',
          description: `Also liked: ${sortedStyles[styleIndex]?.[0]} with ${sortedSubjects[subjectIndex]?.[0]}`
        })
      }
    }
    
    // 3. CREATIVE MIXES (20% - 2 images)
    const creativeCount = Math.floor(count * 0.2)
    
    for (let i = 0; i < creativeCount; i++) {
      // Create unexpected but potentially appealing combinations
      const randomStyleIndex = Math.min(
        Math.floor(Math.random() * 2) + 1,
        sortedStyles.length - 1
      )
      const randomSubjectIndex = Math.min(
        Math.floor(Math.random() * 3) + 1,
        sortedSubjects.length - 1
      )
      
      plan.push({
        type: 'creative',
        style: sortedStyles[randomStyleIndex]?.[0] || topStyle,
        subject: sortedSubjects[randomSubjectIndex]?.[0] || sortedSubjects[0][0],
        complexity: this.preferences.complexity * (0.7 + Math.random() * 0.6),
        palette: this.preferences.palette,
        variation: 'creative interpretation',
        description: `Creative mix: ${sortedStyles[randomStyleIndex]?.[0]} meets ${sortedSubjects[randomSubjectIndex]?.[0]}`
      })
    }
    
    // 4. VARIATIONS (remaining - 1 image)
    const variationCount = count - plan.length
    
    for (let i = 0; i < variationCount; i++) {
      // Vary complexity and mood while keeping core preferences
      const complexityMultiplier = i % 2 === 0 ? 0.6 : 1.4
      
      plan.push({
        type: 'variation',
        style: topStyle,
        subject: sortedSubjects[Math.min(i + 1, sortedSubjects.length - 1)]?.[0] || topSubject,
        complexity: this.preferences.complexity * complexityMultiplier,
        palette: this.preferences.palette,
        variation: complexityMultiplier < 1 ? 'minimalist version' : 'detailed version',
        description: `Variation: ${complexityMultiplier < 1 ? 'Simplified' : 'Detailed'} ${topSubject}`
      })
    }
    
    return plan
  }

  /**
   * Generate diverse prompts from the plan
   */
  generateDiversePrompts(plan: GenerationPlanItem[]): Array<{
    framed: string
    clean: string
    type: string
    description: string
  }> {
    return plan.map(item => {
      const basePrompt = this.buildPromptFromPlan(item)
      
      return {
        framed: `close-up of framed artwork on gallery wall, ${basePrompt}, elegant ${this.getFrameStyle(item.style)} frame, professional gallery lighting, museum-quality presentation, high-end wall art, sharp focus on the artwork, professional interior photography, luxurious home decor`,
        clean: `${basePrompt}, high quality digital art, professional artwork, museum quality, clean composition, no frame, full artwork view, high resolution, masterpiece quality, perfect for wall art`,
        type: item.type,
        description: item.description
      }
    })
  }

  private buildPromptFromPlan(item: GenerationPlanItem): string {
    const stylePrompts: Record<string, string> = {
      'minimalist': 'ultra minimalist design, clean lines, negative space, simple elegance',
      'abstract': 'abstract expressionist painting, bold shapes, emotional depth',
      'watercolor': 'soft watercolor painting, flowing washes, delicate transparency',
      'geometric': 'precise geometric composition, mathematical beauty, structured harmony',
      'botanical': 'botanical illustration style, detailed nature study, scientific accuracy',
      'photographic': 'fine art photography style, dramatic lighting, professional composition',
      'impressionist': 'impressionist painting, loose brushwork, light and color',
      'modern': 'modern contemporary art, current trends, innovative approach',
      'traditional': 'traditional fine art, classical technique, timeless beauty'
    }
    
    const subjectPrompts: Record<string, string> = {
      'mountains': 'majestic mountain landscape, peaks and valleys',
      'ocean': 'serene ocean waves, coastal beauty',
      'geometric shapes': 'interlocking geometric forms, mathematical patterns',
      'botanical': 'elegant botanical elements, flora and nature',
      'abstract': 'pure abstract forms, non-representational art',
      'architecture': 'architectural structures, building designs',
      'celestial': 'celestial bodies, sun moon and stars',
      'landscapes': 'sweeping landscape vistas, natural scenery',
      'portraits': 'artistic portrait composition, human form',
      'patterns': 'intricate pattern work, repetitive designs'
    }
    
    const style = stylePrompts[item.style] || item.style
    const subject = subjectPrompts[item.subject] || item.subject
    const complexityDesc = this.getComplexityDescriptor(item.complexity)
    const paletteDesc = item.palette.replace('-', ' ')
    
    // Add variation-specific modifiers
    const variationModifiers: Record<string, string> = {
      'morning light': 'soft morning light, dawn atmosphere, gentle illumination',
      'golden hour': 'golden hour lighting, warm sunset glow, magical light',
      'dramatic mood': 'dramatic atmosphere, strong contrast, powerful emotion',
      'serene atmosphere': 'peaceful serene mood, calm tranquility, zen-like quality',
      'vibrant energy': 'vibrant dynamic energy, bold and lively, full of life',
      'alternative style': 'fresh interpretation, unique perspective',
      'creative interpretation': 'innovative creative approach, artistic freedom',
      'minimalist version': 'stripped down to essentials, pure simplicity',
      'detailed version': 'richly detailed, intricate complexity'
    }
    
    const variation = variationModifiers[item.variation] || ''
    
    return `${subject}, ${style}, ${variation}, ${complexityDesc}, ${paletteDesc} color palette`
  }

  private getComplexityDescriptor(complexity: number): string {
    if (complexity < 0.3) return 'extremely minimal, essential elements only'
    if (complexity < 0.5) return 'simple clean composition, balanced simplicity'
    if (complexity < 0.7) return 'moderate detail level, balanced complexity'
    if (complexity < 0.9) return 'richly detailed composition, intricate elements'
    return 'highly complex and intricate, maximum detail'
  }

  private getFrameStyle(style: string): string {
    const frameStyles: Record<string, string> = {
      'minimalist': 'thin black metal',
      'abstract': 'bold white',
      'watercolor': 'natural wood',
      'geometric': 'sleek aluminum',
      'botanical': 'ornate gold',
      'photographic': 'classic black',
      'impressionist': 'vintage gold',
      'modern': 'floating acrylic',
      'traditional': 'carved wood'
    }
    
    return frameStyles[style] || 'elegant wooden'
  }
}

/**
 * Generate diverse artworks based on full preference profile
 */
export async function generateDiversifiedArtworks(
  preferences: ExtendedPreferences,
  count: number = 12
): Promise<GeneratedArtwork[]> {
  const generator = new DiversifiedArtGenerator(preferences)
  const plan = generator.createGenerationPlan(count)
  const prompts = generator.generateDiversePrompts(plan)
  
  // Return prompts with metadata (actual generation would happen in fal.ts)
  return prompts.map((prompt, index) => ({
    imageUrl: '', // Will be filled by FAL API
    cleanImageUrl: '', // Will be filled by FAL API
    prompt: prompt.framed,
    cleanPrompt: prompt.clean,
    orderIndex: index,
    variationType: prompt.type,
    description: prompt.description
  }))
}