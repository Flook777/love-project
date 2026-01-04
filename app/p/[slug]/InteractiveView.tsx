'use client'

import { useState, useRef, useEffect } from 'react'
import { UploadButton } from '@/components/UploadButton' // ไม่ได้ใช้ ลบออกได้

export default function InteractiveView({ data }: { data: any }) {
  const [isOpened, setIsOpened] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // วันครบรอบ (ถ้าไม่มีใน DB ให้ใช้วันที่สร้างโปรเจกต์แทนไปก่อน)
  const startDate = data.anniversaryDate ? new Date(data.anniversaryDate) : new Date()
  const today = new Date()
  // คำนวณจำนวนวัน (Diff Time)
  const daysTogether = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24))

  const handleOpen = () => {
    setIsOpened(true)
    // สั่งเล่นเพลงหลังจากมีการกด (User Interaction)
    if (audioRef.current) {
      audioRef.current.volume = 0.5 // ลดเสียงหน่อยจะได้ไม่ตกใจ
      audioRef.current.play().catch(e => console.log("Audio play error:", e))
    }
  }

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    // เช็คคำตอบ (ถ้ามีการตั้งคำถามไว้)
    if (data.quizAnswer && passcode.trim() !== data.quizAnswer) {
      alert("คำตอบยังไม่ถูกนะ ลองใหม่เข๊ะ!")
      return
    }
    setIsUnlocked(true)
  }

  // Animation หัวใจ
  const hearts = Array.from({ length: 20 }).map((_, i) => ({
    left: `${Math.floor(Math.random() * 100)}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${10 + Math.random() * 10}s`,
    icon: ['❤️', '💖', '✨', '🌹', '💑'][Math.floor(Math.random() * 5)]
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-indigo-100 flex items-center justify-center p-4 overflow-hidden relative font-sans">
      
      {/* --- Audio Element (Hidden) --- */}
      <audio ref={audioRef} loop>
        <source src={data.bgMusicUrl || "https://cdn.pixabay.com/download/audio/2022/10/25/audio_24921c54a5.mp3?filename=romantic-piano-1234.mp3"} type="audio/mpeg" />
      </audio>

      {/* --- Scene 1: กล่องของขวัญ (Click to Start) --- */}
      {!isOpened && (
        <div className="z-50 text-center animate-bounce cursor-pointer" onClick={handleOpen}>
          <div className="text-8xl drop-shadow-2xl hover:scale-110 transition duration-300">🎁</div>
          <p className="mt-4 text-pink-600 font-bold text-xl bg-white/80 px-6 py-2 rounded-full shadow-lg">
            แตะเพื่อเปิดของขวัญ
          </p>
          <p className="text-xs text-gray-400 mt-2">(เปิดเสียงด้วยนะ)</p>
        </div>
      )}

      {/* --- Scene 2: Quiz (ถ้ามี) --- */}
      {isOpened && data.quizQuestion && !isUnlocked && (
        <div className="z-40 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
          <span className="text-4xl">🔐</span>
          <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">ตอบคำถามก่อนนะ</h2>
          <p className="text-gray-600 mb-6">{data.quizQuestion}</p>
          <form onSubmit={checkAnswer} className="space-y-4">
            <input 
              type="text" 
              className="w-full px-4 py-2 text-center border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none text-black"
              placeholder="คำตอบคือ..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoFocus
            />
            <button type="submit" className="w-full bg-pink-500 text-white font-bold py-2 rounded-xl hover:bg-pink-600 transition">
              ปลดล็อค ❤️
            </button>
          </form>
        </div>
      )}

      {/* --- Scene 3: เนื้อหาหลัก (Main Content) --- */}
      {isOpened && (!data.quizQuestion || isUnlocked) && (
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          
          {/* Day Counter Badge */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
             <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap">
                <span>🗓️</span>
                <span className="font-bold">คบกันมา {daysTogether} วันแล้วนะ</span>
             </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/80">
            {/* Image */}
            <div className="relative h-96 group">
              {data.imageUrl ? (
                <img 
                  src={data.imageUrl} 
                  alt="Us" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full bg-pink-100 flex items-center justify-center text-pink-300 text-6xl">🖼️</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h1 className="text-3xl font-bold font-serif leading-tight text-shadow">
                  {data.title || "Happy Anniversary"}
                </h1>
              </div>
            </div>

            {/* Message */}
            <div className="p-8 pb-12 text-center">
              <p className="text-gray-800 text-lg leading-loose font-medium whitespace-pre-line">
                {data.message || "ขอบคุณสำหรับทุกอย่างนะ..."}
              </p>
              <div className="mt-8 text-pink-500 text-2xl animate-pulse">💖</div>
            </div>
          </div>
        </div>
      )}

      {/* Background Hearts */}
      <div className="absolute inset-0 pointer-events-none">
        {hearts.map((h, i) => (
          <div 
            key={i} 
            className="absolute opacity-50 animate-float"
            style={{ 
              left: h.left, 
              animationDelay: h.delay, 
              animationDuration: h.duration,
              bottom: '-10%'
            }}
          >
            {h.icon}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}