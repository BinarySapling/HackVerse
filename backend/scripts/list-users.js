import mongoose from 'mongoose';
import config from '../src/config/env.js';
import User from '../src/models/User.js';

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
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
