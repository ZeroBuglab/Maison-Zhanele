import { Instagram, Phone } from 'lucide-react';
import { getLocale } from '@/lib/i18n';

const phone = '+7 (775) 833-02-23';
const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/';

export default async function StoresPage() {
  const locale = await getLocale();
  const kk = locale === 'kk';
  return <div className="container-shell py-12 md:py-20"><p className="text-[10px] uppercase tracking-[.2em] text-rose">Maison Zhanele</p><h1 className="display mt-2 text-5xl">{kk ? 'Алматыдағы дүкен' : 'Магазин в Алматы'}</h1><p className="mt-4 max-w-md text-sm leading-6 text-black/55">{kk ? 'Біз онлайн жұмыс істейміз.' : 'Работаем онлайн — заказ можно оформить в WhatsApp.'}</p><article className="mt-12 max-w-xl border border-line bg-white p-7 md:p-9"><p className="text-[10px] uppercase tracking-[.18em] text-rose">{kk ? 'Жұмыс уақыты' : 'Режим работы'}</p><h2 className="display mt-3 text-3xl">{kk ? 'Күн сайын 10:00–20:00' : 'Ежедневно, 10:00–20:00'}</h2><a href={instagramUrl} target="_blank" rel="noreferrer" className="mt-8 flex items-center gap-3 text-sm underline underline-offset-4"><Instagram size={18} className="text-rose" /> Instagram</a><a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="mt-5 flex items-center gap-3 text-sm underline underline-offset-4"><Phone size={18} className="text-rose" />{phone}</a></article></div>;
}
