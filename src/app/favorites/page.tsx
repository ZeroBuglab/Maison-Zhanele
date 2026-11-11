import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  return <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"><Heart size={28} strokeWidth={1.2} className="text-rose" /><h1 className="display mt-5 text-4xl">Избранное</h1><p className="mt-3 max-w-sm text-sm leading-6 text-black/55">Сохраняйте украшения, которые хочется рассмотреть ещё раз.</p><Link href="/catalog" className="mt-7 bg-ink px-6 py-4 text-xs uppercase tracking-[.14em] text-white">Перейти в каталог</Link></div>;
}
