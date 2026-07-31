import mongoose from 'mongoose';
import Roles from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"]
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.[A-Za-z]{2,})+$/,
        "Please provide a valid email address"
      ]
    },
    avatar: {
      type: String,
      trim: true,
      default: null
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: Object.values(Roles),
        message: "Provided role is invalid"
      },
      default: Roles.PARTICIPANT
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: null
    },
    refreshToken: {
      type: String,
      select: false,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compile the model
const User = mongoose.model('User', userSchema);

export default User;
