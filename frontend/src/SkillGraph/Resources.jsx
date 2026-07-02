import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import DashboardNavbar from "../Components/DashboardNavbar";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "video", label: "Videos" },
  { key: "course", label: "Courses" },
  { key: "blog", label: "Blogs" },
  { key: "documentation", label: "Docs" },
  { key: "practice", label: "Practice" },
  { key: "project", label: "Projects" },
];

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_ICONS = {
  video: "▶",
  course: "🎓",
  blog: "✍",
  documentation: "📖",
  practice: "⚡",
  project: "🏗",
};

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCE CARD
// ─────────────────────────────────────────────────────────────────────────────
const ResourceCard = ({ resource }) => {
  const diffColor = DIFFICULTY_COLORS[resource.difficulty] || DIFFICULTY_COLORS.beginner;
  const typeIcon = TYPE_ICONS[resource.type] || "🔗";

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-black/30 hover:shadow-sm transition-all duration-200 group">
      {/* Type chip + Free badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
          <span>{typeIcon}</span>
          {resource.type}
        </span>
        <div className="flex items-center gap-1.5">
          {resource.isFree ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Free
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
              Paid
            </span>
          )}
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${diffColor}`}
          >
            {resource.difficulty}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-sm text-black leading-snug group-hover:text-zinc-700 transition">
        {resource.title}
      </h3>

      {/* Description */}
      {resource.description && (
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {resource.description}
        </p>
      )}

      {/* Source + Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mt-auto">
        {resource.source && (
          <span className="text-[10px] font-medium text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
            {resource.source}
          </span>
        )}
        {resource.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-50"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Open button */}
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full mt-1 py-2.5 rounded-xl bg-black text-white text-xs font-semibold text-center hover:bg-zinc-800 transition"
      >
        Open Resource →
      </a>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON CARD (loading state)
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white border border-black/10 rounded-2xl p-5 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-3 bg-zinc-100 rounded-full w-16" />
      <div className="h-3 bg-zinc-100 rounded-full w-12" />
    </div>
    <div className="h-4 bg-zinc-100 rounded-full w-3/4" />
    <div className="h-3 bg-zinc-100 rounded-full w-full" />
    <div className="h-3 bg-zinc-100 rounded-full w-2/3" />
    <div className="h-8 bg-zinc-100 rounded-xl w-full mt-2" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: Resources Page
// ─────────────────────────────────────────────────────────────────────────────
const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  // ── State ─────────────────────────────────────────────────────────────────
  const skillParam = searchParams.get("skill") || "";
  const [searchInput, setSearchInput] = useState(skillParam);
  const [activeSkill, setActiveSkill] = useState(skillParam);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mode, setMode] = useState(skillParam ? "skill" : "idle");
  // mode: "idle" | "skill" | "search"

  // ── Fetch by skill ────────────────────────────────────────────────────────
  const fetchBySkill = useCallback(
    async (skill) => {
      if (!skill) return;
      setLoading(true);
      setError("");
      setTypeFilter("all");
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/resources?skill=${encodeURIComponent(skill)}`
        );
        if (data.success) {
          setResources(data.resources);
          setMode("skill");
        } else {
          setError(data.message || "No resources found.");
          setResources([]);
        }
      } catch {
        setError("Failed to load resources. Please try again.");
        setResources([]);
      } finally {
        setLoading(false);
      }
    },
    [backendUrl]
  );

  // ── Fetch by search query ─────────────────────────────────────────────────
  const fetchSearch = useCallback(
    async (q) => {
      if (!q) return;
      setLoading(true);
      setError("");
      setTypeFilter("all");
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/resources/search?q=${encodeURIComponent(q)}`
        );
        if (data.success) {
          setResources(data.resources);
          setMode("search");
        } else {
          setError(data.message || "No results found.");
          setResources([]);
        }
      } catch {
        setError("Failed to search. Please try again.");
        setResources([]);
      } finally {
        setLoading(false);
      }
    },
    [backendUrl]
  );

  // ── On skill param change (via URL e.g. from RoadmapPage) ─────────────────
  useEffect(() => {
    const skill = searchParams.get("skill") || "";
    if (skill) {
      setActiveSkill(skill);
      setSearchInput(skill);
      fetchBySkill(skill);
    } else {
      setMode("idle");
      setResources([]);
    }
  }, [searchParams, fetchBySkill]);

  // ── Handle search submit ──────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    // If the input matches a well-known skill name exactly, use skill endpoint
    setSearchParams({ skill: q });
    setActiveSkill(q);
  };

  // ── Filter by type ────────────────────────────────────────────────────────
  const filtered =
    typeFilter === "all"
      ? resources
      : resources.filter((r) => r.type === typeFilter);

  // ── Count per type ────────────────────────────────────────────────────────
  const typeCounts = resources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <DashboardNavbar />

      <main className="min-h-screen bg-[#f7f7f7]">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">

          {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">Resources</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Find videos, blogs, docs, practice links, and projects for every skill.
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-xs font-medium text-zinc-400 hover:text-black transition"
            >
              ← Go back
            </button>
          </div>

          {/* ── SEARCH BAR ──────────────────────────────────────────────── */}
          <form onSubmit={handleSearch} className="relative">
            <input
              id="resources-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search a skill or topic… e.g. React, DSA, Node.js"
              className="w-full px-5 py-4 pr-32 rounded-2xl border border-black/10 bg-white text-sm text-black placeholder-zinc-400 outline-none focus:border-black/40 transition shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition"
            >
              Search
            </button>
          </form>

          {/* ── ACTIVE SKILL CHIP ────────────────────────────────────────── */}
          {activeSkill && !loading && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-zinc-500">Showing results for:</span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold">
                {activeSkill}
                <button
                  onClick={() => {
                    setSearchParams({});
                    setActiveSkill("");
                    setSearchInput("");
                    setResources([]);
                    setMode("idle");
                  }}
                  className="text-zinc-400 hover:text-white transition text-base leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              </span>
              {resources.length > 0 && (
                <span className="text-xs text-zinc-400">
                  {resources.length} resource{resources.length !== 1 ? "s" : ""} found
                </span>
              )}
            </div>
          )}

          {/* ── LOADING ──────────────────────────────────────────────────── */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────────── */}
          {!loading && error && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                ⚠️
              </div>
              <p className="text-sm text-zinc-500">{error}</p>
            </div>
          )}

          {/* ── IDLE (no skill selected) ─────────────────────────────────── */}
          {!loading && !error && mode === "idle" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-3xl bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">
                📚
              </div>
              <h2 className="text-xl font-bold text-black mb-2">Find Learning Resources</h2>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Search any skill above, or click "View Resources" on a roadmap node to jump straight here.
              </p>
              {/* Suggested skills */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {["JavaScript", "React", "Node.js", "MongoDB", "DSA", "Git", "CSS"].map(
                  (skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSearchInput(skill);
                        setSearchParams({ skill });
                      }}
                      className="px-4 py-2 rounded-xl border border-black/10 bg-white text-sm font-medium text-black hover:border-black/30 hover:shadow-sm transition"
                    >
                      {skill}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* ── RESULTS ──────────────────────────────────────────────────── */}
          {!loading && !error && resources.length > 0 && (
            <>
              {/* ── Type filter tabs ───────────────────────────────────── */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {TYPE_FILTERS.map(({ key, label }) => {
                  const count = key === "all" ? resources.length : typeCounts[key] || 0;
                  if (key !== "all" && count === 0) return null; // hide empty tabs
                  return (
                    <button
                      key={key}
                      onClick={() => setTypeFilter(key)}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                        typeFilter === key
                          ? "bg-black text-white"
                          : "bg-white border border-black/10 text-zinc-600 hover:border-black/30"
                      }`}
                    >
                      {label}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          typeFilter === key
                            ? "bg-white/20 text-white"
                            : "bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Cards grid ────────────────────────────────────────── */}
              {filtered.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((resource) => (
                    <ResourceCard key={resource._id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-zinc-400">
                    No {typeFilter} resources found for "{activeSkill}".
                  </p>
                  <button
                    onClick={() => setTypeFilter("all")}
                    className="mt-3 text-xs font-medium text-black underline"
                  >
                    Show all types
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── EMPTY (skill searched, nothing returned) ─────────────────── */}
          {!loading && !error && resources.length === 0 && mode !== "idle" && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-white border border-black/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <p className="text-base font-semibold text-black mb-2">No resources found</p>
              <p className="text-sm text-zinc-500">
                We don't have resources for "{activeSkill}" yet.
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Try a related skill or check back later.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Resources;
