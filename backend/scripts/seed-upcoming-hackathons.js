import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../src/database/connection.js';
import Hackathon from '../src/models/Hackathon.js';
import User from '../src/models/User.js';
import HackathonStatus from '../src/constants/hackathonStatus.js';
import cloudinaryService from '../src/services/cloudinary.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const organizerId = '6a6c8b5e285e7dbdabd2e08c';

const imagePath = (filename) =>
  path.resolve(__dirname, '../../', 'seed-assets/hackathon-banners', filename);

const addDays = (days, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const hackathons = [
  {
    title: 'Intel Student Hackathon 2026',
    slug: 'intel-student-hackathon-2026',
    tagline: 'Innovate today, transform tomorrow with edge AI and secure computing.',
    description:
      'A student innovation sprint focused on AI, machine learning, cloud, edge computing, embedded IoT, security, and sustainable technology.',
    localBanner: imagePath('intel-student-hackathon.png'),
    theme: 'AI and Edge Computing',
    mode: 'hybrid',
    venue: 'Online + Campus Innovation Lab',
    minTeamSize: 1,
    maxTeamSize: 4,
    maxTeams: 120,
    prizePool: 'INR 2,00,000+',
    registrationStart: addDays(1, 9),
    registrationEnd: addDays(16, 23),
    hackathonStart: addDays(20, 10),
    hackathonEnd: addDays(22, 18),
    submissionStart: addDays(20, 10),
    submissionDeadline: addDays(22, 16),
    techStack: ['AI/ML', 'Cloud', 'Edge Computing', 'Security', 'IoT'],
  },
  {
    title: 'Deloitte Impact Hackathon 2026',
    slug: 'deloitte-impact-hackathon-2026',
    tagline: 'Innovate, solve, and create business impact that matters.',
    description:
      'Build practical solutions for business transformation, sustainability, cyber security, inclusion, and emerging technology challenges.',
    localBanner: imagePath('deloitte-impact-hackathon.png'),
    theme: 'Business Transformation',
    mode: 'hybrid',
    venue: 'Online + Deloitte Innovation Studio',
    minTeamSize: 2,
    maxTeamSize: 4,
    maxTeams: 90,
    prizePool: 'INR 2,00,000+',
    registrationStart: addDays(4, 9),
    registrationEnd: addDays(24, 23),
    hackathonStart: addDays(29, 10),
    hackathonEnd: addDays(31, 18),
    submissionStart: addDays(29, 10),
    submissionDeadline: addDays(31, 16),
    techStack: ['Technology', 'Sustainability', 'Cyber Security', 'Inclusion'],
  },
  {
    title: 'Amazon HackOn 2026',
    slug: 'amazon-hackon-2026',
    tagline: 'Think big and build bigger for real customer impact.',
    description:
      'Collaborate on scalable AWS-powered solutions that solve real problems, improve customer experiences, and create lasting impact.',
    localBanner: imagePath('amazon-hackon.png'),
    theme: 'Cloud Innovation',
    mode: 'online',
    venue: 'Virtual',
    minTeamSize: 1,
    maxTeamSize: 4,
    maxTeams: 150,
    prizePool: '$25,000+',
    registrationStart: addDays(7, 9),
    registrationEnd: addDays(35, 23),
    hackathonStart: addDays(40, 10),
    hackathonEnd: addDays(42, 18),
    submissionStart: addDays(40, 10),
    submissionDeadline: addDays(42, 16),
    techStack: ['AWS', 'Cloud', 'AI', 'Customer Experience', 'Scalable Systems'],
  },
  {
    title: 'Google Developer Student Clubs Hackathon 2026',
    slug: 'gdsc-build-for-everyone-2026',
    tagline: 'Build for everyone. Solve real-world problems with impact.',
    description:
      'A Google Developer Student Clubs hackathon for students to collaborate, create inclusive technology, and ship practical projects.',
    localBanner: imagePath('gdsc-build-for-everyone.png'),
    theme: 'Open Innovation',
    mode: 'hybrid',
    venue: 'Online + GDSC Campus Hubs',
    minTeamSize: 1,
    maxTeamSize: 4,
    maxTeams: 200,
    prizePool: '$25,000+',
    registrationStart: addDays(10, 9),
    registrationEnd: addDays(45, 23),
    hackathonStart: addDays(50, 10),
    hackathonEnd: addDays(52, 18),
    submissionStart: addDays(50, 10),
    submissionDeadline: addDays(52, 16),
    techStack: ['Web', 'Mobile', 'AI/ML', 'Firebase', 'Open Source'],
  },
];

const common = {
  organizer: organizerId,
  status: HackathonStatus.REGISTRATION_OPEN,
  visibility: 'public',
  contactEmail: 'organizer@hackverse.dev',
  problemStatements: [
    {
      title: 'Build a practical innovation prototype',
      description:
        'Choose a real-world problem in the event theme and build a functional prototype with a clear impact story.',
    },
  ],
  prizes: [
    { title: '1st Place', value: 'Grand prize', description: 'Cash prize, goodies, and recognition.' },
    { title: '2nd Place', value: 'Runner up', description: 'Goodies, certificates, and mentorship.' },
    { title: '3rd Place', value: 'Special mention', description: 'Certificates and platform showcase.' },
  ],
  judgingCriteria: [
    { criteriaName: 'Innovation', weight: 25, description: 'Originality and creativity.' },
    { criteriaName: 'Technical Execution', weight: 30, description: 'Build quality and feasibility.' },
    { criteriaName: 'Impact', weight: 25, description: 'Usefulness and problem relevance.' },
    { criteriaName: 'Presentation', weight: 20, description: 'Clarity of demo and pitch.' },
  ],
  rules:
    'Teams must submit original work, include a repository link, provide a short demo, and follow the HackVerse code of conduct.',
  faq: [
    { question: 'Who can join?', answer: 'Students from all backgrounds can participate.' },
    { question: 'Can I participate remotely?', answer: 'Yes, online and hybrid events support remote participation.' },
  ],
};

const uploadBanner = async (hackathon) => {
  const result = await cloudinaryService.uploadImageFile(hackathon.localBanner, {
    public_id: hackathon.slug,
  });
  return result.secure_url;
};

const run = async () => {
  if (!cloudinaryService.isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name or set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }

  await connectDB();

  const organizer = await User.findById(organizerId);
  if (!organizer) {
    throw new Error(`Organizer not found: ${organizerId}`);
  }

  for (const hackathon of hackathons) {
    const banner = await uploadBanner(hackathon);
    const { localBanner, ...payload } = hackathon;
    const saved = await Hackathon.findOneAndUpdate(
      { slug: payload.slug },
      { $set: { ...common, ...payload, banner } },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`${saved.title}: ${saved.banner}`);
  }
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
