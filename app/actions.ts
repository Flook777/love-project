'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// --- Schemas ---

const QuizSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'date', 'choice']),
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()).default([]),
  explanationImage: z.string().optional(),
  explanationText: z.string().optional(),
})

const CustomDataSchema = z.object({
  coverTitle: z.string().optional(),
  imageUrl: z.string().optional(),
  message: z.string().optional(),
  useTypingEffect: z.boolean().optional(),
  gallery: z.array(z.string()).default([]),
  themeColor: z.string().optional(),
  fontStyle: z.string().optional(),
  anniversaryDate: z.string().optional(),
  bgMusicUrl: z.string().optional(),
  musicStart: z.string().optional(),
  musicEnd: z.string().optional(),
  quizzes: z.array(QuizSchema).default([]),
})

const ProjectSchema = z.object({
  name: z.string().min(1, "ชื่อโปรเจกต์ต้องใส่").max(100, "ชื่อยาวเกินไป"),
  slug: z.string()
    .min(3, "Slug ต้องมีอย่างน้อย 3 ตัว")
    .regex(/^[a-z0-9-]+$/, "Slug ใช้ได้แค่ a-z, 0-9 และ -"),
  isPublished: z.boolean().optional(),
  customData: CustomDataSchema.optional(),
})

export type ProjectFormData = z.infer<typeof ProjectSchema>
export type CustomData = z.infer<typeof CustomDataSchema>

// --- Actions ---

export async function createProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const templateId = (formData.get("templateId") as string) || "valentine"

  if (!name?.trim()) return { error: "ชื่อโปรเจกต์ต้องใส่" }

  try {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        templateId,
        userId: session.user.id,
        customData: {},
        isPublished: false,
      },
    })

    revalidatePath("/dashboard")
    return { success: true, redirectUrl: `/editor/${project.id}` }
  } catch (error) {
    console.error("Create Project Error:", error)
    return { error: "สร้างโปรเจกต์ไม่สำเร็จ" }
  }
}

export async function updateProject(id: string, data: ProjectFormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const validation = ProjectSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  try {
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existing || existing.userId !== session.user.id) {
      return { error: "ไม่มีสิทธิ์แก้ไขโปรเจกต์นี้" }
    }

    await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        isPublished: data.isPublished ?? false,
        customData: data.customData ?? {},
      },
    })

    revalidatePath(`/editor/${id}`)
    revalidatePath(`/p/${data.slug}`)
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Update Project Error:", error)
    return { error: "บันทึกไม่สำเร็จ อาจเพราะ Slug ซ้ำ" }
  }
}

export async function uploadImage(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const file = formData.get("file") as File
  if (!file) return { error: "ไม่พบไฟล์" }

  try {
    const { put } = await import("@vercel/blob")
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
    const blob = await put(filename, file, { access: 'public' })
    return { success: true, url: blob.url }
  } catch (error) {
    console.error("Upload Error:", error)
    return { error: "อัปโหลดรูปไม่สำเร็จ กรุณาตั้งค่า BLOB_READ_WRITE_TOKEN ใน environment variables" }
  }
}
