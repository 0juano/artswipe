'use client'

import { useState } from 'react'
import IntakeForm from '@/components/IntakeForm'
import ImageComparison from '@/components/ImageComparison'
import ResultsGallery from '@/components/ResultsGallery'
import ProgressBar from '@/components/ProgressBar'
import LoadingScreen from '@/components/LoadingScreen'
import SkeletonLoader from '@/components/SkeletonLoader'
import { SessionData, TestImagePair, GeneratedArtwork, UserPreferences } from '@/types'

export default function ArtSwipeFlow() {
  const [stage, setStage] = useState<'intake' | 'discovery' | 'generating' | 'results'>('intake')
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [currentPair, setCurrentPair] = useState<TestImagePair | null>(null)
  const [interactionCount, setInteractionCount] = useState(0)
  const [explanation, setExplanation] = useState('')
  const [generatedArt, setGeneratedArt] = useState<GeneratedArtwork[]>([])
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [algorithmVersion, setAlgorithmVersion] = useState<string>('basic')
  const [choiceStartTime, setChoiceStartTime] = useState<number>(Date.now())
  const [isLoadingNext, setIsLoadingNext] = useState(false)

  const handleIntakeComplete = async (data: { orientation: string; palette: string }) => {
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
      setAlgorithmVersion(result.algorithmVersion)
      setChoiceStartTime(Date.now())
      setStage('discovery')
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start session. Please check your API configuration.')
    }
  }

  const handleChoice = async (choice: 'left' | 'right') => {
    if (!sessionData || !currentPair || isLoadingNext) return

    try {
      setIsLoadingNext(true)
      
      // Calculate response time for this choice
      const responseTime = Date.now() - choiceStartTime
      
      // Use appropriate endpoint based on algorithm version
      const endpoint = algorithmVersion === 'advanced' || algorithmVersion === 'experimental' 
        ? '/api/choice-v2' 
        : '/api/choice'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.id,
          leftId: currentPair.left.id,
          rightId: currentPair.right.id,
          choice,
          choiceNumber: interactionCount + 1,
          responseTime,
        }),
      })

      const result = await response.json()
      
      if (result.complete) {
        setPreferences(result.preferences)
        setStage('generating')
        await generateResults(result.preferences)
      } else {
        setCurrentPair(result.nextPair)
        setInteractionCount(interactionCount + 1)
        setChoiceStartTime(Date.now())  // Reset timer for next choice
      }
      
      setIsLoadingNext(false)
    } catch (error) {
      console.error('Error submitting choice:', error)
      setIsLoadingNext(false)
      alert('Failed to submit choice. Please try again.')
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
          {algorithmVersion !== 'basic' && (
            <div className="mb-2 text-center">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Using {algorithmVersion} algorithm
              </span>
            </div>
          )}
          <ProgressBar current={interactionCount} total={20} />
          {isLoadingNext ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <SkeletonLoader type="image" />
              <SkeletonLoader type="image" />
            </div>
          ) : (
            <ImageComparison
              leftImage={currentPair.left}
              rightImage={currentPair.right}
              onChoice={handleChoice}
            />
          )}
        </div>
      </div>
    )
  }

  if (stage === 'generating') {
    return <LoadingScreen />
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