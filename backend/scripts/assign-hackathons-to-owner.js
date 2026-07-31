import mongoose from 'mongoose';
import config from '../src/config/env.js';
import User from '../src/models/User.js';
import Hackathon from '../src/models/Hackathon.js';

const run = async () => {
  await mongoose.connect(config.mongoUri);
  const owner = await User.findOne({ email: 'danishanwarofficial@gmail.com' });
  if (!owner) throw new Error('owner missing');

  const result = await Hackathon.updateMany(
    { isDeleted: { $ne: true } },
    { $set: { organizer: owner._id } }
  );

  const owned = await Hackathon.countDocuments({ organizer: owner._id, isDeleted: { $ne: true } });
  console.log(JSON.stringify({ matched: result.matchedCount, modified: result.modifiedCount, owned }, null, 2));
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
