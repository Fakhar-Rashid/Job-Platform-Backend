export const CLIENTS = [
  {
    name: 'Alice',
    email: 'alice@example.com',
    paymentVerified: true,
    rating: 5,
    totalSpent: 1200,
    country: 'United Kingdom',
    activeRole: 'CLIENT' as const,
    walletBalance: 5000,
  },
  {
    name: 'Bob',
    email: 'bob@example.com',
    paymentVerified: true,
    rating: 5,
    totalSpent: 340,
    country: 'Germany',
    activeRole: 'CLIENT' as const,
    walletBalance: 2000,
  },
];

export const FAKHAR = {
  name: 'Muhammad Fakhar R.',
  title: 'Mobile App Developer | Android | iOS | Flutter | React Native | AI apps',
  overview:
    'I love building software that ships. Whether you need a mobile app, an AI feature or a backend API, I can take your idea from concept to production. My focus is clean, maintainable code.',
  hourlyRate: 15,
  city: 'Lahore',
  country: 'Pakistan',
  connectBalance: 137,
  responseTime: '0-4 hours',
  hoursPerWeek: 'MORE_THAN_30' as const,
  openToContractToHire: true,
  idVerified: true,
  phoneVerified: true,
  boostProfile: true,
  skills: [
    'Flutter',
    'Android',
    'iOS',
    'Smartphone',
    'Mobile App Development',
    'Firebase',
    'Dart',
    'React Native',
    'API Integration',
    'JavaScript',
    'Node.js',
    'UX & UI',
  ],
};

export const OPEN_JOBS = [
  {
    owner: 'alice@example.com',
    title: 'Make an App for my website calculator',
    description:
      'Looking to turn my online glass calculator into a mobile application where customers can sign up and order their glass on the app.',
    jobType: 'HOURLY' as const,
    hourlyRateMin: 3,
    hourlyRateMax: 5,
    experienceLevel: 'ENTRY' as const,
    category: 'Mobile App Development',
    projectTerm: 'SHORT_TERM' as const,
    scopeSize: 'MEDIUM' as const,
    duration: 'ONE_TO_THREE_MONTHS' as const,
    contractToHire: true,
    connectsRequired: 10,
    skills: ['AI Mobile App Development', 'Mobile App Development', 'Android', 'iPhone'],
  },
  {
    owner: 'bob@example.com',
    title: 'Basic Fuel Tracking App Development',
    description:
      'Need a simple cross-platform app to log fuel purchases, track mileage and show monthly spend charts.',
    budget: 600,
    jobType: 'FIXED' as const,
    experienceLevel: 'INTERMEDIATE' as const,
    category: 'Mobile App Development',
    projectTerm: 'SHORT_TERM' as const,
    scopeSize: 'MEDIUM' as const,
    duration: 'ONE_TO_THREE_MONTHS' as const,
    connectsRequired: 10,
    skills: ['React Native', 'Mobile App Development', 'UI/UX Design'],
  },
];

export const COMPLETED = [
  {
    owner: 'alice@example.com',
    title: 'Fix Bugs & Add Features to Existing Flutter App',
    amount: 165,
    rating: 5,
    comment: 'Jumped into our Flutter codebase without hand-holding and fixed issues faster than expected.',
    clientComment: 'Clear brief, fast payments and quick responses. Great client to work with.',
    endorsements: [
      'Reliable',
      'Committed to Quality',
      'Solution Oriented',
      'Clear Communicator',
      'Accountable for Outcomes',
    ],
  },
  {
    owner: 'bob@example.com',
    title: 'Android & iOS App Development in Flutter',
    amount: 35,
    rating: 5,
    comment: 'Great to work with, communicates clearly, and is very skilled.',
    clientComment: 'Straightforward scope and friendly communication throughout.',
    endorsements: ['Collaborative', 'Clear Communicator', 'Committed to Quality'],
  },
];

export const PROFILE_CHILDREN = {
  languages: [
    { name: 'English', proficiency: 'CONVERSATIONAL' as const },
    { name: 'Urdu', proficiency: 'NATIVE_OR_BILINGUAL' as const },
    { name: 'Punjabi', proficiency: 'CONVERSATIONAL' as const },
    { name: 'Hindi', proficiency: 'BASIC' as const },
  ],
  education: {
    school: 'National University of Computer and Emerging Sciences',
    degree: 'Bachelor of Computer Science (BCompSc)',
    fieldOfStudy: 'Software Engineering',
    startYear: 2022,
    endYear: 2026,
  },
  employment: { company: 'HappyChef', title: 'Software Engineer', startDate: '2025-06', current: true },
  portfolio: [
    {
      title: 'Void — Multi-Vendor eCommerce Mobile App',
      category: 'Mobile App',
      description: 'Firebase, Real-Time Chat',
    },
    {
      title: 'SAAS | Client-Server Desktop App',
      category: 'Desktop App',
      description: 'Role-Based POS & Inventory',
    },
    { title: 'Framer Website for Dentist', category: 'Website' },
  ],
  linkedAccounts: [
    { provider: 'GitHub', username: 'Fakhar Rashid', url: 'https://github.com/' },
    { provider: 'StackOverflow', username: 'Fakhar', url: 'https://stackoverflow.com/' },
  ],
  otherExperience: {
    subject: 'AI Image Generation for Marketing & Branding',
    description: 'Created photorealistic marketing visuals using AI tools for clients across several industries.',
  },
};
