'use client';

import { createContext, useContext, useState } from 'react';
import { messages, type Locale } from '@/lib/i18n-messages';

const LanguageContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: (key: keyof typeof messages.ru) => string } | null>(null);
export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  function setLocale(next: Locale) { setLocaleState(next); document.cookie = `site-locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`; document.documentElement.lang = next; window.location.reload(); }
  return <LanguageContext.Provider value={{ locale, setLocale, t: (key) => messages[locale][key] }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const context = useContext(LanguageContext); if (!context) throw new Error('useLanguage must be used inside LanguageProvider'); return context; }
