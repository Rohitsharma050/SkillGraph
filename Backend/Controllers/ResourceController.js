import resourceModel from "../Models/resourceModel.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/resources?skill=React
//
// Returns resources for a given skill (case-insensitive).
// Also checks tags array for secondary matches.
// Groups results by type for easier frontend consumption.
// ─────────────────────────────────────────────────────────────────────────────
export const getResourcesBySkill = async (req, res) => {
    try {
        const skill = req.query.skill?.trim();
        if (!skill) {
            return res.status(400).json({
                success: false,
                message: "skill query parameter is required. Example: /api/resources?skill=React",
            });
        }

        const regex = new RegExp(skill, "i"); // case-insensitive match

        const resources = await resourceModel
            .find({
                $or: [
                    { skillName: { $regex: regex } },
                    { tags: { $elemMatch: { $regex: regex } } },
                ],
            })
            .sort({ type: 1, difficulty: 1 }); // consistent ordering

        // Group by type
        const grouped = {};
        for (const r of resources) {
            if (!grouped[r.type]) grouped[r.type] = [];
            grouped[r.type].push(r);
        }

        return res.json({
            success: true,
            skill,
            count: resources.length,
            resources,
            grouped,
        });
    } catch (error) {
        console.error("getResourcesBySkill error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/resources/search?q=React hooks
//
// Full-text search across title, skillName, description, and tags.
// Falls back to regex search if no text index match is found.
// ─────────────────────────────────────────────────────────────────────────────
export const searchResources = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q) {
            return res.status(400).json({
                success: false,
                message: "q query parameter is required. Example: /api/resources/search?q=React",
            });
        }

        let resources;

        // Try MongoDB text search first (fast, uses text index)
        try {
            resources = await resourceModel
                .find({ $text: { $search: q } })
                .sort({ score: { $meta: "textScore" } })
                .limit(30);
        } catch {
            // Text index may not be ready yet — fall back to regex
            resources = [];
        }

        // If text search found nothing, fall back to case-insensitive regex
        if (resources.length === 0) {
            const regex = new RegExp(q, "i");
            resources = await resourceModel
                .find({
                    $or: [
                        { title: { $regex: regex } },
                        { skillName: { $regex: regex } },
                        { description: { $regex: regex } },
                        { tags: { $elemMatch: { $regex: regex } } },
                    ],
                })
                .limit(30);
        }

        return res.json({
            success: true,
            query: q,
            count: resources.length,
            resources,
        });
    } catch (error) {
        console.error("searchResources error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/resources
//
// Create a new resource. Protected route (logged-in user).
// ─────────────────────────────────────────────────────────────────────────────
export const createResource = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        const { skillName, title, type, url, description, difficulty, tags, isFree, source } =
            req.body;

        // Validate required fields
        if (!skillName || !title || !type || !url) {
            return res.status(400).json({
                success: false,
                message: "skillName, title, type, and url are required.",
            });
        }

        const validTypes = ["video", "blog", "documentation", "practice", "course", "project"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `type must be one of: ${validTypes.join(", ")}`,
            });
        }

        const resource = await resourceModel.create({
            skillName: skillName.trim(),
            title: title.trim(),
            type,
            url: url.trim(),
            description: description?.trim() || "",
            difficulty: difficulty || "beginner",
            tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
            isFree: isFree !== undefined ? Boolean(isFree) : true,
            source: source?.trim() || "",
        });

        return res.status(201).json({
            success: true,
            message: "Resource created successfully.",
            resource,
        });
    } catch (error) {
        console.error("createResource error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};
