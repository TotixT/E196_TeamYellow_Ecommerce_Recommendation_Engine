import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...');

  // Hashear contraseñas con el costo de 12 que usamos en el auth module
  const adminPasswordHash = await bcrypt.hash('*S4nt14g0*_', 12);
  const userPasswordHash = await bcrypt.hash('password123', 12);

  // 1. Crear Administrador (Santiago)
  const admin = await prisma.user.upsert({
    where: { email: 'santiagolopezgarcia22@gmail.com' },
    update: { role: 'admin' },
    create: {
      email: 'santiagolopezgarcia22@gmail.com',
      passwordHash: adminPasswordHash,
      fullName: 'Santiago Lopez Garcia',
      phone: '+573112664689',
      address: 'Zapamanga IV, Floridablanca',
      role: 'admin',
    },
  });
  console.log('✅ Admin creado:', admin.email);

  // 2. Crear Usuarios (Juan y Maria)
  const user1 = await prisma.user.upsert({
    where: { email: 'juan@example.com' },
    update: {},
    create: {
      email: 'juan@example.com',
      passwordHash: userPasswordHash,
      fullName: 'Juan Perez',
      role: 'user',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      email: 'maria@example.com',
      passwordHash: userPasswordHash,
      fullName: 'Maria Rodriguez',
      role: 'user',
    },
  });
  console.log('✅ Usuarios creados:', user1.email, user2.email);

  // 3. Crear Categorías (Smartphones, Laptops, Audio)
  const catSmartphones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Teléfonos inteligentes de última generación',
      status: 'active',
    },
  });

  const catLaptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Portátiles para trabajo y gaming',
      status: 'active',
    },
  });

  const catAudio = await prisma.category.upsert({
    where: { slug: 'audio' },
    update: {},
    create: {
      name: 'Audio',
      slug: 'audio',
      description: 'Audífonos, parlantes y equipos de sonido',
      status: 'active',
    },
  });
  console.log('✅ Categorías creadas');

  // 4. Crear Productos (6 productos)
  const products = [
    {
      categoryId: catSmartphones.id,
      name: 'iPhone 15 Pro',
      description: 'El último iPhone con titanio y chip A17 Pro.',
      price: 999.99,
      stock: 50,
      status: 'active',
    },
    {
      categoryId: catSmartphones.id,
      name: 'Samsung Galaxy S24 Ultra',
      description: 'El mejor Android con Inteligencia Artificial.',
      price: 1199.99,
      stock: 30,
      status: 'active',
    },
    {
      categoryId: catLaptops.id,
      name: 'MacBook Air M3',
      description: 'Portátil ligero y súper potente con chip M3.',
      price: 1099.0,
      stock: 20,
      status: 'active',
    },
    {
      categoryId: catLaptops.id,
      name: 'Dell XPS 15',
      description: 'Diseño premium y pantalla OLED 4K.',
      price: 1500.0,
      stock: 15,
      status: 'active',
    },
    {
      categoryId: catAudio.id,
      name: 'AirPods Pro 2',
      description: 'Cancelación de ruido activa y sonido espacial.',
      price: 249.0,
      stock: 100,
      status: 'active',
    },
    {
      categoryId: catAudio.id,
      name: 'Sony WH-1000XM5',
      description: 'Los mejores audífonos de diadema del mercado.',
      price: 348.0,
      stock: 45,
      status: 'active',
    },
  ];

  for (const prod of products) {
    // Check if it already exists to avoid duplicates on multiple runs
    const existing = await prisma.product.findFirst({
      where: { name: prod.name },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          categoryId: prod.categoryId,
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          status: prod.status as any,
        },
      });
    }
  }
  console.log('✅ 6 Productos creados con éxito');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
