import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { updateProject } from "@/app/actions"
import { CldUploadButton } from 'next-cloudinary';

// ใน Next.js 15+ params ต้องเป็น Promise ครับ
export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/")

  // ต้อง await params ก่อนดึงค่า id
  const { id } = await params

  // 1. ดึงข้อมูลโปรเจกต์จาก Database
  const project = await prisma.project.findUnique({
    where: { 
      id: id,
      userId: session.user?.id // ป้องกันไม่ให้แก้ของคนอื่น
    }
  })

  // ถ้าหาไม่เจอ หรือไม่ใช่เจ้าของ ดีดกลับ Dashboard
  if (!project) redirect("/dashboard")

  // แปลงข้อมูล JSON ที่เก็บไว้ กลับมาเป็น Object เพื่อแสดงผล
  const data = project.customData as any || {}

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* --- ส่วนที่ 1: แถบเครื่องมือแก้ไข (ซ้ายมือ) --- */}
      <aside className="w-full md:w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto h-screen shadow-lg z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          ✏️ แก้ไขข้อมูล
          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
            {project.name}
          </span>
        </h2>

        <form action={updateProject} className="space-y-6">
          {/* ส่ง ID โปรเจกต์ไปด้วย (แบบซ่อน) */}
          <input type="hidden" name="projectId" value={project.id} />

          {/* 1. อัปโหลดรูปภาพ */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">รูปภาพหลัก (รูปคู่/รูปแฟน)</label>
            
            {/* ปุ่มอัปโหลดจาก Cloudinary */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition">
              <CldUploadButton 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{ sources: ['local', 'url'], multiple: false }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                📸 อัปโหลดรูปภาพ
              </CldUploadButton>
            </div>

            {/* ช่องกรอก URL รูป (จะถูกใส่ค่าอัตโนมัติ จริงๆ ต้องใช้ Client Component ช่วยจัดการ State แต่เฟสแรกให้ User ก๊อปมาวางก่อน หรือทำระบบ Auto ใน Phase ถัดไป) */}
            {/* หมายเหตุ: เพื่อความง่ายในเฟสแรก เราจะให้ User กด Save 1 ทีหลังจากอัปโหลดเสร็จ เพื่อเห็นผลลัพธ์ */}
            <input 
              name="imageUrl" 
              defaultValue={data.imageUrl || ""} 
              placeholder="URL รูปภาพจะปรากฏที่นี่หลังอัปโหลด (หรือใส่เองก็ได้)"
              className="w-full px-3 py-2 border rounded-md text-xs text-gray-500 bg-gray-100"
            />
            <p className="text-xs text-red-400">*หมายเหตุ: ระบบรับค่า URL รูปภาพอัตโนมัติใน Phase หน้า (ตอนนี้ให้ Copy Link มาใส่ก่อน หรือพิมพ์เทสได้)</p>
          </div>

          {/* 2. แก้ไขข้อความ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ (Title)</label>
            <input
              name="title"
              type="text"
              defaultValue={data.title || "Happy Anniversary"}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความในใจ (Message)</label>
            <textarea
              name="message"
              rows={4}
              defaultValue={data.message || "ขอบคุณที่อยู่เคียงข้างกันนะ..."}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg shadow-lg transition transform active:scale-95"
          >
            💾 บันทึกข้อมูล
          </button>
          
          <div className="pt-4 border-t">
            <a href={`/preview/${project.slug}`} target="_blank" className="block text-center w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
              👁️ ดูตัวอย่างเว็บจริง
            </a>
            <a href="/dashboard" className="block text-center mt-2 text-sm text-gray-400 hover:text-gray-600">
              &larr; กลับไปแดชบอร์ด
            </a>
          </div>
        </form>
      </aside>

      {/* --- ส่วนที่ 2: พื้นที่แสดงผลตัวอย่าง (Live Preview) --- */}
      <main className="flex-1 flex items-center justify-center p-8 bg-gray-100">
        <div className="w-[375px] h-[667px] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800 relative">
          {/* จำลองหน้าจอมือถือ */}
          <div className="absolute top-0 w-full h-6 bg-gray-800 flex justify-center z-20">
             <div className="w-20 h-4 bg-black rounded-b-xl"></div>
          </div>
          
          {/* เนื้อหาเว็บที่จะแสดงจริง */}
          <div className="h-full overflow-y-auto bg-pink-50 p-6 flex flex-col items-center text-center pt-12">
            
            {/* แสดงรูปภาพ */}
            {data.imageUrl ? (
              <img src={data.imageUrl} alt="Fan" className="w-48 h-48 object-cover rounded-full border-4 border-white shadow-lg mb-6 animate-pulse" />
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-gray-400">
                (ยังไม่มีรูป)
              </div>
            )}

            {/* แสดงข้อความ */}
            <h1 className="text-2xl font-bold text-pink-600 mb-2 text-black">{data.title || "Happy Anniversary"}</h1>
            <p className="text-gray-600 leading-relaxed text-black">
              {data.message || "ขอบคุณที่อยู่เคียงข้างกันนะ..."}
            </p>

          </div>
        </div>
      </main>

    </div>
  )
}
