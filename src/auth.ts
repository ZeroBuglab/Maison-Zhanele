import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  cookies: { sessionToken: { name: process.env.NODE_ENV === 'production' ? '__Secure-maison.session-token' : 'maison.session-token', options: { httpOnly: true, sameSite: 'strict', path: '/', secure: process.env.NODE_ENV === 'production' } } },
  providers: [Credentials({ credentials: { email: {}, password: {} }, async authorize(credentials) {
    const email = String(credentials?.email ?? '').toLowerCase().trim();
    const password = String(credentials?.password ?? '');
    if (!email || !password) return null;
    const user = await db.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  } })],
  callbacks: { jwt({ token, user }) { if (user) { token.id = user.id; token.role = (user as { role: 'USER' | 'MANAGER' | 'ADMIN' }).role; } return token; }, session({ session, token }) { if (session.user) { session.user.id = String(token.id); session.user.role = token.role as 'USER' | 'MANAGER' | 'ADMIN'; } return session; } },
  pages: { signIn: '/login' }
});
