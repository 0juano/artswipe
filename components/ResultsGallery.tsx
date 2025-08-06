'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GeneratedArtwork } from '@/types'

interface ExtendedArtwork extends GeneratedArtwork {
  variationType?: string
  description?: string
}

interface ResultsGalleryProps {
  explanation: string
  artworks: ExtendedArtwork[]
  onStartOver: () => void
}

export default function ResultsGallery({ explanation, artworks, onStartOver }: ResultsGalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<ExtendedArtwork | null>(null)
  const [viewMode, setViewMode] = useState<Record<string, 'framed' | 'clean'>>({})

  const handleDownload = async (artwork: ExtendedArtwork, index?: number) => {
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

  // Group artworks by type
  const primaryArtworks = artworks.filter(a => a.variationType === 'primary')
  const secondaryArtworks = artworks.filter(a => a.variationType === 'secondary')
  const creativeArtworks = artworks.filter(a => a.variationType === 'creative' || a.variationType === 'variation')

  const renderArtworkCard = (artwork: ExtendedArtwork, index: number, keyPrefix: string) => (
    <div
      key={artwork.id || `${keyPrefix}-${index}`}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
    >
      <button
        onClick={() => setSelectedArtwork(artwork)}
        className="w-full aspect-square relative group"
      >
        <Image
          src={viewMode[artwork.id || `${keyPrefix}-${index}`] === 'clean' && artwork.cleanImageUrl ? artwork.cleanImageUrl : artwork.imageUrl}
          alt={`Generated artwork ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
      </button>
      
      <div className="p-4">
        {artwork.description && (
          <p className="text-xs text-gray-500 mb-2">{artwork.description}</p>
        )}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => handleDownload(artwork, index)}
            className="flex-1 bg-blue-500 text-white py-1.5 text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            Download
          </button>
          {artwork.cleanImageUrl && (
            <button
              onClick={() => {
                const key = artwork.id || `${keyPrefix}-${index}`
                setViewMode(prev => ({
                  ...prev,
                  [key]: prev[key] === 'clean' ? 'framed' : 'clean'
                }))
              }}
              className="flex-1 bg-gray-500 text-white py-1.5 text-sm rounded-lg hover:bg-gray-600 transition-colors"
            >
              {viewMode[artwork.id || `${keyPrefix}-${index}`] === 'clean' ? 'Framed' : 'Clean'}
            </button>
          )}
        </div>
        
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
            Prompt details
          </summary>
          <p className="mt-1 text-gray-500 text-xs leading-relaxed">
            {artwork.prompt}
          </p>
        </details>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Art DNA Explanation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Art DNA</h1>
          <p className="text-lg text-gray-700 leading-relaxed">{explanation}</p>
        </div>

        {/* Generated Artworks - Grouped by type */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Personalized Collection</h2>
          
          {/* Primary Preferences */}
          {primaryArtworks.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Your Primary Style</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {primaryArtworks.map((artwork, index) => 
                  renderArtworkCard(artwork, index, 'primary')
                )}
              </div>
            </div>
          )}
          
          {/* Secondary Preferences */}
          {secondaryArtworks.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Also Based on Your Preferences</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {secondaryArtworks.map((artwork, index) => 
                  renderArtworkCard(artwork, index, 'secondary')
                )}
              </div>
            </div>
          )}
          
          {/* Creative Variations */}
          {creativeArtworks.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Creative Explorations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {creativeArtworks.map((artwork, index) => 
                  renderArtworkCard(artwork, index, 'creative')
                )}
              </div>
            </div>
          )}
          
          {/* Fallback for old format without types */}
          {primaryArtworks.length === 0 && secondaryArtworks.length === 0 && creativeArtworks.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworks.map((artwork, index) => 
                renderArtworkCard(artwork, index, 'artwork')
              )}
            </div>
          )}
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
            Download All 12 High-Res ($9.99)
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