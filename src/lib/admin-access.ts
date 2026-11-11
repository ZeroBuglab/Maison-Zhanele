import { auth } from '@/auth';

/** Local admin UX is intentionally passwordless. Production still requires an ADMIN/MANAGER session. */
export async function hasAdminAccess() {
  if (process.env.NODE_ENV !== 'production') return true;
  const session = await auth();
  return Boolean(session?.user && ['ADMIN', 'MANAGER'].includes(session.user.role));
}
