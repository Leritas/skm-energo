import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ALL_PERMISSIONS, Permission } from '@skm/specs';

const prisma = new PrismaClient();

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

  // Ensure default user role exists for FK/reference (logged for seed clarity)
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
