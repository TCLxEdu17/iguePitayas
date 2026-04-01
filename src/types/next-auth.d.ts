import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id:             string
      role:           string
      isPrimaryAdmin: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role:           string
    isPrimaryAdmin: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?:             string
    role?:           string
    isPrimaryAdmin?: boolean
  }
}
