import NextAuth from "next-auth"
import Line from "next-auth/providers/line"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Line({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
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
  // --- เพิ่มส่วนนี้เพื่อแก้ปัญหาบน Vercel/Mobile ---
  trustHost: true, // เชื่อใจ Host header จาก Vercel (สำคัญมากสำหรับ Serverless)
  session: {
    strategy: "jwt", // ใช้ JWT เพื่อลดปัญหา Cookie บนมือถือบางรุ่น
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // @ts-ignore
        session.user.id = token.sub // ดึง ID จาก Token มาใส่ Session
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
  // ---------------------------------------------
})