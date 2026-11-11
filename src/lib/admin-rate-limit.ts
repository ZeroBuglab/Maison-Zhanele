import { enforceRateLimit } from '@/lib/rate-limit';
import { getClientIdentifier } from '@/lib/request';

export async function enforceAdminRateLimit(name: string) {
  return enforceRateLimit(`admin:${name}`, await getClientIdentifier(), 120, '1 m');
}
