import mongoose from 'mongoose';
import config from '../src/config/env.js';
import User from '../src/models/User.js';
import Hackathon from '../src/models/Hackathon.js';

const HACKATHON_ID = '6a6bd932b98fb440df395825';
const OWNER_EMAIL = 'danishanwarofficial@gmail.com';

const run = async () => {
  await mongoose.connect(config.mongoUri);
  const owner = await User.findOne({ email: OWNER_EMAIL });
  if (!owner) {
    throw new Error(`Owner not found: ${OWNER_EMAIL}`);
  }

  const updated = await Hackathon.findByIdAndUpdate(
    HACKATHON_ID,
    { organizer: owner._id },
    { new: true }
  ).select('title organizer status');

  // Ensure account can log in (verified)
  await User.updateOne({ _id: owner._id }, { $set: { isVerified: true, isActive: true } });

  console.log(
    JSON.stringify(
      {
        hackathon: updated,
        owner: { id: owner._id, email: owner.email, role: owner.role, isVerified: true },
      },
      null,
      2
    )
  );
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
