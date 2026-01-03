import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { updateProject } from "@/app/actions"
import EditorForm from "./EditorForm" // Import ไฟล์ที่เราเพิ่งสร้าง

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/")

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { 
      id: id,
      userId: session.user?.id 
    }
  })

  if (!project) redirect("/dashboard")

  // ส่งข้อมูลไปให้ Client Component จัดการต่อ
  return <EditorForm project={project} updateProjectAction={updateProject} />
}