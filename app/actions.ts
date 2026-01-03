'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

// --- 1. ฟังก์ชันสร้างโปรเจกต์ใหม่ ---
export async function createProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("ต้องเข้าสู่ระบบก่อนนะครับ")
  }

  const projectName = formData.get("projectName") as string
  const templateId = formData.get("templateId") as string || "valentine-theme"

  // สร้าง URL (Slug)
  const slug = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`

  // บันทึกลง Database
  const newProject = await prisma.project.create({
    data: {
      name: projectName,
      slug: slug,
      templateId: templateId,
      userId: session.user.id,
      customData: {}, 
      isPublished: true, // <--- แก้เป็น true (ให้เว็บใช้งานได้ทันที ไม่ต้องรอจ่ายเงิน)
    },
  })

  redirect(`/editor/${newProject.id}`)
}

// --- 2. ฟังก์ชันอัปเดตข้อมูลและรูปภาพ ---
export async function updateProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const projectId = formData.get("projectId") as string
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const imageUrl = formData.get("imageUrl") as string

  const customData = {
    title,
    message,
    imageUrl
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
  
  redirect(`/editor/${projectId}`)
}