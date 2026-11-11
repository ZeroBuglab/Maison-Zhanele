import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promoCodeUpdateSchema } from '@/lib/validation';
import { hasAdminAccess } from '@/lib/admin-access';
import { enforceAdminRateLimit } from '@/lib/admin-rate-limit';

const staff = hasAdminAccess;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await staff()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  if (!(await enforceAdminRateLimit('discounts-write')).success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 });
  try {
    const input = promoCodeUpdateSchema.parse(await request.json());
    const { id } = await params;
    const discount = await db.promoCode.update({ where: { id }, data: { code: input.code, percent: input.percent !== undefined ? input.percent : input.amount !== undefined ? null : undefined, amount: input.amount !== undefined ? input.amount : input.percent !== undefined ? null : undefined, minTotal: input.minTotal, maxUses: input.maxUses, active: input.active, ...(input.startsAt ? { startsAt: new Date(input.startsAt) } : {}), ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null } : {}) } });
    return NextResponse.json({ id: discount.id });
  } catch { return NextResponse.json({ error: 'Скидка не найдена или данные некорректны' }, { status: 400 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await staff()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  if (!(await enforceAdminRateLimit('discounts-write')).success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 });
  try { await db.promoCode.delete({ where: { id: (await params).id } }); return new NextResponse(null, { status: 204 }); } catch { return NextResponse.json({ error: 'Скидка не найдена' }, { status: 404 }); }
}
