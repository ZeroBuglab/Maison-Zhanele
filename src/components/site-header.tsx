'use client';

import Link from 'next/link';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/store/cart';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/components/language-provider';

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const openCart = useCart((state) => state.open);
  const count = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const { t } = useLanguage();
  function submit(event: React.FormEvent) { event.preventDefault(); if (query.trim()) window.location.href = `/catalog?q=${encodeURIComponent(query.trim())}`; }
  return <>
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur"><div className="container-shell flex min-h-[72px] items-center justify-between gap-2 py-2 sm:gap-4">
      <button className="focus-ring p-2 md:hidden" onClick={() => setMenu(true)} aria-label={t('menu')}><Menu size={21} /></button>
      <Link href="/" className="display shrink-0 text-[19px] tracking-[.1em] sm:text-[27px] sm:tracking-[.13em]">MAISON <span className="text-rose">ZHANELE</span></Link>
      <nav className="hidden items-center gap-7 text-[12px] uppercase tracking-[.14em] md:flex"><Link className="hover:text-rose" href="/catalog">{t('catalog')}</Link><Link className="hover:text-rose" href="/stores">{t('stores')}</Link></nav>
      <div className="flex items-center gap-1"><form onSubmit={submit} className="hidden items-center border-b border-ink/30 px-1 lg:flex"><Search size={17} /><input aria-label={t('search')} value={query} onChange={(event) => setQuery(event.target.value)} className="w-28 border-0 px-2 py-2 text-xs outline-none" placeholder={t('search')} /></form><Link className="focus-ring hidden p-2 sm:block" href="/favorites" aria-label={t('favorites')}><Heart size={19} /></Link><button className="focus-ring relative p-2" onClick={openCart} aria-label={t('cart')}><ShoppingBag size={19} />{count > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] text-white">{count}</span>}</button><LanguageSwitcher /></div>
    </div></header>
    {menu && <div className="fixed inset-0 z-50 bg-white p-6 md:hidden"><div className="flex justify-end"><button onClick={() => setMenu(false)} aria-label={t('close')}><X /></button></div><nav className="mt-12 flex flex-col gap-7 text-2xl"><Link onClick={() => setMenu(false)} href="/catalog">{t('catalog')}</Link><Link onClick={() => setMenu(false)} href="/stores">{t('stores')}</Link></nav></div>}
  </>;
}
