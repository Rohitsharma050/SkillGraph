import roadmapModel from "../Models/roadmapModel.js";
import userModel from "../Models/userModel.js";
import resourceModel from "../Models/resourceModel.js";
import progressLogModel from "../Models/progressLogModel.js";
import { getTemplate, getSupportedRoles } from "../Utils/roadmapTemplates.js";
import { uploadToCloudinary } from "../Config/Cloudinary.js";
import { priorityScheduledTopoSort } from "../Utils/skillAttributes.js";
import { parseResumeAndExtractSkills } from "../Utils/resumeParser.js";
import { generateJSONFromGemini } from "../Services/geminiService.js";
import { evaluateGraphProficiency, computeRemainingHours } from "../planner/proficiency.js";
import { populateNodeHours } from "../planner/hours.js";
import { planWeeks } from "../planner/planWeeks.js";
import { computeSpeedFactor } from "../planner/speedFactor.js";
import { replanRoadmap } from "../planner/replanRoadmap.js";
import { buildWeeklySummary, normalizeToMidnight } from "../planner/weeklySummary.js";
import { buildCalendarIcs } from "../planner/calendarExport.js";
import { buildReportModel } from "../planner/reportModel.js";
import { renderReportPdf } from "../planner/reportPdf.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: normalise a skill string for comparison (lowercase, trimmed)
// ─────────────────────────────────────────────────────────────────────────────
const norm = (s) => (s ? s.toLowerCase().trim() : "");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build roadmap nodes, edges, learningSteps from a template
// with proficiency levels (0-3), resource hours, 4-state statuses, and plan
// ─────────────────────────────────────────────────────────────────────────────
const buildRoadmapFromTemplate = (
    template,
    userSkillsNorm,
    targetRole,
    resourcesBySkill = {},
    planSettingsInput = {}
) => {
    const { skills, edges, buildExplanation } = template;

    // Normalised template edges with default minLevel = 1
    const normalizedEdges = edges.map((e) => ({
        from: e.from,
        to: e.to,
        relation: e.relation || "prerequisite",
        minLevel: e.minLevel || 1,
    }));

    // Which template skills does the user already have?
    // User claims from resume/profile are capped at level 1 (Design spec §2)
    const rawNodes = skills.map((s) => {
        const hasSkill = userSkillsNorm.includes(norm(s.label));
        const proficiency = hasSkill ? 1 : 0;
        const levelSource = hasSkill ? "resume" : "none";
        const targetProficiency = s.targetProficiency || 2;

        return {
            id: s.id,
            label: s.label,
            type: hasSkill ? "existing" : "missing",
            level: s.level, // graph depth for Dagre layout
            proficiency,
            targetProficiency,
            levelSource,
            difficulty: s.difficulty ?? 0.5,
            demandScore: s.demandScore ?? 0.8,
            essentiality: s.essentiality ?? {},
            description: s.description,
        };
    });

    // Populate totalHours, remainingHours, and hoursSource from curated resources
    const nodesWithHours = populateNodeHours(rawNodes, resourcesBySkill);

    // Evaluate 4-state status ('completed', 'in_progress', 'available', 'locked')
    // and recompute remaining hours based on proficiency
    evaluateGraphProficiency(nodesWithHours, normalizedEdges);

    // Completed node ids (where status === 'completed')
    const completedIds = nodesWithHours
        .filter((n) => n.status === "completed")
        .map((n) => n.id);
    const completedSet = new Set(completedIds);

    // Build learningSteps for skills that are not completed yet
    const missingSkills = skills.filter((s) => !completedSet.has(s.id));
    const orderedIds = priorityScheduledTopoSort(missingSkills, normalizedEdges, targetRole);
    const sortedMissing = orderedIds
        .map((id) => missingSkills.find((s) => s.id === id))
        .filter(Boolean);

    const learningSteps = sortedMissing.map((s, i) => {
        const normSkill = norm(s.label);
        const skillRes = (resourcesBySkill[normSkill] || []).map((r) => ({
            id: r._id,
            title: r.title,
            type: r.type,
            url: r.url,
            durationMinutes: r.durationMinutes || 60,
            targetProficiency: r.targetProficiency || 1,
            required: r.required !== false,
            order: r.order || 1,
        }));

        return {
            order: i + 1,
            skill: s.label,
            reason: s.reason,
            estimatedTime: s.estimatedTime,
            resources: skillRes,
        };
    });

    // Existing and missing skill labels for explanation
    const existingLabels = skills.filter((s) => completedSet.has(s.id)).map((s) => s.label);
    const missingLabels = missingSkills.map((s) => s.label);
    const explanation = buildExplanation(existingLabels, missingLabels, targetRole);

    const totalNodes = nodesWithHours.length;
    const completedCount = completedIds.length;
    const progressPercentage = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

    // Simulate initial weekly study plan
    const hoursPerWeek = planSettingsInput.hoursPerWeek ? Number(planSettingsInput.hoursPerWeek) : 10;
    const startDate = normalizeToMidnight(planSettingsInput.startDate ? new Date(planSettingsInput.startDate) : new Date());
    const deadlineWeeks = planSettingsInput.deadlineWeeks ? Number(planSettingsInput.deadlineWeeks) : null;
    const maxParallelSkills = planSettingsInput.maxParallelSkills ? Number(planSettingsInput.maxParallelSkills) : 2;

    const planSettings = {
        hoursPerWeek,
        startDate,
        deadlineWeeks,
        maxParallelSkills,
    };

    const initialPlan = planWeeks({
        nodes: nodesWithHours,
        edges: normalizedEdges,
        targetRole,
        hoursPerWeek,
        startDate,
        deadlineWeeks,
        maxParallelSkills,
        speedFactor: 1.0,
    });

    return {
        nodes: nodesWithHours,
        edges: normalizedEdges,
        learningSteps,
        missingSkills: missingLabels,
        explanation,
        completedNodes: completedIds,
        progressPercentage,
        planSettings,
        plan: initialPlan,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/roadmaps/generate
//
// Body (JSON or FormData):
//   targetRole       String  required
//   resumeUrl        String  optional — URL of an already-uploaded resume
//   extractedSkills  Array   optional — skills parsed from resume
//   updateProfile    Boolean optional — if true, update user profile fields
//
// File (multipart):
//   resume           File    optional — upload a new resume (PDF/DOC/DOCX)
//
// TODO (Step 6 — resume parser):
//   After uploading the resume, pipe it through a parsing service to auto-fill
//   extractedSkills from the document text.
// ─────────────────────────────────────────────────────────────────────────────
export const generateRoadmap = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized: Please log in." });
        }

        // ── 1. Fetch user ──────────────────────────────────────────────────
        const user = await userModel.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }

        // ── 2. Parse body fields ───────────────────────────────────────────
        const targetRole = (req.body.targetRole || "").trim();
        if (!targetRole) {
            return res
                .status(400)
                .json({ success: false, message: "targetRole is required." });
        }

        // Skills: merge body-provided skills with those already on the user profile
        let extractedSkillsRaw = [];
        if (req.body.extractedSkills) {
            try {
                extractedSkillsRaw =
                    typeof req.body.extractedSkills === "string"
                        ? JSON.parse(req.body.extractedSkills)
                        : req.body.extractedSkills;
            } catch {
                extractedSkillsRaw = [];
            }
        }

        // Merge with profile skills so user doesn't lose credit for known skills
        const allUserSkills = [
            ...new Set([
                ...user.skills.map((s) => s.trim()).filter(Boolean),
                ...extractedSkillsRaw.map((s) => s.trim()).filter(Boolean),
            ]),
        ];
        const allUserSkillsNorm = allUserSkills.map(norm);

        // updateProfile flag
        const updateProfileFlag =
            req.body.updateProfile === true ||
            req.body.updateProfile === "true";

        // ── 3. Resume handling + auto skill extraction ────────────────────
        let finalResumeUrl = (req.body.resumeUrl || user.resumeUrl || "").trim();

        if (req.file) {
            // A new resume was uploaded via multipart/form-data (field name: "resume")
            const cloudResult = await uploadToCloudinary(req.file.buffer, {
                folder: "skillgraph/resumes",
                resource_type: "raw",
                public_id: `resume_${userId}_${Date.now()}`,
            });
            finalResumeUrl = cloudResult.secure_url;
        }

        // ── 3a. Parse resume and extract skills (Feature: Resume AI Parsing) ─
        // parseResumeAndExtractSkills NEVER throws — returns [] on any error,
        // so roadmap generation is always safe regardless of resume state.
        if (finalResumeUrl) {
            const resumeExtractedSkills = await parseResumeAndExtractSkills(finalResumeUrl);

            if (resumeExtractedSkills.length > 0) {
                console.log(`[RoadmapController] Resume yielded ${resumeExtractedSkills.length} additional skills.`);

                // Merge resume skills into the existing allUserSkills array (dedup)
                const mergedSet = new Set([
                    ...allUserSkills.map((s) => s.trim().toLowerCase()),
                ]);
                for (const skill of resumeExtractedSkills) {
                    if (!mergedSet.has(skill.trim().toLowerCase())) {
                        allUserSkills.push(skill);
                        mergedSet.add(skill.trim().toLowerCase());
                    }
                }
            }
        }

        // ── 4. Load template ───────────────────────────────────────────────
        const template = getTemplate(targetRole);
        if (!template) {
            const supported = getSupportedRoles().join(", ");
            return res.status(400).json({
                success: false,
                message: `Unsupported role "${targetRole}". Supported roles: ${supported}.`,
            });
        }

        // ── 5. Fetch curated resources ───────────────────────────────────
        const allResources = await resourceModel.find({});
        const resourcesBySkill = {};
        for (const r of allResources) {
            const k = norm(r.skillName);
            if (!resourcesBySkill[k]) resourcesBySkill[k] = [];
            resourcesBySkill[k].push(r);
        }

        const planSettingsInput = {
            hoursPerWeek: req.body.hoursPerWeek,
            startDate: req.body.startDate,
            deadlineWeeks: req.body.deadlineWeeks,
            maxParallelSkills: req.body.maxParallelSkills,
        };

        // ── 6. Build roadmap with capacity scheduler ───────────────────────
        const {
            nodes,
            edges,
            learningSteps,
            missingSkills,
            explanation,
            completedNodes,
            progressPercentage,
            planSettings,
            plan,
        } = buildRoadmapFromTemplate(template, allUserSkillsNorm, targetRole, resourcesBySkill, planSettingsInput);

        // ── 7. Save roadmap to DB ──────────────────────────────────────────
        const roadmap = await roadmapModel.create({
            userId,
            title: `${targetRole} Roadmap`,
            targetRole,
            resumeUrl: finalResumeUrl,
            extractedSkills: allUserSkills,
            missingSkills,
            nodes,
            edges,
            learningSteps,
            explanation,
            completedNodes,
            progressPercentage,
            planSettings,
            plan,
            speedFactor: 1.0,
        });

        // ── 8. Optionally update user profile ──────────────────────────────
        if (updateProfileFlag) {
            // Update target role
            user.targetRole = targetRole;

            // Update resumeUrl only if a new one was generated
            if (finalResumeUrl) user.resumeUrl = finalResumeUrl;

            // Merge skills (no duplicates, preserve existing ones)
            const mergedSkills = [
                ...new Set([
                    ...user.skills.map((s) => s.trim()).filter(Boolean),
                    ...allUserSkills,
                ]),
            ];
            user.skills = mergedSkills;

            await user.save();
        }

        // ── 9. Respond ─────────────────────────────────────────────────────
        return res.status(201).json({
            success: true,
            message: `Roadmap generated for "${targetRole}".`,
            roadmapId: roadmap._id,
            roadmap: {
                _id: roadmap._id,
                targetRole: roadmap.targetRole,
                title: roadmap.title,
                resumeUrl: roadmap.resumeUrl,
                extractedSkills: roadmap.extractedSkills,
                missingSkills: roadmap.missingSkills,
                nodes: roadmap.nodes,
                edges: roadmap.edges,
                learningSteps: roadmap.learningSteps,
                explanation: roadmap.explanation,
                completedNodes: roadmap.completedNodes,
                progressPercentage: roadmap.progressPercentage,
                planSettings: roadmap.planSettings,
                plan: roadmap.plan,
                speedFactor: roadmap.speedFactor,
                createdAt: roadmap.createdAt,
            },
        });
    } catch (error) {
        console.error("generateRoadmap error:", error.message);
        return res
            .status(500)
            .json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmaps/
// Returns all non-archived roadmaps for the logged-in user, newest first.
// ─────────────────────────────────────────────────────────────────────────────
export const getUserRoadmaps = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized: Please log in." });
        }

        const roadmaps = await roadmapModel
            .find({ userId, isArchived: false })
            .sort({ createdAt: -1 })
            .select(
                "_id title targetRole progressPercentage completedNodes nodes missingSkills createdAt updatedAt"
            );

        return res.json({
            success: true,
            count: roadmaps.length,
            roadmaps,
        });
    } catch (error) {
        console.error("getUserRoadmaps error:", error.message);
        return res
            .status(500)
            .json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmaps/:id
// Returns a single roadmap by ID (must belong to logged-in user).
// ─────────────────────────────────────────────────────────────────────────────
export const getRoadmapById = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized: Please log in." });
        }

        const roadmap = await roadmapModel.findOne({
            _id: req.params.id,
            userId,
        });

        if (!roadmap) {
            return res
                .status(404)
                .json({ success: false, message: "Roadmap not found." });
        }

        return res.json({ success: true, roadmap });
    } catch (error) {
        console.error("getRoadmapById error:", error.message);
        return res
            .status(500)
            .json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/roadmaps/:id/progress
// Body: { completedNodes: [String], progressPercentage: Number }
//
// Re-computes node statuses (locked / available / completed) based on the
// updated completed set and the prerequisite edges stored in the roadmap.
// ─────────────────────────────────────────────────────────────────────────────
export const updateRoadmapProgress = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized: Please log in." });
        }

        const roadmap = await roadmapModel.findOne({
            _id: req.params.id,
            userId,
        });

        if (!roadmap) {
            return res
                .status(404)
                .json({ success: false, message: "Roadmap not found." });
        }

        const { completedNodes } = req.body;

        if (completedNodes !== undefined) {
            if (!Array.isArray(completedNodes)) {
                return res
                    .status(400)
                    .json({ success: false, message: "completedNodes must be an array." });
            }

            const completedSet = new Set(completedNodes);

            // Update proficiency: if completed, set to targetProficiency (or 2)
            roadmap.nodes = roadmap.nodes.map((node) => {
                const isDone = completedSet.has(node.id);
                const targetProf = node.targetProficiency || 2;
                const nodeObj = node.toObject ? node.toObject() : { ...node };
                return {
                    ...nodeObj,
                    proficiency: isDone ? targetProf : (nodeObj.proficiency >= targetProf ? 0 : nodeObj.proficiency),
                    levelSource: isDone ? "self" : nodeObj.levelSource,
                };
            });

            // Re-derive 4-state statuses and remaining hours using proficiency model
            evaluateGraphProficiency(roadmap.nodes, roadmap.edges);

            roadmap.completedNodes = roadmap.nodes
                .filter((n) => n.status === "completed")
                .map((n) => n.id);

            const total = roadmap.nodes.length;
            roadmap.progressPercentage =
                total > 0 ? Math.round((roadmap.completedNodes.length / total) * 100) : 0;

            // Re-simulate capacity-constrained plan
            const plan = planWeeks({
                nodes: roadmap.nodes,
                edges: roadmap.edges,
                targetRole: roadmap.targetRole,
                hoursPerWeek: roadmap.planSettings?.hoursPerWeek || 10,
                startDate: roadmap.planSettings?.startDate || new Date(),
                deadlineWeeks: roadmap.planSettings?.deadlineWeeks || null,
                maxParallelSkills: roadmap.planSettings?.maxParallelSkills || 2,
                speedFactor: roadmap.speedFactor || 1.0,
            });

            roadmap.plan = plan;
            roadmap.markModified("nodes");
            roadmap.markModified("plan");
        }

        await roadmap.save();

        return res.json({
            success: true,
            message: "Progress updated.",
            progressPercentage: roadmap.progressPercentage,
            completedNodes: roadmap.completedNodes,
            nodes: roadmap.nodes,
            plan: roadmap.plan,
        });
    } catch (error) {
        console.error("updateRoadmapProgress error:", error.message);
        return res
            .status(500)
            .json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/roadmaps/:id/regenerate
//
// Re-generates the roadmap for a user after they have marked skills complete.
// Unlike /generate (which creates a new roadmap document), this endpoint
// updates the *existing* roadmap in-place so the URL and _id remain stable.
// ─────────────────────────────────────────────────────────────────────────────
export const regenerateRoadmap = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized: Please log in." });
        }

        // ── 1. Load roadmap ────────────────────────────────────────────────
        const roadmap = await roadmapModel.findOne({
            _id: req.params.id,
            userId,
        });

        if (!roadmap) {
            return res
                .status(404)
                .json({ success: false, message: "Roadmap not found." });
        }

        // ── 2. Load template for this role ─────────────────────────────────
        const template = getTemplate(roadmap.targetRole);
        if (!template) {
            return res.status(400).json({
                success: false,
                message: `Template not found for role "${roadmap.targetRole}".`,
            });
        }

        // ── 3. Build "current skill set" from completedNodes ───────────────
        const completedIdSet = new Set(roadmap.completedNodes);
        const completedLabels = roadmap.nodes
            .filter((n) => completedIdSet.has(n.id))
            .map((n) => n.label);

        const currentSkillsNorm = [
            ...new Set([
                ...roadmap.extractedSkills.map(norm),
                ...completedLabels.map(norm),
            ]),
        ];

        // ── 4. Fetch resources ─────────────────────────────────────────────
        const allResources = await resourceModel.find({});
        const resourcesBySkill = {};
        for (const r of allResources) {
            const k = norm(r.skillName);
            if (!resourcesBySkill[k]) resourcesBySkill[k] = [];
            resourcesBySkill[k].push(r);
        }

        // ── 5. Re-build roadmap using priority-weighted sort & planner ────
        const {
            nodes,
            edges,
            learningSteps,
            missingSkills,
            explanation,
            completedNodes: newCompletedNodes,
            progressPercentage,
            plan,
        } = buildRoadmapFromTemplate(template, currentSkillsNorm, roadmap.targetRole, resourcesBySkill, roadmap.planSettings);

        // ── 6. Update the existing document in-place ───────────────────────
        roadmap.nodes              = nodes;
        roadmap.edges              = edges;
        roadmap.learningSteps      = learningSteps;
        roadmap.missingSkills      = missingSkills;
        roadmap.explanation        = explanation;
        roadmap.completedNodes     = newCompletedNodes;
        roadmap.progressPercentage = progressPercentage;
        roadmap.plan               = plan;
        // Invalidate any cached AI documentation
        roadmap.documentation      = { content: null, generatedAt: null };

        roadmap.markModified("nodes");
        roadmap.markModified("edges");
        roadmap.markModified("plan");
        roadmap.markModified("documentation");

        await roadmap.save();

        // ── 7. Respond ─────────────────────────────────────────────────────
        return res.json({
            success: true,
            message: "Roadmap regenerated with updated priority ordering and study plan.",
            roadmap: {
                _id: roadmap._id,
                targetRole: roadmap.targetRole,
                title: roadmap.title,
                resumeUrl: roadmap.resumeUrl,
                extractedSkills: roadmap.extractedSkills,
                missingSkills: roadmap.missingSkills,
                nodes: roadmap.nodes,
                edges: roadmap.edges,
                learningSteps: roadmap.learningSteps,
                explanation: roadmap.explanation,
                completedNodes: roadmap.completedNodes,
                progressPercentage: roadmap.progressPercentage,
                planSettings: roadmap.planSettings,
                plan: roadmap.plan,
                speedFactor: roadmap.speedFactor,
                createdAt: roadmap.createdAt,
                updatedAt: roadmap.updatedAt,
            },
        });
    } catch (error) {
        console.error("regenerateRoadmap error:", error.message);
        return res
            .status(500)
            .json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/roadmaps/:id/documentation
//
// Generates (or returns cached) AI documentation for a roadmap.
//
// Cache logic:
//   • If documentation.content is non-null AND query ?force=true is NOT set,
//     return the cached content immediately — no Gemini call.
//   • Invalidation is EXPLICIT only: regenerateRoadmap nulls documentation.
//     We do NOT compare timestamps — saving docs itself bumps updatedAt,
//     which would create a permanently self-invalidating cache.
//
// Early-return cases:
//   • All skills already completed (empty learningSteps) → skip Gemini,
//     return a friendly "nothing left to document" response.
//
// Persistence:
//   • roadmap.markModified("documentation") is required before .save()
//     because Schema.Types.Mixed fields are not auto-detected by Mongoose.
// ─────────────────────────────────────────────────────────────────────────────
export const generateDocumentation = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized: Please log in." });
        }

        // ── 1. Load roadmap (ownership check) ─────────────────────────────
        const roadmap = await roadmapModel.findOne({
            _id: req.params.id,
            userId,
        });

        if (!roadmap) {
            return res
                .status(404)
                .json({ success: false, message: "Roadmap not found." });
        }

        const force = req.query.force === "true";

        // ── 2. Return cached documentation if available ────────────────────
        // Cache is valid whenever content is non-null and force is not set.
        // No timestamp comparison — explicit null-out on regenerate is the
        // only invalidation path.
        if (!force && roadmap.documentation?.content != null) {
            console.log(`[generateDocumentation] Returning cached docs for roadmap ${roadmap._id}`);
            return res.json({
                success: true,
                cached: true,
                documentation: {
                    content: roadmap.documentation.content,
                    generatedAt: roadmap.documentation.generatedAt,
                },
            });
        }

        // ── 3. Early return if no skills need documenting ──────────────────
        // learningSteps contains only skills the user still needs to learn.
        // If empty, the user has completed everything — nothing to document.
        if (!roadmap.learningSteps || roadmap.learningSteps.length === 0) {
            return res.json({
                success: true,
                cached: false,
                allComplete: true,
                documentation: { content: null, generatedAt: null },
                message: "No skills left to document — you've completed this roadmap!",
            });
        }

        // ── 4. Build the grounded prompt ───────────────────────────────────
        // Ordered skill list with reason + estimated time (from learningSteps)
        const orderedSkillsText = roadmap.learningSteps
            .map(
                (s) =>
                    `  ${s.order}. ${s.skill}` +
                    (s.estimatedTime ? ` (~${s.estimatedTime})` : "") +
                    (s.reason ? ` — ${s.reason}` : "")
            )
            .join("\n");

        // Prerequisite edges (from → to)
        const prereqEdges = roadmap.edges.filter((e) => e.relation === "prerequisite");
        const edgesText =
            prereqEdges.length > 0
                ? prereqEdges.map((e) => `  ${e.from} → ${e.to}`).join("\n")
                : "  (none — skills can be learned in any order)";

        const prompt = `You are a technical documentation writer for a learning roadmap.
Return ONLY a valid JSON object — no markdown, no code fences, no prose outside the JSON.

Roadmap context:
  Target role: ${roadmap.targetRole}
  Ordered skills to learn (highest priority first):
${orderedSkillsText}

  Prerequisite edges (skill IDs — "from" must be learned before "to"):
${edgesText}

Rules:
  - Document ONLY the skills listed above — do NOT invent or add new skills.
  - "roleOverview" should explain in 2-3 sentences why this skill set fits the target role.
  - "whyThisOrder" must reference actual prerequisites and priority rationale shown above, not generic filler.
  - "howToLearn" should be a concrete short study sequence (e.g., official docs → course → small project).
  - "howToPractice" must be a SPECIFIC project idea, exercise type, or platform — not vague advice like "build projects".
  - "estimatedTimeToLearn" should echo or refine the estimate given above.
  - "finalMilestoneProject" should be a capstone idea that exercises most or all of the listed skills together.

Required output format (strict JSON, no deviations):
{
  "roleOverview": "...",
  "whyThisOrder": "...",
  "skills": [
    {
      "skillName": "...",
      "whyItMatters": "...",
      "howToLearn": "...",
      "howToPractice": "...",
      "estimatedTimeToLearn": "..."
    }
  ],
  "finalMilestoneProject": "..."
}`;

        // ── 5. Call Gemini ─────────────────────────────────────────────────
        console.log(`[generateDocumentation] Calling Gemini for roadmap ${roadmap._id} (${roadmap.targetRole})`);
        let parsed;
        try {
            parsed = await generateJSONFromGemini(prompt);
        } catch (geminiErr) {
            console.error("[generateDocumentation] Gemini call failed:", geminiErr.message);
            return res.status(500).json({
                success: false,
                message: `AI documentation generation failed: ${geminiErr.message}`,
            });
        }

        // ── 6. Validate required keys ──────────────────────────────────────
        const requiredKeys = ["roleOverview", "whyThisOrder", "skills", "finalMilestoneProject"];
        const missingKeys = requiredKeys.filter((k) => !(k in parsed));
        if (missingKeys.length > 0) {
            console.error("[generateDocumentation] Gemini response missing keys:", missingKeys);
            return res.status(500).json({
                success: false,
                message: `AI response was incomplete (missing: ${missingKeys.join(", ")}). Please try again.`,
            });
        }

        if (!Array.isArray(parsed.skills) || parsed.skills.length === 0) {
            return res.status(500).json({
                success: false,
                message: "AI response contained an empty skills array. Please try again.",
            });
        }

        // ── 7. Persist + return ────────────────────────────────────────────
        // markModified is required for Schema.Types.Mixed — Mongoose won't
        // auto-detect deep mutations on Mixed fields and the write silently
        // no-ops without this call.
        roadmap.documentation = {
            content: parsed,
            generatedAt: new Date(),
        };
        roadmap.markModified("documentation");
        await roadmap.save();

        console.log(`[generateDocumentation] ✓ Documentation saved for roadmap ${roadmap._id}`);

        return res.json({
            success: true,
            cached: false,
            documentation: {
                content: roadmap.documentation.content,
                generatedAt: roadmap.documentation.generatedAt,
            },
        });

    } catch (error) {
        console.error("generateDocumentation error:", error.message);
        return res
            .status(500)
            .json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/roadmaps/:id/settings
// Update study plan settings (hoursPerWeek, startDate, deadlineWeeks, maxParallelSkills)
// and re-simulate the weekly schedule.
// ─────────────────────────────────────────────────────────────────────────────
export const updatePlanSettings = async (req, res) => {
    try {
        const userId = req.userId;
        const roadmap = await roadmapModel.findOne({ _id: req.params.id, userId });
        if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found." });

        const { hoursPerWeek, startDate, deadlineWeeks, maxParallelSkills } = req.body;
        if (!roadmap.planSettings) {
            roadmap.planSettings = { hoursPerWeek: 10, startDate: normalizeToMidnight(new Date()), maxParallelSkills: 2 };
        }
        if (hoursPerWeek !== undefined) roadmap.planSettings.hoursPerWeek = Math.max(1, Number(hoursPerWeek));
        if (startDate !== undefined) roadmap.planSettings.startDate = normalizeToMidnight(new Date(startDate));
        if (deadlineWeeks !== undefined) roadmap.planSettings.deadlineWeeks = deadlineWeeks ? Number(deadlineWeeks) : null;
        if (maxParallelSkills !== undefined) roadmap.planSettings.maxParallelSkills = Math.max(1, Number(maxParallelSkills));

        // Re-simulate deterministic plan via replanRoadmap
        replanRoadmap(roadmap);

        roadmap.markModified("planSettings");
        roadmap.markModified("plan");
        await roadmap.save();

        return res.json({
            success: true,
            message: "Study plan settings updated.",
            planSettings: roadmap.planSettings,
            plan: roadmap.plan,
        });
    } catch (error) {
        console.error("updatePlanSettings error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmaps/:id/plan
// Returns the current weekly study plan. If not yet computed, generates one.
// ─────────────────────────────────────────────────────────────────────────────
export const getRoadmapPlan = async (req, res) => {
    try {
        const userId = req.userId;
        const roadmap = await roadmapModel.findOne({ _id: req.params.id, userId });
        if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found." });

        if (!roadmap.plan || !roadmap.plan.weeks || roadmap.plan.weeks.length === 0) {
            replanRoadmap(roadmap);
            roadmap.markModified("plan");
            await roadmap.save();
        }

        return res.json({
            success: true,
            plan: roadmap.plan,
            planSettings: roadmap.planSettings,
            speedFactor: roadmap.speedFactor || 1.0,
        });
    } catch (error) {
        console.error("getRoadmapPlan error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/roadmaps/:id/progress
// Log a progress event (resource_completed, time_logged, level_set),
// update proficiency, recalculate Bayesian speed factor, and adapt weekly plan.
// ─────────────────────────────────────────────────────────────────────────────
export const logProgress = async (req, res) => {
    try {
        const userId = req.userId;
        const roadmap = await roadmapModel.findOne({ _id: req.params.id, userId });
        if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found." });

        const { eventType, skillId, resourceId, minutesSpent, newLevel, notes, studiedAt, tzOffset } = req.body;
        if (!eventType || !skillId) {
            return res.status(400).json({ success: false, message: "eventType and skillId are required." });
        }

        // Find the node in roadmap.nodes
        const node = roadmap.nodes.find((n) => n.id === skillId);
        if (!node) {
            return res.status(404).json({ success: false, message: `Skill ${skillId} not found in roadmap.` });
        }

        const clientTzOffset = Number(tzOffset) || 0;
        const normalizedStart = normalizeToMidnight(roadmap.planSettings?.startDate || roadmap.createdAt, clientTzOffset);

        // Validate studiedAt (day session occurred, distinct from loggedAt audit timestamp)
        const sessionDate = studiedAt ? new Date(studiedAt) : new Date();
        const sessionMs = sessionDate.getTime();
        const startMs = normalizedStart.getTime();

        if (sessionMs < startMs - 86400000) {
            return res.status(400).json({
                success: false,
                message: "Date studied cannot be before your roadmap start date.",
            });
        }
        if (sessionMs > Date.now() + 86400000) {
            return res.status(400).json({
                success: false,
                message: "Date studied cannot be in the future.",
            });
        }

        // Compute week number on server from sessionDate and normalized start
        const calculatedWeekNumber = Math.max(1, Math.floor((sessionMs - startMs) / (7 * 86400000)) + 1);

        let targetResource = null;
        if (resourceId) {
            targetResource = await resourceModel.findById(resourceId);
        }

        // Update node proficiency based on event
        if (eventType === "resource_completed") {
            if (targetResource && targetResource.targetProficiency) {
                if (targetResource.targetProficiency > (node.proficiency || 0)) {
                    node.proficiency = targetResource.targetProficiency;
                    node.levelSource = "progress";
                }
            } else {
                node.proficiency = Math.min(node.targetProficiency || 2, (node.proficiency || 0) + 1);
                node.levelSource = "progress";
            }
        } else if (eventType === "level_set") {
            const parsedLevel = Math.min(3, Math.max(0, Number(newLevel) || 0));
            node.proficiency = parsedLevel;
            node.levelSource = "self";
        }

        // Create ProgressLog entry with studiedAt
        const logEntry = await progressLogModel.create({
            userId,
            roadmapId: roadmap._id,
            skillId,
            resourceId: targetResource ? targetResource._id : null,
            eventType,
            minutesSpent: Number(minutesSpent) || 0,
            proficiencyAfter: node.proficiency || 0,
            weekNumber: calculatedWeekNumber,
            studiedAt: sessionDate,
            loggedAt: new Date(),
            notes: notes || "",
        });

        // Recalculate remaining hours & statuses for the whole graph
        evaluateGraphProficiency(roadmap.nodes, roadmap.edges);

        // Calculate Bayesian speed factor from user's progress logs
        const allLogs = await progressLogModel.find({ roadmapId: roadmap._id });
        const resIds = allLogs.map((l) => l.resourceId).filter(Boolean);
        const resources = await resourceModel.find({ _id: { $in: resIds } });
        const resourceMap = {};
        for (const r of resources) resourceMap[r._id.toString()] = r;

        const { speedFactor } = computeSpeedFactor(allLogs, resourceMap);
        roadmap.speedFactor = speedFactor;

        // Replan with frozen past weeks and preserved current week baseline
        replanRoadmap(roadmap);

        // Sync completedNodes & progressPercentage
        const completedNodes = roadmap.nodes.filter((n) => n.status === "completed").map((n) => n.id);
        roadmap.completedNodes = completedNodes;
        roadmap.progressPercentage = roadmap.nodes.length > 0 ? Math.round((completedNodes.length / roadmap.nodes.length) * 100) : 0;

        roadmap.markModified("nodes");
        roadmap.markModified("plan");
        await roadmap.save();

        return res.json({
            success: true,
            message: "Progress recorded and schedule adapted.",
            log: logEntry,
            speedFactor: roadmap.speedFactor,
            progressPercentage: roadmap.progressPercentage,
            nodes: roadmap.nodes,
            plan: roadmap.plan,
        });
    } catch (error) {
        console.error("logProgress error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmaps/:id/progress
// Retrieve progress logs, total actual time spent, and performance metrics.
// Enriched with weeklySummary and completed-week totals.
// ─────────────────────────────────────────────────────────────────────────────
export const getProgressHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const roadmap = await roadmapModel.findOne({ _id: req.params.id, userId });
        if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found." });

        const logs = await progressLogModel
            .find({ roadmapId: roadmap._id })
            .sort({ loggedAt: -1 })
            .populate("resourceId", "title type durationMinutes");

        const totalMinutesSpent = logs.reduce((sum, l) => sum + (l.minutesSpent || 0), 0);
        const resourcesCompleted = logs.filter((l) => l.eventType === "resource_completed").length;

        // Parse client timezone offset (minutes)
        const clientTzOffset = Number(req.query.tzOffset) || 0;
        const normalizedStart = normalizeToMidnight(roadmap.planSettings?.startDate || roadmap.createdAt, clientTzOffset);

        // If plan is missing, generate it
        if (!roadmap.plan || !roadmap.plan.weeks || roadmap.plan.weeks.length === 0) {
            replanRoadmap(roadmap);
            roadmap.markModified("plan");
            await roadmap.save();
        }

        // Build pure weekly summary using client timezone offset
        const { weeklySummary, totals } = buildWeeklySummary({
            plan: roadmap.plan,
            logs,
            now: new Date(),
            startDate: normalizedStart,
            deadlineWeeks: roadmap.planSettings?.deadlineWeeks || null,
            clientTzOffsetMinutes: clientTzOffset,
        });

        return res.json({
            success: true,
            speedFactor: roadmap.speedFactor || 1.0,
            summary: {
                totalMinutesSpent,
                totalHoursSpent: Math.round((totalMinutesSpent / 60) * 10) / 10,
                resourcesCompleted,
                totalEvents: logs.length,
            },
            weeklySummary,
            totals,
            logs,
        });
    } catch (error) {
        console.error("getProgressHistory error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/roadmaps/:id/skills/:skillId/proficiency
// Directly update a skill's proficiency level (0-3).
// ─────────────────────────────────────────────────────────────────────────────
export const updateSkillProficiency = async (req, res) => {
    try {
        const { skillId } = req.params;
        const { proficiency } = req.body;
        req.body = {
            eventType: "level_set",
            skillId,
            newLevel: proficiency,
            minutesSpent: 0,
        };
        return logProgress(req, res);
    } catch (error) {
        console.error("updateSkillProficiency error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmaps/:id/plan.ics
// Exports the study schedule as an RFC 5545 iCalendar file (.ics).
// Query params: weekdays=1,3,5&startTime=19:00
// ─────────────────────────────────────────────────────────────────────────────
export const exportPlanCalendar = async (req, res) => {
    try {
        const userId = req.userId;
        const roadmap = await roadmapModel.findOne({ _id: req.params.id, userId });
        if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found or unauthorized." });

        const { weekdays: weekdaysQuery, startTime = "19:00" } = req.query;

        // Validate startTime (HH:MM format 00:00 to 23:59)
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        if (!timeRegex.test(startTime)) {
            return res.status(400).json({
                success: false,
                message: "Invalid startTime format. Expected HH:MM (e.g. 19:00).",
            });
        }

        // Validate weekdays (comma-separated 1-7)
        if (!weekdaysQuery) {
            return res.status(400).json({
                success: false,
                message: "weekdays query parameter is required (e.g. weekdays=1,3,5).",
            });
        }

        const weekdays = String(weekdaysQuery)
            .split(",")
            .map((s) => Number(s.trim()))
            .filter((n) => !isNaN(n) && n >= 1 && n <= 7);

        if (weekdays.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one valid weekday (1=Mon ... 7=Sun) must be provided.",
            });
        }

        // Ensure roadmap plan exists
        if (!roadmap.plan || !roadmap.plan.weeks || roadmap.plan.weeks.length === 0) {
            replanRoadmap(roadmap);
            roadmap.markModified("plan");
            await roadmap.save();
        }

        const clientTzOffset = Number(req.query.tzOffset) || 0;

        const icsContent = buildCalendarIcs({
            plan: roadmap.plan,
            roadmapId: roadmap._id.toString(),
            roleTitle: roadmap.targetRole || roadmap.title || "Career Path",
            startDate: roadmap.planSettings?.startDate || roadmap.createdAt,
            weekdays,
            startTime,
            now: new Date(),
            clientTzOffsetMinutes: clientTzOffset,
        });

        res.setHeader("Content-Type", "text/calendar; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="skillgraph-${roadmap._id}.ics"`
        );

        return res.status(200).send(icsContent);
    } catch (error) {
        console.error("exportPlanCalendar error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmaps/:id/report.pdf
// Generates and streams a vector PDF Gap Analysis & Study Report.
// Built entirely in memory to prevent corrupt downloads.
// ─────────────────────────────────────────────────────────────────────────────
export const exportGapReportPdf = async (req, res) => {
    try {
        const userId = req.userId;
        const roadmap = await roadmapModel.findOne({ _id: req.params.id, userId });
        if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found or unauthorized." });

        // Retrieve user name only (privacy: omit email)
        const user = await userModel.findById(userId).select("name");

        // Ensure plan is generated
        if (!roadmap.plan || !roadmap.plan.weeks || roadmap.plan.weeks.length === 0) {
            replanRoadmap(roadmap);
            roadmap.markModified("plan");
            await roadmap.save();
        }

        // Fetch relevant resources for this roadmap's skills
        const skillNames = (roadmap.nodes || []).map((n) => (n.label || n.id).toLowerCase().trim());
        const resources = await resourceModel.find({
            skill: { $in: skillNames },
        });

        const reportModel = buildReportModel({
            roadmap,
            user: { name: user?.name || "SkillGraph Learner" },
            resources,
            documentation: roadmap.documentation,
            now: new Date(),
        });

        // Generate vector PDF buffer in memory
        const pdfBuffer = await renderReportPdf(reportModel);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Length", pdfBuffer.length);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="skillgraph-gap-report-${roadmap._id}.pdf"`
        );

        return res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error("exportGapReportPdf error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};
