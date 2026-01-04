'use client'

import { useState, useEffect } from 'react'

export default function Typewriter({ text, speed = 50 }: { text: string, speed?: number }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // ถ้าข้อความเปลี่ยน ให้เริ่มพิมพ์ใหม่
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeoutId)
    }
  }, [currentIndex, text, speed])

  return (
    <span className="whitespace-pre-line">
      {displayedText}
      {/* Blinking Cursor */}
      <span className="animate-pulse">|</span>
    </span>
  )
}