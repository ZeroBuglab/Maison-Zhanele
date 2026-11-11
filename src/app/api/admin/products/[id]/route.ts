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
    if (input.categoryId) {
      const category = await db.category.findUnique({ where: { id: input.categoryId }, select: { active: true } });
      if (!category?.active) return NextResponse.json({ error: 'Категория не найдена или скрыта' }, { status: 400 });
    }
    if (input.collectionId) {
      const collection = await db.collection.findUnique({ where: { id: input.collectionId }, select: { id: true } });
      if (!collection) return NextResponse.json({ error: 'Коллекция не найдена' }, { status: 400 });
    }
    const updated = await db.$transaction(async (tx) => {
      const current = await tx.product.findUnique({ where: { id }, include: { variants: { select: { orderItems: { select: { id: true }, take: 1 } } } } });
      if (!current) throw new Error('PRODUCT_NOT_FOUND');
      if (input.variants && current.variants.some((variant) => variant.orderItems.length > 0)) throw new Error('VARIANTS_LOCKED');
      if (input.imageUrls) await tx.productImage.deleteMany({ where: { productId: id } });
      if (input.variants) await tx.productVariant.deleteMany({ where: { productId: id } });
      if (input.basePrice !== undefined || input.compareAtPrice !== undefined) await tx.productVariant.updateMany({ where: { productId: id }, data: { ...(input.basePrice !== undefined ? { price: input.basePrice } : {}), ...(input.compareAtPrice !== undefined ? { compareAtPrice: input.compareAtPrice } : {}) } });
      return tx.product.update({ where: { id }, data: { name: input.name, description: input.description, basePrice: input.basePrice, compareAtPrice: input.compareAtPrice, categoryId: input.categoryId, collectionId: input.collectionId, active: input.active, featured: input.featured, ...(input.imageUrls ? { images: { create: input.imageUrls.map((url, sortOrder) => ({ url, alt: input.name ?? 'Product', sortOrder })) } } : {}), ...(input.variants ? { variants: { create: input.variants.map((variant, index) => ({ ...variant, sku: variant.sku ?? createInternalSku('MZV'), size: variant.size ?? null, color: variant.color ?? null })) } } : {}) } });
    });
    return NextResponse.json({ id: updated.id });
  } catch (error) {
    const message = error instanceof Error && error.message === 'VARIANTS_LOCKED' ? 'Нельзя заменить варианты: по товару уже есть оформленные заказы' : error instanceof Error && error.message === 'PRODUCT_NOT_FOUND' ? 'Товар не найден' : 'Данные товара некорректны';
    return NextResponse.json({ error: message }, { status: error instanceof Error && error.message === 'PRODUCT_NOT_FOUND' ? 404 : 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await canManage()) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  const { id } = await params;
  try { await db.product.update({ where: { id }, data: { active: false } }); return new NextResponse(null, { status: 204 }); }
  catch { return NextResponse.json({ error: 'Товар не найден' }, { status: 404 }); }
}
