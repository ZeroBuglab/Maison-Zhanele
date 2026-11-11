import { cookies } from 'next/headers';
export { messages, tr } from '@/lib/i18n-messages';
export type { Locale, MessageKey } from '@/lib/i18n-messages';
import type { Locale } from '@/lib/i18n-messages';

export async function getLocale(): Promise<Locale> { const value = (await cookies()).get('site-locale')?.value; return value === 'kk' ? 'kk' : 'ru'; }
