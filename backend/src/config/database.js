const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Handle cleanup on exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
