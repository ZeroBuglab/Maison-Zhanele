import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { ProductBuyBox } from '@/components/product-buy-box';
import { GiftHint } from '@/components/gift-hint';
import { getLocale } from '@/lib/i18n';

const demo = { id: 'demo-product', slug: 'signature-heart', name: 'Кулон «Signature Heart»', description: 'Знаковое украшение для самых важных историй. Выполнено вручную из ювелирного сплава с покрытием, которое сохраняет мягкое сияние на каждый день.', basePrice: 24900, compareAtPrice: null, images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=90', alt: 'Кулон Signature Heart' }, { url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&q=90', alt: 'Деталь кулона' }], variants: [{ id: 'demo-variant', sku: 'MZ-001', price: 24900, size: null, stock: 10 }] };

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const kk = locale === 'kk';
  let product = null;
  try {
    product = await db.product.findUnique({ where: { slug, active: true }, include: { images: { orderBy: { sortOrder: 'asc' } }, variants: { where: { active: true }, orderBy: { price: 'asc' } } } });
  } catch {
    // The demo product keeps the product route available before the first database setup.
  }
  const item = product ?? (slug === demo.slug ? demo : null);
  if (!item) notFound();
  const currentPrice = item.variants[0]?.price ?? item.basePrice;
  const oldPrice = item.compareAtPrice && item.compareAtPrice > currentPrice ? item.compareAtPrice : null;

  return <div className="container-shell py-8 md:py-14"><div className="grid gap-10 md:grid-cols-[1.1fr_.9fr] md:gap-16"><div className="grid grid-cols-2 gap-2">{item.images.map((image, index) => <div key={image.url} className={`relative overflow-hidden bg-champagne ${index === 0 ? 'col-span-2 aspect-[1.1]' : 'aspect-square'}`}><Image src={image.url} alt={image.alt} fill sizes="(max-width: 768px) 50vw, 60vw" className="object-cover" priority={index === 0} /></div>)}</div><div className="md:sticky md:top-28 md:h-fit"><p className="text-[10px] uppercase tracking-[.2em] text-rose">Maison Zhanele · {item.variants[0]?.sku}</p><h1 className="display mt-3 text-4xl leading-tight md:text-5xl">{item.name}</h1><div className="mt-4 flex items-center gap-3 text-xl"><span className={oldPrice ? 'font-medium text-rose' : ''}>{formatPrice(currentPrice)}</span>{oldPrice && <del className="text-sm text-black/35">{formatPrice(oldPrice)}</del>}</div><p className="mt-7 border-y border-line py-6 text-sm leading-7 text-black/65">{item.description}</p><ProductBuyBox product={{ id: item.id, name: item.name, image: item.images[0]?.url ?? demo.images[0].url, variants: item.variants.map((variant) => ({ id: variant.id, sku: variant.sku, price: variant.price, size: variant.size, stock: variant.stock })) }} /><div className="mt-7 flex gap-5 border-t border-line pt-5 text-xs text-black/55"><span>{kk ? 'Жеткізу бөлек төленеді' : 'Доставка оплачивается отдельно'}</span><span>·</span><span>{kk ? '14 күн ішінде қайтару' : 'Возврат 14 дней'}</span></div></div></div><GiftHint productId={item.id.startsWith('demo-') ? undefined : item.id} productName={item.name} productUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/product/${item.slug}`} /></div>;
}
