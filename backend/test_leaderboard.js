import mongoose from 'mongoose';
import config from './src/config/env.js';
import { connectDB } from './src/database/connection.js';
import Hackathon from './src/models/Hackathon.js';
import leaderboardRepository from './src/repositories/leaderboard.repository.js';
import leaderboardService from './src/services/leaderboard.service.js';

const runTest = async () => {
  await connectDB();
  
  // Find a hackathon that has teams (from e2e tests)
  const evaluation = await mongoose.model('Evaluation').findOne().sort({ createdAt: -1 });
  if (!evaluation) {
    console.log("No evaluation found in DB");
    process.exit(1);
  }
  const hackathonId = evaluation.hackathon;
  console.log("Using Hackathon ID:", hackathonId);
  
  try {
    const pubLeaderboard = await leaderboardRepository.getLeaderboard(hackathonId, 0, 10);
    console.log("Public Leaderboard:");
    console.log(JSON.stringify(pubLeaderboard, null, 2));
    
    const orgResults = await leaderboardRepository.getOrganizerResults(hackathonId, 0, 10);
    console.log("\nOrganizer Results:");
    console.log(JSON.stringify(orgResults, null, 2));

  } catch (err) {
    console.error("Test failed", err);
  }
  
  await mongoose.connection.close();
  process.exit(0);
};

runTest();
