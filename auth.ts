import NextAuth from "next-auth"
import Line from "next-auth/providers/line"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // เปิด Debug เสมอ เพื่อให้เห็น Error ใน Vercel Logs
  debug: true, 
  providers: [
    Line({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
      // Remove manual checks configuration to let NextAuth handle defaults (PKCE)
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
  // ตั้งค่า Trust Host เพื่อให้ทำงานบน Vercel ได้ถูกต้อง
  trustHost: true, 
  secret: process.env.AUTH_SECRET, 
  
  // ปรับแต่ง Session และ Cookie
  session: {
    strategy: "jwt",
  },
  
  // การตั้งค่า Cookies ขั้นสูงสำหรับ Cross-site (จำเป็นสำหรับ Line Login บน Mobile บางกรณี)
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
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