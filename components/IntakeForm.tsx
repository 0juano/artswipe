'use client'

import { useState } from 'react'

interface IntakeFormProps {
  onComplete: (data: { orientation: string; palette: string; size: string }) => void
}

const ORIENTATIONS = [
  { value: 'vertical', label: 'Vertical', icon: '📐', description: 'Portrait (3:4)' },
  { value: 'landscape', label: 'Landscape', icon: '🖼️', description: 'Wide (4:3)' },
  { value: 'square', label: 'Square', icon: '⬜', description: '1:1 ratio' },
]

const PALETTES = [
  { value: 'earth-tones', label: 'Earth Tones', colors: ['#8B7355', '#D2B48C', '#A0826D'] },
  { value: 'ocean-blues', label: 'Ocean Blues', colors: ['#006994', '#4A90E2', '#87CEEB'] },
  { value: 'warm-sunset', label: 'Warm Sunset', colors: ['#FF6B6B', '#FFA500', '#FFD700'] },
  { value: 'black-white', label: 'Black & White', colors: ['#000000', '#808080', '#FFFFFF'] },
  { value: 'pastels', label: 'Pastels', colors: ['#FFE5E5', '#E5F3FF', '#F0FFE5'] },
  { value: 'jewel-tones', label: 'Jewel Tones', colors: ['#9B59B6', '#E74C3C', '#3498DB'] },
]

const SIZES = [
  { value: 'small', label: 'Small', dimensions: '20x25 cm' },
  { value: 'medium', label: 'Medium', dimensions: '40x50 cm' },
  { value: 'large', label: 'Large', dimensions: '60x90 cm' },
  { value: 'extra-large', label: 'Extra Large', dimensions: '75x100 cm' },
]

export default function IntakeForm({ onComplete }: IntakeFormProps) {
  const [step, setStep] = useState(1)
  const [orientation, setOrientation] = useState('')
  const [palette, setPalette] = useState('')
  const [size, setSize] = useState('')

  const handleNext = () => {
    if (step === 1 && orientation) setStep(2)
    else if (step === 2 && palette) setStep(3)
    else if (step === 3 && size) {
      onComplete({ orientation, palette, size })
    }
  }

  const isNextDisabled = 
    (step === 1 && !orientation) ||
    (step === 2 && !palette) ||
    (step === 3 && !size)

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
                s <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {step === 1 && "What orientation do you prefer?"}
          {step === 2 && "What colors do you prefer?"}
          {step === 3 && "What size works best?"}
        </h2>
      </div>

      <div className="space-y-4">
        {step === 1 && (
          <div className="grid grid-cols-3 gap-4">
            {ORIENTATIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setOrientation(o.value)}
                className={`p-6 rounded-xl border-2 transition-all text-center ${
                  orientation === o.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-3xl mb-2">{o.icon}</div>
                <div className="font-medium text-gray-900">{o.label}</div>
                <div className="text-sm text-gray-500 mt-1">{o.description}</div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
            {PALETTES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPalette(p.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  palette === p.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex justify-center mb-2 space-x-1">
                  {p.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="font-medium text-gray-900">{p.label}</div>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-4">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  size === s.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="font-medium text-gray-900">{s.label}</div>
                <div className="text-sm text-gray-500">{s.dimensions}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className={`ml-auto px-8 py-3 rounded-xl font-medium transition-all ${
            isNextDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {step === 3 ? 'Start Discovery' : 'Next'}
        </button>
      </div>
    </div>
  )
}