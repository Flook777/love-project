import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  // 1. เช็คว่า Login หรือยัง? ถ้ายัง ดีดกลับไปหน้าแรก
  if (!session?.user) {
    redirect("/")
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">แดชบอร์ดของคุณ</h1>
          <p className="text-gray-500">ยินดีต้อนรับ, {session.user.name}</p>
        </div>
        <Link 
          href="/create" 
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow transition"
        >
          + สร้างโปรเจกต์ใหม่
        </Link>
      </div>

      {/* พื้นที่แสดงรายการโปรเจกต์ (เดี๋ยวมาทำต่อ) */}
      <div className="bg-white p-10 rounded-xl border-2 border-dashed border-gray-300 text-center">
        <p className="text-gray-400 mb-4">คุณยังไม่มีโปรเจกต์เซอร์ไพรส์</p>
        <Link 
          href="/create"
          className="text-pink-500 font-semibold hover:underline"
        >
          เริ่มสร้างเซอร์ไพรส์แรกเลย!
        </Link>
      </div>
    </div>
  )
}
