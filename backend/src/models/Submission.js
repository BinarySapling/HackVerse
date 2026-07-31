import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required']
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: [true, 'Hackathon ID is required']
    },
    githubRepo: {
      type: String,
      required: [true, 'GitHub repository URL is required'],
      trim: true
    },
    demoUrl: {
      type: String,
      trim: true,
      default: null
    },
    presentationUrl: {
      type: String,
      trim: true,
      default: null
    },
    videoUrl: {
      type: String,
      trim: true,
      default: null
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
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

// Guarantee a unique active submission per team in MongoDB
submissionSchema.index({ team: 1 }, { unique: true });

// Optimize query performance for routing lookups
submissionSchema.index({ hackathon: 1 });
submissionSchema.index({ team: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
