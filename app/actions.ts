'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache" // สำคัญมาก! ต้องมีตัวนี้

// --- 1. ฟังก์ชันสร้างโปรเจกต์ใหม่ ---
export async function createProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("ต้องเข้าสู่ระบบก่อนนะครับ")
  }

  const projectName = formData.get("projectName") as string
  // ถ้า templateId ไม่ได้เลือก ให้ใช้ default
  const templateId = (formData.get("templateId") as string) || "valentine-theme"

  if (!projectName) {
    throw new Error("กรุณาใส่ชื่อโปรเจกต์")
  }

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

  // สั่งให้หน้า Dashboard อัปเดตข้อมูลใหม่ทันที
  revalidatePath('/dashboard')
  
  redirect(`/editor/${newProject.id}`)
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
  const quizType = formData.get("quizType") as string
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

  // Quizzes (NEW: รับเป็น Array)
  const quizzesJson = formData.get("quizzes") as string
  let quizzes = []
  try {
    quizzes = quizzesJson ? JSON.parse(quizzesJson) : []
  } catch (e) {
    quizzes = []
  }

  // Quiz Options (Legacy support for single quiz)
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
    quizOptions,
    useTypingEffect,
    themeColor,
    bgMusicUrl,
    fontStyle,
    musicStart,
    musicEnd,
    gallery,
    quizzes
  }

  try {
    // อัปเดตข้อมูลลง DB
    const updatedProject = await prisma.project.update({
      where: { 
        id: projectId, 
        userId: session.user.id
      }, 
      data: {
        customData: customData,
      },
    })
    console.log("✅ Project updated:", projectId)
    
    // 🔥 บรรทัดสำคัญที่สุด: สั่งให้หน้าเว็บรีเฟรชข้อมูลใหม่
    revalidatePath(`/editor/${projectId}`)  // รีเฟรชหน้า Editor
    revalidatePath(`/p/${updatedProject.slug}`) // รีเฟรชหน้าเว็บจริง (Public Page)
    
  } catch (error) {
    console.error("❌ Failed to update project:", error)
    throw error
  }
}