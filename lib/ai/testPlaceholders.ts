/**
 * Generate placeholder images for testing without using FAL.ai credits
 */

export function generateTestPlaceholders(count: number = 12) {
  const artworks = []
  
  // Different placeholder styles for variety
  const styles = [
    { bg: '4A90E2', fg: 'FFFFFF', label: 'Abstract' },
    { bg: 'E24A4A', fg: 'FFFFFF', label: 'Modern' },
    { bg: '4AE290', fg: 'FFFFFF', label: 'Nature' },
    { bg: 'E2904A', fg: 'FFFFFF', label: 'Warm' },
    { bg: '904AE2', fg: 'FFFFFF', label: 'Cool' },
    { bg: 'E2E24A', fg: '333333', label: 'Bright' },
  ]
  
  for (let i = 0; i < count; i++) {
    const style = styles[i % styles.length]
    const type = i < 5 ? 'primary' : i < 9 ? 'secondary' : 'creative'
    
    artworks.push({
      imageUrl: `https://via.placeholder.com/800x800/${style.bg}/${style.fg}?text=Artwork+${i+1}`,
      cleanImageUrl: `https://via.placeholder.com/800x800/${style.bg}/${style.fg}?text=Clean+${i+1}`,
      prompt: `Test artwork ${i+1} - ${style.label} style`,
      orderIndex: i,
      variationType: type,
      description: `${style.label} style artwork - ${type} preference`
    })
  }
  
  return artworks
}