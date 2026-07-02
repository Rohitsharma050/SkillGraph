import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
    {
        skillName: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["video", "blog", "documentation", "practice", "course", "project"],
            required: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        difficulty: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        tags: {
            type: [String],
            default: [],
        },
        isFree: {
            type: Boolean,
            default: true,
        },
        source: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
resourceSchema.index({ skillName: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ difficulty: 1 });
resourceSchema.index({ tags: 1 });
// Text index for full-text search across title, skillName, description, tags
resourceSchema.index(
    { title: "text", skillName: "text", description: "text", tags: "text" },
    { name: "resource_text_search" }
);

const resourceModel = mongoose.model("Resource", resourceSchema);
export default resourceModel;
