import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { CartDrawer } from '@/components/cart-drawer';
import { Providers } from '@/components/providers';
import { LanguageProvider } from '@/components/language-provider';
import { getLocale } from '@/lib/i18n';

export const metadata: Metadata = { title: 'Maison Zhanele — украшения, которые остаются', description: 'Ювелирные украшения для особенных моментов.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#ffffff' };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return <html lang={locale}><body><Providers><LanguageProvider initialLocale={locale}><SiteHeader /><main>{children}</main><CartDrawer /></LanguageProvider></Providers></body></html>;
}
