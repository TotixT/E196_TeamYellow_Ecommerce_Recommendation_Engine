import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos ampliada...');

  // Hashear contraseñas
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

  // 2. Crear 10 Usuarios de Prueba
  const usersData = Array.from({ length: 10 }).map((_, i) => ({
    email: `usuario${i + 1}@example.com`,
    passwordHash: userPasswordHash,
    fullName: `Cliente Prueba ${i + 1}`,
    role: 'user' as any,
  }));

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u },
    });
    createdUsers.push(user);
  }
  console.log(`✅ ${createdUsers.length} Usuarios creados`);

  // 3. Crear 6 Categorías
  const categoriesData = [
    {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Teléfonos inteligentes',
    },
    {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Portátiles para trabajo y gaming',
    },
    { name: 'Audio', slug: 'audio', description: 'Audífonos y parlantes' },
    {
      name: 'Smartwatches',
      slug: 'smartwatches',
      description: 'Relojes inteligentes',
    },
    {
      name: 'Tablets',
      slug: 'tablets',
      description: 'Tabletas para diseño y consumo',
    },
    {
      name: 'Accesorios',
      slug: 'accesorios',
      description: 'Cables, fundas y cargadores',
    },
  ];

  const createdCategories = [];
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, status: 'active' },
    });
    createdCategories.push(cat);
  }
  console.log(`✅ ${createdCategories.length} Categorías creadas`);

  // 4. Crear 18 Productos (3 por categoría)
  const productsData = [
    // Smartphones
    { catSlug: 'smartphones', name: 'iPhone 15 Pro', price: 999.99, stock: 50 },
    {
      catSlug: 'smartphones',
      name: 'Samsung Galaxy S24 Ultra',
      price: 1199.99,
      stock: 30,
    },
    {
      catSlug: 'smartphones',
      name: 'Google Pixel 8 Pro',
      price: 899.99,
      stock: 20,
    },
    // Laptops
    { catSlug: 'laptops', name: 'MacBook Air M3', price: 1099.0, stock: 20 },
    { catSlug: 'laptops', name: 'Dell XPS 15', price: 1500.0, stock: 15 },
    {
      catSlug: 'laptops',
      name: 'Lenovo ThinkPad X1',
      price: 1399.0,
      stock: 10,
    },
    // Audio
    { catSlug: 'audio', name: 'AirPods Pro 2', price: 249.0, stock: 100 },
    { catSlug: 'audio', name: 'Sony WH-1000XM5', price: 348.0, stock: 45 },
    {
      catSlug: 'audio',
      name: 'Bose QuietComfort Ultra',
      price: 379.0,
      stock: 30,
    },
    // Smartwatches
    {
      catSlug: 'smartwatches',
      name: 'Apple Watch Series 9',
      price: 399.0,
      stock: 60,
    },
    {
      catSlug: 'smartwatches',
      name: 'Samsung Galaxy Watch 6',
      price: 299.0,
      stock: 50,
    },
    {
      catSlug: 'smartwatches',
      name: 'Garmin Fenix 7',
      price: 699.0,
      stock: 15,
    },
    // Tablets
    { catSlug: 'tablets', name: 'iPad Pro M4', price: 999.0, stock: 25 },
    {
      catSlug: 'tablets',
      name: 'Samsung Galaxy Tab S9',
      price: 799.0,
      stock: 20,
    },
    { catSlug: 'tablets', name: 'iPad Air M2', price: 599.0, stock: 35 },
    // Accesorios
    {
      catSlug: 'accesorios',
      name: 'Cargador Anker 65W',
      price: 39.99,
      stock: 200,
    },
    {
      catSlug: 'accesorios',
      name: 'Funda Spigen iPhone 15',
      price: 19.99,
      stock: 150,
    },
    { catSlug: 'accesorios', name: 'Cable USB-C 2M', price: 14.99, stock: 300 },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const category = createdCategories.find((c) => c.slug === p.catSlug);
    if (!category) continue;

    const existing = await prisma.product.findFirst({
      where: { name: p.name },
    });
    if (!existing) {
      const prod = await prisma.product.create({
        data: {
          categoryId: category.id,
          name: p.name,
          description: `Descripción genérica de ${p.name}`,
          price: p.price,
          stock: p.stock,
          status: 'active',
        },
      });
      createdProducts.push(prod);
    } else {
      createdProducts.push(existing);
    }
  }
  console.log(`✅ ${createdProducts.length} Productos asegurados`);

  // 5. Generar 20 Compras Históricas (Seed para el Motor de Recomendación)
  // Check if orders already exist to avoid duplicate seed inflation
  const existingOrdersCount = await prisma.order.count();
  if (existingOrdersCount < 10) {
    console.log('🔄 Generando compras históricas...');

    for (let i = 1; i <= 20; i++) {
      // Pick a random user
      const randomUser =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      // Pick 2 random products
      const p1 =
        createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const p2 =
        createdProducts[Math.floor(Math.random() * createdProducts.length)];

      const subtotal = Number(p1.price) + Number(p2.price);
      const year = new Date().getFullYear();
      const orderNumber = `ORD-${year}SEED${String(i).padStart(3, '0')}`;

      await prisma.order.create({
        data: {
          id: uuidv7(),
          userId: randomUser.id,
          orderNumber,
          status: 'delivered',
          subtotal,
          shippingCost: 0,
          total: subtotal,
          shippingName: randomUser.fullName,
          shippingAddress: 'Seed Address',
          shippingCity: 'Seed City',
          shippingPhone: '555-0000',
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
          ), // Random date in last 30 days
          items: {
            create: [
              {
                productId: p1.id,
                quantity: 1,
                unitPrice: p1.price,
                lineTotal: p1.price,
              },
              {
                productId: p2.id,
                quantity: 1,
                unitPrice: p2.price,
                lineTotal: p2.price,
              },
            ],
          },
        },
      });

      // Update purchase count for recommendation algorithm
      await prisma.product.updateMany({
        where: { id: { in: [p1.id, p2.id] } },
        data: { purchaseCount: { increment: 1 } },
      });
    }
    console.log('✅ 20 Órdenes históricas creadas');
  } else {
    console.log('⏭️ Órdenes históricas ya existen, saltando...');
  }

  console.log('🎉 SEED COMPLETADO SATISFACTORIAMENTE');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
