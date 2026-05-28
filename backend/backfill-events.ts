import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando backfill de eventos PURCHASE...');
  
  // Find all order items that don't have a corresponding behavior event
  const orders = await prisma.order.findMany({
    include: { items: true }
  });

  let eventsCreated = 0;

  for (const order of orders) {
    for (const item of order.items) {
      // Check if this purchase event already exists
      const existingEvent = await prisma.behaviorEvent.findFirst({
        where: {
          userId: order.userId,
          productId: item.productId,
          eventType: 'PURCHASE',
          createdAt: order.createdAt
        }
      });

      if (!existingEvent) {
        await prisma.behaviorEvent.create({
          data: {
            userId: order.userId,
            productId: item.productId,
            eventType: 'PURCHASE',
            quantity: item.quantity,
            pricePaid: item.unitPrice,
            createdAt: order.createdAt,
          }
        });
        eventsCreated++;
      }
    }
  }

  console.log(`✅ Backfill completado. Se crearon ${eventsCreated} eventos PURCHASE históricos.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
