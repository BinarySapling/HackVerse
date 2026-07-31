import mongoose from 'mongoose';
import config from '../src/config/env.js';
import User from '../src/models/User.js';
import Hackathon from '../src/models/Hackathon.js';

const run = async () => {
  await mongoose.connect(config.mongoUri);

  const users = await User.find({
    $or: [
      { email: /danish/i },
      { createdAt: { $gte: new Date('2026-07-31T00:00:00Z') } },
    ],
  })
    .select('email role isVerified isActive createdAt')
    .lean();

  const owned = await Hackathon.find({
    organizer: '6a69c212c8bfe31d80db2638',
    isDeleted: { $ne: true },
  })
    .select('title slug status')
    .lean();

  const e2e = await Hackathon.findById('6a6bd932b98fb440df395825')
    .select('title organizer status')
    .lean();

  console.log(JSON.stringify({ users, owned, e2e }, null, 2));
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
