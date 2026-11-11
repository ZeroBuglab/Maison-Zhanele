'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { productSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { hasAdminAccess } from '@/lib/admin-access';
import { createInternalSku } from '@/lib/product-ids';

async function guard() { if (!await hasAdminAccess()) throw new Error('FORBIDDEN'); }
export async function createProduct(input: unknown) { await guard(); const data = productSchema.parse(input); const sku = data.sku ?? createInternalSku(); const product = await db.product.create({ data: { name: data.name, sku, slug: `${slugify(data.name)}-${sku.toLowerCase()}`, description: data.description, basePrice: data.basePrice, compareAtPrice: data.compareAtPrice, categoryId: data.categoryId, collectionId: data.collectionId, featured: data.featured, active: data.active, images: { create: data.imageUrls.map((url, index) => ({ url, alt: data.name, sortOrder: index })) }, variants: { create: data.variants.map((variant, index) => ({ ...variant, sku: variant.sku ?? `${sku}-${index + 1}`, size: variant.size ?? null, color: variant.color ?? null })) } } }); revalidatePath('/'); revalidatePath('/catalog'); revalidatePath('/admin'); return product.id; }
export async function softDeleteProduct(id: string) { await guard(); await db.product.update({ where: { id }, data: { active: false } }); revalidatePath('/catalog'); revalidatePath('/admin'); }
export async function updateOrderStatus(id: string, status: 'NEW' | 'AWAITING_PAYMENT' | 'PROCESSING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED') { await guard(); await db.order.update({ where: { id }, data: { status, ...(status === 'PAID' ? { paymentStatus: 'PAID' } : {}), ...(status === 'SHIPPED' ? { shippingStatus: 'SHIPPED' } : {}), ...(status === 'COMPLETED' ? { shippingStatus: 'DELIVERED' } : {}) } }); revalidatePath('/admin'); }
