import { DiscountManager } from './discount-manager';

export const dynamic = 'force-dynamic';

export default function AdminDiscountsPage() {
  return <div className="min-h-screen bg-champagne"><div className="container-shell py-10"><p className="text-[10px] uppercase tracking-[.18em] text-rose">Dashboard · Скидки</p><h1 className="display mt-2 text-5xl">Промокоды и скидки</h1><p className="mt-3 text-sm text-black/55">Создавайте процентные или фиксированные скидки и быстро включайте или выключайте их.</p><div className="mt-10"><DiscountManager /></div></div></div>;
}
