import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createProject } from "@/app/actions" // เรียกใช้ฟังก์ชันจากข้อ 2

export default async function CreatePage() {
  const session = await auth()
  if (!session) redirect("/")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          💖 ตั้งชื่อโปรเจกต์ของคุณ
        </h1>

        <form action={createProject} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อโปรเจกต์ (เช่น วันครบรอบ, HBD แฟน)
            </label>
            <input
              name="projectName"
              type="text"
              required
              placeholder="ใส่ชื่อโปรเจกต์..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกธีม (Template)
            </label>
            <select 
              name="templateId" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none bg-white text-black"
            >
              <option value="valentine">🌹 Valentine (ธีมดอกกุหลาบ)</option>
              <option value="birthday">🎂 Birthday (ธีมเค้กวันเกิด)</option>
              <option value="minimal">🤍 Minimal (เรียบหรู)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg shadow-lg transition transform active:scale-95"
          >
            🚀 เริ่มสร้างเซอร์ไพรส์เลย
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
            ย้อนกลับไปแดชบอร์ด
          </a>
        </div>
      </div>
    </div>
  )
}
