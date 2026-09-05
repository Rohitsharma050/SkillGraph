// ─────────────────────────────────────────────────────────────────────────────
// SkillGraph/components/ResourceModal.jsx
//
// Modal dialog that fetches and displays learning resources for a skill.
//
// Props:
//   skillName  {string}   — skill to fetch resources for (null/empty hides modal)
//   onClose    {function} — callback to close the modal
//   backendUrl {string}   — base URL of the API (from AppContext)
//   token      {string}   — auth JWT (from AppContext)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// ── Resource type metadata ────────────────────────────────────────────────────
const TYPE_META = {
    video:         { label: "Video",         color: "bg-red-100 text-red-700",       icon: "🎬" },
    blog:          { label: "Blog",           color: "bg-amber-100 text-amber-700",   icon: "✍️" },
    documentation: { label: "Docs",           color: "bg-blue-100 text-blue-700",     icon: "📖" },
    practice:      { label: "Practice",       color: "bg-purple-100 text-purple-700", icon: "🏋️" },
    course:        { label: "Course",         color: "bg-indigo-100 text-indigo-700", icon: "🎓" },
    project:       { label: "Project",        color: "bg-green-100 text-green-700",   icon: "🛠️" },
};

const DIFFICULTY_COLOR = {
    beginner:     "bg-emerald-100 text-emerald-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced:     "bg-red-100 text-red-700",
};

// ── Resource card ─────────────────────────────────────────────────────────────
const ResourceCard = ({ resource }) => {
    const typeMeta = TYPE_META[resource.type] || { label: resource.type, color: "bg-zinc-100 text-zinc-700", icon: "📌" };
    const diffColor = DIFFICULTY_COLOR[resource.difficulty] || "bg-zinc-100 text-zinc-600";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="group flex flex-col gap-2 p-4 rounded-xl border border-zinc-100
                bg-white hover:border-zinc-300 hover:shadow-sm transition-all duration-200"
        >
            {/* Type + Difficulty badges */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeMeta.color}`}>
                    {typeMeta.icon} {typeMeta.label}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffColor}`}>
                    {resource.difficulty}
                </span>
                {resource.isFree === false && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        Paid
                    </span>
                )}
            </div>

            {/* Title */}
            <p className="font-semibold text-sm text-zinc-900 leading-snug group-hover:text-indigo-600 transition-colors">
                {resource.title}
            </p>

            {/* Description */}
            {resource.description && (
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    {resource.description}
                </p>
            )}

            {/* Tags */}
            {resource.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {resource.tags.map((tag) => (
                        <span
                            key={tag}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Link */}
            <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600
                    hover:text-indigo-800 transition mt-1"
            >
                Open Resource →
            </a>
        </motion.div>
    );
};

// ── Main modal ────────────────────────────────────────────────────────────────
const ResourceModal = ({ skillName, onClose, backendUrl, token }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch resources whenever skillName changes
    useEffect(() => {
        if (!skillName) return;

        const fetchResources = async () => {
            setLoading(true);
            setError("");
            setResources([]);

            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const { data } = await axios.get(
                    `${backendUrl}/api/resources?skill=${encodeURIComponent(skillName)}`,
                    { headers }
                );
                if (data.success) {
                    setResources(data.resources || []);
                } else {
                    setError("Could not load resources.");
                }
            } catch {
                setError("Failed to fetch resources. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [skillName, backendUrl, token]);

    const isOpen = Boolean(skillName);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ─────────────────────────────────────────── */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* ── Modal panel ──────────────────────────────────────── */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 flex items-center justify-center z-50 px-4 py-8 pointer-events-none"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="pointer-events-auto w-full max-w-lg max-h-[80vh] flex flex-col
                                bg-[#fafafa] rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-zinc-100 shrink-0">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">
                                        Learning Resources
                                    </p>
                                    <h2 className="text-lg font-bold text-zinc-900">
                                        {skillName}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="shrink-0 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200
                                        flex items-center justify-center text-zinc-500 hover:text-zinc-900
                                        transition text-sm font-bold mt-0.5"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                                {/* Loading */}
                                {loading && (
                                    <div className="flex flex-col items-center gap-3 py-12">
                                        <div className="w-8 h-8 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-xs text-zinc-400">Finding resources…</p>
                                    </div>
                                )}

                                {/* Error */}
                                {!loading && error && (
                                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                                        <span className="text-3xl">⚠️</span>
                                        <p className="text-sm text-zinc-500">{error}</p>
                                    </div>
                                )}

                                {/* Empty state */}
                                {!loading && !error && resources.length === 0 && (
                                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-2xl">
                                            📭
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-zinc-700 mb-1">
                                                No resources yet
                                            </p>
                                            <p className="text-xs text-zinc-400 max-w-xs">
                                                No curated resources found for <strong>{skillName}</strong>.
                                                Check back later or explore the Resources page.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Resource cards */}
                                {!loading && !error && resources.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-zinc-400 font-medium">
                                            {resources.length} resource{resources.length !== 1 ? "s" : ""} found
                                        </p>
                                        {resources.map((r) => (
                                            <ResourceCard key={r._id} resource={r} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-zinc-100 shrink-0 flex justify-between items-center">
                                <p className="text-[10px] text-zinc-400">
                                    Curated by SkillGraph
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold
                                        hover:bg-zinc-700 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ResourceModal;
