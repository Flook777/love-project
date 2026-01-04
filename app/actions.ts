'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// --- 1. ฟังก์ชันสร้างโปรเจกต์ใหม่ ---
export async function createProject(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    const projectName = formData.get("projectName") as string
    // ถ้า templateId ไม่ได้เลือก ให้ใช้ default
    const templateId = (formData.get("templateId") as string) || "valentine-theme"

    if (!projectName) {
      throw new Error("Project name is required")
    }

    // สร้าง Slug แบบสุ่ม
    const slug = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`

    // บันทึกลง Database
    const newProject = await prisma.project.create({
      data: {
        name: projectName,
        slug: slug,
        templateId: templateId,
        userId: session.user.id,
        customData: {}, // เริ่มต้นเป็น object ว่าง
        isPublished: true, // ให้เป็น true ไปเลยจะได้ดูได้ทันที
      },
    })

    console.log("✅ Project created:", newProject.id)
  } catch (error) {
    console.error("❌ Failed to create project:", error)
    // ใน Server Action ถ้า throw error หน้าเว็บจะรู้ว่าผิดพลาด
    throw error
  }

  // Redirect ต้องอยู่นอก try-catch เพราะมันทำงานโดยการ throw error พิเศษของ Next.js
  // แต่ในกรณีนี้เราจะใช้ redirect ใน try ไม่ได้เพราะ prisma.project.create เป็น async
  // ดังนั้นวิธีที่ถูกคือ: ดึง id ออกมาแล้วค่อย redirect
  // แต่เพื่อให้ง่าย ใช้ท่ามาตรฐานคือ redirect ข้างล่างสุด (แต่ต้องระวังเรื่อง scope ตัวแปร)
  
  // *วิธีแก้ที่ชัวร์ที่สุด:*
  // ดึง project ล่าสุดของ user นี้แล้ว redirect ไป
  const session = await auth()
  if (session?.user?.id) {
      const latestProject = await prisma.project.findFirst({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' }
      })
      if (latestProject) {
          redirect(`/editor/${latestProject.id}`)
      }
  }
  
  // ถ้าหาไม่เจอจริงๆ ให้กลับไปหน้า Dashboard
  redirect("/dashboard")
}

// --- 2. ฟังก์ชันอัปเดตข้อมูล ---
export async function updateProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const projectId = formData.get("projectId") as string
  
  if (!projectId) {
      console.error("❌ Missing Project ID")
      return
  }

  // ข้อมูลทั่วไป
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const imageUrl = formData.get("imageUrl") as string
  
  // ข้อมูลลูกเล่น (Game & Features)
  const anniversaryDate = formData.get("anniversaryDate") as string
  const quizQuestion = formData.get("quizQuestion") as string
  const quizAnswer = formData.get("quizAnswer") as string
  const quizType = formData.get("quizType") as string // <--- เพิ่ม: ประเภทคำถาม (text/date)
  const useTypingEffect = formData.get("useTypingEffect") === "on"
  
  // ข้อมูลธีม
  const themeColor = formData.get("themeColor") as string
  const fontStyle = formData.get("fontStyle") as string
  const bgMusicUrl = formData.get("bgMusicUrl") as string
  const musicStart = formData.get("musicStart") as string
  const musicEnd = formData.get("musicEnd") as string
  
  // Gallery
  const galleryJson = formData.get("gallery") as string
  let gallery = []
  try {
    gallery = galleryJson ? JSON.parse(galleryJson) : []
  } catch (e) {
    gallery = []
  }
  // Quiz Options (เพิ่มใหม่)
  const quizOptionsJson = formData.get("quizOptions") as string
  let quizOptions = ["", "", "", ""]
  try {
    quizOptions = quizOptionsJson ? JSON.parse(quizOptionsJson) : ["", "", "", ""]
  } catch (e) {
    quizOptions = ["", "", "", ""]
  }


  const customData = {
    title,
    message,
    imageUrl,
    anniversaryDate,
    quizQuestion,
    quizAnswer,
    quizType, 
    quizOptions, // บันทึกตัวเลือก
    useTypingEffect,
    themeColor,
    bgMusicUrl,
    fontStyle,
    musicStart,
    musicEnd,
    gallery
  }

  try {
    await prisma.project.update({
      where: { 
        id: projectId, 
        userId: session.user.id
      }, 
      data: {
        customData: customData,
      },
    })
    console.log("✅ Project updated:", projectId)
  } catch (error) {
    console.error("❌ Failed to update project:", error)
    throw error
  }
  
  revalidatePath(`/editor/${projectId}`)
  revalidatePath(`/p/${projectId}`)
}