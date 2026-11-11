import Link from 'next/link';

export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ number?: string }> }) {
  const { number } = await searchParams;
  return <div className="container-shell flex min-h-[65vh] flex-col items-center justify-center text-center"><p className="text-[10px] uppercase tracking-[.2em] text-rose">Заказ принят</p><h1 className="display mt-4 text-5xl">Спасибо за заказ</h1><p className="mt-4 max-w-lg text-sm leading-6 text-black/55">Номер заказа: <strong>{number ?? '—'}</strong>. Статус заказа — «Ожидает оплаты». Менеджер свяжется с вами по WhatsApp и отправит ссылку или QR для оплаты через Kaspi Pay (Kaspi POS).</p><p className="mt-5 max-w-md border-l-2 border-rose bg-blush px-4 py-3 text-left text-sm leading-6">Доставка оплачивается покупателем отдельно по тарифам курьерской службы.</p><Link href="/catalog" className="mt-8 bg-ink px-7 py-4 text-xs uppercase tracking-[.16em] text-white">Вернуться в каталог</Link></div>;
}
