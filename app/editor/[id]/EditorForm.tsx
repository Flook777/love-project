'use client'

import { useState, useTransition } from 'react'
import UploadButton from '@/components/UploadButton'

export default function EditorForm({ project, updateProjectAction }: { project: any, updateProjectAction: any }) {
  // --- State ข้อมูลพื้นฐาน ---
  const [imageUrl, setImageUrl] = useState(project.customData?.imageUrl || "")
  const [title, setTitle] = useState(project.customData?.title || "")
  const [message, setMessage] = useState(project.customData?.message || "")
  
  // --- State ลูกเล่นเดิม (Features) ---
  const [anniversaryDate, setAnniversaryDate] = useState(project.customData?.anniversaryDate || "")
  const [quizQuestion, setQuizQuestion] = useState(project.customData?.quizQuestion || "")
  const [quizAnswer, setQuizAnswer] = useState(project.customData?.quizAnswer || "")

  // --- State การตกแต่งขั้นสูง (Advanced Customization) ---
  const [themeColor, setThemeColor] = useState(project.customData?.themeColor || "#ec4899") // Default สีชมพู
  const [bgMusicUrl, setBgMusicUrl] = useState(project.customData?.bgMusicUrl || "")
  const [fontStyle, setFontStyle] = useState(project.customData?.fontStyle || "font-sans")

  const [isPending, startTransition] = useTransition()

  // คำนวณวันครบรอบ
  const daysTogether = anniversaryDate 
    ? Math.floor((new Date().getTime() - new Date(anniversaryDate).getTime()) / (1000 * 3600 * 24)) 
    : 0

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateProjectAction(formData)
      alert("✅ บันทึกข้อมูลเรียบร้อยแล้วครับ!")
    })
  }

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${fontStyle}`}>
      
      {/* --- ส่วนที่ 1: Form แก้ไข --- */}
      <aside className="w-full md:w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto h-screen shadow-lg z-10 font-sans">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          ✏️ แก้ไขข้อมูล
          <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: themeColor }}>
            {project.name}
          </span>
        </h2>

        <form action={handleSubmit} className="space-y-6 pb-20">
          <input type="hidden" name="projectId" value={project.id} />

          {/* 1. รูปภาพ */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">รูปภาพหลัก</label>
            <UploadButton onUploadSuccess={(result: any) => {
                const secureUrl = result?.info?.secure_url;
                if (secureUrl) setImageUrl(secureUrl);
            }} />
            <input name="imageUrl" value={imageUrl} readOnly className="hidden" />
            {imageUrl && <p className="text-xs text-green-500">✅ มีรูปภาพแล้ว</p>}
          </div>

          {/* 2. ข้อความหลัก */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
            <input
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none text-black transition"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความในใจ</label>
            <textarea
              name="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent outline-none text-black transition"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
          </div>

          {/* --- โซนปรับแต่งธีม (Advanced Theme) --- */}
          <div className="border-t border-dashed pt-6 mt-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: themeColor }}>
              🎨 ปรับแต่งธีม (Design)
            </h3>

            {/* Theme Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">สีธีมหลัก (Theme Color)</label>
              <div className="flex items-center gap-3">
                <input
                  name="themeColor"
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-12 h-12 p-1 rounded-lg border cursor-pointer"
                />
                <span className="text-sm text-gray-500">{themeColor}</span>
              </div>
            </div>

            {/* Font Style */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบตัวอักษร (Font)</label>
              <select
                name="fontStyle"
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black bg-white"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              >
                <option value="font-sans">Default (เรียบง่าย)</option>
                <option value="font-serif">Serif (หรูหรา/ทางการ)</option>
                <option value="font-mono">Mono (พิมพ์ดีด/วินเทจ)</option>
              </select>
            </div>

            {/* Background Music */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">🎵 ลิงก์เพลง (.mp3 หรือ URL)</label>
              <input
                name="bgMusicUrl"
                type="text"
                placeholder="https://example.com/music.mp3"
                value={bgMusicUrl}
                onChange={(e) => setBgMusicUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              />
              <p className="text-xs text-gray-400 mt-1">แนะนำไฟล์ .mp3 เพื่อความชัวร์ในการเล่น</p>
            </div>
          </div>

          {/* --- โซนลูกเล่นพิเศษ (Features) --- */}
          <div className="border-t border-dashed pt-6 mt-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: themeColor }}>
              ✨ ลูกเล่นพิเศษ (Optional)
            </h3>

            {/* วันครบรอบ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 วันที่เริ่มคบกัน</label>
              <input
                name="anniversaryDate"
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              />
            </div>

            {/* Quiz */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">🔐 ตั้งคำถาม (Quiz)</label>
              <input
                name="quizQuestion"
                type="text"
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              />
            </div>

            {quizQuestion && (
              <div className="mb-4 animate-fade-in-up">
                <label className="block text-sm font-medium text-gray-700 mb-2">🔑 คำตอบ (เฉลย)</label>
                <input
                  name="quizAnswer"
                  type="text"
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black bg-gray-50"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
              </div>
            )}
          </div>

          {/* ปุ่มบันทึก */}
          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full font-bold py-3 rounded-lg shadow-lg transition flex justify-center items-center gap-2 text-white`}
            style={{ backgroundColor: isPending ? '#9ca3af' : themeColor }}
          >
            {isPending ? <span className="animate-spin">⏳</span> : '💾 บันทึกข้อมูล'}
          </button>

          <div className="pt-4 border-t text-center">
            <a 
              href={`/p/${project.slug}`} 
              target="_blank" 
              className="hover:underline text-sm font-bold"
              style={{ color: themeColor }}
            >
              👁️ ดูตัวอย่างเว็บจริง
            </a>
            <div className="mt-2">
               <a href="/dashboard" className="text-gray-400 hover:text-gray-600 text-xs">&larr; กลับไปแดชบอร์ด</a>
            </div>
          </div>
        </form>
      </aside>

      {/* --- ส่วนที่ 2: Live Preview (แสดงผลตามธีมที่เลือกทันที) --- */}
      <main className="flex-1 flex items-center justify-center p-8 bg-gray-100 hidden md:flex">
        <div className="w-[375px] h-[667px] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800 relative">
          <div className="absolute top-0 w-full h-6 bg-gray-800 flex justify-center z-20"><div className="w-20 h-4 bg-black rounded-b-xl"></div></div>
          
          {/* พื้นที่แสดงผลจำลอง (ใช้สี Theme Color เป็นพื้นหลังแบบจางๆ) */}
          <div 
            className={`h-full overflow-y-auto p-6 flex flex-col items-center text-center pt-16 relative ${fontStyle}`}
            style={{ 
              background: `linear-gradient(to bottom right, ${themeColor}20, #ffffff)` // สีพื้นหลังจางๆ 20%
            }}
          >
            
            {/* Badge วันครบรอบ */}
            {anniversaryDate && (
              <div 
                className="text-white px-4 py-1 rounded-full text-xs font-bold shadow-md mb-4 animate-bounce"
                style={{ backgroundColor: themeColor }}
              >
                คบกันมา {daysTogether} วัน ❤️
              </div>
            )}

            {imageUrl ? (
              <img src={imageUrl} alt="Fan" className="w-48 h-48 object-cover rounded-2xl border-4 border-white shadow-xl mb-6" />
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-2xl flex items-center justify-center mb-6 text-gray-400 text-4xl">🖼️</div>
            )}

            <h1 className="text-2xl font-bold mb-2" style={{ color: themeColor }}>
              {title || "Happy Anniversary"}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">{message || "ข้อความของคุณ..."}</p>

            {/* Quiz Preview */}
            {quizQuestion && (
              <div 
                className="mt-8 p-3 bg-white rounded-lg border w-full opacity-80"
                style={{ borderColor: `${themeColor}40` }}
              >
                <p className="text-xs text-gray-500 mb-1">🔒 มีคำถามล็อคอยู่:</p>
                <p className="text-sm font-bold text-gray-800">"{quizQuestion}"</p>
              </div>
            )}
            
            {/* Music Preview Icon */}
            {bgMusicUrl && (
              <div className="absolute top-4 right-4 text-xs bg-white/80 px-2 py-1 rounded-full shadow flex items-center gap-1">
                🎵 มีเพลง
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}