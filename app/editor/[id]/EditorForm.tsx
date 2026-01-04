'use client'

import { useState, useTransition, ChangeEvent } from 'react'
import ImageCropper from '@/components/ImageCropper'

// --- Helper Functions ---
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// ใช้ฟังก์ชันนี้ถ้าต้องการอัปโหลดขึ้น Cloudinary (ต้องตั้งค่า Preset เป็น Unsigned)
const uploadToCloudinary = async (blob: Blob) => {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!uploadPreset || !cloudName) throw new Error("Missing Cloudinary Config")

  const base64Data = await blobToBase64(blob);
  const formData = new FormData()
  formData.append('file', base64Data)
  formData.append('upload_preset', uploadPreset)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )
  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || "Upload failed")
  return data.secure_url
}

const CATEGORIES = [
  { id: 'valentine', label: 'วาเลนไทน์ 🌹', color: '#ec4899' },
  { id: 'birthday', label: 'วันเกิด 🎂', color: '#f59e0b' },
  { id: 'anniversary', label: 'วันครบรอบ 💍', color: '#8b5cf6' },
  { id: 'apology', label: 'ขอโทษ 🥺', color: '#3b82f6' },
]

// Updated Quiz Interface with Explanation fields
interface QuizItem {
  id: string;
  type: 'text' | 'date' | 'choice';
  question: string;
  answer: string;
  options: string[];
  explanationImage?: string; // รูปเฉลย/รางวัล
  explanationText?: string;  // ข้อความเฉลย/รางวัล
}

