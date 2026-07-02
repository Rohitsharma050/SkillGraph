import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format a date string into a readable short form
// ─────────────────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// ─────────────────────────────────────────────────────────────────────────────
// RoadmapHistoryItem — a single roadmap card in the list
// ─────────────────────────────────────────────────────────────────────────────
const RoadmapHistoryItem = ({ roadmap, isActive, compact, onClick }) => {
  const pct = roadmap.progressPercentage ?? 0;
  const totalNodes = roadmap.nodes?.length ?? 0;
  const completedCount = roadmap.completedNodes?.length ?? 0;
  const missingCount = roadmap.missingSkills?.length ?? 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border transition-all duration-200 group ${
        isActive
          ? "border-black bg-black text-white"
          : "border-black/10 bg-white hover:border-black/30 hover:shadow-sm"
      } ${compact ? "p-3" : "p-4"}`}
    >
      {/* Title + date row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className={`font-semibold leading-snug truncate ${
            compact ? "text-xs" : "text-sm"
          } ${isActive ? "text-white" : "text-black"}`}
        >
          {roadmap.title || roadmap.targetRole}
        </p>
        <span
          className={`shrink-0 text-[10px] font-medium ${
            isActive ? "text-zinc-300" : "text-zinc-400"
          }`}
        >
          {fmtDate(roadmap.createdAt)}
        </span>
      </div>

      {/* Role badge */}
      {!compact && (
        <p
          className={`text-[11px] mb-2.5 ${
            isActive ? "text-zinc-300" : "text-zinc-500"
          }`}
        >
          {roadmap.targetRole}
        </p>
      )}

      {/* Progress bar */}
      <div
        className={`w-full h-1 rounded-full mb-1.5 overflow-hidden ${
          isActive ? "bg-white/20" : "bg-zinc-100"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct === 100
              ? "bg-emerald-400"
              : isActive
              ? "bg-white"
              : "bg-black"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-medium ${
            isActive ? "text-zinc-300" : "text-zinc-400"
          }`}
        >
          {pct}% complete
        </span>
        {!compact && (
          <span
            className={`text-[10px] ${
              isActive ? "text-zinc-400" : "text-zinc-300"
            }`}
          >
            {completedCount}/{totalNodes} skills
            {missingCount > 0 ? ` · ${missingCount} to learn` : ""}
          </span>
        )}
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RoadmapHistory — main exported component
//
// Props:
//   currentRoadmapId  string   optional — highlight currently viewed roadmap
//   limit             number   optional — max items to show (default: all)
//   compact           boolean  optional — use compact card style
//   showHeader        boolean  optional — show the section header (default: true)
//   onNavigate        fn       optional — called after navigate (for side effects)
// ─────────────────────────────────────────────────────────────────────────────
const RoadmapHistory = ({
  currentRoadmapId,
  limit,
  compact = false,
  showHeader = true,
  onNavigate,
}) => {
  const { token, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Fetch all user roadmaps ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`${backendUrl}/api/roadmaps`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setRoadmaps(data.roadmaps || []);
        } else {
          setError(data.message || "Could not load roadmaps.");
        }
      } catch {
        setError("Failed to load roadmap history.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token, backendUrl]);

  // ── Handle item click ─────────────────────────────────────────────────────
  const handleOpen = (id) => {
    navigate(`/roadmap/${id}`);
    if (onNavigate) onNavigate(id);
  };

  // ── Apply limit ───────────────────────────────────────────────────────────
  const displayed = limit ? roadmaps.slice(0, limit) : roadmaps;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-black/10 rounded-2xl overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Roadmap History
            </p>
            {!loading && !error && roadmaps.length > 0 && (
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {roadmaps.length} roadmap{roadmaps.length !== 1 ? "s" : ""} generated
              </p>
            )}
          </div>
          {/* "See all" link shown on Dashboard when limit is applied */}
          {limit && roadmaps.length > limit && (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-[11px] font-medium text-zinc-400 hover:text-black transition"
            >
              See all →
            </button>
          )}
        </div>
      )}

      {/* Body */}
      <div className={`${showHeader ? "px-4 pb-4" : "p-4"}`}>
        {/* ── Loading ────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-400">Loading…</span>
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {!loading && error && (
          <p className="text-xs text-zinc-400 text-center py-6">{error}</p>
        )}

        {/* ── Empty ──────────────────────────────────────────────────────── */}
        {!loading && !error && roadmaps.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-400">No roadmaps generated yet.</p>
            <p className="text-xs text-zinc-300 mt-1">
              Your roadmaps will appear here once generated.
            </p>
          </div>
        )}

        {/* ── List ───────────────────────────────────────────────────────── */}
        {!loading && !error && displayed.length > 0 && (
          <div className="space-y-2">
            {displayed.map((rm) => (
              <RoadmapHistoryItem
                key={rm._id}
                roadmap={rm}
                isActive={rm._id === currentRoadmapId}
                compact={compact}
                onClick={() => handleOpen(rm._id)}
              />
            ))}

            {/* "View all" prompt when showing limited results inline */}
            {limit && roadmaps.length > limit && (
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-2.5 text-center text-[11px] font-medium text-zinc-400 hover:text-black transition rounded-xl border border-dashed border-black/10 hover:border-black/20"
              >
                + {roadmaps.length - limit} more roadmap{roadmaps.length - limit !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapHistory;
