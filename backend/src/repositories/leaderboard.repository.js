import mongoose from 'mongoose';
import Evaluation from '../models/Evaluation.js';

const getBaseRankingPipeline = (hackathonId) => {
  return [
    {
      $match: {
        hackathon: new mongoose.Types.ObjectId(hackathonId)
      }
    },
    // 1. Group by submission to calculate averages
    {
      $group: {
        _id: '$submission',
        totalScoreAvg: { $avg: '$totalScore' },
        innovationScoreAvg: { $avg: '$innovationScore' },
        uiuxScoreAvg: { $avg: { $ifNull: ['$uiuxScore', 0] } },
        technicalScoreAvg: { $avg: '$technicalScore' },
        presentationScoreAvg: { $avg: '$presentationScore' },
        codeQualityScoreAvg: { $avg: { $ifNull: ['$codeQualityScore', 0] } },
        problemSolvingScoreAvg: { $avg: { $ifNull: ['$problemSolvingScore', 0] } },
        judgeCount: { $sum: 1 },
        evaluations: {
          $push: {
            judge: '$judge',
            totalScore: '$totalScore',
            innovationScore: '$innovationScore',
            uiuxScore: { $ifNull: ['$uiuxScore', 0] },
            technicalScore: '$technicalScore',
            presentationScore: '$presentationScore',
            codeQualityScore: { $ifNull: ['$codeQualityScore', 0] },
            problemSolvingScore: { $ifNull: ['$problemSolvingScore', 0] },
            remarks: '$remarks'
          }
        }
      }
    },
    // 2. Lookup Submission
    {
      $lookup: {
        from: 'submissions',
        localField: '_id',
        foreignField: '_id',
        as: 'submissionDoc'
      }
    },
    { $unwind: '$submissionDoc' },
    // Filter out deleted submissions
    { $match: { 'submissionDoc.isDeleted': false } },
    
    // 3. Lookup Team
    {
      $lookup: {
        from: 'teams',
        localField: 'submissionDoc.team',
        foreignField: '_id',
        as: 'teamDoc'
      }
    },
    { $unwind: '$teamDoc' },
    // Filter out deleted teams
    { $match: { 'teamDoc.isDeleted': false } },

    // 4. Lookup Leader
    {
      $lookup: {
        from: 'users',
        localField: 'teamDoc.leader',
        foreignField: '_id',
        as: 'leaderDoc'
      }
    },
    { $unwind: '$leaderDoc' },
    
    // 5. Round averages and prepare fields
    {
      $addFields: {
        averageScore: { $round: ['$totalScoreAvg', 2] },
        innovation: { $round: ['$innovationScoreAvg', 2] },
        uiux: { $round: ['$uiuxScoreAvg', 2] },
        technical: { $round: ['$technicalScoreAvg', 2] },
        presentation: { $round: ['$presentationScoreAvg', 2] },
        codeQuality: { $round: ['$codeQualityScoreAvg', 2] },
        problemSolving: { $round: ['$problemSolvingScoreAvg', 2] }
      }
    },
    
    // 6. Sort for ranking
    // 1. Highest Average Total Score
    // 2. Highest Average Innovation Score
    // 3. Earliest Submission Time
    {
      $sort: {
        averageScore: -1,
        innovation: -1,
        'submissionDoc.submittedAt': 1
      }
    },
    
    // 7. Generate Rank using $group and $unwind array index
    {
      $group: {
        _id: null,
        results: { $push: '$$ROOT' }
      }
    },
    {
      $unwind: {
        path: '$results',
        includeArrayIndex: 'rankIndex'
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$results',
            { rank: { $add: ['$rankIndex', 1] } }
          ]
        }
      }
    }
  ];
};

export const getLeaderboard = async (hackathonId, skip, limit) => {
  const pipeline = [
    ...getBaseRankingPipeline(hackathonId),
    {
      $project: {
        _id: 0,
        rank: 1,
        teamName: '$teamDoc.name',
        leader: { $concat: ['$leaderDoc.firstName', ' ', '$leaderDoc.lastName'] },
        averageScore: 1,
        innovation: 1,
        technical: 1,
        presentation: 1,
        judgeCount: 1
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  const results = await Evaluation.aggregate(pipeline);
  
  // Total count for pagination
  const countPipeline = [
    ...getBaseRankingPipeline(hackathonId),
    { $count: 'total' }
  ];
  const countResult = await Evaluation.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  return { results, total };
};

export const getOrganizerResults = async (hackathonId, skip, limit, searchQuery) => {
  const pipeline = [
    ...getBaseRankingPipeline(hackathonId),
    {
      $project: {
        _id: 0,
        rank: 1,
        teamName: '$teamDoc.name',
        leader: { $concat: ['$leaderDoc.firstName', ' ', '$leaderDoc.lastName'] },
        averageScore: 1,
        innovation: 1,
        technical: 1,
        presentation: 1,
        judgeCount: 1,
        githubRepo: '$submissionDoc.githubRepo',
        demoUrl: '$submissionDoc.demoUrl',
        presentationUrl: '$submissionDoc.presentationUrl',
        videoUrl: '$submissionDoc.videoUrl',
        submittedAt: '$submissionDoc.submittedAt'
      }
    }
  ];

  if (searchQuery) {
    pipeline.push({
      $match: {
        teamName: { $regex: searchQuery, $options: 'i' }
      }
    });
  }

  pipeline.push({ $skip: skip }, { $limit: limit });

  const results = await Evaluation.aggregate(pipeline);

  // Total count
  const countPipeline = [
    ...getBaseRankingPipeline(hackathonId),
    {
      $project: {
        teamName: '$teamDoc.name'
      }
    }
  ];
  if (searchQuery) {
    countPipeline.push({
      $match: {
        teamName: { $regex: searchQuery, $options: 'i' }
      }
    });
  }
  countPipeline.push({ $count: 'total' });
  const countResult = await Evaluation.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  return { results, total };
};

export const getTeamResult = async (hackathonId, teamId) => {
  const pipeline = [
    ...getBaseRankingPipeline(hackathonId),
    {
      $match: {
        'teamDoc._id': new mongoose.Types.ObjectId(teamId)
      }
    },
    {
      $project: {
        _id: 0,
        rank: 1,
        team: {
          id: '$teamDoc._id',
          name: '$teamDoc.name'
        },
        submission: {
          id: '$submissionDoc._id',
          githubRepo: '$submissionDoc.githubRepo',
          demoUrl: '$submissionDoc.demoUrl'
        },
        evaluations: 1,
        averageScore: 1,
        innovation: 1,
        technical: 1,
        presentation: 1,
        judgeCount: 1
      }
    }
  ];

  const results = await Evaluation.aggregate(pipeline);
  return results.length > 0 ? results[0] : null;
};

export default {
  getLeaderboard,
  getOrganizerResults,
  getTeamResult
};
