import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ALL_PERMISSIONS, Permission, migrateLegacyCatalogPermissions } from '@skm/specs';
import {
  CATALOG_SEED_CATEGORIES,
  CATALOG_SEED_MANUFACTURERS,
  CATALOG_SEED_PRODUCTS,
  type CatalogSeedCategory,
} from './catalog-seed-data';
import { NEWS_SEED_ARTICLES } from './news-seed-data';

const prisma = new PrismaClient();

async function seedCatalogCategories(
  categories: CatalogSeedCategory[],
  parentId: number | null = null,
) {
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, parentId, isPublished: true },
      create: {
        slug: category.slug,
        name: category.name,
        parentId,
        isPublished: true,
      },
    });

    if (category.children?.length) {
      await seedCatalogCategories(category.children, row.id);
    }
  }
}

async function seedCatalog() {
  for (const manufacturer of CATALOG_SEED_MANUFACTURERS) {
    await prisma.manufacturer.upsert({
      where: { slug: manufacturer.slug },
      update: { name: manufacturer.name },
      create: manufacturer,
    });
  }

  await seedCatalogCategories(CATALOG_SEED_CATEGORIES);

  const manufacturers = await prisma.manufacturer.findMany();
  const categories = await prisma.category.findMany();
  const manufacturerBySlug = new Map(
    manufacturers.map((item) => [item.slug, item.id]),
  );
  const categoryBySlug = new Map(categories.map((item) => [item.slug, item.id]));

  for (const product of CATALOG_SEED_PRODUCTS) {
    const manufacturerId = manufacturerBySlug.get(product.manufacturerSlug);
    const categoryId = categoryBySlug.get(product.categorySlug);

    if (manufacturerId === undefined || categoryId === undefined) {
      throw new Error(
        `Missing manufacturer/category for product ${product.slug}`,
      );
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        sku: product.sku,
        description: product.description,
        specs: product.specs,
        pdfHref: product.pdfHref ?? null,
        badges: product.badges ?? [],
        similarSlugs: product.similarSlugs ?? [],
        manufacturerId,
        categoryId,
        isPublished: true,
      },
      create: {
        slug: product.slug,
        title: product.title,
        sku: product.sku,
        description: product.description,
        specs: product.specs,
        pdfHref: product.pdfHref ?? null,
        badges: product.badges ?? [],
        similarSlugs: product.similarSlugs ?? [],
        manufacturerId,
        categoryId,
        isPublished: true,
      },
    });
  }

  console.log(
    `Seeded catalog: ${CATALOG_SEED_MANUFACTURERS.length} manufacturers, ${categories.length} categories, ${CATALOG_SEED_PRODUCTS.length} products`,
  );
}

async function seedNews() {
  for (const article of NEWS_SEED_ARTICLES) {
    const data = {
      title: article.title,
      excerpt: article.excerpt,
      body: article.body,
      publishDate: new Date(article.publishDate),
      published: true,
    };

    await prisma.newsArticle.upsert({
      where: { slug: article.slug },
      update: data,
      create: { slug: article.slug, ...data },
    });
  }

  console.log(`Seeded news: ${NEWS_SEED_ARTICLES.length} articles`);
}

async function migrateRoleCatalogPermissions() {
  const roles = await prisma.role.findMany();
  let updated = 0;

  for (const role of roles) {
    const migrated = migrateLegacyCatalogPermissions(role.permissions);
    const before = [...role.permissions].sort().join(',');
    const after = [...migrated].sort().join(',');
    if (before === after) {
      continue;
    }

    await prisma.role.update({
      where: { id: role.id },
      data: { permissions: migrated },
    });
    updated += 1;
  }

  if (updated > 0) {
    console.log(`Migrated catalog permissions for ${updated} role(s)`);
  }
}

async function main() {
  const userRole = await prisma.role.upsert({
    where: { slug: 'user' },
    update: {
      name: 'User',
      permissions: [],
      isSystem: true,
    },
    create: {
      slug: 'user',
      name: 'User',
      permissions: [],
      isSystem: true,
    },
  });

  const moderatorPermissions = [
    Permission.hasAccessToAdmin,
    Permission.hasAccessToNews,
    Permission.canManageNews,
    Permission.hasAccessToOrders,
    Permission.canManageOrders,
  ];

  await prisma.role.upsert({
    where: { slug: 'moderator' },
    update: {
      name: 'Moderator',
      permissions: moderatorPermissions,
      isSystem: true,
    },
    create: {
      slug: 'moderator',
      name: 'Moderator',
      permissions: moderatorPermissions,
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {
      name: 'Admin',
      permissions: [...ALL_PERMISSIONS],
      isSystem: true,
    },
    create: {
      slug: 'admin',
      name: 'Admin',
      permissions: [...ALL_PERMISSIONS],
      isSystem: true,
    },
  });

  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@skmenergo.ru';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeAdmin1!';
  const name = process.env.SEED_ADMIN_NAME ?? 'Admin';
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
    },
    create: {
      email,
      name,
      passwordHash,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: admin.id, roleId: adminRole.id },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  await migrateRoleCatalogPermissions();

  await seedCatalog();
  await seedNews();

  console.log(`Seeded roles: user(#${userRole.id}), moderator, admin(#${adminRole.id})`);
  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
