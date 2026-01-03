'use client'

import { useState } from 'react'
import UploadButton from '@/components/UploadButton' // เรียกปุ่มที่เราเพิ่งสร้าง

// รับข้อมูล Project และ ID ของธีมมา
export default function EditorForm({ project, updateProjectAction }: { project: any, updateProjectAction: any }) {
  // State สำหรับเก็บ URL รูปภาพ (เพื่อให้มันเปลี่ยนทันทีที่อัปโหลดเสร็จ)
  const [imageUrl, setImageUrl] = useState(project.customData?.imageUrl || "")
  const [title, setTitle] = useState(project.customData?.title || "")
  const [message, setMessage] = useState(project.customData?.message || "")

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      
      {/* --- ส่วนที่ 1: Form แก้ไข (Client Side) --- */}
      <aside className="w-full md:w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto h-screen shadow-lg z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          ✏️ แก้ไขข้อมูล
          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
            {project.name}
          </span>
        </h2>

        <form action={updateProjectAction} className="space-y-6">
          <input type="hidden" name="projectId" value={project.id} />

          {/* ปุ่มอัปโหลด */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">รูปภาพหลัก</label>
            <UploadButton onUploadSuccess={(result: any) => {
                // เมื่ออัปโหลดเสร็จ ให้เซ็ต URL ลงใน State ทันที
                const secureUrl = result?.info?.secure_url;
                if (secureUrl) setImageUrl(secureUrl);
            }} />
            
            {/* Input ซ่อนไว้ (หรือโชว์ก็ได้) เพื่อส่งค่า URL ไป Server Action */}
            <input 
              name="imageUrl" 
              value={imageUrl} // ผูกค่ากับ State
              readOnly
              className="w-full px-3 py-2 border rounded-md text-xs text-gray-500 bg-gray-100"
              placeholder="URL รูปภาพจะปรากฏอัตโนมัติ"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
            <input
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none text-black"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความ</label>
            <textarea
              name="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none text-black"
            />
          </div>

          <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg shadow-lg">
            💾 บันทึกข้อมูล
          </button>
        </form>
      </aside>

      {/* --- ส่วนที่ 2: Live Preview (Client Side เพื่อให้เห็นการเปลี่ยนแปลงทันที) --- */}
      <main className="flex-1 flex items-center justify-center p-8 bg-gray-100">
        <div className="w-[375px] h-[667px] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800 relative">
          <div className="absolute top-0 w-full h-6 bg-gray-800 flex justify-center z-20"><div className="w-20 h-4 bg-black rounded-b-xl"></div></div>
          
          <div className="h-full overflow-y-auto bg-pink-50 p-6 flex flex-col items-center text-center pt-12">
            {imageUrl ? (
              <img src={imageUrl} alt="Fan" className="w-48 h-48 object-cover rounded-full border-4 border-white shadow-lg mb-6 animate-pulse" />
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-gray-400">(รอรูปภาพ...)</div>
            )}
            <h1 className="text-2xl font-bold text-pink-600 mb-2 text-black">{title || "Happy Anniversary"}</h1>
            <p className="text-gray-600 leading-relaxed text-black">{message || "ข้อความของคุณ..."}</p>
          </div>
        </div>
      </main>
    </div>
  )
}