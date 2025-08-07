export interface TestImage {
  id: number
  imageUrl: string
  style?: string | null
  subject?: string | null
  palette?: string | null
  complexity?: string | null
  testCategory: string
  promptUsed?: string | null
  createdAt?: Date
}

export interface TestImagePair {
  left: TestImage
  right: TestImage
}

export interface SessionData {
  id: string
  email?: string
  statedOrientation: string
  statedPalette: string
  statedSize: string
  createdAt: Date
}

export interface Choice {
  id: number
  sessionId: string
  shownLeftId: number
  shownRightId: number
  choice: 'left' | 'right'
  choiceNumber: number
  responseTimeMs: number
  createdAt: Date
}

export interface GeneratedArtwork {
  id?: string
  sessionId?: string
  imageUrl: string
  cleanImageUrl?: string
  prompt: string
  orderIndex?: number
  variationType?: string
  description?: string
}

export interface UserPreferences {
  style: string
  subjects: string[]
  complexity: number
  palette: string
  orientation?: string
}

export interface UserProfile {
  sessionId: string
  preferredStyle: string
  preferredComplexity: number
  preferredSubjects: string[]
  preferredPalette: string
  explanationText?: string
  confidenceScore?: number
}