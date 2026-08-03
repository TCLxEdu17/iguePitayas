import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const ADMIN_ROUTES = ['/dashboard', '/relatorios', '/talhoes', '/admin']

export default withAuth(
  function middleware(req) {
    const role     = req.nextauth.token?.role as string | undefined
    const { pathname } = req.nextUrl

    if (role !== 'ADMIN' && ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/mapa', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/((?!login|api|_next/static|_next/image|favicon.ico|maps|icons|.*\\..*).*)',],
}
