'use client'

import { useState, useRef, useEffect } from 'react'
import PhotoGallery from '@/components/PhotoGallery'

// --- 1. Inline Typewriter Component ---
function TypewriterEffect({ text, speed = 50 }: { text: string, speed?: number }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // รีเซ็ตเมื่อข้อความเปลี่ยน
    setDisplayedText("")
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(currentIndex))
        setCurrentIndex((prev) => prev + 1)
      }, speed)
      return () => clearTimeout(timeoutId)
    }
  }, [currentIndex, text, speed])

  return (
    <span className="whitespace-pre-line">
      {displayedText}
      <span className="animate-pulse text-pink-500">|</span>
    </span>
  )
}

// --- Helper Functions ---
const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const getSoundCloudEmbed = (url: string) => {
  if (url && url.includes("soundcloud.com")) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true`;
  }
  return null;
}

const getSpotifyEmbed = (url: string) => {
  if (!url) return null;
  const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator&theme=0`;
  }
  return null;
}

// Interface
interface Heart {
  left: string;
  delay: string;
  duration: string;
  icon: string;
}

interface QuizItem {
  id: string;
  type: 'text' | 'date' | 'choice';
  question: string;
  answer: string;
  options: string[];
  explanationImage?: string; // เพิ่มฟิลด์รูปเฉลย
  explanationText?: string;  // เพิ่มฟิลด์ข้อความเฉลย
}

