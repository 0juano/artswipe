/**
 * Image optimization utilities for better performance
 */

/**
 * Generate a blur data URL for image placeholders
 * This creates a tiny base64 encoded image for instant loading
 */
export function generateBlurPlaceholder(width: number = 4, height: number = 4): string {
  // Simple gray placeholder - in production, generate from actual image
  const canvas = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#e5e7eb"/>
  </svg>`
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`
}

/**
 * Get optimized image loader configuration
 */
export function getImageLoaderConfig(src: string) {
  // Add image optimization parameters
  const params = new URLSearchParams()
  
  // FAL.media URLs already include some optimization
  if (src.includes('fal.media')) {
    // FAL images are already optimized, just return
    return src
  }
  
  // For other sources, add optimization params
  params.set('auto', 'format')
  params.set('fit', 'max')
  params.set('w', '1024')
  
  const separator = src.includes('?') ? '&' : '?'
  return `${src}${separator}${params.toString()}`
}

/**
 * Preload next images while user is thinking
 */
export function preloadImages(urls: string[]) {
  if (typeof window === 'undefined') return
  
  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

/**
 * Get responsive image sizes for different breakpoints
 */
export function getResponsiveSizes(type: 'comparison' | 'gallery' | 'result') {
  switch (type) {
    case 'comparison':
      return '(max-width: 768px) 100vw, 50vw'
    case 'gallery':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    case 'result':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
    default:
      return '100vw'
  }
}

/**
 * Calculate priority for image loading
 */
export function shouldPrioritizeImage(index: number, viewport: 'mobile' | 'desktop') {
  // Prioritize first 2 images on mobile, first 4 on desktop
  const threshold = viewport === 'mobile' ? 2 : 4
  return index < threshold
}