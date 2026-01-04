'use client'

import { useState, useTransition } from 'react'
import UploadButton from '@/components/UploadButton'
import ImageCropper from '@/components/ImageCropper'

// ฟังก์ชันอัปโหลดรูป
const uploadToCloudinary = async (blob: Blob) => {
  const formData = new FormData()
  formData.append('file', blob)
  
  // ดึงค่า Config
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  // ตรวจสอบความถูกต้องของ Config
  if (!uploadPreset) {
    throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env")
  }
  if (!cloudName) {
    throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env")
  }

  // Log เพื่อ Debug (ดูใน Console Browser)
  console.log("Uploading to Cloudinary:", { cloudName, uploadPreset })

  formData.append('upload_preset', uploadPreset)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("Cloudinary Error Data:", data)
      throw new Error(data.error?.message || "Upload failed")
    }

    return data.secure_url
  } catch (error) {
    console.error("Cloudinary Upload Error:", error)
    throw error
  }
}

// รายการหมวดหมู่
const CATEGORIES = [
  { id: 'valentine', label: 'วาเลนไทน์ 🌹', color: '#ec4899' },
  { id: 'birthday', label: 'วันเกิด 🎂', color: '#f59e0b' },
  { id: 'anniversary', label: 'วันครบรอบ 💍', color: '#8b5cf6' },
  { id: 'apology', label: 'ขอโทษ 🥺', color: '#3b82f6' },
]

