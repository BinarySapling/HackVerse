import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: [true, 'Hackathon ID reference is required']
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: [true, 'Submission ID reference is required']
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Judge ID reference is required']
    },
    innovationScore: {
      type: Number,
      required: [true, 'Innovation score is required'],
      min: [0, 'Innovation score cannot be less than 0'],
      max: [10, 'Innovation score cannot exceed 10']
    },
    uiuxScore: {
      type: Number,
      required: [true, 'UI/UX score is required'],
      min: [0, 'UI/UX score cannot be less than 0'],
      max: [10, 'UI/UX score cannot exceed 10'],
      default: 0
    },
    technicalScore: {
      type: Number,
      required: [true, 'Technical score is required'],
      min: [0, 'Technical score cannot be less than 0'],
      max: [10, 'Technical score cannot exceed 10']
    },
    presentationScore: {
      type: Number,
      required: [true, 'Presentation score is required'],
      min: [0, 'Presentation score cannot be less than 0'],
      max: [10, 'Presentation score cannot exceed 10']
    },
    codeQualityScore: {
      type: Number,
      required: [true, 'Code quality score is required'],
      min: [0, 'Code quality score cannot be less than 0'],
      max: [10, 'Code quality score cannot exceed 10'],
      default: 0
    },
    problemSolvingScore: {
      type: Number,
      required: [true, 'Problem solving score is required'],
      min: [0, 'Problem solving score cannot be less than 0'],
      max: [10, 'Problem solving score cannot exceed 10'],
      default: 0
    },
    remarks: {
      type: String,
      required: [true, 'Evaluation remarks are required'],
      trim: true
    },
    totalScore: {
      type: Number,
      required: [true, 'Total score calculation is required']
    },
    evaluatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Restrict to one evaluation per judge per submission using compound uniqueness
evaluationSchema.index({ judge: 1, submission: 1 }, { unique: true });

// Performance lookup indices
evaluationSchema.index({ hackathon: 1 });
evaluationSchema.index({ submission: 1 });
evaluationSchema.index({ judge: 1 });

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

export default Evaluation;
