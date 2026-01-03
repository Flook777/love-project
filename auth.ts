import NextAuth from "next-auth"
import Line from "next-auth/providers/line"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma" // <--- เปลี่ยนมา Import จากไฟล์กลางที่เราสร้างไว้ใน lib

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma), // ส่งตัวแปร prisma ที่ import มาเข้าไป
  providers: [
    Line({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
      // Line ต้องตั้งค่า scope ให้ดึงข้อมูล email ด้วย
      authorization: { params: { scope: "openid profile email" } }, 
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login", // หน้า Login ของเราเอง (เดี๋ยวค่อยสร้าง)
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // @ts-ignore: ปิด Error ชั่วคราวเพื่อให้รันผ่าน (TypeScript เข้มงวดเรื่อง Type)
        session.user.id = user.id 
      }
      return session
    },
  },
})