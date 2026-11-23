// ─────────────────────────────────────────────────────────────────────────────
// SkillGraph/components/RoadmapDocumentation.jsx
//
// Renders AI-generated documentation for a roadmap when the "Docs" view is
// selected. Calls POST /api/roadmaps/:id/documentation on mount (uses cached
// response if warm) and on "Regenerate documentation" (force=true).
//
// Props:
//   roadmapId  {string}  — roadmap _id from URL params
//   token      {string}  — auth JWT (from AppContext)
//   backendUrl {string}  — API base URL (from AppContext)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FileText, RefreshCw, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Loader2, Sparkles, BookOpen, Hammer, Clock, Trophy } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: SkillCard
// Accordion card for a single skill's documentation entry.
// ─────────────────────────────────────────────────────────────────────────────
const SkillCard = ({ skill, index }) => {
  const [open, setOpen] = useState(index === 0); // first skill expanded by default

  return (
    <div className="border border-black/10 rounded-xl overflow-hidden transition-all duration-200 hover:border-black/20">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-zinc-50 transition text-left gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-semibold text-sm text-black truncate">{skill.skillName}</span>
          {skill.estimatedTimeToLearn && (
            <span className="shrink-0 text-[10px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full hidden sm:inline">
              {skill.estimatedTimeToLearn}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown size={15} className="shrink-0 text-zinc-400" />
        ) : (
          <ChevronRight size={15} className="shrink-0 text-zinc-400" />
        )}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="bg-white border-t border-black/5 px-5 py-4 space-y-4">
          {/* Why It Matters */}
          <div className="flex gap-3">
            <Sparkles size={14} className="shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Why It Matters</p>
              <p className="text-sm text-zinc-700 leading-relaxed">{skill.whyItMatters}</p>
            </div>
          </div>

          {/* How to Learn */}
          <div className="flex gap-3">
            <BookOpen size={14} className="shrink-0 text-blue-500 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">How to Learn</p>
              <p className="text-sm text-zinc-700 leading-relaxed">{skill.howToLearn}</p>
            </div>
          </div>

          {/* How to Practice */}
          <div className="flex gap-3">
            <Hammer size={14} className="shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">How to Practice</p>
              <p className="text-sm text-zinc-700 leading-relaxed">{skill.howToPractice}</p>
            </div>
          </div>

          {/* Estimated Time */}
          {skill.estimatedTimeToLearn && (
            <div className="flex gap-3 sm:hidden">
              <Clock size={14} className="shrink-0 text-zinc-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Estimated Time</p>
                <p className="text-sm text-zinc-700">{skill.estimatedTimeToLearn}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: RoadmapDocumentation
// ─────────────────────────────────────────────────────────────────────────────
const RoadmapDocumentation = ({ roadmapId, token, backendUrl }) => {
  const [doc, setDoc] = useState(null);         // documentation.content
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allComplete, setAllComplete] = useState(false);
  const [isCached, setIsCached] = useState(false);
  // Concurrency guard: disables the regen button while a request is in flight
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Fetch documentation ─────────────────────────────────────────────────
  const fetchDocumentation = useCallback(
    async (force = false) => {
      if (!token || !roadmapId || isGenerating) return;

      setIsGenerating(true);
      setLoading(true);
      setError("");

      try {
        const url = `${backendUrl}/api/roadmaps/${roadmapId}/documentation${force ? "?force=true" : ""}`;
        const { data } = await axios.post(url, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          if (data.allComplete) {
            setAllComplete(true);
            setDoc(null);
          } else {
            setDoc(data.documentation?.content ?? null);
            setGeneratedAt(data.documentation?.generatedAt ?? null);
            setIsCached(data.cached ?? false);
            setAllComplete(false);
          }
        } else {
          setError(data.message || "Failed to generate documentation.");
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Documentation generation failed. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
        setIsGenerating(false);
      }
    },
    [roadmapId, token, backendUrl, isGenerating]
  );

  // Fetch on mount / roadmapId change
  useEffect(() => {
    fetchDocumentation(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapId]);

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center">
            <FileText size={22} className="text-zinc-400" />
          </div>
          <Loader2 size={14} className="absolute -top-1 -right-1 text-black animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-black">Generating documentation…</p>
          <p className="text-xs text-zinc-400 mt-1">
            Gemini is analysing your roadmap — this may take a few seconds.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-sm font-semibold text-black mb-1">Documentation generation failed</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => fetchDocumentation(false)}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ALL COMPLETE STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (allComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
          <CheckCircle2 size={22} className="text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-black">You've completed this roadmap!</p>
          <p className="text-xs text-zinc-400 mt-1">
            There are no remaining skills to document.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NO DATA YET (shouldn't normally happen, but guard anyway)
  // ─────────────────────────────────────────────────────────────────────────
  if (!doc) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER — Documentation
  // ─────────────────────────────────────────────────────────────────────────
  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div className="space-y-6">

      {/* ── Top bar: cache indicator + regen button ──────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {isCached && generatedAt && (
            <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 px-2.5 py-1 rounded-full">
              ✓ Cached · {fmtDate(generatedAt)}
            </span>
          )}
          {!isCached && generatedAt && (
            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
              ✨ Just generated
            </span>
          )}
        </div>

        {/* Regenerate documentation button — disabled while in-flight (concurrency guard) */}
        <button
          id="btn-regenerate-docs"
          onClick={() => fetchDocumentation(true)}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 text-xs font-semibold text-zinc-600 hover:border-black/30 hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={11} className={isGenerating ? "animate-spin" : ""} />
          Regenerate documentation
        </button>
      </div>

      {/* ── Role Overview ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-zinc-400" />
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Role Overview</p>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed">{doc.roleOverview}</p>
      </div>

      {/* ── Why This Order ───────────────────────────────────────────────── */}
      <div className="bg-white border border-black/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-amber-500" />
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Why This Order</p>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">{doc.whyThisOrder}</p>
      </div>

      {/* ── Skills ───────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-zinc-400" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Skills
            </p>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 px-2.5 py-1 rounded-full">
            {doc.skills.length} skills
          </span>
        </div>

        <div className="space-y-2">
          {doc.skills.map((skill, i) => (
            <SkillCard key={skill.skillName ?? i} skill={skill} index={i} />
          ))}
        </div>
      </div>

      {/* ── Capstone Project ─────────────────────────────────────────────── */}
      {doc.finalMilestoneProject && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-amber-600" />
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
              Capstone Project
            </p>
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed">{doc.finalMilestoneProject}</p>
        </div>
      )}
    </div>
  );
};

export default RoadmapDocumentation;
