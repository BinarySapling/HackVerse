import mongoose from 'mongoose';

/**
 * @desc Mongoose Schema for Participant Hackathon Registration tracking
 */
const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: [true, 'Hackathon ID is required']
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered'
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

// Compound index to guarantee uniqueness of registration per user per hackathon
registrationSchema.index({ user: 1, hackathon: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
