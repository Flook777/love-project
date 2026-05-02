'use client'

import { useState, useRef, useEffect } from 'react'
import PhotoGallery from '@/components/PhotoGallery'

function TypewriterEffect({ text, speed = 45 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [idx, setIdx] = useState(0)
  useEffect(() => { setDisplayed(''); setIdx(0) }, [text])
  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed(p => p + text[idx])
        setIdx(p => p + 1)
      }, speed)
      return () => clearTimeout(t)
    }
  }, [idx, text, speed])
  return <span className="whitespace-pre-line">{displayed}<span className="animate-pulse opacity-60">▋</span></span>
}

const getYouTubeId = (url: string) => {
  if (!url) return null
  const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
  return m && m[2].length === 11 ? m[2] : null
}
const getSoundCloudEmbed = (url: string) =>
  url?.includes('soundcloud.com')
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true`
    : null
const getSpotifyEmbed = (url: string) => {
  if (!url) return null
  const m = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/)
  return m ? `https://open.spotify.com/embed/track/${m[1]}?utm_source=generator&theme=0` : null
}

interface QuizItem {
  id: string
  type: 'text' | 'date' | 'choice'
  question: string
  answer: string
  options: string[]
  explanationImage?: string
  explanationText?: string
}

interface Particle {
  left: string
  delay: string
  duration: string
  icon: string
  size: string
}

