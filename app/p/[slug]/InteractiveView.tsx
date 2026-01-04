'use client'

import { useState, useRef, useEffect } from 'react'

// ฟังก์ชันช่วยดึง YouTube ID จากลิงก์
const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function InteractiveView({ data }: { data: any }) {
  const [isOpened, setIsOpened] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // ดึงค่า Config (ถ้าไม่มีให้ใช้ค่า Default)
  const themeColor = data.themeColor || "#ec4899"
  const fontStyle = data.fontStyle || "font-sans"
  
  // เช็คว่าเป็น YouTube หรือ MP3
  const youtubeId = getYouTubeId(data.bgMusicUrl)

  // วันครบรอบ
  const daysTogether = data.anniversaryDate 
    ? Math.floor((new Date().getTime() - new Date(data.anniversaryDate).getTime()) / (1000 * 3600 * 24)) 
    : 0

  const handleOpen = () => {
    setIsOpened(true)
    
    // ถ้าเป็น MP3 ให้เล่นผ่าน <audio> (YouTube จะเล่นเองผ่าน autoplay ใน iframe)
    if (!youtubeId && audioRef.current) {
      audioRef.current.volume = 0.5
      audioRef.current.play().catch(e => console.log("Audio play error:", e))
    }
  }

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (data.quizAnswer && passcode.trim() !== data.quizAnswer) {
      alert("คำตอบยังไม่ถูกนะ ลองใหม่เข๊ะ!")
      return
    }
    setIsUnlocked(true)
  }

  // สร้างหัวใจลอย background
  const hearts = Array.from({ length: 20 }).map((_, i) => ({
    left: `${Math.floor(Math.random() * 100)}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${10 + Math.random() * 10}s`,
    icon: ['❤️', '💖', '✨', '🌹'][Math.floor(Math.random() * 4)]
  }))

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 overflow-hidden relative ${fontStyle}`}
      style={{ 
        background: `linear-gradient(to bottom right, ${themeColor}15, #ffffff, ${themeColor}30)` 
      }}
    >
      
      {/* --- Audio Player System --- */}
      {isOpened && (
        <div className="absolute top-4 right-4 z-50">
          {youtubeId ? (
            // กรณีเป็น YouTube (ซ่อน iframe ไว้เล็กๆ แต่ให้เล่นเสียง)
            <div className="opacity-80 hover:opacity-100 transition shadow-lg rounded-xl overflow-hidden w-32 h-20 md:w-48 md:h-28 bg-black">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&controls=0`} 
                title="Music" 
                allow="autoplay; encrypted-media" 
                allowFullScreen
                style={{ pointerEvents: 'none' }} // ป้องกันการกดหยุด
              />
            </div>
          ) : data.bgMusicUrl && (
            // กรณีเป็น MP3
             <audio ref={audioRef} loop controls className="h-10 w-32 rounded-full shadow-lg">
                <source src={data.bgMusicUrl} type="audio/mpeg" />
             </audio>
          )}
        </div>
      )}

      {/* --- Scene 1: กล่องของขวัญ (Click to Start) --- */}
      {!isOpened && (
        <div className="z-50 text-center animate-bounce cursor-pointer relative" onClick={handleOpen}>
          <div className="text-8xl drop-shadow-2xl transition duration-300 transform hover:scale-110">🎁</div>
          <div 
            className="mt-6 font-bold text-xl px-8 py-3 rounded-full shadow-xl text-white inline-block relative overflow-hidden"
            style={{ backgroundColor: themeColor }}
          >
            <span className="relative z-10">แตะเพื่อเปิดของขวัญ</span>
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-500 mt-3 font-medium">( เปิดเสียงด้วยนะ 🔊 )</p>
        </div>
      )}

      {/* --- Scene 2: Quiz --- */}
      {isOpened && data.quizQuestion && !isUnlocked && (
        <div className="z-40 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-fade-in-up border-2" style={{ borderColor: `${themeColor}40` }}>
          <span className="text-4xl">🔐</span>
          <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">ตอบคำถามก่อนนะ</h2>
          <p className="text-gray-600 mb-6 font-medium">{data.quizQuestion}</p>
          <form onSubmit={checkAnswer} className="space-y-4">
            <input 
              type="text" 
              className="w-full px-4 py-3 text-center border-2 rounded-xl outline-none text-black transition focus:scale-105"
              style={{ borderColor: `${themeColor}60` }}
              placeholder="คำตอบคือ..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoFocus
            />
            <button 
              type="submit" 
              className="w-full text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              ปลดล็อค ❤️
            </button>
          </form>
        </div>
      )}

      {/* --- Scene 3: เนื้อหาหลัก (Main Content) --- */}
      {isOpened && (!data.quizQuestion || isUnlocked) && (
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          
          {/* Day Counter Badge */}
          {data.anniversaryDate && (
             <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20 w-full text-center">
               <div 
                 className="inline-flex items-center gap-2 text-white px-6 py-2 rounded-full shadow-xl text-sm font-bold animate-bounce"
                 style={{ backgroundColor: themeColor }}
               >
                  <span>🗓️</span>
                  <span>คบกันมา {daysTogether} วันแล้วนะ</span>
               </div>
             </div>
          )}

          {/* Main Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/80">
            {/* Image */}
            <div className="relative h-96 group">
              {data.imageUrl ? (
                <img 
                  src={data.imageUrl} 
                  alt="Us" 
                  className="w-full h-full object-cover transition duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="h-full bg-gray-100 flex items-center justify-center text-4xl">🖼️</div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h1 className="text-3xl font-bold leading-tight drop-shadow-lg">
                  {data.title || "Happy Anniversary"}
                </h1>
              </div>
            </div>

            {/* Message */}
            <div className="p-8 pb-12 text-center relative">
               <div 
                 className="absolute -top-8 right-8 bg-white p-3 rounded-full shadow-lg"
                 style={{ color: themeColor }}
               >
                 <span className="text-3xl">💌</span>
               </div>

              <p className="text-gray-800 text-lg leading-loose font-medium whitespace-pre-line">
                {data.message || "ขอบคุณสำหรับทุกอย่างนะ..."}
              </p>
              
              <div className="mt-8 text-2xl animate-pulse" style={{ color: themeColor }}>💖</div>
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
              bottom: '-10%',
              color: themeColor
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
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}