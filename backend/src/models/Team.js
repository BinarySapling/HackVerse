import mongoose from 'mongoose';

/**
 * @desc Mongoose Schema for Team Management tracking
 */
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: [true, 'Hackathon ID is required']
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Team leader ID is required']
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    maxMembers: {
      type: Number,
      required: [true, 'Max members limit is required']
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring name uniqueness within a specific hackathon
teamSchema.index({ name: 1, hackathon: 1 }, { unique: true });

// Optimize query performance for routing lookups
teamSchema.index({ hackathon: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ members: 1 });

const Team = mongoose.model('Team', teamSchema);

export default Team;
