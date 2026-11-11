import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { db } from '@/lib/db';
import { ProductCard, type ProductCardData } from '@/components/product-card';
import { getLocale, tr } from '@/lib/i18n';

const fallbackCategories = [{ name: 'Кольца', slug: 'rings' }, { name: 'Колье', slug: 'necklaces' }, { name: 'Часы', slug: 'watches' }, { name: 'Комплекты', slug: 'sets' }, { name: 'Браслеты', slug: 'bracelets' }, { name: 'Цепочки', slug: 'chains' }];
const fallback: ProductCardData[] = [
  { id: '1', slug: 'signature-heart', name: 'Кулон «Signature Heart»', basePrice: 24900, compareAtPrice: null, images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=85', alt: 'Кулон' }], variants: [{ id: 'demo-1', sku: 'MZ-001', price: 24900, size: null }] },
  { id: '2', slug: 'rose-tennis', name: 'Браслет Rose Tennis', basePrice: 38900, compareAtPrice: null, images: [{ url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=85', alt: 'Браслет' }], variants: [{ id: 'demo-2', sku: 'MZ-002', price: 38900, size: '17' }] },
  { id: '3', slug: 'elevated-ring', name: 'Кольцо Elevated', basePrice: 17900, compareAtPrice: 21900, images: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=85', alt: 'Кольцо' }], variants: [{ id: 'demo-3', sku: 'MZ-003', price: 17900, size: '17' }] },
  { id: '4', slug: 'moment-charm', name: 'Шарм «New Moment»', basePrice: 12900, compareAtPrice: null, images: [{ url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=85', alt: 'Шарм' }], variants: [{ id: 'demo-4', sku: 'MZ-004', price: 12900, size: null }] }
];

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; collection?: string; outlet?: string }> }) {
  const params = await searchParams;
  const locale = await getLocale();
  const selectedCategory = params.category ?? '';
  const selectedCollection = params.collection ?? '';
  const outlet = params.outlet === 'true';
  let products: ProductCardData[] = fallback;
  let categories = fallbackCategories;
  try {
    const [foundProducts, foundCategories] = await Promise.all([
      db.product.findMany({ where: { active: true, category: { active: true }, ...(params.q ? { OR: [{ name: { contains: params.q, mode: 'insensitive' } }, { sku: { contains: params.q, mode: 'insensitive' } }] } : {}), ...(selectedCategory ? { category: { slug: selectedCategory, active: true } } : {}), ...(selectedCollection ? { collection: { slug: selectedCollection } } : {}), ...(outlet ? { compareAtPrice: { not: null } } : {}) }, include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, variants: { where: { active: true }, orderBy: { price: 'asc' }, take: 1 } }, orderBy: { createdAt: 'desc' } }),
      db.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } })
    ]);
    products = foundProducts;
    categories = foundCategories;
  } catch { /* fallback keeps the storefront usable before database setup */ }

  const categoryLabel = (slug: string, name: string) => slug === 'rings' ? tr(locale, 'ring') : slug === 'necklaces' ? tr(locale, 'necklace') : slug === 'bracelets' ? tr(locale, 'bracelet') : name;
  return <div className="container-shell py-12 md:py-20"><div className="flex items-end justify-between border-b border-line pb-8"><div><p className="text-[10px] uppercase tracking-[.2em] text-rose">Maison Zhanele</p><h1 className="display mt-2 text-5xl">{tr(locale, 'catalog')}</h1><p className="mt-3 text-sm text-black/50">{locale === 'kk' ? 'Сіздің сәттеріңізге арналған әшекейлер' : 'Украшения, созданные для твоих моментов'}</p></div><button className="flex items-center gap-2 border border-line px-4 py-3 text-xs uppercase tracking-[.12em] md:hidden"><SlidersHorizontal size={15} /> Фильтры</button></div><nav aria-label="Категории каталога" className="mt-8 flex flex-wrap gap-x-7 gap-y-4 border-b border-line pb-4 text-xs uppercase tracking-[.13em] text-black/55"><Link href="/catalog" className={`border-b pb-4 transition hover:text-ink ${!selectedCategory ? 'border-ink text-ink' : 'border-transparent'}`}>{tr(locale, 'allJewelry')}</Link>{categories.map((category) => <Link key={category.slug} href={`/catalog?category=${category.slug}`} className={`border-b pb-4 transition hover:text-ink ${selectedCategory === category.slug ? 'border-ink text-ink' : 'border-transparent'}`}>{categoryLabel(category.slug, category.name)}</Link>)}<span className="ml-auto pb-4">{products.length} {locale === 'kk' ? 'тауар' : 'товаров'}</span></nav>{params.q && <p className="mt-6 text-sm">Поиск: <strong>«{params.q}»</strong></p>}<div className="mt-9 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>{!products.length && <p className="py-20 text-center text-sm text-black/55">{tr(locale, 'emptyCategory')}</p>}</div>;
}
