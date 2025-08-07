'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { generateBlurPlaceholder, getResponsiveSizes } from '@/lib/utils/imageOptimization'

interface OptimizedImageProps {
  src: string
  alt: string
  type?: 'comparison' | 'gallery' | 'result'
  priority?: boolean
  className?: string
  onClick?: () => void
  quality?: number
}

export default function OptimizedImage({
  src,
  alt,
  type = 'gallery',
  priority = false,
  className = '',
  onClick,
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [blurDataURL] = useState(() => generateBlurPlaceholder())

  // Preload next image when this one loads
  useEffect(() => {
    if (!isLoading && !error) {
      // Could emit event for parent to preload next images
      const event = new CustomEvent('imageLoaded', { detail: { src } })
      window.dispatchEvent(event)
    }
  }, [isLoading, error, src])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <div className="text-center p-4">
          <svg 
            className="w-12 h-12 mx-auto mb-2 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-sm text-gray-500">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      <Image
        src={src}
        alt={alt}
        fill
        className={`
          object-cover transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        sizes={getResponsiveSizes(type)}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError(true)
        }}
      />
      
      {/* Blur placeholder background */}
      {isLoading && (
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Loading spinner overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}