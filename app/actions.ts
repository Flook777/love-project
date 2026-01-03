'use server' // บรรทัดนี้สำคัญมาก! บอกว่าเป็น Server Code ห้ามรันบน Browser

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

// --- 1. ฟังก์ชันสร้างโปรเจกต์ใหม่ (เดิม) ---
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

  // 5. สร้างเสร็จแล้ว ดีดไปหน้า Editor
  redirect(`/editor/${newProject.id}`)
}

// --- 2. ฟังก์ชันอัปเดตข้อมูลและรูปภาพ (เพิ่มใหม่) ---
export async function updateProject(formData: FormData) {
  const session = await auth()
  // ต้อง Login และมี ID ถึงจะแก้ได้
  if (!session?.user?.id) throw new Error("Unauthorized")

  const projectId = formData.get("projectId") as string
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const imageUrl = formData.get("imageUrl") as string // รับ URL รูปภาพที่อัปโหลดแล้ว

  // เตรียมข้อมูล JSON ที่จะเก็บ (รวมรูปภาพด้วย)
  const customData = {
    title,
    message,
    imageUrl
  }

  // อัปเดตลง Database
  await prisma.project.update({
    where: { 
      id: projectId, 
      userId: session.user.id // Security: ต้องเป็นเจ้าของเท่านั้นถึงแก้ได้
    }, 
    data: {
      customData: customData, // อัปเดต JSON ก้อนใหม่เข้าไป
    },
  })
  
  // รีเฟรชหน้าเว็บเพื่อให้เห็นข้อมูลใหม่
  redirect(`/editor/${projectId}`)
}