import { UserPreferences } from '@/types'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export async function generateTasteExplanation(
  preferences: UserPreferences,
  choicesMade: number
): Promise<string> {
  const complexityDescription = getComplexityDescription(preferences.complexity)
  
  const prompt = `Based on these art preferences discovered through ${choicesMade} user choices:
- Preferred style: ${preferences.style}
- Preferred subjects: ${preferences.subjects.join(', ')}
- Complexity level: ${preferences.complexity.toFixed(2)} (0=minimal, 1=complex)
- Color palette: ${preferences.palette.replace('-', ' ')}
- Orientation: ${preferences.orientation || 'square'}

The user consistently chose ${preferences.style} style images over others, showed preference for ${preferences.subjects[0]} subjects, and selected ${complexityDescription} compositions.

Write a 2-3 sentence friendly explanation of their art taste that:
1. Sounds personal and insightful
2. Uses accessible language (no art jargon)
3. Makes them feel understood
4. Mentions specific combinations they'd love

Format: Start with "Your Art DNA:" then the explanation. Be warm and conversational.`

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_SITE_NAME || 'ArtSwipe',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an art taste expert who helps people understand their aesthetic preferences in warm, accessible language.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error generating taste explanation:', error)
    // Fallback explanation
    return `Your Art DNA: You're drawn to ${preferences.style} art featuring ${preferences.subjects[0]} with ${complexityDescription} compositions. Your preference for ${preferences.palette.replace('-', ' ')} colors creates a cohesive aesthetic. The art that speaks to you balances simplicity with just enough visual interest to keep things engaging.`
  }
}

function getComplexityDescription(complexity: number): string {
  if (complexity < 0.3) return 'very minimal'
  if (complexity < 0.5) return 'simple and clean'
  if (complexity < 0.7) return 'balanced'
  if (complexity < 0.9) return 'richly detailed'
  return 'highly complex'
}