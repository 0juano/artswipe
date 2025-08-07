'use client'

import { useEffect } from 'react'
import OptimizedImage from './OptimizedImage'
import { TestImage } from '@/types'
import { preloadImages } from '@/lib/utils/imageOptimization'

interface ImageComparisonProps {
  leftImage: TestImage
  rightImage: TestImage
  onChoice: (choice: 'left' | 'right') => void
}

export default function ImageComparison({ leftImage, rightImage, onChoice }: ImageComparisonProps) {
  // Preload potential next images
  useEffect(() => {
    // Could receive next pair URLs to preload
    const handleImageLoaded = () => {
      // Image loaded successfully, could trigger preload of next pair
    }
    
    window.addEventListener('imageLoaded', handleImageLoaded)
    return () => window.removeEventListener('imageLoaded', handleImageLoaded)
  }, [])
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Which speaks to you more?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          onClick={() => onChoice('left')}
          className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 bg-gray-100"
        >
          <div className="aspect-square relative">
            {leftImage.imageUrl ? (
              <OptimizedImage
                src={leftImage.imageUrl}
                alt="Left artwork option"
                type="comparison"
                className="w-full h-full"
                priority={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg font-medium">Placeholder Image</p>
                  <p className="text-sm">{leftImage.style || 'Style A'}</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-gray-900 font-medium">Choose This</span>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => onChoice('right')}
          className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 bg-gray-100"
        >
          <div className="aspect-square relative">
            {rightImage.imageUrl ? (
              <OptimizedImage
                src={rightImage.imageUrl}
                alt="Right artwork option"
                type="comparison"
                className="w-full h-full"
                priority={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg font-medium">Placeholder Image</p>
                  <p className="text-sm">{rightImage.style || 'Style B'}</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-gray-900 font-medium">Choose This</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500">Tap or click the image you prefer</p>
      </div>
    </div>
  )
}