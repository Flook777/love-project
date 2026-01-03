import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

// หน้านี้รับค่า slug จาก URL (เช่น /p/love-you-3000)
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // 1. ค้นหาโปรเจกต์จาก Slug (ไม่ต้องเช็ค User ID เพราะใครก็ดูได้)
  const project = await prisma.project.findUnique({
    where: { slug: slug }
  })

  // ถ้าหาไม่เจอ ให้ขึ้นหน้า 404
  if (!project) notFound()

  // ดึงข้อมูล JSON ออกมา
  const data = project.customData as any || {}

  // เลือก Theme ในการแสดงผล (เผื่ออนาคตมีหลายธีม)
  const theme = project.templateId || "valentine"

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* Background Effect (หัวใจลอย) - เดี๋ยวค่อยใส่เพิ่ม */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {/* ใส่ CSS Animation ทีหลัง */}
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-4 border-white relative z-10 animate-fade-in-up">
        
        {/* ส่วนรูปภาพ */}
        <div className="relative h-80 bg-gray-200">
          {data.imageUrl ? (
            <img 
              src={data.imageUrl} 
              alt="Our Memory" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              ไม่มีรูปภาพ
            </div>
          )}
          {/* Gradient บังแดดด้านล่างรูป */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* ส่วนข้อความ */}
        <div className="p-8 text-center -mt-10 relative">
          <div className="inline-block bg-white p-2 rounded-full shadow-lg mb-4">
            <span className="text-4xl">❤️</span>
          </div>
          
          <h1 className="text-3xl font-bold text-pink-600 mb-4 font-serif">
            {data.title || "Happy Anniversary"}
          </h1>
          
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
            {data.message || "ขอบคุณที่อยู่เคียงข้างกันนะ..."}
          </p>

          <div className="mt-8 text-sm text-gray-400">
            Created with Love Project 💖
          </div>
        </div>
      </div>
    </div>
  )
}
