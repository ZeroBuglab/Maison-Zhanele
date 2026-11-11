import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await db.category.count();
    return NextResponse.json({ ok: true, database: 'up', timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, database: 'down' }, { status: 503 });
  }
}
