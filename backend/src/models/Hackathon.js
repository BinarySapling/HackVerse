import mongoose from 'mongoose';
import HackathonStatus from '../constants/hackathonStatus.js';

// Sub-schema for problem statements to provide structure and validations
const problemStatementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Problem statement title is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Problem statement description is required"]
  }
}, { _id: false });

// Sub-schema for prizes definitions
const prizeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Prize title is required"]
  },
  value: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  }
}, { _id: false });

// Sub-schema for defining criteria and associated weights
const judgingCriteriaSchema = new mongoose.Schema({
  criteriaName: {
    type: String,
    required: [true, "Criteria name is required"]
  },
  weight: {
    type: Number,
    required: [true, "Criteria weight is required"],
    min: [0, "Weight cannot be negative"],
    max: [100, "Weight cannot exceed 100"]
  },
  description: {
    type: String,
    default: null
  }
}, { _id: false });

// Sub-schema for question-answer FAQ objects
const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "FAQ question is required"]
  },
  answer: {
    type: String,
    required: [true, "FAQ answer is required"]
  }
}, { _id: false });

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Hackathon title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    slug: {
      type: String,
      required: [true, "Hackathon slug is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [150, "Tagline cannot exceed 150 characters"],
      default: null
    },
    description: {
      type: String,
      required: [true, "Description is required"]
    },
    banner: {
      type: String,
      trim: true,
      default: null
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "Organizer ID reference is required"]
    },
    registrationStart: {
      type: Date,
      required: [true, "Registration start date is required"]
    },
    registrationEnd: {
      type: Date,
      required: [true, "Registration end date is required"]
    },
    hackathonStart: {
      type: Date,
      required: [true, "Hackathon start date is required"]
    },
    hackathonEnd: {
      type: Date,
      required: [true, "Hackathon end date is required"]
    },
    submissionStart: {
      type: Date,
      default: null
    },
    submissionDeadline: {
      type: Date,
      default: null
    },
    maxTeamSize: {
      type: Number,
      required: [true, "Maximum team size is required"],
      default: 4,
      min: [1, "Maximum team size must be at least 1"]
    },
    minTeamSize: {
      type: Number,
      required: [true, "Minimum team size is required"],
      default: 1,
      min: [1, "Minimum team size must be at least 1"]
    },
    maxTeams: {
      type: Number,
      default: null,
      min: [1, "Maximum teams must be at least 1"]
    },
    prizePool: {
      type: String,
      trim: true,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: Object.values(HackathonStatus),
        message: "Provided status is invalid"
      },
      default: HackathonStatus.DRAFT
    },
    evaluationClosed: {
      type: Boolean,
      default: false
    },
    winnersAnnounced: {
      type: Boolean,
      default: false
    },
    winnersAnnouncedAt: {
      type: Date,
      default: null
    },
    visibility: {
      type: String,
      enum: {
        values: ['public', 'private'],
        message: "Visibility mode must be public or private"
      },
      default: 'public'
    },
    theme: {
      type: String,
      trim: true,
      maxlength: [100, "Theme cannot exceed 100 characters"],
      default: null
    },
    mode: {
      type: String,
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: "Mode must be online, offline, or hybrid"
      },
      default: 'online'
    },
    venue: {
      type: String,
      trim: true,
      maxlength: [200, "Venue cannot exceed 200 characters"],
      default: null
    },
    problemStatements: [problemStatementSchema],
    techStack: [
      {
        type: String,
        trim: true
      }
    ],
    rules: {
      type: String,
      default: null
    },
    prizes: [prizeSchema],
    judgingCriteria: [judgingCriteriaSchema],
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.[A-Za-z]{2,})+$/,
        "Please provide a valid contact email address"
      ]
    },
    faq: [faqSchema],
    judges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/*
 * Schema Indexes Explanations:
 *
 * 1. slug: Index is configured as unique to avoid duplicate SEO routing pages and speed up
 *    individual hackathon page details lookups which query by slug string directly.
 * 2. organizer: Index allows optimization of organizer dashboard layouts which fetch lists of
 *    hackathons belonging to a specific user id.
 * 3. status: Index accelerates filtering operations on dashboards and landing pages showing only
 *    "ongoing" or "registration_open" hackathons.
 */
hackathonSchema.index({ organizer: 1 });
hackathonSchema.index({ status: 1 });

// Compile the model
const Hackathon = mongoose.model('Hackathon', hackathonSchema);

export default Hackathon;
