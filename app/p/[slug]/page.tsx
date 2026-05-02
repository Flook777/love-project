import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import InteractiveView from "./InteractiveView"

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  let project = await prisma.project.findUnique({ where: { slug: decodedSlug } })
  if (!project) {
    project = await prisma.project.findUnique({ where: { slug } })
  }
  if (!project) return notFound()

  if (!project.isPublished) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="text-6xl animate-pulse">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">เว็บไซต์นี้ถูกล็อคอยู่</h1>
          <Link
            href="/dashboard"
            className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            กลับไปที่ Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Increment view count without blocking render
  prisma.project.update({
    where: { id: project.id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {})

  const customData = (project.customData as Record<string, unknown>) ?? {}
  const data = {
    title: (customData.coverTitle as string) || project.name,
    ...customData,
  }

  return <InteractiveView data={data} />
}
