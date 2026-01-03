import { auth, signIn } from "@/auth"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-white p-4 text-center">
      <h1 className="text-5xl font-extrabold text-pink-600 mb-4 tracking-tight">
        Love Project 💖
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-md">
        สร้างเว็บไซต์เซอร์ไพรส์แฟนง่ายๆ ใน 5 นาที ไม่ต้องเขียนโค้ด!
      </p>

      {session ? (
        // กรณี Login แล้ว
        <div className="space-y-4">
          <Link 
            href="/dashboard"
            className="inline-block bg-pink-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-pink-600 transition transform hover:scale-105"
          >
            ไปที่แดชบอร์ดของคุณ 🚀
          </Link>
          <p className="text-sm text-gray-400">Login เป็น: {session.user?.name}</p>
        </div>
      ) : (
        // กรณีรับแขก (ยังไม่ Login)
        <form
          action={async () => {
            "use server"
            await signIn("line", { redirectTo: "/dashboard" }) // Login เสร็จ ส่งไป Dashboard เลย
          }}
        >
          <button className="bg-[#06C755] text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-[#05b34c] transition flex items-center gap-2 mx-auto">
            <span>เข้าสู่ระบบด้วย LINE</span>
          </button>
        </form>
      )}
    </div>
  )
}
