import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hasAdminAccess } from '@/lib/admin-access';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await hasAdminAccess()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json() as { active?: boolean };
    const category = await db.category.update({ where: { id }, data: { active: body.active !== false } });
    return NextResponse.json(category);
  } catch { return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 }); }
}
