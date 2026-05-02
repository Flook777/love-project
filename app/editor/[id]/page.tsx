import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditorForm from "./EditorForm"

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/")

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user?.id }
  })

  if (!project) redirect("/dashboard")

  return (
    <EditorForm
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
        isPublished: project.isPublished,
        templateId: project.templateId,
        customData: (project.customData as Record<string, unknown>) ?? null,
      }}
    />
  )
}
