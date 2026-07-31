/**
 * Upsert a known local admin account and print credentials.
 * Usage: node scripts/ensure-admin.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../src/config/env.js';
import User from '../src/models/User.js';
import Roles from '../src/constants/roles.js';

const ADMIN_EMAIL = 'admin@hackverse.local';
const ADMIN_PASSWORD = 'Admin@HackVerse1';

const run = async () => {
  await mongoose.connect(config.mongoUri);

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    existing.password = hashed;
    existing.role = Roles.ADMIN;
    existing.isActive = true;
    existing.isVerified = true;
    existing.isDeleted = false;
    existing.firstName = existing.firstName || 'Platform';
    existing.lastName = existing.lastName || 'Admin';
    await existing.save();
    console.log('Updated existing admin:');
  } else {
    await User.create({
      firstName: 'Platform',
      lastName: 'Admin',
      email: ADMIN_EMAIL,
      password: hashed,
      role: Roles.ADMIN,
      isActive: true,
      isVerified: true,
    });
    console.log('Created admin:');
  }

  console.log(`  email:    ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);

  // Verify login hash
  const user = await User.findOne({ email: ADMIN_EMAIL }).select('+password');
  const ok = await bcrypt.compare(ADMIN_PASSWORD, user.password);
  console.log(`  verify:   ${ok ? 'OK' : 'FAILED'}`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
