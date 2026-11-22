import express from "express";
import Job, { VALID_STATUSES, VALID_TAGS } from "../Models/jobModel.js";
import authMiddleware from "../Middleware/authMiddleware.js";

export const jobRouter = express.Router();

// All routes are protected by authMiddleware (req.userId is populated from JWT)
jobRouter.use(authMiddleware);

function logActivity(job, action, detail = "") {
  if (!job.activityLog) {
    job.activityLog = [];
  }
  job.activityLog.push({ action, detail });
}

// ─── GET /api/jobs ─────────────────────────────────────────────────────────
// Supports query params: status, tags, search, resume, from, to, sortBy
jobRouter.get("/", async (req, res) => {
  try {
    const { status, tags, search, resume, from, to, sortBy } = req.query;

    const filter = { user: req.userId };

    // Status filter (comma-separated)
    if (status) {
      const statuses = status.split(",").filter((s) => VALID_STATUSES.includes(s));
      if (statuses.length) filter.status = { $in: statuses };
    }

    // Tags filter (comma-separated)
    if (tags) {
      const tagList = tags.split(",").filter((t) => VALID_TAGS.includes(t));
      if (tagList.length) filter.tags = { $in: tagList };
    }

    // Resume filter
    if (resume) {
      filter.resume = { $regex: resume, $options: "i" };
    }

    // Date range filter
    if (from || to) {
      filter.appliedDate = {};
      if (from) filter.appliedDate.$gte = new Date(from);
      if (to) filter.appliedDate.$lte = new Date(to);
    }

    // Text search
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Sort
    const sortMap = {
      newest: { updatedAt: -1 },
      oldest: { appliedDate: 1 },
      company: { company: 1 },
      status: { status: 1 },
    };
    const sort = sortMap[sortBy] || { updatedAt: -1 };

    const jobs = await Job.find(filter).sort(sort);
    res.json(jobs);
  } catch (err) {
    console.error("GET /jobs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /api/jobs ─────────────────────────────────────────────────────────
jobRouter.post("/", async (req, res) => {
  try {
    const {
      company,
      role,
      status,
      appliedDate,
      notes,
      jobLink,
      interviewDates,
      tags,
      resume,
      followUpDate,
      salary,
      location,
    } = req.body;

    if (!company?.trim() || !role?.trim()) {
      return res.status(400).json({ message: "Company and role are required" });
    }

    const validatedTags = (tags || []).filter((t) => VALID_TAGS.includes(t));
    const initialStatus = VALID_STATUSES.includes(status) ? status : "Wishlist";

    const job = new Job({
      user: req.userId,
      company: company.trim(),
      role: role.trim(),
      status: initialStatus,
      appliedDate: appliedDate || Date.now(),
      notes: notes || "",
      jobLink: jobLink || "",
      interviewDates: interviewDates || [],
      tags: validatedTags,
      resume: resume || "",
      followUpDate: followUpDate || null,
      salary: salary || "",
      location: location || "",
    });

    logActivity(job, "Created", `Added to ${initialStatus}`);
    await job.save();

    res.status(201).json(job);
  } catch (err) {
    console.error("POST /jobs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PUT /api/jobs/:id ──────────────────────────────────────────────────────
jobRouter.put("/:id", async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.userId });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const editableFields = [
      "company",
      "role",
      "appliedDate",
      "notes",
      "jobLink",
      "interviewDates",
      "resume",
      "followUpDate",
      "salary",
      "location",
    ];

    const changes = [];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (JSON.stringify(job[field]) !== JSON.stringify(req.body[field])) {
          changes.push(field);
        }
        job[field] = req.body[field];
      }
    });

    if (req.body.status && req.body.status !== job.status) {
      if (!VALID_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const prev = job.status;
      job.status = req.body.status;
      logActivity(job, "Status changed", `${prev} → ${req.body.status}`);
    }

    if (req.body.tags !== undefined) {
      job.tags = req.body.tags.filter((t) => VALID_TAGS.includes(t));
    }

    if (changes.length > 0) {
      logActivity(job, "Edited", changes.join(", "));
    }

    await job.save();
    res.json(job);
  } catch (err) {
    console.error("PUT /jobs/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE /api/jobs/:id ────────────────────────────────────────────────────
jobRouter.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error("DELETE /jobs/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PATCH /api/jobs/:id/status ─────────────────────────────────────────────
jobRouter.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const job = await Job.findOne({ _id: req.params.id, user: req.userId });
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status !== status) {
      logActivity(job, "Status changed", `${job.status} → ${status}`);
      job.status = status;
      await job.save();
    }

    res.json(job);
  } catch (err) {
    console.error("PATCH /jobs/:id/status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PATCH /api/jobs/:id/tags ───────────────────────────────────────────────
jobRouter.patch("/:id/tags", async (req, res) => {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: "tags must be an array" });
    }

    const validTags = tags.filter((t) => VALID_TAGS.includes(t));
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { tags: validTags },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("PATCH /jobs/:id/tags error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PATCH /api/jobs/:id/reminder ───────────────────────────────────────────
jobRouter.patch("/:id/reminder", async (req, res) => {
  try {
    const { followUpDate } = req.body;

    const job = await Job.findOne({ _id: req.params.id, user: req.userId });
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.followUpDate = followUpDate ? new Date(followUpDate) : null;
    logActivity(
      job,
      "Reminder set",
      followUpDate ? new Date(followUpDate).toLocaleDateString() : "Cleared"
    );
    await job.save();

    res.json(job);
  } catch (err) {
    console.error("PATCH /jobs/:id/reminder error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default jobRouter;
