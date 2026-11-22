import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { hasAdminAccess } from '@/lib/admin-access';
import { createInternalSku } from '@/lib/product-ids';
import { enforceAdminRateLimit } from '@/lib/admin-rate-limit';
import { revalidatePath } from 'next/cache';

const staff = hasAdminAccess;

export async function GET() {
  if (!await staff()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  if (!(await enforceAdminRateLimit('products-read')).success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 });
  const [products, categories] = await Promise.all([
    db.product.findMany({ include: { category: true, images: { orderBy: { sortOrder: 'asc' } }, variants: { orderBy: { price: 'asc' } } }, orderBy: { createdAt: 'desc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } })
  ]);
  return NextResponse.json({ products, categories }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (!await staff()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  if (!(await enforceAdminRateLimit('products-write')).success) return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 });
  if (Number(request.headers.get('content-length') ?? 0) > 1_000_000) return NextResponse.json({ error: 'Слишком большой запрос' }, { status: 413 });
  try {
    const input = productSchema.parse(await request.json());
    const [category, collection] = await Promise.all([
      db.category.findUnique({ where: { id: input.categoryId }, select: { active: true } }),
      input.collectionId ? db.collection.findUnique({ where: { id: input.collectionId }, select: { id: true } }) : null
    ]);
    if (!category?.active) return NextResponse.json({ error: 'Категория не найдена или скрыта' }, { status: 400 });
    if (input.collectionId && !collection) return NextResponse.json({ error: 'Коллекция не найдена' }, { status: 400 });
    const sku = input.sku ?? createInternalSku();
    const product = await db.product.create({ data: { name: input.name, sku, slug: `${slugify(input.name)}-${sku.toLowerCase()}`, description: input.description, basePrice: input.basePrice, compareAtPrice: input.compareAtPrice, categoryId: input.categoryId, collectionId: input.collectionId, active: input.active, featured: input.featured, images: { create: input.imageUrls.map((url, sortOrder) => ({ url, alt: input.name, sortOrder })) }, variants: { create: input.variants.map((variant, index) => ({ ...variant, sku: variant.sku ?? `${sku}-${index + 1}`, size: variant.size ?? null, color: variant.color ?? null })) } } });
    revalidatePath('/'); revalidatePath('/catalog'); revalidatePath('/admin'); revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Некорректные данные товара или такой код уже существует' }, { status: 400 }); }
}
