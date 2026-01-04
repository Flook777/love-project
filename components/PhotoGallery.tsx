'use client'

import { useState, useEffect } from 'react'

export default function PhotoGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [images.length])

  if (!images || images.length === 0) return null

  return (
    <div className="mt-8 w-full max-w-sm mx-auto">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-4 border-white/50">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Memory ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out
              ${index === currentIndex ? 'opacity-100' : 'opacity-0'}
            `}
          />
        ))}
        
        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-gray-500 text-xs mt-2 font-medium">
        ความทรงจำของเรา ({currentIndex + 1}/{images.length})
      </p>
    </div>
  )
}