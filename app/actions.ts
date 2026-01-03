'use server' // บรรทัดนี้สำคัญมาก! บอกว่าเป็น Server Code ห้ามรันบน Browser

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createProject(formData: FormData) {
  // 1. เช็คว่า Login หรือยัง
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("ต้องเข้าสู่ระบบก่อนนะครับ")
  }

  // 2. รับค่าจากฟอร์ม
  const projectName = formData.get("projectName") as string
  const templateId = formData.get("templateId") as string || "valentine-theme" // Default ไว้ก่อน

  // 3. สร้าง URL เท่ๆ (Slug)
  // เช่น project-name-1234 (สุ่มเลขต่อท้ายกันซ้ำ)
  const slug = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`

  // 4. บันทึกลง Database
  const newProject = await prisma.project.create({
    data: {
      name: projectName,
      slug: slug,
      templateId: templateId,
      userId: session.user.id,
      customData: {}, // ยังไม่มีข้อมูลแก้ไข ใส่ว่างๆ ไว้ก่อน
    },
  })

  // 5. สร้างเสร็จแล้ว ดีดไปหน้า Editor (เดี๋ยวเราค่อยสร้างหน้านี้)
  redirect(`/editor/${newProject.id}`)
}