export default function EditorForm({ project, updateProjectAction }: { project: any, updateProjectAction: any }) {
  // --- State ---
  const [imageUrl, setImageUrl] = useState(project.customData?.imageUrl || "") 
  const [title, setTitle] = useState(project.customData?.title || "")
  const [message, setMessage] = useState(project.customData?.message || "")
  const [selectedCategory, setSelectedCategory] = useState(project.templateId || 'valentine')
  const [anniversaryDate, setAnniversaryDate] = useState(project.customData?.anniversaryDate || "")
  const [useTypingEffect, setUseTypingEffect] = useState(project.customData?.useTypingEffect || false)
  const [themeColor, setThemeColor] = useState(project.customData?.themeColor || "#ec4899")
  const [bgMusicUrl, setBgMusicUrl] = useState(project.customData?.bgMusicUrl || "")
  const [fontStyle, setFontStyle] = useState(project.customData?.fontStyle || "font-sans")
  const [musicStart, setMusicStart] = useState(project.customData?.musicStart || "0")
  const [musicEnd, setMusicEnd] = useState(project.customData?.musicEnd || "")
  const [gallery, setGallery] = useState<string[]>(project.customData?.gallery || [])
  
  // Quiz State
  const [quizzes, setQuizzes] = useState<QuizItem[]>(project.customData?.quizzes || [])

  // Cropper State
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [croppingTarget, setCroppingTarget] = useState<'main' | 'quiz'>('main') // ระบุว่ากำลัง Crop รูปไหน (main หรือ quiz)
  const [currentQuizIndexForCrop, setCurrentQuizIndexForCrop] = useState<number | null>(null) // เก็บ index ของ quiz ที่กำลังอัปรูป

  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)

  const daysTogether = anniversaryDate 
    ? Math.floor((new Date().getTime() - new Date(anniversaryDate).getTime()) / (1000 * 3600 * 24)) 
    : 0

  // --- Quiz Handlers ---
  const addQuiz = () => {
    setQuizzes([...quizzes, { 
      id: Date.now().toString(), 
      type: 'text', 
      question: '', 
      answer: '', 
      options: ['', '', '', ''],
      explanationImage: '',
      explanationText: ''
    }])
  }

  const removeQuiz = (index: number) => {
    setQuizzes(quizzes.filter((_, i) => i !== index))
  }

  const updateQuiz = (index: number, field: keyof QuizItem, value: any) => {
    const newQuizzes = [...quizzes]
    newQuizzes[index] = { ...newQuizzes[index], [field]: value }
    setQuizzes(newQuizzes)
  }

  const updateQuizOption = (quizIndex: number, optionIndex: number, value: string) => {
    const newQuizzes = [...quizzes]
    const newOptions = [...newQuizzes[quizIndex].options]
    newOptions[optionIndex] = value
    newQuizzes[quizIndex].options = newOptions
    if (newQuizzes[quizIndex].answer === quizzes[quizIndex].options[optionIndex]) {
      newQuizzes[quizIndex].answer = value
    }
    setQuizzes(newQuizzes)
  }

  // --- Image Handlers ---
  const handleMainImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setTempImage(base64);
      setCroppingTarget('main');
      setIsCropping(true);
    }
  }

  const handleQuizImageChange = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setTempImage(base64);
      setCroppingTarget('quiz');
      setCurrentQuizIndexForCrop(index);
      setIsCropping(true);
    }
  }

  const handleCropComplete = async (blob: Blob) => {
    setIsCropping(false)
    setIsUploading(true)
    try {
      // ใช้วิธีอัปโหลดไป Cloudinary เพื่อความเสถียรและ URL ที่ถาวร
      const newUrl = await uploadToCloudinary(blob)
      
      if (croppingTarget === 'main') {
        setImageUrl(newUrl)
      } else if (croppingTarget === 'quiz' && currentQuizIndexForCrop !== null) {
        updateQuiz(currentQuizIndexForCrop, 'explanationImage', newUrl)
      }

    } catch (error) {
      alert(`อัปโหลดรูปไม่สำเร็จ: ${(error as Error).message}`)
    } finally {
      setIsUploading(false)
      setTempImage(null)
      setCurrentQuizIndexForCrop(null)
    }
  }

  const handleAddGalleryImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      try {
        const newUrl = await uploadToCloudinary(file) // Gallery ไม่ต้อง Crop เพื่อความไว
        setGallery(prev => [...prev, newUrl])
      } catch (error) {
        alert(`อัปโหลดรูป Gallery ไม่สำเร็จ: ${(error as Error).message}`)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index))
  }

  const handleSelectCategory = (catId: string, color: string) => {
    setSelectedCategory(catId)
    setThemeColor(color)
  }

  const handleSubmit = (formData: FormData) => {
    formData.append('gallery', JSON.stringify(gallery))
    formData.append('quizzes', JSON.stringify(quizzes))
    formData.set('imageUrl', imageUrl || "")
    if(useTypingEffect) formData.set('useTypingEffect', 'on')
    formData.set('themeColor', themeColor) 

    startTransition(async () => {
      try {
        await updateProjectAction(formData)
        alert("✅ บันทึกข้อมูลเรียบร้อยแล้วครับ!")
      } catch (error) {
        console.error("Save Error:", error)
        alert("❌ เกิดข้อผิดพลาดในการบันทึก")
      }
    })
  }

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${fontStyle}`}>
      
      {/* Cropper Modal */}
      {isCropping && tempImage && (
        <ImageCropper 
          imageSrc={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => { setIsCropping(false); setTempImage(null); }}
        />
      )}

      {/* --- Sidebar Editor --- */}
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
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleMainImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-gray-500 font-medium">📸 คลิกเพื่อเลือกรูปภาพ</div>
            </div>
            
            {isUploading && croppingTarget === 'main' && <p className="text-sm text-blue-500 animate-pulse">✂️ กำลังอัปโหลด...</p>}
            
            {imageUrl && (
              <div className="relative w-24 h-24 mt-2 rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm group">
                <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><p className="text-white text-xs">รูปปัจจุบัน</p></div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
              <input name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black" style={{ '--tw-ring-color': themeColor } as React.CSSProperties} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความในใจ</label>
              <textarea name="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none text-black" style={{ '--tw-ring-color': themeColor } as React.CSSProperties} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={useTypingEffect} onChange={(e) => setUseTypingEffect(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-pink-500" />
              <label className="text-sm text-gray-700 font-medium">เปิดเอฟเฟกต์พิมพ์ข้อความ</label>
            </div>
          </div>

          {/* --- Multi-Quiz Editor (UPDATED) --- */}
          <div className="border-t border-dashed pt-6 mt-6">
            <h3 className="font-bold mb-4 flex items-center justify-between" style={{ color: themeColor }}>
              <span className="flex items-center gap-2">🎮 เกมตอบคำถาม ({quizzes.length})</span>
              <button type="button" onClick={addQuiz} className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg border hover:bg-gray-200 text-black">
                + เพิ่มข้อ
              </button>
            </h3>
            
            <div className="space-y-6">
              {quizzes.map((quiz, idx) => (
                <div key={quiz.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                  <button type="button" onClick={() => removeQuiz(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg">×</button>
                  <span className="text-xs font-bold text-gray-400 mb-2 block">ข้อที่ {idx + 1}</span>
                  
                  {/* Question Type */}
                  <div className="flex gap-2 mb-3">
                    {['text', 'date', 'choice'].map(type => (
                      <button 
                        key={type} 
                        type="button"
                        onClick={() => updateQuiz(idx, 'type', type)}
                        className={`flex-1 text-xs py-1.5 rounded border ${quiz.type === type ? 'bg-white shadow-sm border-gray-300 font-bold' : 'text-gray-500 border-transparent hover:bg-gray-100'}`}
                      >
                        {type === 'text' ? 'พิมพ์ตอบ' : type === 'date' ? 'วันที่' : 'ตัวเลือก'}
                      </button>
                    ))}
                  </div>

                  {/* Question Input */}
                  <input
                    type="text"
                    placeholder="ตั้งคำถาม..."
                    value={quiz.question}
                    onChange={(e) => updateQuiz(idx, 'question', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-3 outline-none focus:border-pink-400 text-black"
                  />

                  {/* Answer Input */}
                  {quiz.type === 'choice' ? (
                    <div className="space-y-2 pl-2 border-l-2 border-gray-200 mb-4">
                      {quiz.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`correct-${quiz.id}`}
                            checked={quiz.answer === opt && opt !== ""}
                            onChange={() => updateQuiz(idx, 'answer', opt)}
                            className="w-4 h-4 cursor-pointer"
                            disabled={!opt}
                          />
                          <input
                            type="text"
                            placeholder={`ตัวเลือกที่ ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) => updateQuizOption(idx, optIdx, e.target.value)}
                            className={`flex-1 px-2 py-1.5 rounded border text-xs outline-none text-black ${quiz.answer === opt && opt !== "" ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : quiz.type === 'date' ? (
                    <input
                      type="date"
                      value={quiz.answer}
                      onChange={(e) => updateQuiz(idx, 'answer', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-green-200 bg-green-50 text-sm text-black outline-none mb-4"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="ใส่คำตอบที่ถูกต้อง..."
                      value={quiz.answer}
                      onChange={(e) => updateQuiz(idx, 'answer', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-green-200 bg-green-50 text-sm text-black outline-none mb-4"
                    />
                  )}

                  {/* --- Explanation Section (รางวัลตอนตอบถูก) --- */}
                  <div className="bg-white p-3 rounded-lg border border-pink-100">
                    <p className="text-xs font-bold text-pink-500 mb-2">🎁 รางวัลเมื่อตอบถูก (Optional)</p>
                    
                    {/* Image Upload */}
                    <div className="flex items-center gap-3 mb-2">
                       {quiz.explanationImage ? (
                         <div className="relative w-12 h-12 rounded border overflow-hidden shrink-0 group">
                           <img src={quiz.explanationImage} className="w-full h-full object-cover" alt="Reward" />
                           <button type="button" onClick={() => updateQuiz(idx, 'explanationImage', "")} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs">ลบ</button>
                         </div>
                       ) : (
                         <div className="w-12 h-12 rounded border-2 border-dashed flex items-center justify-center bg-gray-50 text-gray-400 shrink-0 relative">
                           <span className="text-xs">รูป</span>
                           <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleQuizImageChange(e, idx)} />
                         </div>
                       )}
                       
                       <input 
                         type="text"
                         placeholder="ข้อความหวานๆ (เช่น เก่งมากที่รัก!)"
                         value={quiz.explanationText || ""}
                         onChange={(e) => updateQuiz(idx, 'explanationText', e.target.value)}
                         className="flex-1 px-3 py-2 border rounded text-xs outline-none text-black"
                       />
                    </div>
                  </div>

                </div>
              ))}
              
              {quizzes.length === 0 && (
                <div className="text-center p-6 border-2 border-dashed rounded-xl text-gray-400 text-sm cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition" onClick={addQuiz}>
                  + คลิกเพื่อสร้างเกมทายใจ
                </div>
              )}
            </div>
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
                 <input type="file" accept="image/*" onChange={handleAddGalleryImage} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
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
            disabled={isPending || isUploading}
            className={`w-full font-bold py-3 rounded-lg shadow-lg transition flex justify-center items-center gap-2 text-white mt-8`}
            style={{ backgroundColor: (isPending || isUploading) ? '#9ca3af' : themeColor }}
          >
            {(isPending || isUploading) ? <span className="animate-spin">⏳</span> : '💾 บันทึกข้อมูล'}
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

            {/* Quiz Preview */}
            {quizzes.length > 0 && (
              <div className="mt-6 p-4 bg-white/80 rounded-xl border-2 border-dashed w-full text-left relative" style={{ borderColor: themeColor }}>
                <div className="flex justify-between items-center mb-2">
                   <p className="text-xs font-bold text-gray-500">🎮 Quiz Preview ({quizzes.length} ข้อ)</p>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-2">Q1: {quizzes[0].question || "คำถาม..."}</p>
                
                {quizzes[0].type === 'choice' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {quizzes[0].options.slice(0,2).map((opt, i) => (
                      <div key={i} className="text-xs px-2 py-1.5 rounded border text-center bg-white border-gray-200 text-gray-500">{opt || `ตัวเลือก ${i+1}`}</div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-8 bg-gray-100 rounded border border-gray-200 flex items-center px-3 text-xs text-gray-400">คำตอบ...</div>
                )}

                {/* Show if explanation is set */}
                {(quizzes[0].explanationImage || quizzes[0].explanationText) && (
                   <div className="mt-3 pt-2 border-t border-gray-200 flex items-center gap-2">
                      <span className="text-xs text-pink-500 font-bold">🎁 มีรางวัล</span>
                      {quizzes[0].explanationImage && <span className="text-xs bg-gray-100 px-1 rounded">🖼️ รูป</span>}
                      {quizzes[0].explanationText && <span className="text-xs bg-gray-100 px-1 rounded">📝 ข้อความ</span>}
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