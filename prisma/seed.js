import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLIENTS = [
  { name: 'Alice', email: 'alice@example.com', paymentVerified: true, rating: 5, totalSpent: 1200, country: 'United Kingdom' },
  { name: 'Bob', email: 'bob@example.com', paymentVerified: true, rating: 4.8, totalSpent: 340, country: 'Germany' },
];

const FAKHAR = {
  name: 'Muhammad Fakhar R.',
  title: 'Mobile App Developer | Android | iOS | Flutter | React Native | AI apps',
  overview:
    'I love building software that ships. Whether you need a mobile app, an AI feature or a backend API, I can take your idea from concept to production. My focus is clean, maintainable code.',
  hourlyRate: 15,
  city: 'Lahore',
  country: 'Pakistan',
  connectBalance: 137,
  responseTime: '0-4 hours',
  hoursPerWeek: 'MORE_THAN_30',
  openToContractToHire: true,
  idVerified: true,
  phoneVerified: true,
  boostProfile: true,
  skills: [
    'Flutter', 'Android', 'iOS', 'Smartphone', 'Mobile App Development', 'Firebase', 'Dart',
    'React Native', 'API Integration', 'JavaScript', 'Node.js', 'UX & UI',
  ],
};

const OPEN_JOBS = [
  {
    owner: 'alice@example.com',
    title: 'Make an App for my website calculator',
    description:
      'Looking to turn my online glass calculator into a mobile application where customers can sign up and order their glass on the app.',
    budget: 900, jobType: 'HOURLY', experienceLevel: 'ENTRY',
    durationLabel: 'Less than 1 month, Less than 30 hrs/week',
    skills: ['AI Mobile App Development', 'Mobile App Development', 'Android', 'iPhone'],
  },
  {
    owner: 'bob@example.com',
    title: 'Basic Fuel Tracking App Development',
    description: 'Need a simple cross-platform app to log fuel purchases, track mileage and show monthly spend charts.',
    budget: 600, jobType: 'FIXED', experienceLevel: 'INTERMEDIATE',
    durationLabel: '1 to 3 months, Less than 30 hrs/week',
    skills: ['React Native', 'Mobile App Development', 'UI/UX Design'],
  },
];

const COMPLETED = [
  {
    owner: 'alice@example.com', title: 'Fix Bugs & Add Features to Existing Flutter App',
    amount: 165, rating: 5, comment: 'Jumped into our Flutter codebase without hand-holding and fixed issues faster than expected.',
    endorsements: ['Reliable', 'Committed to Quality', 'Solution Oriented', 'Clear Communicator', 'Accountable for Outcomes'],
  },
  {
    owner: 'bob@example.com', title: 'Android & iOS App Development in Flutter',
    amount: 35, rating: 5, comment: 'Great to work with, communicates clearly, and is very skilled.',
    endorsements: ['Collaborative', 'Clear Communicator', 'Committed to Quality'],
  },
];

async function seedProfileChildren(userId) {
  await prisma.language.createMany({
    data: [
      { userId, name: 'English', proficiency: 'CONVERSATIONAL' },
      { userId, name: 'Urdu', proficiency: 'NATIVE_OR_BILINGUAL' },
      { userId, name: 'Punjabi', proficiency: 'CONVERSATIONAL' },
      { userId, name: 'Hindi', proficiency: 'BASIC' },
    ],
  });
  await prisma.education.create({
    data: {
      userId, school: 'National University of Computer and Emerging Sciences',
      degree: 'Bachelor of Computer Science (BCompSc)', fieldOfStudy: 'Software Engineering',
      startYear: 2022, endYear: 2026,
    },
  });
  await prisma.employment.create({
    data: { userId, company: 'HappyChef', title: 'Software Engineer', startDate: '2025-06', current: true },
  });
  await prisma.portfolioItem.createMany({
    data: [
      { userId, title: 'Void — Multi-Vendor eCommerce Mobile App', category: 'Mobile App', description: 'Firebase, Real-Time Chat' },
      { userId, title: 'SAAS | Client-Server Desktop App', category: 'Desktop App', description: 'Role-Based POS & Inventory' },
      { userId, title: 'Framer Website for Dentist', category: 'Website' },
    ],
  });
  await prisma.linkedAccount.createMany({
    data: [
      { userId, provider: 'GitHub', username: 'Fakhar Rashid', url: 'https://github.com/' },
      { userId, provider: 'StackOverflow', username: 'Fakhar', url: 'https://stackoverflow.com/' },
    ],
  });
  await prisma.otherExperience.create({
    data: {
      userId, subject: 'AI Image Generation for Marketing & Branding',
      description: 'Created photorealistic marketing visuals using AI tools for clients across several industries.',
    },
  });
}

async function seedCompletedJob(fakharId, ownerId, item) {
  const job = await prisma.job.create({
    data: { ownerId, title: item.title, description: item.comment, budget: item.amount, status: 'CLOSED', jobType: 'FIXED' },
  });
  await prisma.bid.create({
    data: { jobId: job.id, freelancerId: fakharId, amount: item.amount, coverLetter: 'Happy to help on this project.', connectsSpent: 5, status: 'ACCEPTED' },
  });
  await prisma.review.create({
    data: {
      jobId: job.id, authorId: ownerId, freelancerId: fakharId, rating: item.rating,
      comment: item.comment, endorsements: item.endorsements, amount: item.amount, priceType: 'FIXED',
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const byEmail = {};

  for (const client of CLIENTS) {
    byEmail[client.email] = await prisma.user.upsert({
      where: { email: client.email }, update: { ...client, passwordHash }, create: { ...client, passwordHash },
    });
  }

  const fakhar = await prisma.user.upsert({
    where: { email: 'fakhar@example.com' }, update: { ...FAKHAR }, create: { email: 'fakhar@example.com', passwordHash, ...FAKHAR },
  });

  if ((await prisma.job.count()) === 0) {
    await seedProfileChildren(fakhar.id);
    for (const { owner, ...job } of OPEN_JOBS) {
      await prisma.job.create({ data: { ...job, ownerId: byEmail[owner].id } });
    }
    for (const item of COMPLETED) {
      await seedCompletedJob(fakhar.id, byEmail[item.owner].id, item);
    }
  }

  console.log('Seeded clients + freelancer fakhar@example.com (password: password123).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
