import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { giftHintSchema } from '@/lib/validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getClientIdentifier } from '@/lib/request';

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > 100_000) return NextResponse.json({ error: 'Слишком большой запрос' }, { status: 413 });
  const rate = await enforceRateLimit('gift-hint', await getClientIdentifier(), 5, '1 h');
  if (!rate.success) return NextResponse.json({ error: 'Попробуйте позже' }, { status: 429 });

  try {
    const input = giftHintSchema.parse(await request.json());
    let productName = input.productName ?? 'товар из каталога';
    let productUrl = input.productUrl ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/catalog`;
    if (input.productId) {
      const product = await db.product.findFirst({ where: { id: input.productId, active: true }, select: { name: true, slug: true } });
      if (!product) return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
      productName = product.name;
      productUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/product/${product.slug}`;
    }

    const message = `Новая заявка «Намекнуть на подарок»\nОтправитель: ${input.senderName}, ${input.senderPhone}\nКому: ${input.recipientName}, ${input.recipientContact}\nТовар: ${productName}\nСсылка: ${productUrl}${input.message ? `\nСообщение: ${input.message}` : ''}`;
    const hint = await db.giftHint.create({ data: { productId: input.productId ?? null, senderName: input.senderName, senderPhone: input.senderPhone, recipientName: input.recipientName, recipientContact: input.recipientContact, message, token: randomBytes(18).toString('base64url') } });
    const adminPhone = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? process.env.ADMIN_WHATSAPP ?? '77758330223').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    return NextResponse.json({ id: hint.id, message, whatsappUrl });
  } catch {
    return NextResponse.json({ error: 'Проверьте данные формы' }, { status: 400 });
  }
}
