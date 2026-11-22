import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    detail: { type: String, default: "" },
  },
  { timestamps: true, _id: false }
);

activityLogSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.date = ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

const VALID_TAGS = [
  "Remote",
  "Internship",
  "Dream",
  "Referral",
  "Contract",
  "Hybrid",
  "On-site",
];
const VALID_STATUSES = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

const jobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: "Wishlist",
    },
    appliedDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    jobLink: { type: String, default: "" },
    interviewDates: [{ type: Date }],
    tags: [{ type: String, enum: VALID_TAGS }],
    resume: { type: String, default: "" },
    activityLog: [activityLogSchema],
    followUpDate: { type: Date, default: null },
    salary: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

jobSchema.index({ company: "text", role: "text", notes: "text" });

export { VALID_STATUSES, VALID_TAGS };
export default mongoose.model("Job", jobSchema);
