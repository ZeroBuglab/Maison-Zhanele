import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientIdentifier } from '@/lib/request';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const identifier = await getClientIdentifier();
  const rate = await enforceRateLimit('search', identifier, 60, '1 m');
  if (!rate.success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 });
  const params = request.nextUrl.searchParams;
  const q = params.get('q')?.trim().slice(0, 80);
  const category = params.get('category')?.trim().slice(0, 80);
  const page = Math.max(Number(params.get('page') ?? 1), 1);
  const take = 24;
  const where = { active: true, category: { active: true, ...(category ? { slug: category } : {}) }, ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { sku: { contains: q, mode: 'insensitive' as const } }] } : {}) };
  const [items, total] = await db.$transaction([
    db.product.findMany({ where, include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, variants: { where: { active: true }, orderBy: { price: 'asc' }, take: 1 }, category: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * take, take }),
    db.product.count({ where })
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / take) }, { headers: { 'Cache-Control': 'no-store' } });
}
