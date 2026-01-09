import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import InteractiveView from "./InteractiveView"

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // 🔥 แก้ไขสำคัญ: ถอดรหัส URL (เช่น ภาษาไทย %E0%B8%...) ให้เป็นตัวหนังสือปกติ
  const decodedSlug = decodeURIComponent(slug)

  console.log(`🔍 Checking Project: ${slug} -> ${decodedSlug}`)

  const project = await prisma.project.findUnique({
    where: { slug: decodedSlug }
  })

  // ถ้าหาไม่เจอจริงๆ ให้ลองหาแบบไม่ต้อง decode (เผื่อบางเคส)
  if (!project) {
     const fallbackProject = await prisma.project.findUnique({
        where: { slug: slug }
     })
     
     if (!fallbackProject) {
        console.error("❌ Project Not Found:", decodedSlug)
        return notFound()
     }
     
     // ถ้าเจอใน fallback ก็ใช้ตัวนี้แทน
     return renderProject(fallbackProject)
  }

  return renderProject(project)
}

function renderProject(project: any) {
  // --- ส่วนที่ 1: Lock Screen ---
  if (!project.isPublished) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="text-6xl animate-pulse">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">เว็บไซต์นี้ถูกล็อคอยู่</h1>
          <Link 
             href="/dashboard"
             className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            กลับไปที่ Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // --- ส่วนที่ 2: ส่งข้อมูลไปหน้าเว็บจริง ---
  const data = project.customData as any || {}
  
  return <InteractiveView data={data} />
}