import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import CopyLinkButton from "@/components/CopyLinkButton"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' }
  })

  const templateIcon: Record<string, string> = {
    birthday: '🎂',
    valentine: '🌹',
    minimal: '🤍',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 drop-shadow-sm">
              แดชบอร์ดแห่งความรัก 💖
            </h1>
            <p className="text-gray-500 mt-1">ยินดีต้อนรับ, {session.user.name}</p>
          </div>
          <Link
            href="/create"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-full shadow-lg transition transform hover:scale-105 flex items-center gap-2 font-bold"
          >
            <span>+</span> สร้างโปรเจกต์ใหม่
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm p-16 rounded-3xl border-2 border-dashed border-pink-200 text-center shadow-sm">
            <div className="text-6xl mb-4 animate-bounce">💌</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มีเซอร์ไพรส์เลย</h3>
            <p className="text-gray-400 mb-8">มาเริ่มสร้างความทรงจำดีๆ ให้คนพิเศษกันเถอะครับ</p>
            <Link href="/create" className="text-pink-500 font-semibold hover:text-pink-600 hover:underline text-lg">
              เริ่มสร้างเซอร์ไพรส์แรกเลย! &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-white/90 backdrop-blur rounded-2xl shadow-sm border border-pink-100 overflow-hidden hover:shadow-xl transition duration-300 group">
                <div className="h-32 bg-gradient-to-br from-pink-200 to-rose-100 flex items-center justify-center relative overflow-hidden">
                  <span className="text-5xl transform group-hover:scale-110 transition duration-500 drop-shadow-md">
                    {templateIcon[project.templateId] ?? '💌'}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-1 truncate">{project.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>👁️ {project.viewCount} ครั้ง</span>
                    <span>·</span>
                    <span>แก้ไขล่าสุด: {new Date(project.updatedAt).toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="mb-5">
                    {project.isPublished ? (
                      <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full border border-green-200 text-xs">ออนไลน์</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 text-xs">ร่าง</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/editor/${project.id}`}
                      className="flex items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition border border-gray-200"
                    >
                      ✏️ แก้ไข
                    </Link>
                    <Link
                      href={`/p/${project.slug}`}
                      target="_blank"
                      className="flex items-center justify-center gap-1 bg-pink-50 hover:bg-pink-100 text-pink-600 py-2.5 rounded-xl text-sm font-semibold transition border border-pink-100"
                    >
                      👁️ ดู
                    </Link>
                    <CopyLinkButton slug={project.slug} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

