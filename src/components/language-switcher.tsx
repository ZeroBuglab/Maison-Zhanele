'use client';
import { useLanguage } from '@/components/language-provider';
export function LanguageSwitcher() { const { locale, setLocale } = useLanguage(); return <div className="flex items-center gap-1 border-l border-line pl-3 text-[10px] uppercase tracking-[.1em]"><button onClick={() => setLocale('ru')} className={locale === 'ru' ? 'font-semibold text-ink' : 'text-black/40'}>RU</button><span className="text-black/25">/</span><button onClick={() => setLocale('kk')} className={locale === 'kk' ? 'font-semibold text-ink' : 'text-black/40'}>ҚАЗ</button></div>; }
