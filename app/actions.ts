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
  const templateId = (formData.get("templateId") as string) || "valentine-theme"

  if (!projectName) {
    throw new Error("กรุณาใส่ชื่อโปรเจกต์")
  }

  // 🔥 Logic สร้าง Slug ที่ปลอดภัย 100%
  // 1. เก็บเฉพาะตัวอักษรไทย, อังกฤษ, ตัวเลข
  const cleanName = projectName.trim().toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F ]/g, "")
  // 2. เปลี่ยนช่องว่างเป็นขีด
  const safeName = cleanName.replace(/\s+/g, "-")
  // 3. เติมเลขสุ่มกันซ้ำ
  const randomSuffix = Math.floor(Math.random() * 10000)
  
  // ถ้าชื่อหายหมด (เช่นใส่แต่ ???) ให้ใช้ชื่อ default
  const slug = safeName.length > 0 
    ? `${safeName}-${randomSuffix}` 
    : `love-project-${randomSuffix}`

  const newProject = await prisma.project.create({
    data: {
      name: projectName, // ชื่อจริง (โชว์ในเว็บ)
      slug: slug,        // ชื่อใน URL (ปลอดภัย)
      templateId: templateId,
      userId: session.user.id,
      customData: {}, 
      isPublished: true, 
    },
  })

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
  
  // ข้อมูลลูกเล่น
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

  // Quizzes
  const quizzesJson = formData.get("quizzes") as string
  let quizzes = []
  try {
    quizzes = quizzesJson ? JSON.parse(quizzesJson) : []
  } catch (e) {
    quizzes = []
  }

  // Quiz Options
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
    
    revalidatePath(`/editor/${projectId}`)
    // รีเฟรชหน้าเว็บจริงด้วย Slug ที่ถูกต้อง
    revalidatePath(`/p/${updatedProject.slug}`) 
    
  } catch (error) {
    console.error("❌ Failed to update project:", error)
    throw error
  }
}