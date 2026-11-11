import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getClientIdentifier } from '@/lib/request';
import { checkoutRequestSchema } from '@/lib/validation';

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > 100_000) return NextResponse.json({ error: 'Слишком большой запрос' }, { status: 413 });
  const rate = await enforceRateLimit('checkout', await getClientIdentifier(), 8, '10 m');
  if (!rate.success) return NextResponse.json({ error: 'Слишком много попыток оформления' }, { status: 429 });

  try {
    const parsed = checkoutRequestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Проверьте имя, телефон, адрес и email' }, { status: 400 });
    const { items: lineItems, packagingType, ...checkout } = parsed.data;
    const session = await auth();
    const created = await db.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({ where: { id: { in: lineItems.map((item) => item.variantId) }, active: true }, include: { product: { select: { name: true } } } });
      if (variants.length !== lineItems.length) throw new Error('ITEMS_NOT_FOUND');
      const byId = new Map(variants.map((variant) => [variant.id, variant]));
      let subtotal = 0;
      const orderItems = lineItems.map((line) => {
        const variant = byId.get(line.variantId)!;
        subtotal += variant.price * line.quantity;
        return { variantId: variant.id, name: variant.product.name, sku: variant.sku, price: variant.price, quantity: line.quantity };
      });
      const packaging = packagingType === 'PREMIUM' ? 2500 : 0;
      const promoCode = checkout.promoCode?.toUpperCase();
      const promo = promoCode ? await tx.promoCode.findFirst({ where: { code: promoCode, active: true, startsAt: { lte: new Date() }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }) : null;
      if (promoCode && (!promo || subtotal < promo.minTotal || (promo.maxUses !== null && promo.usedCount >= promo.maxUses))) throw new Error('PROMO_INVALID');
      const discount = promo ? Math.min(subtotal, promo.percent ? Math.floor(subtotal * promo.percent / 100) : promo.amount ?? 0) : 0;
      const order = await tx.order.create({
        data: {
          number: `MZ-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`,
          ...checkout,
          email: checkout.email.toLowerCase(),
          userId: session?.user?.id,
          status: 'AWAITING_PAYMENT',
          paymentMethod: 'MANUAL_KASPI',
          promoCode: promo?.code,
          shipping: 0,
          packaging,
          subtotal,
          discount,
          total: subtotal + packaging - discount,
          items: { create: orderItems }
        }
      });
      if (promo) await tx.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
      for (const line of lineItems) {
        const result = await tx.productVariant.updateMany({ where: { id: line.variantId, active: true, stock: { gte: line.quantity } }, data: { stock: { decrement: line.quantity } } });
        if (result.count !== 1) throw new Error('OUT_OF_STOCK');
      }
      return order;
    });
    return NextResponse.json({ orderId: created.id, number: created.number }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message === 'OUT_OF_STOCK' ? 'Недостаточно товара на складе' : error instanceof Error && error.message === 'ITEMS_NOT_FOUND' ? 'Позиция товара недоступна' : error instanceof Error && error.message === 'PROMO_INVALID' ? 'Промокод недействителен или не подходит для этой суммы' : 'Не удалось оформить заказ';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
