import { z } from 'zod';

const safeText = (max: number) => z.string().trim().min(1).max(max);
// Vercel is immutable at runtime: product images must always be durable Blob URLs.
const imageUrl = z.string().url().refine((value) => value.startsWith('https://'), 'Изображение должно быть публичным HTTPS URL');

export const giftHintSchema = z.object({
  productId: z.string().cuid().nullable().optional(),
  productName: z.string().trim().max(160).optional(),
  productUrl: z.string().url().max(2048).optional(),
  senderName: safeText(80),
  senderPhone: z.string().regex(/^\+?[0-9 ()-]{10,20}$/),
  recipientName: safeText(80),
  recipientContact: safeText(120),
  message: z.string().trim().max(500).optional().default('')
});

export const cartItemSchema = z.object({ variantId: z.string().cuid(), quantity: z.number().int().min(1).max(20) });

export const checkoutSchema = z.object({
  email: z.string().email().max(160),
  phone: z.string().regex(/^\+?[0-9 ()-]{10,20}$/),
  customerName: safeText(100),
  address: safeText(300),
  paymentMethod: z.literal('MANUAL_KASPI').default('MANUAL_KASPI'),
  packagingType: z.enum(['FREE', 'PREMIUM']).default('FREE'),
  promoCode: z.string().trim().max(30).optional()
});

export const checkoutRequestSchema = checkoutSchema.extend({ items: z.array(cartItemSchema).min(1).max(50) });

const variantSchema = z.object({
  sku: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/).optional(),
  size: z.string().max(30).nullable().optional(),
  color: z.string().max(50).nullable().optional(),
  price: z.number().int().nonnegative(),
  stock: z.number().int().min(0).max(100000)
});

export const productSchema = z.object({
  name: safeText(160),
  sku: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/).optional(),
  description: safeText(5000),
  basePrice: z.number().int().nonnegative(),
  compareAtPrice: z.number().int().nonnegative().nullable().optional(),
  categoryId: z.string().cuid(),
  collectionId: z.string().cuid().nullable().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  imageUrls: z.array(imageUrl).max(12),
  variants: z.array(variantSchema).min(1).max(100)
});

export const categorySchema = z.object({
  name: safeText(80),
  slug: z.string().trim().min(2).max(50).regex(/^[a-z0-9-]+$/).optional()
});

const promoCodeFields = z.object({
  code: z.string().trim().min(2).max(30).regex(/^[A-Za-z0-9_-]+$/).transform((value) => value.toUpperCase()),
  percent: z.number().int().min(1).max(100).nullable().optional(),
  amount: z.number().int().positive().nullable().optional(),
  minTotal: z.number().int().min(0).default(0),
  maxUses: z.number().int().min(1).nullable().optional(),
  active: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional()
});

function validatePromoDates(value: { startsAt?: string; expiresAt?: string | null }, ctx: z.RefinementCtx) {
  if (value.startsAt && value.expiresAt && new Date(value.expiresAt) <= new Date(value.startsAt)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiresAt'], message: 'Дата окончания должна быть позже даты начала' });
}

export const promoCodeSchema = promoCodeFields.superRefine((value, ctx) => {
  if (Boolean(value.percent) === Boolean(value.amount)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['percent'], message: 'Укажите процент или фиксированную сумму скидки' });
  validatePromoDates(value, ctx);
});

export const promoCodeUpdateSchema = promoCodeFields.partial().superRefine((value, ctx) => {
  if (value.percent !== undefined && value.amount !== undefined && Boolean(value.percent) === Boolean(value.amount)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['percent'], message: 'Укажите только один тип скидки' });
  validatePromoDates(value, ctx);
});
