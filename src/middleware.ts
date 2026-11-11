import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith('/admin')) {
    if (process.env.NODE_ENV !== 'production') return NextResponse.next();
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, cookieName: process.env.NODE_ENV === 'production' ? '__Secure-maison.session-token' : 'maison.session-token' });
    const role = token?.role;
    if (!token) return NextResponse.redirect(new URL('/login?callbackUrl=/admin', request.url));
    if (role !== 'ADMIN' && role !== 'MANAGER') return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*'] };
