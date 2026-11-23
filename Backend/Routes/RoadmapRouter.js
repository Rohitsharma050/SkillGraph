import express from "express";
import multer from "multer";
import {
    generateRoadmap,
    getUserRoadmaps,
    getRoadmapById,
    updateRoadmapProgress,
    regenerateRoadmap,
    generateDocumentation,
    updatePlanSettings,
    getRoadmapPlan,
    logProgress,
    getProgressHistory,
    updateSkillProficiency,
    exportPlanCalendar,
    exportGapReportPdf,
} from "../Controllers/RoadmapController.js";
import authMiddleware from "../Middleware/authMiddleware.js";

export const roadmapRouter = express.Router();

// Multer instance for optional resume upload on /generate
// Accepts a single file in the "resume" field (in-memory buffer)
// The controller uploads it to Cloudinary if present.
const uploadResume = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ["application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        cb(null, allowed.includes(file.mimetype));
    },
}).single("resume");

// All routes are protected by authMiddleware
roadmapRouter.post("/generate", authMiddleware, uploadResume, generateRoadmap);
roadmapRouter.get("/", authMiddleware, getUserRoadmaps);
roadmapRouter.get("/:id", authMiddleware, getRoadmapById);
roadmapRouter.patch("/:id/progress", authMiddleware, updateRoadmapProgress);
roadmapRouter.post("/:id/regenerate", authMiddleware, regenerateRoadmap);
roadmapRouter.post("/:id/documentation", authMiddleware, generateDocumentation);

// ── Adaptive Study Planner Routes ──────────────────────────────────────────
roadmapRouter.put("/:id/settings", authMiddleware, updatePlanSettings);
roadmapRouter.get("/:id/plan", authMiddleware, getRoadmapPlan);
roadmapRouter.get("/:id/plan.ics", authMiddleware, exportPlanCalendar);
roadmapRouter.get("/:id/report.pdf", authMiddleware, exportGapReportPdf);
roadmapRouter.post("/:id/plan", authMiddleware, updatePlanSettings);
roadmapRouter.post("/:id/progress", authMiddleware, logProgress);
roadmapRouter.get("/:id/progress", authMiddleware, getProgressHistory);
roadmapRouter.patch("/:id/skills/:skillId/proficiency", authMiddleware, updateSkillProficiency);
