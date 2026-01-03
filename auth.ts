import NextAuth from "next-auth"
import Line from "next-auth/providers/line"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

// --- ส่วนจัดการ Database Connection (ป้องกัน Error: Too many connections) ---
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
// ---------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
