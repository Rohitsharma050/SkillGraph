import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import DashboardNavbar from "../Components/DashboardNavbar";
import RoadmapHistory from "../Components/RoadmapHistory";


const statusMeta = {
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    card: "border-emerald-200 bg-emerald-50/40",
    ring: "ring-2 ring-emerald-300",
  },
  available: {
    label: "Available",
    dot: "bg-black",
    badge: "bg-zinc-900 text-white border-zinc-900",
    card: "border-black/20 bg-white hover:border-black/50 hover:shadow-md",
    ring: "",
  },
  locked: {
    label: "Locked",
    dot: "bg-zinc-300",
    badge: "bg-zinc-100 text-zinc-400 border-zinc-200",
    card: "border-zinc-100 bg-zinc-50/60 opacity-60",
    ring: "",
  },
};


const RoadmapNode = ({ node, onMarkComplete, marking, onViewResources }) => {
  const meta = statusMeta[node.status] || statusMeta.available;
  const isMarkable = node.status === "available";

  return (
    <div
      className={`relative rounded-2xl border p-4 transition-all duration-200 ${meta.card} ${meta.ring}`}
    >
      {/* Status dot + badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`shrink-0 w-2.5 h-2.5 rounded-full mt-0.5 ${meta.dot}`} />
          <span className="font-semibold text-sm text-black leading-snug">
            {node.label}
          </span>
        </div>
        <span
          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-500 leading-relaxed pl-4 mb-3">
        {node.description}
      </p>

      {/* Level badge */}
      <div className="pl-4 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-zinc-400 font-medium">
          Level {node.level}
        </span>

        {/* Mark Complete */}
        {isMarkable && (
          <button
            onClick={() => onMarkComplete(node.id)}
            disabled={marking === node.id}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-black text-white hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {marking === node.id ? "Saving…" : "✓ Mark Complete"}
          </button>
        )}

        {/* View Resources */}
        <button
          onClick={() => onViewResources(node.label)}
          className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-black/10 text-zinc-600 hover:border-black/30 hover:text-black transition"
        >
          Resources →
        </button>
      </div>

      {/* Completed checkmark overlay */}
      {node.status === "completed" && (
        <span className="absolute top-3 right-3 text-emerald-500 text-base">✓</span>
      )}

      {/* Locked overlay icon */}
      {node.status === "locked" && (
        <span className="absolute top-3 right-3 text-zinc-300 text-sm">🔒</span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: ProgressCard
// ─────────────────────────────────────────────────────────────────────────────
const ProgressCard = ({ percentage, completedCount, totalCount }) => {
  const pct = Math.max(0, Math.min(100, percentage));

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
        Progress
      </p>

      {/* Circular-style big number */}
      <div className="flex items-end gap-1 mb-3">
        <span className="text-5xl font-bold text-black leading-none">{pct}</span>
        <span className="text-xl font-semibold text-zinc-400 mb-1">%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-black transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-zinc-400">
        {completedCount} of {totalCount} skills completed
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: LearningStepCard
// ─────────────────────────────────────────────────────────────────────────────
const LearningStepCard = ({ step, isCompleted }) => (
  <div
    className={`flex gap-4 p-4 rounded-2xl border transition-all duration-200 ${
      isCompleted
        ? "border-emerald-200 bg-emerald-50/40"
        : "border-black/10 bg-white"
    }`}
  >
    {/* Order number */}
    <div
      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isCompleted ? "bg-emerald-500 text-white" : "bg-black text-white"
      }`}
    >
      {isCompleted ? "✓" : step.order}
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <p className="font-semibold text-sm text-black">{step.skill}</p>
        <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 px-2 py-0.5 rounded-full">
          ~{step.estimatedTime}
        </span>
        {isCompleted && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            Done
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">{step.reason}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: RoadmapPage
// ─────────────────────────────────────────────────────────────────────────────
const RoadmapPage = () => {
  const { roadmapId } = useParams();
  const navigate = useNavigate();
  const { token, backendUrl } = useContext(AppContext);

  // ── State ─────────────────────────────────────────────────────────────────
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(null); // nodeId being marked

  // ── Fetch roadmap ─────────────────────────────────────────────────────────
  const fetchRoadmap = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(
        `${backendUrl}/api/roadmaps/${roadmapId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setRoadmap(data.roadmap);
      } else {
        setError(data.message || "Roadmap not found.");
      }
    } catch (err) {
      setError(
        err?.response?.status === 404
          ? "This roadmap doesn't exist or you don't have access."
          : "Failed to load roadmap. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [roadmapId, token, backendUrl]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  // ── Mark a node as complete ───────────────────────────────────────────────
  const handleMarkComplete = async (nodeId) => {
    if (!roadmap) return;
    setMarking(nodeId);

    try {
      const newCompleted = [...new Set([...roadmap.completedNodes, nodeId])];
      const newProgress = Math.round(
        (newCompleted.length / roadmap.nodes.length) * 100
      );

      const { data } = await axios.patch(
        `${backendUrl}/api/roadmaps/${roadmapId}/progress`,
        { completedNodes: newCompleted, progressPercentage: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // Recompute node statuses locally from backend response
        // Build prerequisite lookup from edges
        const prereqMap = {};
        for (const edge of roadmap.edges) {
          if (edge.relation === "prerequisite") {
            if (!prereqMap[edge.to]) prereqMap[edge.to] = [];
            prereqMap[edge.to].push(edge.from);
          }
        }

        const completedSet = new Set(data.completedNodes);
        const updatedNodes = roadmap.nodes.map((n) => {
          let status;
          if (completedSet.has(n.id)) {
            status = "completed";
          } else {
            const prereqs = prereqMap[n.id] || [];
            const allDone = prereqs.every((pid) => completedSet.has(pid));
            status = prereqs.length === 0 || allDone ? "available" : "locked";
          }
          return { ...n, status };
        });

        setRoadmap((prev) => ({
          ...prev,
          nodes: updatedNodes,
          completedNodes: data.completedNodes,
          progressPercentage: data.progressPercentage,
        }));
      }
    } catch (err) {
      console.error("Mark complete error:", err);
    } finally {
      setMarking(null);
    }
  };

  // ── Navigate to resources page for a skill ───────────────────────────────
  const handleViewResources = (skillLabel) => {
    navigate(`/resources?skill=${encodeURIComponent(skillLabel)}`);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const nodesByLevel = roadmap
    ? roadmap.nodes.reduce((acc, node) => {
        const lvl = node.level || 1;
        if (!acc[lvl]) acc[lvl] = [];
        acc[lvl].push(node);
        return acc;
      }, {})
    : {};
  const levels = Object.keys(nodesByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  const completedSet = new Set(roadmap?.completedNodes || []);
  const completedCount = roadmap?.completedNodes?.length || 0;
  const totalCount = roadmap?.nodes?.length || 0;

  // ── Format date ───────────────────────────────────────────────────────────
  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-400 font-medium">
              Loading your roadmap…
            </p>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center mx-auto mb-5 text-3xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-black mb-2">
              Roadmap not found
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <DashboardNavbar />

      <main className="min-h-screen bg-[#f7f7f7]">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

          {/* ── HEADER CARD ───────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-black via-zinc-900 to-zinc-700 rounded-3xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-6">

              {/* Back button + title */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-xs font-medium mb-4"
                >
                  ← Dashboard
                </button>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight truncate">
                  {roadmap.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium">
                    {roadmap.targetRole}
                  </span>
                  {roadmap.createdAt && (
                    <span className="text-xs text-zinc-400">
                      Created {fmtDate(roadmap.createdAt)}
                    </span>
                  )}
                </div>
                {/* Explanation teaser */}
                {roadmap.explanation && (
                  <p className="text-sm text-zinc-300 leading-relaxed mt-3 max-w-2xl line-clamp-2">
                    {roadmap.explanation}
                  </p>
                )}
              </div>

              {/* Progress ring area */}
              <div className="shrink-0 flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-6 min-w-[140px]">
                <span className="text-5xl font-bold leading-none">
                  {roadmap.progressPercentage}
                </span>
                <span className="text-zinc-400 text-sm mt-0.5">%</span>
                <div className="w-full h-1.5 rounded-full bg-white/10 mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                    style={{ width: `${roadmap.progressPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 text-center">
                  {completedCount}/{totalCount} skills
                </p>
              </div>
            </div>
          </div>

          {/* ── MAIN BODY GRID ────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

            {/* ══ LEFT / MAIN COLUMN ════════════════════════════════════════ */}
            <div className="space-y-6">

              {/* ── ROADMAP GRAPH ──────────────────────────────────────────── */}
              <div className="bg-white border border-black/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-black">
                      Skill Roadmap
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Skills are ordered by prerequisite level. Complete each
                      layer before advancing.
                    </p>
                  </div>
                  {/* Legend */}
                  <div className="hidden sm:flex items-center gap-3 text-[10px] text-zinc-500 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Done
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-black" />
                      Available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-zinc-300" />
                      Locked
                    </span>
                  </div>
                </div>

                {/* Levels */}
                <div className="space-y-0">
                  {levels.map((level, levelIdx) => (
                    <div key={level}>
                      {/* Level label + connector line */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="shrink-0 text-[10px] font-bold text-zinc-300 uppercase tracking-widest w-14 text-right">
                          Level {level}
                        </span>
                        <div className="flex-1 h-px bg-zinc-100" />
                      </div>

                      {/* Nodes row */}
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-2 pl-[72px]">
                        {nodesByLevel[level].map((node) => (
                          <RoadmapNode
                            key={node.id}
                            node={node}
                            onMarkComplete={handleMarkComplete}
                            onViewResources={handleViewResources}
                            marking={marking}
                          />
                        ))}
                      </div>

                      {/* Vertical connector between levels */}
                      {levelIdx < levels.length - 1 && (
                        <div className="flex items-center gap-3 my-1">
                          <div className="w-14" />
                          <div className="ml-4 flex flex-col items-center">
                            <div className="w-px h-6 bg-zinc-200" />
                            <svg
                              className="text-zinc-300 -mt-px"
                              width="10"
                              height="6"
                              viewBox="0 0 10 6"
                              fill="currentColor"
                            >
                              <path d="M5 6L0 0h10L5 6z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── EXPLANATION CARD ───────────────────────────────────────── */}
              {roadmap.explanation && (
                <div className="bg-white border border-black/10 rounded-2xl p-6">
                  <h2 className="text-base font-bold text-black mb-3">
                    Why This Roadmap?
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {roadmap.explanation}
                  </p>
                </div>
              )}

              {/* ── LEARNING STEPS ─────────────────────────────────────────── */}
              {roadmap.learningSteps?.length > 0 && (
                <div className="bg-white border border-black/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-base font-bold text-black">
                        Learning Steps
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Ordered by prerequisite level — tackle them one by one.
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400 font-medium bg-zinc-100 px-3 py-1 rounded-full">
                      {roadmap.learningSteps.length} steps
                    </span>
                  </div>
                  <div className="space-y-3">
                    {roadmap.learningSteps.map((step) => {
                      // Check if this skill node is completed
                      const matchingNode = roadmap.nodes.find(
                        (n) =>
                          n.label.toLowerCase() === step.skill.toLowerCase()
                      );
                      const isDone =
                        matchingNode && completedSet.has(matchingNode.id);
                      return (
                        <LearningStepCard
                          key={step.order}
                          step={step}
                          isCompleted={!!isDone}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ══ RIGHT / SIDEBAR ═══════════════════════════════════════════ */}
            <div className="space-y-4">

              {/* ── Progress Card ──────────────────────────────────────────── */}
              <ProgressCard
                percentage={roadmap.progressPercentage}
                completedCount={completedCount}
                totalCount={totalCount}
              />

              {/* ── Existing Skills ────────────────────────────────────────── */}
              <div className="bg-white border border-black/10 rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                  Your Skills
                </p>
                {roadmap.extractedSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.extractedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    No skills detected from profile.
                  </p>
                )}
              </div>

              {/* ── Missing Skills ─────────────────────────────────────────── */}
              <div className="bg-white border border-black/10 rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                  Skills to Learn
                </p>
                {roadmap.missingSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.missingSkills.map((skill) => {
                      // Check if it has been completed mid-session
                      const matchingNode = roadmap.nodes.find(
                        (n) => n.label.toLowerCase() === skill.toLowerCase()
                      );
                      const isDone =
                        matchingNode && completedSet.has(matchingNode.id);
                      return (
                        <span
                          key={skill}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                            isDone
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 line-through"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200"
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    🎉 You already have all required skills!
                  </p>
                )}
              </div>

              {/* ── Completed Skills ───────────────────────────────────────── */}
              {completedCount > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">
                    Completed
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.nodes
                      .filter((n) => completedSet.has(n.id))
                      .map((n) => (
                        <span
                          key={n.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-semibold"
                        >
                          ✓ {n.label}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* ── Quick Actions ──────────────────────────────────────────── */}
              <div className="bg-white border border-black/10 rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                  Quick Actions
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full text-left px-4 py-3 rounded-xl border border-black/10 text-sm font-medium text-black hover:bg-zinc-50 hover:border-black/20 transition"
                  >
                    ← Back to Dashboard
                  </button>
                  {/* TODO (Step 6): implement Resources page */}
                  <button
                    onClick={() => navigate("/resources")}
                    className="w-full text-left px-4 py-3 rounded-xl border border-black/10 text-sm font-medium text-black hover:bg-zinc-50 hover:border-black/20 transition"
                  >
                    📚 View Resources
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full text-left px-4 py-3 rounded-xl border border-black/10 text-sm font-medium text-black hover:bg-zinc-50 hover:border-black/20 transition"
                  >
                    ⚡ Generate New Roadmap
                  </button>
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left px-4 py-3 rounded-xl border border-black/10 text-sm font-medium text-black hover:bg-zinc-50 hover:border-black/20 transition"
                  >
                    👤 Open Profile
                  </button>
                </div>
              </div>

              {/* ── Resume link (if available) ─────────────────────────────── */}
              {roadmap.resumeUrl && (
                <div className="bg-white border border-black/10 rounded-2xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                    Resume Used
                  </p>
                  <a
                    href={roadmap.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-black hover:text-zinc-600 transition underline underline-offset-2"
                  >
                    <span>📄</span> View Resume →
                  </a>
                </div>
              )}

              {/* ── Roadmap History ────────────────────────────────────────── */}
              <RoadmapHistory
                currentRoadmapId={roadmapId}
                compact={true}
                showHeader={true}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default RoadmapPage;
