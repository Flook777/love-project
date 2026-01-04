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

// --- 2. ฟังก์ชันอัปเดตข้อมูล ---
export async function updateProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const projectId = formData.get("projectId") as string
  
  // ข้อมูลทั่วไป
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const imageUrl = formData.get("imageUrl") as string
  
  // ข้อมูลลูกเล่น (Features)
  const anniversaryDate = formData.get("anniversaryDate") as string
  const useTypingEffect = formData.get("useTypingEffect") === "on"
  
  // ข้อมูลธีม & เพลง
  const themeColor = formData.get("themeColor") as string
  const fontStyle = formData.get("fontStyle") as string
  const bgMusicUrl = formData.get("bgMusicUrl") as string
  const musicStart = formData.get("musicStart") as string
  const musicEnd = formData.get("musicEnd") as string
  
  // Gallery
  const galleryJson = formData.get("gallery") as string
  let gallery = []
  try { gallery = galleryJson ? JSON.parse(galleryJson) : [] } catch (e) { gallery = [] }

  // --- Quizzes (NEW: รับเป็น Array) ---
  const quizzesJson = formData.get("quizzes") as string
  let quizzes = []
  try { quizzes = quizzesJson ? JSON.parse(quizzesJson) : [] } catch (e) { quizzes = [] }

  const customData = {
    title,
    message,
    imageUrl,
    anniversaryDate,
    useTypingEffect,
    themeColor,
    bgMusicUrl,
    fontStyle,
    musicStart,
    musicEnd,
    gallery,
    quizzes // บันทึกรายการคำถามทั้งหมด
  }

  await prisma.project.update({
    where: { 
      id: projectId, 
      userId: session.user.id
    }, 
    data: {
      customData: customData,
    },
  })
  
  revalidatePath(`/editor/${projectId}`)
  revalidatePath(`/p/${projectId}`)
}