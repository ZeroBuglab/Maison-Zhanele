import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promoCodeSchema } from '@/lib/validation';
import { hasAdminAccess } from '@/lib/admin-access';
import { enforceAdminRateLimit } from '@/lib/admin-rate-limit';

const staff = hasAdminAccess;

export async function GET() {
  if (!await staff()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  if (!(await enforceAdminRateLimit('discounts-read')).success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 });
  return NextResponse.json({ discounts: await db.promoCode.findMany({ orderBy: { startsAt: 'desc' } }) });
}

export async function POST(request: Request) {
  if (!await staff()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  if (!(await enforceAdminRateLimit('discounts-write')).success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 });
  try {
    const input = promoCodeSchema.parse(await request.json());
    const discount = await db.promoCode.create({ data: { code: input.code, percent: input.percent ?? null, amount: input.amount ?? null, minTotal: input.minTotal, maxUses: input.maxUses ?? null, active: input.active, startsAt: input.startsAt ? new Date(input.startsAt) : new Date(), expiresAt: input.expiresAt ? new Date(input.expiresAt) : null } });
    return NextResponse.json({ id: discount.id }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Проверьте данные скидки и уникальность кода' }, { status: 400 }); }
}
