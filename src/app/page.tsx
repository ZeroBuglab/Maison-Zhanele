import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { ProductCard } from '@/components/product-card';
import { getLocale } from '@/lib/i18n';

const fallback = [
  { id: '1', slug: 'signature-heart', name: 'Кулон «Signature Heart»', basePrice: 24900, compareAtPrice: null, images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=85', alt: 'Кулон' }], variants: [{ id: 'demo-1', sku: 'MZ-001', price: 24900, size: null }] },
  { id: '2', slug: 'rose-tennis', name: 'Браслет Rose Tennis', basePrice: 38900, compareAtPrice: null, images: [{ url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=85', alt: 'Браслет' }], variants: [{ id: 'demo-2', sku: 'MZ-002', price: 38900, size: '17' }] },
  { id: '3', slug: 'elevated-ring', name: 'Кольцо Elevated', basePrice: 17900, compareAtPrice: 21900, images: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=85', alt: 'Кольцо' }], variants: [{ id: 'demo-3', sku: 'MZ-003', price: 17900, size: '17' }] },
  { id: '4', slug: 'moment-charm', name: 'Шарм «New Moment»', basePrice: 12900, compareAtPrice: null, images: [{ url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=85', alt: 'Шарм' }], variants: [{ id: 'demo-4', sku: 'MZ-004', price: 12900, size: null }] }
];

async function featuredProducts() {
  try {
    return await db.product.findMany({ where: { active: true, featured: true, category: { active: true } }, include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, variants: { where: { active: true }, orderBy: { price: 'asc' }, take: 1 } }, take: 4 });
  } catch { return fallback; }
}

export default async function Home() {
  const products = await featuredProducts();
  const locale = await getLocale();
  const kk = locale === 'kk';
  return <><section className="relative min-h-[620px] overflow-hidden bg-blush"><Image src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1800&q=85" alt="Коллекция Maison Zhanele" fill priority className="object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/5 to-transparent" /><div className="container-shell relative flex min-h-[620px] items-end pb-14 md:items-center md:pb-0"><div className="max-w-lg text-white"><p className="text-[10px] uppercase tracking-[.3em]">New collection · 2025</p><h1 className="display mt-4 text-5xl leading-[.94] md:text-7xl">{kk ? <>Сенің тарихың.<br />Сенің әшекейің.</> : <>Твоя история.<br />Твоё украшение.</>}</h1><p className="mt-5 max-w-sm text-sm leading-6 text-white/80">{kk ? 'Сіз туралы сөзсіз айтатын коллекция.' : 'Коллекция, которая говорит о тебе без слов.'}</p><Link href="/catalog" className="mt-8 inline-flex items-center gap-3 border border-white px-6 py-4 text-xs uppercase tracking-[.16em] transition hover:bg-white hover:text-ink">{kk ? 'Каталогты көру' : 'Смотреть каталог'} <ArrowRight size={15} /></Link></div></div></section><section className="container-shell py-20"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-rose">Curated for you</p><h2 className="display mt-2 text-4xl md:text-5xl">{kk ? 'Таңдаулы' : 'Избранное'}</h2></div><Link href="/catalog" className="hidden items-center gap-2 text-xs uppercase tracking-[.13em] md:flex">{kk ? 'Барлық каталог' : 'Весь каталог'} <ArrowRight size={14} /></Link></div><div className="mt-9 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section><section className="bg-champagne"><div className="container-shell grid items-center gap-10 py-16 md:grid-cols-2 md:py-24"><div><p className="text-[10px] uppercase tracking-[.2em] text-rose">A gift that stays</p><h2 className="display mt-3 text-5xl leading-none">{kk ? <>Есте қалатын<br />сыйлық</> : <>Подарок,<br />который запомнят</>}</h2><p className="mt-5 max-w-sm text-sm leading-6 text-black/60">{kk ? 'Жақын адамыңызға әшекей туралы әдемі ишара жіберіңіз.' : 'Отправьте близкому человеку красивый намёк на украшение, которое ему понравится.'}</p><Link href="/catalog" className="mt-7 inline-flex items-center gap-3 bg-ink px-6 py-4 text-xs uppercase tracking-[.16em] text-white">{kk ? 'Сыйлық табу' : 'Найти подарок'} <ArrowRight size={15} /></Link></div><div className="relative aspect-[1.1] overflow-hidden"><Image src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1000&q=85" alt="Украшения" fill className="object-cover" /></div></div></section></>;
}
