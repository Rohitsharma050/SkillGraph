import mongoose from "mongoose";

// ---- Sub-schema: Node ----
const nodeSchema = new mongoose.Schema(
    {
        id: { type: String },
        label: { type: String },
        type: { type: String },
        level: { type: Number },
        status: {
            type: String,
            enum: ["locked", "available", "completed"],
            default: "available",
        },
        description: { type: String },
    },
    { _id: false }
);

// ---- Sub-schema: Edge ----
const edgeSchema = new mongoose.Schema(
    {
        from: { type: String },
        to: { type: String },
        relation: { type: String, default: "prerequisite" },
    },
    { _id: false }
);

// ---- Sub-schema: Learning Step ----
const learningStepSchema = new mongoose.Schema(
    {
        order: { type: Number },
        skill: { type: String },
        reason: { type: String },
        estimatedTime: { type: String },
        resources: { type: [String], default: [] },
    },
    { _id: false }
);

// ---- Main Roadmap Schema ----
const roadmapSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            default: "",
        },
        targetRole: {
            type: String,
            required: true,
        },
        resumeUrl: {
            type: String,
            default: "",
        },
        extractedSkills: {
            type: [String],
            default: [],
        },
        missingSkills: {
            type: [String],
            default: [],
        },
        nodes: {
            type: [nodeSchema],
            default: [],
        },
        edges: {
            type: [edgeSchema],
            default: [],
        },
        learningSteps: {
            type: [learningStepSchema],
            default: [],
        },
        explanation: {
            type: String,
            default: "",
        },
        completedNodes: {
            type: [String],
            default: [],
        },
        progressPercentage: {
            type: Number,
            default: 0,
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// ---- Indexes ----
roadmapSchema.index({ userId: 1 });
roadmapSchema.index({ targetRole: 1 });
roadmapSchema.index({ createdAt: -1 });

const roadmapModel = mongoose.model("Roadmap", roadmapSchema);
export default roadmapModel;
