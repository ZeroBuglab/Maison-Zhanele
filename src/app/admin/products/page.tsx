import { ProductManager } from './product-manager';

export const dynamic = 'force-dynamic';

export default function AdminProductsPage() {
  return <div className="min-h-screen bg-champagne"><div className="container-shell py-10"><p className="text-[10px] uppercase tracking-[.18em] text-rose">Dashboard · Товары</p><h1 className="display mt-2 text-5xl">Управление товарами</h1><p className="mt-3 max-w-xl text-sm text-black/55">Добавляйте изображения, меняйте цены и показывайте скидку: основная цена будет зачёркнута, а цена со скидкой выделена.</p><div className="mt-10"><ProductManager /></div></div></div>;
}
