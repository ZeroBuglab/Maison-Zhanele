import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hasAdminAccess } from '@/lib/admin-access';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { enforceAdminRateLimit } from '@/lib/admin-rate-limit';

export async function POST(request: Request) {
  if (!await hasAdminAccess()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  if (!(await enforceAdminRateLimit('categories-write')).success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 });
  try {
    const input = categorySchema.parse(await request.json());
    const slug = input.slug ?? slugify(input.name);
    const category = await db.category.create({ data: { name: input.name, slug } });
    return NextResponse.json(category, { status: 201 });
  } catch { return NextResponse.json({ error: 'Не удалось создать категорию. Проверьте название и уникальность.' }, { status: 400 }); }
}
