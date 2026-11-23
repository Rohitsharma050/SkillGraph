import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import userModel from './Models/userModel.js';
import jobModel from './Models/jobModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dns.setServers(['1.1.1.1', '8.8.8.8']);

export const sampleJobs = [
  {
    company: 'Google',
    role: 'Frontend Engineer',
    status: 'Interview',
    notes: 'Phone screen went really well. Technical interview scheduled.',
    jobLink: 'https://careers.google.com',
    appliedDate: new Date(Date.now() - 15 * 86400000),
    tags: ['Dream', 'Remote'],
    resume: 'Resume_2026.pdf',
    salary: '$150k–$200k',
    location: 'Mountain View, CA',
    followUpDate: new Date(Date.now() + 3 * 86400000),
    interviewDates: [new Date(Date.now() + 5 * 86400000)],
  },
  {
    company: 'Stripe',
    role: 'Full Stack Developer',
    status: 'Applied',
    notes: 'Referral from college friend on the payments team.',
    jobLink: 'https://stripe.com/jobs',
    appliedDate: new Date(Date.now() - 8 * 86400000),
    tags: ['Referral', 'Hybrid'],
    resume: 'Resume_2026.pdf',
    salary: '$140k–$180k',
    location: 'San Francisco, CA',
  },
  {
    company: 'Linear',
    role: 'Software Engineer',
    status: 'Offer',
    notes: 'Received written offer! Reviewing equity and start date.',
    jobLink: 'https://linear.app/careers',
    appliedDate: new Date(Date.now() - 40 * 86400000),
    tags: ['Dream', 'Remote'],
    resume: 'Resume_2026.pdf',
    salary: '$160k–$200k',
    location: 'Remote',
    followUpDate: new Date(Date.now() + 2 * 86400000),
  },
  {
    company: 'Notion',
    role: 'React Developer',
    status: 'Wishlist',
    notes: 'Love the product culture. Preparing portfolio before submitting.',
    jobLink: 'https://notion.so/careers',
    appliedDate: new Date(),
    tags: ['Dream', 'Remote'],
    resume: '',
    salary: '$130k–$160k',
    location: 'Remote',
  },
  {
    company: 'Shopify',
    role: 'Backend Engineer',
    status: 'Interview',
    notes: 'Pair programming round went great, waiting for final loop.',
    jobLink: 'https://shopify.com/careers',
    appliedDate: new Date(Date.now() - 20 * 86400000),
    tags: ['Remote', 'Contract'],
    resume: 'Resume_2026.pdf',
    salary: '$135k–$165k',
    location: 'Remote',
    followUpDate: new Date(Date.now() + 4 * 86400000),
    interviewDates: [new Date(Date.now() + 7 * 86400000)],
  },
  {
    company: 'Figma',
    role: 'UI/UX Engineer',
    status: 'Applied',
    notes: 'Applied through team link.',
    jobLink: 'https://figma.com/careers',
    appliedDate: new Date(Date.now() - 5 * 86400000),
    tags: ['Dream', 'On-site'],
    resume: 'Resume_2026.pdf',
    salary: '$140k–$175k',
    location: 'New York, NY',
  },
  {
    company: 'Vercel',
    role: 'Frontend Developer',
    status: 'Rejected',
    notes: 'Position closed for internal transfer. Good connection made with recruiter.',
    jobLink: 'https://vercel.com/careers',
    appliedDate: new Date(Date.now() - 50 * 86400000),
    tags: ['Remote'],
    resume: 'Resume_2026.pdf',
    salary: '$130k–$170k',
    location: 'Remote',
  },
  {
    company: 'Netflix',
    role: 'Senior UI Engineer',
    status: 'Applied',
    notes: 'Applied for UI platform tools team.',
    jobLink: 'https://netflix.com/jobs',
    appliedDate: new Date(Date.now() - 12 * 86400000),
    tags: ['Dream', 'Hybrid'],
    resume: 'Resume_2026.pdf',
    salary: '$200k–$250k',
    location: 'Los Gatos, CA',
  },
];

export async function seedJobsForUser(userId) {
  await jobModel.deleteMany({ user: userId });

  const createdJobs = [];
  for (const data of sampleJobs) {
    const job = new jobModel({
      ...data,
      user: userId,
    });

    job.activityLog.push({
      action: 'Created',
      detail: `Added to ${data.status}`,
    });

    if (data.status !== 'Wishlist') {
      job.activityLog.push({
        action: 'Status changed',
        detail: `Wishlist → ${data.status}`,
      });
    }

    await job.save();
    createdJobs.push(job);
  }

  return createdJobs;
}

export async function seedJobsForAllUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found');

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected for seeding jobs');
    }

    const users = await userModel.find({});
    console.log(`Found ${users.length} users in database.`);

    for (const user of users) {
      console.log(`Seeding jobs for user: ${user.name} (${user.email})...`);
      await seedJobsForUser(user._id);
    }

    console.log('Successfully seeded sample jobs for ALL users in the database!');
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Only run automatically if executed directly from node CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('seedJobs.js')) {
  seedJobsForAllUsers();
}
