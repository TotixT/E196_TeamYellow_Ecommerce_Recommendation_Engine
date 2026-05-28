import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.behaviorEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  console.log('Last 10 events in DB:', JSON.stringify(events, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
