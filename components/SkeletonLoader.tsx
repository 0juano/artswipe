export default function SkeletonLoader({ 
  type = 'card',
  count = 1 
}: { 
  type?: 'card' | 'image' | 'text' | 'button'
  count?: number 
}) {
  const getSkeletonClass = () => {
    switch (type) {
      case 'card':
        return 'h-64 rounded-xl'
      case 'image':
        return 'aspect-square rounded-lg'
      case 'text':
        return 'h-4 rounded'
      case 'button':
        return 'h-12 w-32 rounded-lg'
      default:
        return 'h-32 rounded'
    }
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`
            ${getSkeletonClass()}
            bg-gray-200 animate-pulse
            relative overflow-hidden
          `}
        >
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 -translate-x-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
          />
        </div>
      ))}
    </>
  )
}