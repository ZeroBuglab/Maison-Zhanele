'use client';

import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { orderWhatsAppMessage, whatsappLink } from '@/lib/whatsapp';
import { useLanguage } from '@/components/language-provider';

export default function CheckoutPage() {
  const { items } = useCart();
  const { t } = useLanguage();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!items.length) return <div className="container-shell py-24 text-center"><h1 className="display text-4xl">{t('emptyCart')}</h1><Link href="/catalog" className="mt-6 inline-flex border border-ink px-6 py-3 text-xs uppercase tracking-[.15em]">{t('goCatalog')}</Link></div>;
  const message = orderWhatsAppMessage(items);

  return <div className="container-shell py-12 md:py-20"><Link href="/catalog" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.12em] text-black/55"><ArrowLeft size={14} /> {t('catalogBack')}</Link><h1 className="display mt-7 text-5xl">{t('whatsappOrder')}</h1><div className="mt-10 grid gap-10 md:grid-cols-[1fr_380px]"><section className="max-w-xl"><div className="border border-rose/30 bg-blush p-6"><MessageCircle className="text-rose" size={24} /><h2 className="display mt-5 text-3xl">{t('noForms')}</h2><p className="mt-3 text-sm leading-6 text-black/65">{t('managerText')}</p><a href={whatsappLink(message)} target="_blank" rel="noreferrer" className="mt-7 flex w-full items-center justify-center gap-2 bg-[#25D366] py-4 text-xs uppercase tracking-[.14em] text-white"><MessageCircle size={17} /> {t('openWhatsApp')}</a></div><p className="mt-5 text-xs leading-5 text-black/45">{t('shippingSeparate')}. Заказ считается принятым после подтверждения менеджера.</p></section><aside className="h-fit bg-champagne p-6"><p className="text-[10px] uppercase tracking-[.18em] text-rose">{t('selectedItems')}</p><div className="mt-6 space-y-4">{items.map((item) => <div key={item.variantId} className="flex justify-between gap-3 text-sm"><span>{item.name} × {item.quantity}</span><span className="whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span></div>)}</div><div className="mt-7 flex justify-between border-t border-black/10 pt-5 text-sm font-medium"><span>{t('totalItems')}</span><span>{formatPrice(subtotal)}</span></div></aside></div></div>;
}
