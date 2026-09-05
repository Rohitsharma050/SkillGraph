// ─────────────────────────────────────────────────────────────────────────────
// SkillGraph/components/SkillNode.jsx
//
// Custom React Flow node component for a single roadmap skill.
//
// Receives `data` from the React Flow node object:
//   data.id           — skill ID
//   data.label        — skill display name
//   data.status       — "completed" | "available" | "locked"
//   data.level        — numeric level
//   data.description  — short description
//   data.onMarkComplete(nodeId) — callback to mark the node done
//   data.marking      — nodeId currently being saved (shows spinner)
//   data.onViewResources(skillLabel) — callback opens the resource modal
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { motion, AnimatePresence } from "framer-motion";

// ── Status theme tokens ───────────────────────────────────────────────────────
const STATUS_THEME = {
    completed: {
        card: "bg-emerald-50 border-emerald-300 shadow-emerald-100",
        badge: "bg-emerald-500 text-white",
        dot: "bg-emerald-500",
        label: "Completed",
        icon: "✓",
        handleColor: "#10b981",
    },
    available: {
        card: "bg-white border-indigo-300 shadow-indigo-100 hover:border-indigo-500",
        badge: "bg-indigo-600 text-white",
        dot: "bg-indigo-500",
        label: "Available",
        icon: "▶",
        handleColor: "#6366f1",
    },
    locked: {
        card: "bg-zinc-50 border-zinc-200 opacity-70",
        badge: "bg-zinc-200 text-zinc-500",
        dot: "bg-zinc-300",
        label: "Locked",
        icon: "🔒",
        handleColor: "#94a3b8",
    },
};

const SkillNode = ({ data }) => {
    const [hovered, setHovered] = useState(false);

    const theme = STATUS_THEME[data.status] || STATUS_THEME.available;
    const isMarkable = data.status === "available";
    const isLocked = data.status === "locked";
    const isCompleted = data.status === "completed";

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ width: 220 }}
            className={`relative rounded-2xl border-2 shadow-md transition-all duration-200 select-none
                ${theme.card}`}
        >
            {/* Top handle — receives edges from prerequisites */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: theme.handleColor,
                    width: 10,
                    height: 10,
                    border: "2px solid white",
                }}
            />

            {/* ── Card body ──────────────────────────────────────────────── */}
            <div className="p-3 pb-2">
                {/* Header row */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className={`shrink-0 w-2 h-2 rounded-full mt-0.5 ${theme.dot}`} />
                        <span className="font-semibold text-xs text-zinc-900 leading-snug truncate">
                            {data.label}
                        </span>
                    </div>
                    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${theme.badge}`}>
                        {theme.label}
                    </span>
                </div>

                {/* Description */}
                {data.description && (
                    <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2 pl-3.5 mb-2">
                        {data.description}
                    </p>
                )}

                {/* Footer row */}
                <div className="pl-3.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] text-zinc-400 font-medium bg-zinc-100 px-1.5 py-0.5 rounded-full">
                        Lvl {data.level}
                    </span>

                    {/* Mark Complete button */}
                    {isMarkable && data.onMarkComplete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onMarkComplete(data.id);
                            }}
                            disabled={data.marking === data.id}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white
                                hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {data.marking === data.id ? "Saving…" : "✓ Mark Done"}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Hover: View Resources floating button ─────────────────── */}
            <AnimatePresence>
                {hovered && !isLocked && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.92 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute -bottom-9 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onViewResources && data.onViewResources(data.label);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                bg-zinc-900 text-white text-[10px] font-semibold shadow-lg
                                hover:bg-zinc-700 transition border border-white/10"
                        >
                            📚 View Resources
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completed check overlay */}
            {isCompleted && (
                <span className="absolute top-2 right-2 text-emerald-500 text-sm font-bold">✓</span>
            )}

            {/* Bottom handle — emits edges to dependent skills */}
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: theme.handleColor,
                    width: 10,
                    height: 10,
                    border: "2px solid white",
                }}
            />
        </div>
    );
};

export default SkillNode;
