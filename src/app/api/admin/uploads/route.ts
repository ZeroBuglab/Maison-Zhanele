import { randomUUID } from 'node:crypto';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { hasAdminAccess } from '@/lib/admin-access';
import { enforceAdminRateLimit } from '@/lib/admin-rate-limit';

export const runtime = 'nodejs';

function detectImageExtension(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'gif';
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
  return null;
}

export async function POST(request: Request) {
  if (!await hasAdminAccess()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  if (!(await enforceAdminRateLimit('uploads')).success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Хранилище изображений не настроено' }, { status: 503 });
  if (Number(request.headers.get('content-length') ?? 0) > 6 * 1024 * 1024) return NextResponse.json({ error: 'Слишком большой запрос' }, { status: 413 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    if (!(file instanceof File) || !allowedMimeTypes.has(file.type)) return NextResponse.json({ error: 'Загрузите JPG, PNG, GIF и WebP' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Максимальный размер изображения — 5 МБ' }, { status: 413 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = detectImageExtension(bytes);
    if (!extension) return NextResponse.json({ error: 'Файл не похож на поддерживаемое изображение' }, { status: 400 });

    const blob = await put(`products/${randomUUID()}.${extension}`, Buffer.from(bytes), {
      access: 'public',
      contentType: file.type
    });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Не удалось сохранить изображение' }, { status: 502 });
  }
}