export default function InteractiveView({ data }: { data: any }) {
  const [step, setStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [flapOpen, setFlapOpen] = useState(false)
  const [letterRising, setLetterRising] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  const quizzes: QuizItem[] = data.quizzes || []
  if (quizzes.length === 0 && data.quizQuestion) {
    quizzes.push({
      id: 'legacy',
      type: data.quizType || 'text',
      question: data.quizQuestion,
      answer: data.quizAnswer,
      options: data.quizOptions || [],
      explanationImage: '',
      explanationText: '',
    })
  }
  const [quizIdx, setQuizIdx] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const accent = data.themeColor || '#ec4899'
  const fontStyle = data.fontStyle || 'font-sans'
  const youtubeId = getYouTubeId(data.bgMusicUrl)
  const soundcloudUrl = getSoundCloudEmbed(data.bgMusicUrl)
  const spotifyUrl = getSpotifyEmbed(data.bgMusicUrl)
  const startTime = data.musicStart ? parseInt(data.musicStart) : 0
  const endTime = data.musicEnd ? parseInt(data.musicEnd) : 0
  const daysTogether = data.anniversaryDate
    ? Math.floor((Date.now() - new Date(data.anniversaryDate).getTime()) / 86400000)
    : 0

  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, () => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${14 + Math.random() * 12}s`,
        icon: ['🌸', '✨', '💕', '🌷', '⭐', '💫', '🌼'][Math.floor(Math.random() * 7)],
        size: `${13 + Math.random() * 10}px`,
      }))
    )
  }, [])

  const playMusic = () => {
    if (!youtubeId && !soundcloudUrl && !spotifyUrl && audioRef.current) {
      audioRef.current.volume = 0.4
      audioRef.current.play().catch(() => {})
    }
  }

  const handleOpenEnvelope = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setFlapOpen(true)
    setTimeout(() => setLetterRising(true), 350)
    setTimeout(() => {
      playMusic()
      setStep(quizzes.length > 0 ? 1 : 2)
      setIsAnimating(false)
    }, 1800)
  }

  const compliments = [
    'เก่งจังเลยที่รัก! ❤️',
    'ถูกต้องแล้วคนดี 😘',
    'จำได้ด้วย น่ารักที่สุด! 🥰',
    'เก่งมากเลย! 💖',
    'ใช่เลย! สู้ๆ นะ ✨',
  ]

  const handleNextQuiz = () => {
    setShowResult(false)
    if (quizIdx < quizzes.length - 1) {
      setQuizIdx(p => p + 1)
    } else {
      setStep(2)
    }
  }

  const checkAnswer = (e: React.FormEvent, selected?: string) => {
    e.preventDefault()
    const quiz = quizzes[quizIdx]
    const ans = selected || passcode
    if (quiz.answer && ans.trim().toLowerCase() !== quiz.answer.trim().toLowerCase()) {
      alert('ผิดนะจ๊ะ ลองใหม่เข๊ะ! 😜')
      return
    }
    setPasscode('')
    setShowResult(true)
  }

  // Shared card styles
  const card = {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${accent}20`,
    borderRadius: '1.75rem',
    boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  }

  const btnPrimary = {
    backgroundColor: accent,
    color: '#fff',
    borderRadius: '1rem',
    fontWeight: 600,
    padding: '0.875rem 1.5rem',
    width: '100%',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'transform 0.15s, opacity 0.15s',
    boxShadow: `0 4px 20px ${accent}50`,
  } as const

  const stepStyle = (n: number, enterDir: 'up' | 'down' = 'up') => ({
    opacity: step === n ? 1 : 0,
    pointerEvents: (step === n ? 'auto' : 'none') as 'auto' | 'none',
    transform: step === n ? 'none' : step < n
      ? `translateY(${enterDir === 'up' ? '32px' : '-32px'})`
      : `translateY(${enterDir === 'up' ? '-32px' : '32px'})`,
    transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
  })

  return (
    <div
      className={`fixed inset-0 overflow-hidden ${fontStyle}`}
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: `linear-gradient(150deg, ${accent}12 0%, #fdf8ff 45%, ${accent}08 80%, #fff5f7 100%)`,
      }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute iv-particle select-none"
            style={{ left: p.left, bottom: '-4%', fontSize: p.size, animationDelay: p.delay, animationDuration: p.duration }}
          >
            {p.icon}
          </span>
        ))}
      </div>

      {/* Music player */}
      <div
        className="absolute top-4 right-4"
        style={{ zIndex: 50, transition: 'opacity 0.6s', opacity: step > 1 ? 1 : 0, pointerEvents: step > 1 ? 'auto' : 'none' }}
      >
        {youtubeId ? (
          <div className="sr-only">
            <iframe
              width="1" height="1"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&controls=0&start=${startTime}${endTime > 0 ? `&end=${endTime}` : ''}`}
              title="bg" allow="autoplay; encrypted-media"
            />
          </div>
        ) : soundcloudUrl ? (
          <div style={{ width: 220, height: 60, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            <iframe width="100%" height="100%" scrolling="no" frameBorder="no" allow="autoplay" src={soundcloudUrl} />
          </div>
        ) : spotifyUrl ? (
          <div style={{ width: 220, height: 60, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            <iframe src={spotifyUrl} width="100%" height="100%" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
          </div>
        ) : data.bgMusicUrl ? (
          <audio ref={audioRef} loop className="w-28 h-8" style={{ borderRadius: 999 }}>
            <source src={data.bgMusicUrl} type="audio/mpeg" />
          </audio>
        ) : null}
      </div>

      {/* ── STEP 0: ENVELOPE ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        style={{ zIndex: 10, ...stepStyle(0) }}
      >
        <div className="flex flex-col items-center" style={{ gap: '2rem' }}>
          {/* Eyebrow + title */}
          <div className="text-center">
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: `${accent}99`, marginBottom: '0.5rem', fontWeight: 500 }}>
              a surprise for you ✨
            </p>
            <h1 className="iv-display" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.25rem)', color: '#3d2c35', lineHeight: 1.2, textAlign: 'center' }}>
              {data.title || 'มีซัมซิ่งให้นายหน่อยนึง'}
            </h1>
          </div>

          {/* Envelope */}
          <button
            onClick={handleOpenEnvelope}
            disabled={isAnimating}
            style={{ background: 'none', border: 'none', cursor: isAnimating ? 'default' : 'pointer', padding: 0 }}
            aria-label="เปิดซอง"
          >
            <div
              className="iv-envelope-shadow"
              style={{
                position: 'relative',
                width: 'min(300px, 78vw)',
                height: 'min(210px, 54vw)',
                borderRadius: '1.25rem',
                overflow: 'hidden',
                backgroundColor: accent,
              }}
            >
              {/* Envelope body shading */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.06)', zIndex: 1 }} />

              {/* Side fold triangles */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, zIndex: 2,
                width: 0, height: 0,
                borderStyle: 'solid',
                borderWidth: '0 0 105px 150px',
                borderColor: `transparent transparent rgba(0,0,0,0.1) transparent`,
              }} />
              <div style={{
                position: 'absolute', bottom: 0, right: 0, zIndex: 2,
                width: 0, height: 0,
                borderStyle: 'solid',
                borderWidth: '0 150px 105px 0',
                borderColor: `transparent rgba(0,0,0,0.1) transparent transparent`,
              }} />

              {/* Letter card that rises out */}
              <div style={{
                position: 'absolute',
                left: '10%', right: '10%',
                bottom: '6px',
                height: '72%',
                background: '#fff',
                borderRadius: '0.75rem',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                transform: letterRising ? 'translateY(-58%)' : 'translateY(0)',
                transition: 'transform 0.75s cubic-bezier(0.34, 1.05, 0.64, 1)',
              }}>
                <p style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c4b0bb', marginBottom: '0.5rem' }}>For You</p>
                <span style={{ fontSize: '2.5rem' }}>💌</span>
                {letterRising && (
                  <p style={{ fontSize: '0.65rem', color: accent, marginTop: '0.5rem', animation: 'pulse 1.5s infinite' }}>กำลังเข้าสู่โลกของเรา...</p>
                )}
              </div>

              {/* Flap — sits on top, rotates open */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '52%',
                zIndex: 4,
                transformOrigin: 'top center',
                transform: flapOpen ? 'perspective(500px) rotateX(-170deg)' : 'perspective(500px) rotateX(0deg)',
                transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  backgroundColor: accent,
                  filter: 'brightness(1.12)',
                }} />
              </div>
            </div>
          </button>

          {/* Hint */}
          {!isAnimating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div
                className="iv-bounce"
                style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  backgroundColor: `${accent}15`,
                  border: `1.5px solid ${accent}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: accent, fontSize: '1rem',
                }}
              >
                ↑
              </div>
              <p style={{ fontSize: '0.8rem', color: '#9d8090', letterSpacing: '0.04em' }}>แตะซองเพื่อเปิด</p>
            </div>
          )}
        </div>
      </div>

      {/* ── STEP 1: QUIZ ── */}
      {quizzes.length > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center p-5"
          style={{ zIndex: 10, ...stepStyle(1) }}
        >
          {showResult ? (
            <div className="w-full iv-scale-in" style={{ maxWidth: 360 }}>
              <div style={card} className="p-8 text-center">
                {quizzes[quizIdx].explanationImage ? (
                  <div style={{ borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem', aspectRatio: '1/1' }}>
                    <img src={quizzes[quizIdx].explanationImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="iv-bounce" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {['🥰', '😍', '😘', '💖', '🎉'][quizIdx % 5]}
                  </div>
                )}
                <h2
                  className="iv-display"
                  style={{ fontSize: '1.35rem', color: accent, marginBottom: '0.4rem', lineHeight: 1.4 }}
                >
                  {quizzes[quizIdx].explanationText || compliments[quizIdx % compliments.length]}
                </h2>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', marginBottom: '1.5rem' }}>
                  {quizIdx < quizzes.length - 1 ? `ข้อ ${quizIdx + 1} / ${quizzes.length}` : 'ผ่านทุกข้อแล้ว! 🎉'}
                </p>
                <button style={btnPrimary} onClick={handleNextQuiz}>
                  {quizIdx < quizzes.length - 1 ? 'ข้อต่อไป →' : 'ดูเซอร์ไพรส์ ✨'}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full iv-fade-up" style={{ maxWidth: 360 }}>
              <div style={card} className="p-8">
                {/* Progress bar */}
                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {quizzes.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: 4, borderRadius: 99,
                        width: i === quizIdx ? 28 : 6,
                        backgroundColor: i === quizIdx ? accent : `${accent}25`,
                        transition: 'width 0.3s, background-color 0.3s',
                      }}
                    />
                  ))}
                </div>

                <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#bbb', textAlign: 'center', marginBottom: '0.5rem' }}>
                  ข้อที่ {quizIdx + 1}
                </p>
                <h2
                  className="iv-display"
                  style={{ fontSize: '1.25rem', color: '#3d2c35', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.5 }}
                >
                  "{quizzes[quizIdx].question}"
                </h2>

                <form onSubmit={checkAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {quizzes[quizIdx].type === 'choice' && Array.isArray(quizzes[quizIdx].options)
                    ? quizzes[quizIdx].options.filter(Boolean).map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={e => checkAnswer(e, opt)}
                          style={{
                            textAlign: 'left',
                            padding: '0.8rem 1rem',
                            borderRadius: '0.875rem',
                            border: `1.5px solid ${accent}20`,
                            background: '#fff',
                            color: '#4a3540',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'border-color 0.2s, background 0.2s',
                          }}
                          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = `${accent}60`; (e.target as HTMLElement).style.background = `${accent}08` }}
                          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = `${accent}20`; (e.target as HTMLElement).style.background = '#fff' }}
                        >
                          {opt}
                        </button>
                      ))
                    : quizzes[quizIdx].type === 'date'
                    ? (
                      <>
                        <input
                          type="date"
                          style={{ padding: '0.8rem', borderRadius: '0.875rem', border: `1.5px solid ${accent}35`, textAlign: 'center', fontSize: '1rem', color: '#3d2c35', background: '#fafafa', outline: 'none', width: '100%' }}
                          value={passcode}
                          onChange={e => setPasscode(e.target.value)}
                          required
                        />
                        <button type="submit" disabled={!passcode} style={{ ...btnPrimary, opacity: passcode ? 1 : 0.5 }}>ตอบเลย 💘</button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          style={{ padding: '0.8rem', borderRadius: '0.875rem', border: `1.5px solid ${accent}35`, textAlign: 'center', fontSize: '1rem', color: '#3d2c35', background: '#fafafa', outline: 'none', width: '100%' }}
                          placeholder="ใส่คำตอบ..."
                          value={passcode}
                          onChange={e => setPasscode(e.target.value)}
                          autoFocus
                          required
                        />
                        <button type="submit" disabled={!passcode} style={{ ...btnPrimary, opacity: passcode ? 1 : 0.5 }}>ตอบเลย 💘</button>
                      </>
                    )
                  }
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: COVER ── */}
      <div
        className="absolute inset-0 flex items-center justify-center p-5"
        style={{ zIndex: 10, ...stepStyle(2) }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ position: 'relative', borderRadius: '1.75rem', overflow: 'hidden', boxShadow: '0 16px 56px rgba(0,0,0,0.12)', aspectRatio: '3/4', marginBottom: '1rem' }}>
            {data.imageUrl ? (
              <img src={data.imageUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', background: `${accent}12` }}>🖼️</div>
            )}
            {/* gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(to top, ${accent}dd 0%, ${accent}44 40%, transparent 65%)`,
            }} />
            {/* text on photo */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem 1.5rem', color: '#fff' }}>
              <h1 className="iv-display" style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', lineHeight: 1.25, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {data.title || 'Happy Anniversary 🌹'}
              </h1>
              {data.anniversaryDate && (
                <p style={{ fontSize: '0.8rem', marginTop: '0.3rem', opacity: 0.85, fontWeight: 500 }}>
                  🗓️ {daysTogether} วันที่เรามีกัน
                </p>
              )}
            </div>
          </div>
          <button style={btnPrimary} onClick={() => setStep(3)}>
            อ่านจดหมาย 💌
          </button>
        </div>
      </div>

      {/* ── STEP 3: MESSAGE ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center p-5"
        style={{ zIndex: 10, ...stepStyle(3) }}
      >
        <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>
          {/* Header pill */}
          <div style={{ textAlign: 'center', marginBottom: '0.875rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
              padding: '0.4rem 1rem', borderRadius: 999,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              fontSize: '0.8rem', color: '#9d8090',
            }}>
              <span style={{ color: accent }}>💌</span>
              จดหมายถึงคุณ
            </span>
          </div>

          {/* Message card */}
          <div style={{ ...card, padding: '1.75rem', flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <div style={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#4a3540', fontWeight: 400 }}>
              {step === 3 && (
                data.useTypingEffect
                  ? <TypewriterEffect text={data.message || '...'} speed={40} />
                  : <p className="whitespace-pre-line">{data.message}</p>
              )}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1.4rem', color: accent, animation: 'pulse 2s infinite' }}>
              💖
            </div>
          </div>

          {/* Next */}
          <div style={{ marginTop: '0.875rem' }}>
            {data.gallery?.length > 0 ? (
              <button style={btnPrimary} onClick={() => setStep(4)}>
                ดูรูปของเรา 📸
              </button>
            ) : (
              <button
                style={{ width: '100%', padding: '0.75rem', borderRadius: '1rem', border: `1.5px solid ${accent}25`, background: 'transparent', color: '#9d8090', fontSize: '0.875rem', cursor: 'pointer' }}
                onClick={() => setStep(2)}
              >
                ← กลับไปหน้าปก
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── STEP 4: GALLERY ── */}
      {data.gallery?.length > 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-start p-5 overflow-y-auto"
          style={{ zIndex: 10, paddingTop: '2rem', ...stepStyle(4) }}
        >
          <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h2 className="iv-display" style={{ fontSize: '1.75rem', color: '#3d2c35' }}>
                ความทรงจำของเรา
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#bbb', marginTop: '0.25rem' }}>
                📸 {data.gallery.length} รูป
              </p>
            </div>
            <div style={{ ...card, padding: '1rem' }}>
              <PhotoGallery images={data.gallery} />
            </div>
            <button
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: '1rem', border: `1.5px solid ${accent}25`, background: 'transparent', color: '#9d8090', fontSize: '0.875rem', cursor: 'pointer' }}
              onClick={() => setStep(3)}
            >
              ← กลับไปอ่านจดหมาย
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .iv-display { font-family: 'DM Serif Display', Georgia, serif; }

        @keyframes iv-particle {
          0%   { transform: translateY(0) rotate(0deg) scale(0.6); opacity: 0; }
          8%   { opacity: 0.9; transform: translateY(-8vh) rotate(25deg) scale(1); }
          88%  { opacity: 0.4; }
          100% { transform: translateY(-108vh) rotate(700deg) scale(0.5); opacity: 0; }
        }
        .iv-particle {
          animation-name: iv-particle;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }

        @keyframes iv-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .iv-bounce { animation: iv-bounce 1.8s ease-in-out infinite; }

        @keyframes iv-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .iv-fade-up { animation: iv-fade-up 0.45s ease-out both; }

        @keyframes iv-scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .iv-scale-in { animation: iv-scale-in 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) both; }

        .iv-envelope-shadow {
          filter: drop-shadow(0 16px 40px rgba(0,0,0,0.12)) drop-shadow(0 4px 12px rgba(0,0,0,0.08));
          transition: transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .iv-envelope-shadow:hover { transform: scale(1.03) translateY(-4px); }
        .iv-envelope-shadow:active { transform: scale(0.97); }
      `}</style>
    </div>
  )
}
