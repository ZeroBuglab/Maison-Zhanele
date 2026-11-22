import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [categories, products, administrators] = await db.$transaction([
      db.category.count(),
      db.product.count(),
      db.user.count({ where: { role: 'ADMIN' } })
    ]);
    return NextResponse.json({
      ok: true,
      database: 'up',
      seed: { categories, products, administrators },
      timestamp: new Date().toISOString()
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ok: false, database: 'down' }, { status: 503 });
  }
}
