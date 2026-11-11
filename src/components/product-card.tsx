'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Gift, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/store/cart';

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  compareAtPrice?: number | null;
  images: { url: string; alt: string }[];
  variants: { id: string; sku: string; price: number; size?: string | null }[];
};

export function ProductCard({ product, onHint }: { product: ProductCardData; onHint?: (id: string) => void }) {
  const add = useCart((state) => state.add);
  const variant = product.variants[0];
  const image = product.images[0]?.url ?? 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&q=85';
  const currentPrice = variant?.price ?? product.basePrice;
  const oldPrice = product.compareAtPrice && product.compareAtPrice > currentPrice ? product.compareAtPrice : null;

  return <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group relative">
    <Link href={`/product/${product.slug}`}><div className="relative aspect-[.84] overflow-hidden bg-champagne"><Image src={image} alt={product.images[0]?.alt ?? product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute left-3 top-3 bg-white px-2 py-1 text-[9px] uppercase tracking-[.16em]">New</div></div></Link>
    <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2" aria-label="Добавить в избранное"><Heart size={16} strokeWidth={1.5} /></button>
    <div className="pt-4"><p className="text-[10px] uppercase tracking-[.16em] text-black/45">Maison Zhanele</p><Link href={`/product/${product.slug}`} className="mt-1 block text-sm">{product.name}</Link>
      <div className="mt-2 flex items-center gap-2 text-sm"><span className={oldPrice ? 'font-medium text-rose' : ''}>{formatPrice(currentPrice)}</span>{oldPrice && <del className="text-xs text-black/35">{formatPrice(oldPrice)}</del>}</div>
      <div className="mt-3 flex gap-2"><button className="flex-1 border border-ink px-3 py-2 text-[10px] uppercase tracking-[.12em] transition hover:bg-ink hover:text-white" onClick={() => variant && add({ variantId: variant.id, productId: product.id, name: product.name, sku: variant.sku, price: variant.price, image })}>В корзину</button>{onHint && <button className="border border-line px-3" onClick={() => onHint(product.id)} aria-label="Намекнуть на подарок"><Gift size={15} /></button>}</div>
    </div>
  </motion.article>;
}
