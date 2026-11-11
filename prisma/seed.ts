import { BraceletType, Metal, PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const categories = [
  { name: 'Кольца', slug: 'rings' },
  { name: 'Колье', slug: 'necklaces' },
  { name: 'Шармы', slug: 'charms', active: false },
  { name: 'Часы', slug: 'watches' },
  { name: 'Комплекты', slug: 'sets' },
  { name: 'Браслеты', slug: 'bracelets' },
  { name: 'Цепочки', slug: 'chains' }
];

async function main() {
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedAdminEmail || !seedAdminPassword) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before running the seed.');
  }
  if (seedAdminPassword.length < 12) throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters.');

  const categoryRecords = await Promise.all(categories.map((category) => db.category.upsert({ where: { slug: category.slug }, update: { name: category.name, active: category.active ?? true }, create: category })));
  const bracelets = categoryRecords.find((category) => category.slug === 'bracelets');
  if (!bracelets) throw new Error('The bracelets category was not created.');
  const collection = await db.collection.upsert({ where: { slug: 'rose' }, update: { name: 'Rose' }, create: { name: 'Rose', slug: 'rose' } });
  const passwordHash = await bcrypt.hash(seedAdminPassword, 12);

  await db.user.upsert({
    where: { email: seedAdminEmail },
    update: { role: Role.ADMIN, passwordHash },
    create: { email: seedAdminEmail, name: 'Maison Admin', passwordHash, role: Role.ADMIN }
  });

  await db.product.upsert({
    where: { sku: 'MZ-ROSE-001' },
    update: { categoryId: bracelets.id, collectionId: collection.id },
    create: {
      sku: 'MZ-ROSE-001',
      name: 'Браслет Rose Tennis',
      slug: 'rose-tennis',
      description: 'Лаконичный браслет для ежедневного сияния.',
      basePrice: 38900,
      categoryId: bracelets.id,
      collectionId: collection.id,
      featured: true,
      braceletType: BraceletType.CHARM,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200&q=85', alt: 'Браслет Rose Tennis' }] },
      variants: { create: [
        { sku: 'MZ-ROSE-001-17', size: '17', color: 'Rose', metal: Metal.ROSE_GOLD, price: 38900, stock: 12 },
        { sku: 'MZ-ROSE-001-19', size: '19', color: 'Rose', metal: Metal.ROSE_GOLD, price: 38900, stock: 8 }
      ] }
    }
  });
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Seed failed.');
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
