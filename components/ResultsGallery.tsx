'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GeneratedArtwork } from '@/types'

interface ResultsGalleryProps {
  explanation: string
  artworks: GeneratedArtwork[]
  onStartOver: () => void
}

export default function ResultsGallery({ explanation, artworks, onStartOver }: ResultsGalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<GeneratedArtwork | null>(null)
  const [viewMode, setViewMode] = useState<Record<string, 'framed' | 'clean'>>({})

  const handleDownload = async (artwork: GeneratedArtwork, index?: number) => {
    try {
      const key = artwork.id || index?.toString() || '0'
      const imageUrl = viewMode[key] === 'clean' && artwork.cleanImageUrl ? artwork.cleanImageUrl : artwork.imageUrl
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `artswipe-${viewMode[key] === 'clean' ? 'clean' : 'framed'}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Art DNA Explanation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Art DNA</h1>
          <p className="text-lg text-gray-700 leading-relaxed">{explanation}</p>
        </div>

        {/* Generated Artworks */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Personalized Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {artworks.slice(0, 4).map((artwork, index) => (
              <div
                key={artwork.id || index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <button
                  onClick={() => setSelectedArtwork(artwork)}
                  className="w-full aspect-square relative group"
                >
                  <Image
                    src={viewMode[artwork.id || index.toString()] === 'clean' && artwork.cleanImageUrl ? artwork.cleanImageUrl : artwork.imageUrl}
                    alt={`Generated artwork ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
                
                <div className="p-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleDownload(artwork, index)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Download
                    </button>
                    {artwork.cleanImageUrl && (
                      <button
                        onClick={() => {
                          const key = artwork.id || index.toString()
                          setViewMode(prev => ({
                            ...prev,
                            [key]: prev[key] === 'clean' ? 'framed' : 'clean'
                          }))
                        }}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {viewMode[artwork.id || index.toString()] === 'clean' ? 'View Framed' : 'View Clean'}
                      </button>
                    )}
                  </div>
                  
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                      How we made this
                    </summary>
                    <p className="mt-2 text-gray-500 text-xs leading-relaxed">
                      {artwork.prompt}
                    </p>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onStartOver}
            className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
          <button
            className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            Get All High-Res ($4.99)
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArtwork(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={viewMode[selectedArtwork.id || '0'] === 'clean' && selectedArtwork.cleanImageUrl ? selectedArtwork.cleanImageUrl : selectedArtwork.imageUrl}
              alt="Selected artwork"
              width={1024}
              height={1024}
              className="object-contain"
            />
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}