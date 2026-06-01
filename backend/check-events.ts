import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.behaviorEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      product: { select: { name: true, category: { select: { name: true } } } }
    }
  });

  console.log('--- Ultimos 10 eventos ---');
  events.forEach(e => {
    console.log(`[${e.createdAt.toISOString()}] ${e.eventType} - Producto: ${e.product.name} (Cat: ${e.product.category.name}) - Usuario: ${e.userId} - Sesion: ${e.sessionId}`);
  });
}

main().finally(() => prisma.$disconnect());
