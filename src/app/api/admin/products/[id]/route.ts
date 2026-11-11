import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productSchema } from '@/lib/validation';
import { hasAdminAccess } from '@/lib/admin-access';
import { createInternalSku } from '@/lib/product-ids';

const canManage = hasAdminAccess;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await canManage()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  const { id } = await params;
  try {
    const input = productSchema.partial().parse(await request.json());
    const updated = await db.$transaction(async (tx) => {
      if (input.imageUrls) await tx.productImage.deleteMany({ where: { productId: id } });
      if (input.variants) await tx.productVariant.deleteMany({ where: { productId: id } });
      if (input.basePrice !== undefined || input.compareAtPrice !== undefined) await tx.productVariant.updateMany({ where: { productId: id }, data: { ...(input.basePrice !== undefined ? { price: input.basePrice } : {}), ...(input.compareAtPrice !== undefined ? { compareAtPrice: input.compareAtPrice } : {}) } });
      return tx.product.update({ where: { id }, data: { name: input.name, description: input.description, basePrice: input.basePrice, compareAtPrice: input.compareAtPrice, categoryId: input.categoryId, collectionId: input.collectionId, active: input.active, featured: input.featured, ...(input.imageUrls ? { images: { create: input.imageUrls.map((url, sortOrder) => ({ url, alt: input.name ?? 'Product', sortOrder })) } } : {}), ...(input.variants ? { variants: { create: input.variants.map((variant, index) => ({ ...variant, sku: variant.sku ?? createInternalSku('MZV'), size: variant.size ?? null, color: variant.color ?? null })) } } : {}) } });
    });
    return NextResponse.json({ id: updated.id });
  } catch {
    return NextResponse.json({ error: 'Товар не найден или данные некорректны' }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await canManage()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  const { id } = await params;
  try {
    await db.product.update({ where: { id }, data: { active: false } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
  }
}