export default function EditorForm({ project, updateProjectAction }: { project: any, updateProjectAction: any }) {
  // State ข้อมูล
  // ใช้ || "" เพื่อป้องกัน undefined (Controlled Input)
  const [imageUrl, setImageUrl] = useState(project.customData?.imageUrl || "") 
  const [title, setTitle] = useState(project.customData?.title || "")
  const [message, setMessage] = useState(project.customData?.message || "")
  
  const [selectedCategory, setSelectedCategory] = useState(project.templateId || 'valentine')

  // State ลูกเล่น & เกม
  const [anniversaryDate, setAnniversaryDate] = useState(project.customData?.anniversaryDate || "")
  
  // Quiz (Minigame)
  const [quizQuestion, setQuizQuestion] = useState(project.customData?.quizQuestion || "")
  const [quizAnswer, setQuizAnswer] = useState(project.customData?.quizAnswer || "")
  const [quizType, setQuizType] = useState(project.customData?.quizType || "text")
  const [quizOptions, setQuizOptions] = useState<string[]>(project.customData?.quizOptions || ["", "", "", ""])

  const [useTypingEffect, setUseTypingEffect] = useState(project.customData?.useTypingEffect || false)

  // State ธีม
  const [themeColor, setThemeColor] = useState(project.customData?.themeColor || "#ec4899")
  const [bgMusicUrl, setBgMusicUrl] = useState(project.customData?.bgMusicUrl || "")
  const [fontStyle, setFontStyle] = useState(project.customData?.fontStyle || "font-sans")
  const [musicStart, setMusicStart] = useState(project.customData?.musicStart || "0")
  const [musicEnd, setMusicEnd] = useState(project.customData?.musicEnd || "")

  const [gallery, setGallery] = useState<string[]>(project.customData?.gallery || [])

  // Cropper State
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [isUploadingCrop, setIsUploadingCrop] = useState(false)

  const [isPending, startTransition] = useTransition()

  const daysTogether = anniversaryDate 
    ? Math.floor((new Date().getTime() - new Date(anniversaryDate).getTime()) / (1000 * 3600 * 24)) 
    : 0

  const handleSubmit = (formData: FormData) => {
    formData.append('gallery', JSON.stringify(gallery))
    formData.append('quizOptions', JSON.stringify(quizOptions))
    
    // ส่ง imageUrl เสมอ (ถ้าว่างก็ส่ง "")
    formData.set('imageUrl', imageUrl || "")
    
    formData.set('quizType', quizType)
    if(useTypingEffect) formData.set('useTypingEffect', 'on')

    startTransition(async () => {
      await updateProjectAction(formData)
      alert("✅ บันทึกข้อมูลเรียบร้อยแล้วครับ!")
    })
  }

  const handleSelectCategory = (catId: string, color: string) => {
    setSelectedCategory(catId)
    setThemeColor(color)
  }

  const handleMainImageUpload = (result: any) => {
    const secureUrl = result?.info?.secure_url;
    if (secureUrl) {
      setTempImage(secureUrl)
      setIsCropping(true)
    }
  }

  const handleCropComplete = async (blob: Blob) => {
    setIsCropping(false)
    setIsUploadingCrop(true)
    try {
      const newUrl = await uploadToCloudinary(blob)
      setImageUrl(newUrl || "") // Ensure string
    } catch (error) {
      console.error("Upload failed", error)
      alert(`อัปโหลดรูปไม่สำเร็จ: ${(error as Error).message}\n(กรุณาเช็ค Console และ Cloudinary Preset)`)
    } finally {
      setIsUploadingCrop(false)
      setTempImage(null)
    }
  }

  const handleAddGalleryImage = (result: any) => {
    const secureUrl = result?.info?.secure_url
    if (secureUrl) setGallery(prev => [...prev, secureUrl])
  }

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setGallery(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...quizOptions]
    newOptions[index] = value
    setQuizOptions(newOptions)
    
    if (quizAnswer === quizOptions[index]) {
      setQuizAnswer(value)
    }
  }

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${fontStyle}`}>
      
      {isCropping && tempImage && (
        <ImageCropper 
          imageSrc={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => { setIsCropping(false); setTempImage(null); }}
        />
      )}

      {/* --- Editor Sidebar --- */}
      <aside className="w-full md:w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto h-screen shadow-lg z-10 font-sans">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          ✏️ แก้ไขข้อมูล
          <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: themeColor }}>
            {project.name}
          </span>
        </h2>

        <form action={handleSubmit} className="space-y-6 pb-20">
          <input type="hidden" name="projectId" value={project.id} />

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">เลือกหมวดหมู่ (Theme)</label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id, cat.color)}
                  className={`py-3 px-2 rounded-xl border-2 transition text-sm font-bold flex items-center justify-center gap-2
                    ${selectedCategory === cat.id 
                      ? 'border-transparent text-white shadow-md transform scale-105' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-gray-50'
                    }
                  `}
                  style={{ backgroundColor: selectedCategory === cat.id ? cat.color : undefined }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* วันครบรอบ */}
          <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
            <label className="block text-sm font-bold text-pink-700 mb-2">📅 วันสำคัญ (เช่น วันครบรอบ)</label>
            <input
              name="anniversaryDate"
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-black bg-white"
            />
            {anniversaryDate && (
               <p className="text-xs text-pink-600 mt-2 font-medium">❤️ คบกันมาแล้ว {daysTogether} วัน</p>
            )}
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">รูปภาพหลัก (Cover)</label>
            <UploadButton onUploadSuccess={handleMainImageUpload} />
            
            {/* Input นี้ต้องมี value เสมอ */}
            <input name="imageUrl" value={imageUrl || ""} readOnly className="hidden" />
            
            {isUploadingCrop && <p className="text-sm text-blue-500 animate-pulse">✂️ กำลังตัดและบันทึกรูป...</p>}
            
            {!isUploadingCrop && imageUrl && (
              <div className="relative w-24 h-24 mt-2 rounded-lg overflow-hidden border">
                <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
            <input
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black"
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" name="useTypingEffect" id="useTypingEffect"
              checked={useTypingEffect} onChange={(e) => setUseTypingEffect(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-pink-500"
            />
            <label htmlFor="useTypingEffect" className="text-sm text-gray-700 font-medium">เปิดเอฟเฟกต์พิมพ์ข้อความ</label>
          </div>

          {/* --- Minigame / Quiz (UPDATED) --- */}
          <div className="border-t border-dashed pt-6 mt-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: themeColor }}>
              🎮 มินิเกม (Quiz)
            </h3>
            <p className="text-xs text-gray-500 mb-4">ให้แฟนเล่นเกมตอบคำถามก่อนถึงจะเห็นเซอร์ไพรส์</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบคำถาม</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuizType('text')}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold ${quizType === 'text' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  📝 พิมพ์ตอบ
                </button>
                <button
                  type="button"
                  onClick={() => setQuizType('date')}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold ${quizType === 'date' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  📅 ทายวันที่
                </button>
                <button
                  type="button"
                  onClick={() => setQuizType('choice')}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold ${quizType === 'choice' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  🔠 ตัวเลือก
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {quizType === 'date' ? 'คำถาม (เช่น เราคบกันวันไหน?)' : 'คำถาม (เช่น เราเจอกันที่ไหน?)'}
              </label>
              <input
                name="quizQuestion"
                type="text"
                placeholder="ตั้งคำถาม..."
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              />
            </div>

            {/* ส่วนเฉลยคำตอบ */}
            {quizQuestion && (
              <div className="mb-4 animate-fade-in-up">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {quizType === 'choice' ? 'กำหนดตัวเลือก (ติ๊กถูกข้อที่ใช่)' : 'เฉลย (คำตอบที่ถูก)'}
                </label>
                
                {quizType === 'date' ? (
                  <input
                    name="quizAnswer"
                    type="date"
                    value={quizAnswer}
                    onChange={(e) => setQuizAnswer(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black bg-green-50"
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  />
                ) : quizType === 'choice' ? (
                  <div className="space-y-2">
                    {quizOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="correctOption"
                          checked={quizAnswer === option && option !== ""}
                          onChange={() => setQuizAnswer(option)}
                          className="w-5 h-5 cursor-pointer accent-green-500"
                          disabled={!option}
                        />
                        <input
                          type="text"
                          placeholder={`ตัวเลือกที่ ${idx + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none text-black text-sm ${quizAnswer === option && option !== "" ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                        />
                      </div>
                    ))}
                    {/* Hidden input to store quizAnswer for form submission */}
                    <input type="hidden" name="quizAnswer" value={quizAnswer} />
                  </div>
                ) : (
                  <input
                    name="quizAnswer"
                    type="text"
                    placeholder="ใส่คำตอบที่ถูกต้อง..."
                    value={quizAnswer}
                    onChange={(e) => setQuizAnswer(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black bg-green-50"
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  />
                )}
              </div>
            )}
          </div>

          {/* Photo Gallery */}
          <div className="border-t border-dashed pt-6 mt-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: themeColor }}>📸 อัลบั้มรูป</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {gallery.map((img, idx) => (
                <div key={idx} className="relative aspect-square group">
                  <img src={img} alt="Gallery" className="w-full h-full object-cover rounded-lg border" />
                  <button type="button" onClick={() => handleRemoveGalleryImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-sm z-10">×</button>
                </div>
              ))}
              <div className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition relative overflow-hidden">
                 <div className="absolute inset-0 opacity-0 cursor-pointer z-10">
                    <UploadButton onUploadSuccess={handleAddGalleryImage} />
                 </div>
                 <span className="text-2xl text-gray-400">+</span>
              </div>
            </div>
          </div>

          {/* Music */}
          <div className="border-t border-dashed pt-6 mt-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: themeColor }}>🎵 เพลงประกอบ</h3>
            <div className="mb-4">
              <input name="bgMusicUrl" type="text" placeholder="YouTube / Spotify URL" value={bgMusicUrl} onChange={(e) => setBgMusicUrl(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black text-sm" style={{ '--tw-ring-color': themeColor } as React.CSSProperties} />
            </div>
            <div className="flex gap-2">
               <input name="musicStart" type="number" placeholder="เริ่ม (วิ)" value={musicStart} onChange={(e) => setMusicStart(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm text-black" />
               <input name="musicEnd" type="number" placeholder="จบ (วิ)" value={musicEnd} onChange={(e) => setMusicEnd(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm text-black" />
            </div>
            {/* Font & Color */}
            <div className="grid grid-cols-2 gap-4 mt-4">
               <div>
                  <label className="text-xs text-gray-500 mb-1 block">สีธีม</label>
                  <input name="themeColor" type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-full h-8 p-1 rounded border cursor-pointer" />
               </div>
               <div>
                  <label className="text-xs text-gray-500 mb-1 block">ฟอนต์</label>
                  <select name="fontStyle" value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} className="w-full h-8 px-2 rounded border text-xs text-black bg-white">
                    <option value="font-sans">ปกติ</option>
                    <option value="font-serif">หรูหรา</option>
                    <option value="font-mono">วินเทจ</option>
                  </select>
               </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending || isUploadingCrop}
            className={`w-full font-bold py-3 rounded-lg shadow-lg transition flex justify-center items-center gap-2 text-white mt-8`}
            style={{ backgroundColor: (isPending || isUploadingCrop) ? '#9ca3af' : themeColor }}
          >
            {(isPending || isUploadingCrop) ? <span className="animate-spin">⏳</span> : '💾 บันทึกข้อมูล'}
          </button>

          <div className="pt-4 border-t text-center">
            <a href={`/p/${project.slug}`} target="_blank" className="hover:underline text-sm font-bold" style={{ color: themeColor }}>👁️ ดูตัวอย่างเว็บจริง</a>
            <div className="mt-2"><a href="/dashboard" className="text-gray-400 hover:text-gray-600 text-xs">&larr; กลับไปแดชบอร์ด</a></div>
          </div>
        </form>
      </aside>

      {/* --- Live Preview --- */}
      <main className="flex-1 flex items-center justify-center p-8 bg-gray-100 hidden md:flex">
        <div className="w-[375px] h-[667px] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800 relative">
          <div className="absolute top-0 w-full h-6 bg-gray-800 flex justify-center z-20"><div className="w-20 h-4 bg-black rounded-b-xl"></div></div>
          
          <div className={`h-full overflow-y-auto p-6 flex flex-col items-center text-center pt-16 relative ${fontStyle}`} style={{ background: `linear-gradient(to bottom right, ${themeColor}20, #ffffff)` }}>
            {anniversaryDate && (
              <div className="text-white px-4 py-1 rounded-full text-xs font-bold shadow-md mb-4 animate-bounce" style={{ backgroundColor: themeColor }}>
                คบกันมา {daysTogether} วัน ❤️
              </div>
            )}
            {imageUrl ? <img src={imageUrl} alt="Fan" className="w-48 h-48 object-cover rounded-2xl border-4 border-white shadow-xl mb-6" /> : <div className="w-48 h-48 bg-gray-200 rounded-2xl flex items-center justify-center mb-6 text-gray-400 text-4xl">🖼️</div>}
            
            <h1 className="text-2xl font-bold mb-2" style={{ color: themeColor }}>{title || "Happy Anniversary"}</h1>
            <p className="text-gray-600 text-sm leading-relaxed">{message || "ข้อความของคุณ..."}</p>

            {quizQuestion && (
              <div className="mt-6 p-4 bg-white/80 rounded-xl border-2 border-dashed w-full text-left" style={{ borderColor: themeColor }}>
                <p className="text-xs font-bold text-gray-500 mb-1">🎮 Minigame Preview:</p>
                <p className="text-sm font-bold text-gray-800 mb-2">Q: {quizQuestion}</p>
                
                {/* Preview ตามประเภทคำถาม */}
                {quizType === 'choice' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {quizOptions.map((opt, i) => (
                      <div key={i} className={`text-xs px-2 py-1.5 rounded border text-center ${opt === quizAnswer ? 'bg-green-100 border-green-300 font-bold text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                        {opt || `ตัวเลือก ${i+1}`}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-8 bg-gray-100 rounded border border-gray-200 flex items-center px-3 text-xs text-gray-400">
                    {quizType === 'date' ? 'DD/MM/YYYY' : 'คำตอบ...'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}