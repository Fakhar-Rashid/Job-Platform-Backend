import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLIENTS = [
  { name: 'Alice', email: 'alice@example.com', paymentVerified: true, rating: 5, totalSpent: 1200, country: 'United Kingdom' },
  { name: 'Bob', email: 'bob@example.com', paymentVerified: true, rating: 4.8, totalSpent: 340, country: 'Germany' },
];

const JOBS = [
  {
    owner: 'alice@example.com',
    title: 'Make an App for my website calculator',
    description:
      'Looking to turn my online glass calculator into a mobile application where customers can sign up, order their glass on the application. Thanks for looking.',
    budget: 900,
    jobType: 'HOURLY',
    experienceLevel: 'ENTRY',
    durationLabel: 'Less than 1 month, Less than 30 hrs/week',
    skills: ['AI Mobile App Development', 'Mobile App Development', 'Android', 'iPhone'],
  },
  {
    owner: 'bob@example.com',
    title: 'Basic Fuel Tracking App Development',
    description:
      'Need a simple cross-platform app to log fuel purchases, track mileage and show monthly spend charts. Clean UI preferred.',
    budget: 600,
    jobType: 'FIXED',
    experienceLevel: 'INTERMEDIATE',
    durationLabel: '1 to 3 months, Less than 30 hrs/week',
    skills: ['React Native', 'Mobile App Development', 'UI/UX Design'],
  },
  {
    owner: 'alice@example.com',
    title: 'Design a modern logo for a coffee brand',
    description:
      'Looking for a clean, modern logo and basic brand palette for a specialty coffee startup. Deliver source files.',
    budget: 150,
    jobType: 'FIXED',
    experienceLevel: 'ENTRY',
    durationLabel: 'Less than 1 week',
    skills: ['Logo Design', 'Branding', 'Adobe Illustrator'],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const byEmail = {};

  for (const client of CLIENTS) {
    byEmail[client.email] = await prisma.user.upsert({
      where: { email: client.email },
      update: { ...client, passwordHash },
      create: { ...client, passwordHash },
    });
  }

  if ((await prisma.job.count()) === 0) {
    for (const { owner, ...job } of JOBS) {
      await prisma.job.create({ data: { ...job, ownerId: byEmail[owner].id } });
    }
  }

  console.log('Seeded demo clients (password: password123) and sample jobs.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
