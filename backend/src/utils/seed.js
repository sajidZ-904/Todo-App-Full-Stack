const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create sample categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Work',
          color: '#3B82F6'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Personal',
          color: '#10B981'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Shopping',
          color: '#F59E0B'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Health',
          color: '#EF4444'
        }
      })
    ]);

    // Create sample tasks
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          title: 'Complete project proposal',
          description: 'Finish the Q1 project proposal for client presentation',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          categoryId: categories[0].id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Review team feedback',
          description: 'Go through all team member feedback from last sprint',
          priority: 'MEDIUM',
          categoryId: categories[0].id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Call dentist',
          description: 'Schedule appointment for dental checkup',
          priority: 'LOW',
          categoryId: categories[3].id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Buy groceries',
          description: 'Milk, bread, eggs, vegetables',
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          categoryId: categories[2].id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Plan weekend trip',
          description: 'Research destinations and book accommodation',
          priority: 'LOW',
          completed: true,
          categoryId: categories[1].id
        }
      })
    ]);

    console.log('Database seeding completed successfully!');
    console.log(`Created ${categories.length} categories and ${tasks.length} tasks`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();