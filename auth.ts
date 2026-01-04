import NextAuth from "next-auth"
import Line from "next-auth/providers/line"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  debug: true, // เปิด Debug Mode เพื่อดู Log ใน Vercel เวลาเกิดปัญหา
  providers: [
    Line({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
      // บังคับขอ Scope และลดการตรวจสอบให้เหลือแค่ state เพื่อความเข้ากันได้บนมือถือ
      authorization: { params: { scope: "openid profile email" } },
      checks: ["state"], 
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  // --- การตั้งค่าสำหรับ Vercel และ Mobile ---
  trustHost: true, 
  secret: process.env.AUTH_SECRET, // ระบุ Secret ให้ชัดเจน (ดึงจาก .env)
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // @ts-ignore
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id
        }
        return token
    }
  },
})