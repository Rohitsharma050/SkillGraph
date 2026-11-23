import mongoose from "mongoose";

const progressLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    skillId: {
      type: String,
      required: true,
      trim: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null,
    },
    eventType: {
      type: String,
      enum: ["resource_completed", "time_logged", "level_set"],
      required: true,
    },
    minutesSpent: {
      type: Number,
      default: 0,
    },
    proficiencyAfter: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    weekNumber: {
      type: Number,
      default: 1,
    },
    studiedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes specified for efficient replanning and skill progress retrieval
progressLogSchema.index({ roadmapId: 1, loggedAt: -1 });
progressLogSchema.index({ roadmapId: 1, skillId: 1 });

const progressLogModel = mongoose.model("ProgressLog", progressLogSchema);
export default progressLogModel;
