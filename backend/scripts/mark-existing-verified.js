import mongoose from 'mongoose';
import config from '../src/config/env.js';
import User from '../src/models/User.js';

const run = async () => {
  await mongoose.connect(config.mongoUri);
  const result = await User.updateMany(
    { isVerified: false },
    { $set: { isVerified: true } }
  );
  console.log(
    JSON.stringify(
      {
        matched: result.matchedCount ?? result.n,
        modified: result.modifiedCount ?? result.nModified,
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
