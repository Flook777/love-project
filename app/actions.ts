'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// --- 1. ฟังก์ชันสร้างโปรเจกต์ใหม่ ---
export async function createProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("ต้องเข้าสู่ระบบก่อนนะครับ")
  }

  const projectName = formData.get("projectName") as string
  const templateId = formData.get("templateId") as string || "valentine-theme"

  const slug = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`

  const newProject = await prisma.project.create({
    data: {
      name: projectName,
      slug: slug,
      templateId: templateId,
      userId: session.user.id,
      customData: {}, 
      isPublished: true, 
    },
  })

  redirect(`/editor/${newProject.id}`)
}

// --- 2. ฟังก์ชันอัปเดตข้อมูล (Update Logic) ---
export async function updateProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const projectId = formData.get("projectId") as string
  
  // 1. รับค่าพื้นฐาน
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const imageUrl = formData.get("imageUrl") as string

  // 2. รับค่าลูกเล่น (Features)
  const anniversaryDate = formData.get("anniversaryDate") as string
  const quizQuestion = formData.get("quizQuestion") as string
  const quizAnswer = formData.get("quizAnswer") as string

  // 3. รับค่าธีมและการตกแต่ง (Theme & Customization)
  const themeColor = formData.get("themeColor") as string
  const bgMusicUrl = formData.get("bgMusicUrl") as string
  const fontStyle = formData.get("fontStyle") as string

  // รวมข้อมูลทั้งหมดเป็น JSON
  const customData = {
    title,
    message,
    imageUrl,
    anniversaryDate,
    quizQuestion,
    quizAnswer,
    themeColor,  // บันทึกสีธีม
    bgMusicUrl,  // บันทึกเพลง
    fontStyle    // บันทึกฟอนต์
  }

  // อัปเดตลง Database
  await prisma.project.update({
    where: { 
      id: projectId, 
      userId: session.user.id
    }, 
    data: {
      customData: customData,
    },
  })
  
  // สั่งให้หน้าเว็บอัปเดตทันที
  revalidatePath(`/editor/${projectId}`)
  revalidatePath(`/p/${projectId}`)
}