export default function InteractiveView({ data }: { data: any }) {
  // Steps: 0=Envelope, 1=Quizzes, 2=Cover, 3=Message, 4=Gallery
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [passcode, setPasscode] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // State สำหรับหัวใจ (ป้องกัน Hydration Error)
  const [hearts, setHearts] = useState<Heart[]>([])

  // Quiz Logic
  const quizzes: QuizItem[] = data.quizzes || []
  // รองรับข้อมูลเก่า (Backward Compatibility)
  if (quizzes.length === 0 && data.quizQuestion) {
    quizzes.push({
      id: 'legacy',
      type: data.quizType || 'text',
      question: data.quizQuestion,
      answer: data.quizAnswer,
      options: data.quizOptions || [],
      // map ข้อมูลเก่าเข้า structure ใหม่ (ถ้ามี)
      explanationImage: '',
      explanationText: ''
    })
  }
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [showIntermission, setShowIntermission] = useState(false) // สถานะโชว์หน้าเฉลย

  const themeColor = data.themeColor || "#ec4899"
  const fontStyle = data.fontStyle || "font-sans"
  
  const youtubeId = getYouTubeId(data.bgMusicUrl)
  const soundcloudUrl = getSoundCloudEmbed(data.bgMusicUrl)
  const spotifyUrl = getSpotifyEmbed(data.bgMusicUrl)
  const startTime = data.musicStart ? parseInt(data.musicStart) : 0
  const endTime = data.musicEnd ? parseInt(data.musicEnd) : 0

  const daysTogether = data.anniversaryDate 
    ? Math.floor((new Date().getTime() - new Date(data.anniversaryDate).getTime()) / (1000 * 3600 * 24)) 
    : 0

  // สร้างหัวใจเฉพาะฝั่ง Client (useEffect) เพื่อแก้ Hydration Error
  useEffect(() => {
    const newHearts = Array.from({ length: 15 }).map(() => ({
      left: `${Math.floor(Math.random() * 100)}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 10}s`,
      icon: ['❤️', '💖', '✨', '🌹'][Math.floor(Math.random() * 4)]
    }))
    setHearts(newHearts)
  }, [])

  const goToNextStep = () => setCurrentStep(prev => prev + 1)

  const handleOpenEnvelope = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    if (!youtubeId && !soundcloudUrl && !spotifyUrl && audioRef.current) {
      audioRef.current.volume = 0.5
      audioRef.current.play().catch(e => console.log("Audio play error:", e))
    }

    setTimeout(() => {
      // ถ้ามี Quiz ให้ไปหน้า Quiz (Step 1), ถ้าไม่มีข้ามไป Cover (Step 2)
      if (quizzes.length > 0) {
        setCurrentStep(1)
      } else {
        setCurrentStep(2)
      }
      setIsAnimating(false);
    }, 2000);
  }

  // คำชมสุ่ม (กรณีลูกค้าไม่ได้ใส่ข้อความเฉลยมา)
  const compliments = [
    "เก่งจังเลยที่รัก! ❤️",
    "ถูกต้องนะครับคนดี 😘",
    "จำได้ด้วยเหรอเนี่ย น่ารักที่สุด! 🥰",
    "เก่งมากครับ! 💖",
    "อีกนิดเดียวนะ สู้ๆ! ✌️"
  ];

  const handleNextQuiz = () => {
    setShowIntermission(false);
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1)
    } else {
      goToNextStep() // จบทุกข้อ ไปหน้า Cover
    }
  }

  const checkAnswer = (e: React.FormEvent, selectedOption?: string) => {
    e.preventDefault()
    const currentQuiz = quizzes[currentQuizIndex]
    const answerToCheck = selectedOption || passcode

    // ตรวจคำตอบ (Trim ช่องว่างทิ้ง และเทียบ case-insensitive แบบง่ายๆ)
    if (currentQuiz.answer && answerToCheck.trim().toLowerCase() !== currentQuiz.answer.trim().toLowerCase()) {
      alert("ผิดนะจ๊ะ ลองใหม่เข๊ะ! 😜")
      return
    }
    
    setPasscode("") 
    setShowIntermission(true); // เปิดหน้าเฉลย
  }

  return (
    <div className={`fixed inset-0 overflow-hidden flex flex-col ${fontStyle}`} style={{ background: `linear-gradient(to bottom right, ${themeColor}15, #ffffff, ${themeColor}30)` }}>
      
      {/* Music Player */}
      <div className="absolute top-4 right-4 z-[100]">
        {youtubeId ? (
          <div className="opacity-0 pointer-events-none w-1 h-1 overflow-hidden">
            <iframe width="1" height="1" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&controls=0&start=${startTime}${endTime > 0 ? `&end=${endTime}` : ''}`} title="Music" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        ) : soundcloudUrl ? (
          <div className={`transition-all duration-500 ${currentStep > 2 ? 'opacity-80 translate-y-0' : 'opacity-0 -translate-y-10'} w-64 h-20 bg-black rounded-xl overflow-hidden shadow-lg`}>
            <iframe width="100%" height="100%" scrolling="no" frameBorder="no" allow="autoplay" src={soundcloudUrl} />
          </div>
        ) : spotifyUrl ? (
          <div className={`transition-all duration-500 ${currentStep > 2 ? 'opacity-90 translate-y-0' : 'opacity-0 -translate-y-10'} w-64 h-20 bg-black rounded-xl overflow-hidden shadow-lg`}>
             <iframe style={{ borderRadius: '12px' }} src={spotifyUrl} width="100%" height="100%" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
          </div>
        ) : data.bgMusicUrl && (
           <audio ref={audioRef} loop controls className={`transition-all duration-500 ${currentStep > 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'} h-10 w-32 rounded-full shadow-lg`}>
              <source src={data.bgMusicUrl} type="audio/mpeg" />
           </audio>
        )}
      </div>

      <div className="flex-1 relative w-full h-full">
        
        {/* STEP 0: ENVELOPE (อนิเมชั่นเปิดซอง) */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${currentStep === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <div className="flex flex-col items-center perspective-1000 relative">
              <div className="relative w-80 h-52 cursor-pointer" onClick={handleOpenEnvelope}>
                {/* 1. ด้านหลังซอง (ร่วงลง) */}
                <div className={`absolute inset-0 rounded-b-xl transition-all duration-1000 ease-in-out z-0 ${isAnimating ? 'translate-y-[150%] opacity-0' : ''}`} style={{ backgroundColor: themeColor, filter: 'brightness(0.7)' }}></div>
                
                {/* 2. การ์ดจดหมาย (ลอยขึ้น) */}
                <div className={`absolute left-4 right-4 bg-white shadow-md p-6 text-center transition-all duration-1000 ease-in-out z-10 flex flex-col items-center rounded-lg border border-gray-100 ${isAnimating ? '-translate-y-36 scale-110 opacity-100 shadow-2xl z-50' : 'bottom-2 h-44 justify-center'}`}>
                   <div className="text-gray-400 text-xs tracking-widest uppercase mb-2">For You</div>
                   <div className="text-5xl animate-bounce">💌</div>
                   {isAnimating && <p className="text-xs text-pink-400 mt-4 animate-pulse">กำลังเข้าสู่โลกของเรา...</p>}
                </div>

                {/* 3. กระเป๋าหน้า (ร่วงลง) */}
                <div className={`absolute inset-0 z-20 pointer-events-none transition-all duration-1000 ease-in-out ${isAnimating ? 'translate-y-[150%] opacity-0' : ''}`}>
                    <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[160px] border-t-[100px] border-b-[104px] border-t-transparent border-b-transparent" style={{ borderLeftColor: themeColor, filter: 'brightness(0.9)' }} />
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[160px] border-t-[100px] border-b-[104px] border-t-transparent border-b-transparent" style={{ borderRightColor: themeColor, filter: 'brightness(0.85)' }} />
                    <div className="absolute bottom-0 w-0 h-0 border-l-[160px] border-r-[160px] border-b-[110px] border-l-transparent border-r-transparent rounded-b-xl" style={{ borderBottomColor: themeColor, filter: 'brightness(1)' }} />
                </div>

                {/* 4. ฝาปิด (เปิดแล้วร่วงลง) */}
                <div className={`absolute top-0 w-0 h-0 border-l-[160px] border-r-[160px] border-t-[110px] border-l-transparent border-r-transparent origin-top transition-all duration-1000 ease-in-out z-30 ${isAnimating ? 'rotate-x-180 translate-y-[150%] opacity-0' : 'z-30'}`} style={{ borderTopColor: themeColor, filter: 'brightness(1.1)' }} />
              </div>
              {!isAnimating && <div className="mt-12 text-gray-500 font-medium animate-bounce bg-white/80 px-4 py-2 rounded-full shadow-sm">แตะที่ซองจดหมายเพื่อเปิด ❤️</div>}
           </div>
        </div>

        {/* STEP 1: MINIGAME (QUIZZES with INTERMISSION) */}
        {quizzes.length > 0 && (
          <div className={`absolute inset-0 flex items-center justify-center p-6 transition-all duration-700 transform ${currentStep === 1 ? 'translate-y-0 opacity-100 z-10' : 'translate-y-full opacity-0 z-0 pointer-events-none'}`}>
            
            {/* --- Intermission View (หน้าคั่นเฉลย/คำชม) --- */}
            {showIntermission ? (
              <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border-4 animate-fade-in-up flex flex-col items-center relative overflow-hidden" style={{ borderColor: themeColor }}>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                {/* รูปเฉลย (ถ้ามี) */}
                {quizzes[currentQuizIndex].explanationImage ? (
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border-4 border-white w-full aspect-square relative group transform hover:scale-105 transition duration-500">
                    <img src={quizzes[currentQuizIndex].explanationImage} alt="Reward" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-8xl mb-6 animate-bounce drop-shadow-md">
                    {['🥰', '😍', '😘', '💖', '🎉'][currentQuizIndex % 5]}
                  </div>
                )}

                <h2 className="text-xl font-bold text-gray-800 mb-2 leading-relaxed" style={{ color: themeColor }}>
                  {/* แสดงข้อความเฉลยจากลูกค้า หรือคำชมสุ่ม */}
                  {quizzes[currentQuizIndex].explanationText || compliments[currentQuizIndex % compliments.length]}
                </h2>
                
                <p className="text-gray-400 mb-8 text-xs font-medium tracking-wide uppercase">
                   {currentQuizIndex < quizzes.length - 1 ? "Next Question" : "Surprise is waiting!"}
                </p>

                <button 
                  onClick={handleNextQuiz}
                  className="w-full text-white px-8 py-3 rounded-full shadow-lg font-bold hover:scale-105 transition transform active:scale-95"
                  style={{ backgroundColor: themeColor }}
                >
                  {currentQuizIndex < quizzes.length - 1 ? "ไปข้อต่อไป ➡️" : "ดูเซอร์ไพรส์ 🎉"}
                </button>
              </div>
            ) : (
              /* --- Quiz Question View --- */
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border-4 relative" style={{ borderColor: themeColor }}>
                
                {/* Pagination */}
                <div className="absolute top-4 right-4 flex gap-1">
                  {quizzes.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentQuizIndex ? 'w-4' : ''}`} style={{ backgroundColor: i === currentQuizIndex ? themeColor : '#d1d5db' }} />
                  ))}
                </div>

                <div className="text-6xl mb-4 animate-bounce">🤔</div>
                <h2 className="text-xl font-bold text-gray-800 mt-2">คำถามข้อที่ {currentQuizIndex + 1}</h2>
                <p className="text-gray-600 mb-6 font-medium mt-2 text-lg">"{quizzes[currentQuizIndex].question}"</p>
                
                <form onSubmit={(e) => checkAnswer(e)} className="space-y-4">
                  {quizzes[currentQuizIndex].type === 'choice' && Array.isArray(quizzes[currentQuizIndex].options) ? (
                    <div className="grid grid-cols-1 gap-3">
                      {quizzes[currentQuizIndex].options.map((option, idx) => (
                        option && (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => checkAnswer(e, option)} // คลิกแล้วตอบเลย
                            className="w-full py-3 px-4 rounded-xl border-2 transition-all font-medium text-lg bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50 active:scale-95 shadow-sm hover:shadow-md"
                          >
                            {option}
                          </button>
                        )
                      ))}
                    </div>
                  ) : quizzes[currentQuizIndex].type === 'date' ? (
                    <>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 text-center border-2 rounded-xl outline-none text-black transition focus:scale-105 bg-gray-50 text-lg font-bold shadow-sm"
                        style={{ borderColor: `${themeColor}60` }}
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        required
                      />
                      <button type="submit" disabled={!passcode} className="w-full text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95 text-lg mt-2" style={{ backgroundColor: themeColor }}>ตอบเลย 💘</button>
                    </>
                  ) : (
                    <>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 text-center border-2 rounded-xl outline-none text-black transition focus:scale-105 bg-gray-50 text-lg shadow-sm"
                        style={{ borderColor: `${themeColor}60` }}
                        placeholder="ใส่คำตอบที่นี่..."
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        autoFocus
                        required
                      />
                      <button type="submit" disabled={!passcode} className="w-full text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95 text-lg mt-2" style={{ backgroundColor: themeColor }}>ตอบเลย 💘</button>
                    </>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: COVER PAGE */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-700 transform ${currentStep === 2 ? 'translate-y-0 opacity-100 z-10' : currentStep > 2 ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
           <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white p-4">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-inner bg-gray-100">
                {data.imageUrl ? (
                  <img src={data.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
                )}
                {data.anniversaryDate && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg border border-white/20">
                    🗓️ คบกันมา {daysTogether} วันแล้ว
                  </div>
                )}
              </div>
              <div className="text-center pt-6 pb-2">
                 <h1 className="text-3xl font-bold leading-tight" style={{ color: themeColor }}>
                    {data.title || "Happy Anniversary"}
                 </h1>
                 <p className="text-gray-400 text-sm mt-2">แตะปุ่มด้านล่างเพื่อไปต่อ</p>
              </div>
           </div>
           
           <button onClick={goToNextStep} className="mt-8 animate-bounce bg-white text-gray-800 p-4 rounded-full shadow-lg hover:scale-110 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
           </button>
        </div>

        {/* STEP 3: MESSAGE PAGE */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-700 transform ${currentStep === 3 ? 'translate-y-0 opacity-100 z-10' : currentStep > 3 ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
           <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 relative border border-white/60 min-h-[50vh] flex flex-col">
              <div className="absolute -top-6 right-6 bg-white p-3 rounded-full shadow-lg text-3xl" style={{ color: themeColor }}>💌</div>
              <div className="flex-1 overflow-y-auto mb-4">
                <div className="text-gray-800 text-lg leading-loose font-medium">
                  {currentStep === 3 && ( 
                    data.useTypingEffect ? (
                      <TypewriterEffect text={data.message || "..."} speed={50} />
                    ) : (
                      <p className="whitespace-pre-line">{data.message}</p>
                    )
                  )}
                </div>
              </div>
              <div className="text-center pt-4 border-t border-gray-100">
                 <div className="text-2xl animate-pulse" style={{ color: themeColor }}>💖</div>
              </div>
           </div>
           {data.gallery && data.gallery.length > 0 && (
             <button onClick={goToNextStep} className="mt-8 bg-white text-gray-800 px-6 py-3 rounded-full shadow-lg hover:scale-105 transition font-bold flex items-center gap-2">
                ดูรูปของเรา <span className="text-xl">📸</span>
             </button>
           )}
        </div>

        {/* STEP 4: GALLERY PAGE */}
        {data.gallery && data.gallery.length > 0 && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-700 transform ${currentStep === 4 ? 'translate-y-0 opacity-100 z-10' : 'translate-y-full opacity-0 pointer-events-none'}`}>
             <div className="w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">📸 ความทรงจำของเรา</h2>
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl">
                   <PhotoGallery images={data.gallery} />
                </div>
                <button onClick={() => setCurrentStep(2)} className="mt-8 text-white/80 hover:text-white underline text-sm">กลับไปอ่านใหม่อีกรอบ</button>
             </div>
          </div>
        )}

      </div>

      <div className="absolute inset-0 pointer-events-none z-0">
        {hearts.map((h, i) => (
          <div key={i} className="absolute opacity-40 animate-float" style={{ left: h.left, animationDelay: h.delay, animationDuration: h.duration, bottom: '-10%', color: themeColor, fontSize: '24px' }}>
            {h.icon}
          </div>
        ))}
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-x-180 { transform: rotateX(180deg); }
        @keyframes float { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 10% { opacity: 0.6; } 100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; } }
        .animate-float { animation-name: float; animation-timing-function: linear; animation-iteration-count: infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}