import roadmapModel from "../Models/roadmapModel.js";
import userModel from "../Models/userModel.js";
import { getTemplate, getSupportedRoles } from "../Utils/roadmapTemplates.js";
import { uploadToCloudinary } from "../Config/Cloudinary.js";
import { priorityScheduledTopoSort } from "../Utils/skillAttributes.js";
import { parseResumeAndExtractSkills } from "../Utils/resumeParser.js";
import { generateJSONFromGemini } from "../Services/geminiService.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: normalise a skill string for comparison (lowercase, trimmed)
// ─────────────────────────────────────────────────────────────────────────────
const norm = (s) => s.toLowerCase().trim();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build roadmap nodes, edges, learningSteps from a template
//
// Logic:
//   • For each template skill:
//       - status = "completed"  → user already has this skill
//       - status = "available"  → no prerequisite, OR all prerequisites completed
//       - status = "locked"     → at least one prerequisite is NOT completed
//   • completedNodes   = ids of completed skill nodes
//   • progressPercent  = (completedNodes / totalNodes) * 100
// ─────────────────────────────────────────────────────────────────────────────
const buildRoadmapFromTemplate = (template, userSkillsNorm, targetRole) => {
    const { skills, edges, buildExplanation } = template;

    // Which template skills does the user already have?
    const completedIds = new Set(
        skills
            .filter((s) => userSkillsNorm.includes(norm(s.label)))
            .map((s) => s.id)
    );

    // Build a quick lookup: skillId → [prerequisite skillIds]
    // (prerequisites = edges where this skill is the "to" node)
    const prereqMap = {};
    for (const edge of edges) {
        if (edge.relation === "prerequisite") {
            if (!prereqMap[edge.to]) prereqMap[edge.to] = [];
            prereqMap[edge.to].push(edge.from);
        }
    }

    // Build nodes
    const nodes = skills.map((s) => {
        let status;
        if (completedIds.has(s.id)) {
            status = "completed";
        } else {
            const prereqs = prereqMap[s.id] || [];
            // available if no prerequisites OR all prerequisites are completed
            const allPrereqsDone = prereqs.every((pid) => completedIds.has(pid));
            status = prereqs.length === 0 || allPrereqsDone ? "available" : "locked";
        }

        return {
            id: s.id,
            label: s.label,
            type: completedIds.has(s.id) ? "existing" : "missing",
            level: s.level,
            status,
            description: s.description,
        };
    });

    // Build learningSteps (only missing skills).
    // Uses priority-weighted topological sort (Kahn's algorithm variant) so that
    // high-demand, high-unlock-factor skills appear earlier in the learning sequence.
    const missingSkills = skills.filter((s) => !completedIds.has(s.id));
    const orderedIds = priorityScheduledTopoSort(missingSkills, edges, targetRole);
    const sortedMissing = orderedIds
        .map((id) => missingSkills.find((s) => s.id === id))
        .filter(Boolean);
    const learningSteps = sortedMissing.map((s, i) => ({
        order: i + 1,
        skill: s.label,
        reason: s.reason,
        estimatedTime: s.estimatedTime,
        resources: [], // TODO: populate with curated resource links
    }));

    // Existing and missing skill labels for the explanation
    const existingLabels = skills
        .filter((s) => completedIds.has(s.id))
        .map((s) => s.label);
    const missingLabels = missingSkills.map((s) => s.label);

    const explanation = buildExplanation(existingLabels, missingLabels, targetRole);

    // Progress
    const totalNodes = nodes.length;
    const completedCount = nodes.filter((n) => n.status === "completed").length;
    const progressPercentage =
        totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

    return {
        nodes,
        edges,
        learningSteps,
        missingSkills: missingLabels,
        explanation,
        completedNodes: [...completedIds],
        progressPercentage,
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

        // ── 5. Build roadmap ───────────────────────────────────────────────
        const {
            nodes,
            edges,
            learningSteps,
            missingSkills,
            explanation,
            completedNodes,
            progressPercentage,
        } = buildRoadmapFromTemplate(template, allUserSkillsNorm, targetRole);

        // ── 6. Save roadmap to DB ──────────────────────────────────────────
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
        });

        // ── 7. Optionally update user profile ──────────────────────────────
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

        // ── 8. Respond ─────────────────────────────────────────────────────
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

            roadmap.completedNodes = completedNodes;

            // Build prerequisite lookup from stored edges
            const prereqMap = {};
            for (const edge of roadmap.edges) {
                if (edge.relation === "prerequisite") {
                    if (!prereqMap[edge.to]) prereqMap[edge.to] = [];
                    prereqMap[edge.to].push(edge.from);
                }
            }

            const completedSet = new Set(completedNodes);

            // Re-derive node statuses
            roadmap.nodes = roadmap.nodes.map((node) => {
                let status;
                if (completedSet.has(node.id)) {
                    status = "completed";
                } else {
                    const prereqs = prereqMap[node.id] || [];
                    const allDone = prereqs.every((pid) => completedSet.has(pid));
                    status = prereqs.length === 0 || allDone ? "available" : "locked";
                }
                return { ...node.toObject(), status };
            });

            // Recalculate progress percentage
            const total = roadmap.nodes.length;
            roadmap.progressPercentage =
                total > 0 ? Math.round((completedNodes.length / total) * 100) : 0;
        }

        await roadmap.save();

        return res.json({
            success: true,
            message: "Progress updated.",
            progressPercentage: roadmap.progressPercentage,
            completedNodes: roadmap.completedNodes,
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
//
// Steps:
//   1. Load the existing roadmap (ownership-checked)
//   2. Treat completedNodes labels as the user's "current skills"
//   3. Re-run buildRoadmapFromTemplate with the updated skill set
//      (this uses the priority-weighted topo sort automatically)
//   4. Persist and return the refreshed roadmap
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
        // Map completedNode IDs → labels so they match the norm() comparison
        const completedIdSet = new Set(roadmap.completedNodes);
        const completedLabels = roadmap.nodes
            .filter((n) => completedIdSet.has(n.id))
            .map((n) => n.label);

        // Merge with the roadmap's originally extracted skills so the user
        // keeps credit for skills they had before any progress was marked.
        const currentSkillsNorm = [
            ...new Set([
                ...roadmap.extractedSkills.map(norm),
                ...completedLabels.map(norm),
            ]),
        ];

        // ── 4. Re-build roadmap using priority-weighted sort ───────────────
        const {
            nodes,
            edges,
            learningSteps,
            missingSkills,
            explanation,
            completedNodes: newCompletedNodes,
            progressPercentage,
        } = buildRoadmapFromTemplate(template, currentSkillsNorm, roadmap.targetRole);

        // ── 5. Update the existing document in-place ───────────────────────
        roadmap.nodes              = nodes;
        roadmap.edges              = edges;
        roadmap.learningSteps      = learningSteps;
        roadmap.missingSkills      = missingSkills;
        roadmap.explanation        = explanation;
        roadmap.completedNodes     = newCompletedNodes;
        roadmap.progressPercentage = progressPercentage;
        // Invalidate any cached AI documentation — the roadmap's skill set
        // and ordering have changed, so stale docs must not be served.
        roadmap.documentation      = { content: null, generatedAt: null };

        await roadmap.save();

        // ── 6. Respond ─────────────────────────────────────────────────────
        return res.json({
            success: true,
            message: "Roadmap regenerated with updated priority ordering.",
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
