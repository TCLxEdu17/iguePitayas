import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  ...(process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile' && {
    cookies: {
      sessionToken: {
        name: 'next-auth.session-token',
        options: {
          httpOnly: true,
          sameSite: 'none' as const,
          path: '/',
          secure: true,
        },
      },
    },
  }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',  type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.active) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id:             user.id,
          name:           user.name,
          email:          user.email,
          role:           user.role,
          isPrimaryAdmin: user.isPrimaryAdmin,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role           = (user as { role?: string; isPrimaryAdmin?: boolean }).role
        token.id             = user.id
        token.isPrimaryAdmin = (user as { isPrimaryAdmin?: boolean }).isPrimaryAdmin ?? false
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role           = token.role           ?? ''
        session.user.id             = token.id             ?? ''
        session.user.isPrimaryAdmin = token.isPrimaryAdmin ?? false
      }
      return session
    },
  },
}
