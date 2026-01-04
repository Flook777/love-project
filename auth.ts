import NextAuth from "next-auth"
import Line from "next-auth/providers/line"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // เปิด debug เฉพาะตอน dev (หรือเปิดไว้ก่อนถ้ายังแก้ไม่หาย)
  debug: true, 
  providers: [
    Line({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
      // ใช้ค่า Default ของ NextAuth (รองรับทั้ง PKCE และ State อัตโนมัติ)
      authorization: { params: { scope: "openid profile email" } },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  
  // ✅ Key สำคัญ: บอกให้ NextAuth เชื่อใจ Vercel Proxy
  trustHost: true, 
  
  // ✅ ลบส่วน cookies: { ... } ออกทั้งหมด เพื่อให้ระบบจัดการเอง (แก้ปัญหา InvalidCheck)
  
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