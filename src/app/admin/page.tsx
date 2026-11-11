import Link from 'next/link';
import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { softDeleteProduct, updateOrderStatus } from '@/app/actions/admin';

const statusLabels = { NEW: 'Новый', AWAITING_PAYMENT: 'Ожидает оплаты', PROCESSING: 'В обработке', PAID: 'Оплачен', SHIPPED: 'Отправлен', COMPLETED: 'Завершён', CANCELLED: 'Отменён' } as const;
type OrderStatus = keyof typeof statusLabels;

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  const [products, orders, aggregate, recentOrders] = await Promise.all([
    db.product.findMany({ where: { active: true }, include: { category: true, variants: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
    db.order.count(),
    db.order.aggregate({ _sum: { total: true }, _avg: { total: true } }),
    db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { items: true } })
  ]);
  const stats = [
    { icon: TrendingUp, label: 'Выручка', value: formatPrice(aggregate._sum.total ?? 0) },
    { icon: ShoppingBag, label: 'Заказы', value: orders },
    { icon: Package, label: 'Средний чек', value: formatPrice(Math.round(aggregate._avg.total ?? 0)) },
    { icon: Users, label: 'Активные товары', value: products.length }
  ];

  return <div className="min-h-screen bg-champagne"><div className="container-shell py-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-rose">Maison Zhanele</p><h1 className="display mt-2 text-5xl">Панель управления</h1></div><span className="text-xs text-black/50">{session?.user?.name ?? session?.user?.email ?? 'Локальный доступ'}{session?.user?.role ? ` · ${session.user.role}` : ''}</span></div>
    <nav className="mt-8 flex flex-wrap gap-3"><Link href="/admin" className="border border-ink bg-ink px-5 py-3 text-xs uppercase tracking-[.12em] text-white">Заказы</Link><Link href="/admin/products" className="border border-ink bg-white px-5 py-3 text-xs uppercase tracking-[.12em]">Товары</Link><Link href="/admin/discounts" className="border border-ink bg-white px-5 py-3 text-xs uppercase tracking-[.12em]">Скидки</Link></nav>
    <div className="mt-8 grid gap-4 md:grid-cols-4">{stats.map(({ icon: Icon, label, value }) => <div key={label} className="bg-white p-5"><Icon size={18} strokeWidth={1.5} className="text-rose" /><p className="mt-7 text-xs uppercase tracking-[.13em] text-black/45">{label}</p><p className="mt-1 text-2xl">{value}</p></div>)}</div>
    <div className="mt-8 border border-rose/30 bg-blush p-5 text-sm leading-6"><p className="font-medium">Ручная оплата через Kaspi Pay (Kaspi POS)</p><p className="mt-1 text-black/65">После создания заказа свяжитесь с покупателем по WhatsApp и отправьте ссылку или QR вручную. После подтверждения оплаты переведите заказ из «Ожидает оплаты» в «Оплачен».</p></div>
    <div className="mt-8 grid gap-8 lg:grid-cols-2"><section className="bg-white p-6"><div className="flex justify-between"><h2 className="display text-2xl">Заказы</h2><span className="text-xs text-black/45">Последние 10</span></div><div className="mt-5 overflow-auto"><table className="w-full min-w-[660px] text-left text-xs"><thead className="border-b border-line text-[10px] uppercase tracking-[.12em] text-black/45"><tr><th className="py-3">Номер</th><th>Дата</th><th>Сумма</th><th>Статус</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id} className="border-b border-line"><td className="py-4">{order.number}</td><td>{order.createdAt.toLocaleDateString('ru-KZ')}</td><td>{formatPrice(order.total)}</td><td><form action={async (formData) => { 'use server'; const status = formData.get('status'); if (typeof status === 'string' && status in statusLabels) await updateOrderStatus(order.id, status as OrderStatus); }} className="flex items-center gap-2"><select name="status" defaultValue={order.status} className="border border-line bg-white px-2 py-1" aria-label="Статус заказа">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="submit" className="border border-ink px-2 py-1 text-[10px] uppercase">Сохранить</button></form></td></tr>)}</tbody></table></div></section>
      <section className="bg-white p-6"><div className="flex justify-between"><h2 className="display text-2xl">Ассортимент</h2><Link href="/admin/products" className="text-xs underline underline-offset-4">Управлять товарами</Link></div><div className="mt-5 space-y-3">{products.slice(0, 8).map((product) => <div key={product.id} className="flex items-center justify-between border-b border-line py-3"><div><p className="text-sm">{product.name}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-black/40">{product.sku} · {product.variants.reduce((sum, item) => sum + item.stock, 0)} шт.</p></div><div className="flex items-center gap-3"><span className="text-sm">{formatPrice(product.basePrice)}</span><form action={async () => { 'use server'; await softDeleteProduct(product.id); }}><button className="text-xs text-red-500">Скрыть</button></form></div></div>)}</div></section></div>
  </div></div>;
}
