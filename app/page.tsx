'use client'

import { useState } from 'react'
import IntakeForm from '@/components/IntakeForm'
import ImageComparison from '@/components/ImageComparison'
import ResultsGallery from '@/components/ResultsGallery'
import ProgressBar from '@/components/ProgressBar'
import { SessionData, TestImagePair, GeneratedArtwork, UserPreferences } from '@/types'

export default function ArtSwipeFlow() {
  const [stage, setStage] = useState<'intake' | 'discovery' | 'results'>('intake')
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [currentPair, setCurrentPair] = useState<TestImagePair | null>(null)
  const [interactionCount, setInteractionCount] = useState(0)
  const [explanation, setExplanation] = useState('')
  const [generatedArt, setGeneratedArt] = useState<GeneratedArtwork[]>([])
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)

  const handleIntakeComplete = async (data: { room: string; palette: string; size: string }) => {
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setSessionData(result.session)
      setCurrentPair(result.firstPair)
      setStage('discovery')
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start session. Please check your API configuration.')
    }
  }

  const handleChoice = async (choice: 'left' | 'right') => {
    if (!sessionData || !currentPair) return

    try {
      const startTime = Date.now()
      const response = await fetch('/api/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.id,
          leftId: currentPair.left.id,
          rightId: currentPair.right.id,
          choice,
          choiceNumber: interactionCount + 1,
          responseTime: Date.now() - startTime,
        }),
      })

      const result = await response.json()
      
      if (result.complete) {
        setPreferences(result.preferences)
        await generateResults(result.preferences)
      } else {
        setCurrentPair(result.nextPair)
        setInteractionCount(interactionCount + 1)
      }
    } catch (error) {
      console.error('Error submitting choice:', error)
    }
  }

  const generateResults = async (prefs: UserPreferences) => {
    if (!sessionData) return

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.id,
          preferences: prefs,
        }),
      })

      const result = await response.json()
      setExplanation(result.explanation)
      setGeneratedArt(result.artworks)
      setStage('results')
    } catch (error) {
      console.error('Error generating results:', error)
    }
  }

  const startOver = () => {
    setStage('intake')
    setSessionData(null)
    setCurrentPair(null)
    setInteractionCount(0)
    setExplanation('')
    setGeneratedArt([])
    setPreferences(null)
  }

  if (stage === 'intake') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <IntakeForm onComplete={handleIntakeComplete} />
      </div>
    )
  }

  if (stage === 'discovery' && currentPair) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl">
          <ProgressBar current={interactionCount} total={20} />
          <ImageComparison
            leftImage={currentPair.left}
            rightImage={currentPair.right}
            onChoice={handleChoice}
          />
        </div>
      </div>
    )
  }

  if (stage === 'results') {
    return (
      <ResultsGallery
        explanation={explanation}
        artworks={generatedArt}
        onStartOver={startOver}
      />
    )
  }

  return null
}