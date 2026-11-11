import { auth } from '@/auth';

/** Passwordless admin is available only when explicitly enabled for localhost development. */
export async function hasAdminAccess() {
  const localBypass = process.env.NODE_ENV === 'development'
    && process.env.ADMIN_LOCAL_BYPASS === 'true'
    && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(process.env.NEXT_PUBLIC_APP_URL ?? '');
  if (localBypass) return true;
  const session = await auth();
  return Boolean(session?.user && ['ADMIN', 'MANAGER'].includes(session.user.role));
}
