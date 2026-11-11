/* eslint-disable @next/next/no-img-element */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useLanguage } from '@/components/language-provider';

export function CartDrawer() {
  const { items, isOpen, close, remove, setQuantity } = useCart();
  const { t } = useLanguage();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return <AnimatePresence>{isOpen && <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: .35 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-50 bg-black" />
    <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28 }} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-white p-5 shadow-drawer">
      <div className="flex items-center justify-between border-b border-line pb-5"><h2 className="display text-2xl">{t('cart')}</h2><button onClick={close} aria-label={t('close')}><X /></button></div>
      {items.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center text-center"><p className="display text-2xl">{t('emptyCart')}</p><Link href="/catalog" onClick={close} className="mt-5 border border-ink px-6 py-3 text-xs uppercase tracking-[.15em]">{t('goCatalog')}</Link></div> : <>
        <div className="flex-1 space-y-5 overflow-auto py-6">{items.map((item) => <div key={item.variantId} className="flex gap-3"><img src={item.image} alt="" className="h-24 w-20 bg-champagne object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><p className="text-sm">{item.name}</p><button onClick={() => remove(item.variantId)} aria-label={t('close')}><Trash2 size={15} /></button></div><p className="mt-1 text-xs text-black/45">{item.size ? `${t('size')}: ${item.size}` : item.sku}</p><div className="mt-3 flex items-center justify-between"><div className="flex items-center border border-line"><button className="p-1.5" onClick={() => setQuantity(item.variantId, item.quantity - 1)}><Minus size={13} /></button><span className="w-7 text-center text-xs">{item.quantity}</span><button className="p-1.5" onClick={() => setQuantity(item.variantId, item.quantity + 1)}><Plus size={13} /></button></div><span className="text-sm">{formatPrice(item.price * item.quantity)}</span></div></div></div>)}</div>
        <div className="border-t border-line pt-5"><div className="mb-4 space-y-2 text-sm"><div className="flex justify-between"><span>{t('shipping')}</span><span>{t('shippingSeparate')}</span></div><div className="flex justify-between pt-2 text-base font-medium"><span>{t('totalItems')}</span><span>{formatPrice(subtotal)}</span></div></div><Link href="/checkout" onClick={close} className="block bg-ink py-4 text-center text-xs uppercase tracking-[.16em] text-white transition hover:bg-rose">{t('orderWhatsApp')}</Link></div>
      </>}
    </motion.aside>
  </>}</AnimatePresence>;
}
