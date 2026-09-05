// ─────────────────────────────────────────────────────────────────────────────
// SkillGraph/components/GraphRoadmap.jsx
//
// Interactive DAG visualization of a skill roadmap using React Flow + Dagre.
//
// Props:
//   roadmapNodes   {Object[]}  — nodes from the roadmap API
//   roadmapEdges   {Object[]}  — edges from the roadmap API
//   onMarkComplete {function}  — (nodeId) => void  — forwarded from RoadmapPage
//   marking        {string|null} — nodeId currently being saved
//   backendUrl     {string}    — API base URL (from AppContext)
//   token          {string}    — auth JWT (from AppContext)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
} from "reactflow";

// IMPORTANT: import React Flow's base CSS — required for edges, handles, and controls to render
import "reactflow/dist/style.css";

import { getLayoutedElements } from "../utils/graphLayout.js";
import SkillNode from "./SkillNode.jsx";
import ResourceModal from "./ResourceModal.jsx";

// Register our custom node type once (outside component to avoid re-creation on re-render)
const nodeTypes = { skillNode: SkillNode };

// ── Status → minimap node colour ─────────────────────────────────────────────
const minimapNodeColor = (node) => {
    switch (node.data?.status) {
        case "completed": return "#10b981"; // emerald-500
        case "available": return "#6366f1"; // indigo-500
        case "locked":    return "#d1d5db"; // gray-300
        default:          return "#94a3b8";
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GraphRoadmap
// ─────────────────────────────────────────────────────────────────────────────
const GraphRoadmap = ({
    roadmapNodes,
    roadmapEdges,
    onMarkComplete,
    marking,
    backendUrl,
    token,
}) => {
    // ── Resource modal state ──────────────────────────────────────────────────
    const [selectedSkill, setSelectedSkill] = useState(null);

    // ── Build layouted React Flow node/edge arrays ────────────────────────────
    // Memoized so dagre only re-runs when roadmap data actually changes.
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        if (!roadmapNodes?.length) return { nodes: [], edges: [] };
        return getLayoutedElements(roadmapNodes, roadmapEdges || []);
    }, [roadmapNodes, roadmapEdges]);

    // React Flow state management
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Inject callbacks + marking state into each node's data payload.
    // This needs to happen any time marking changes (e.g. mid-save) so the
    // SkillNode button can show "Saving…" without a full re-layout.
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    onMarkComplete,
                    onViewResources: setSelectedSkill,
                    marking,
                },
            }))
        );
    }, [marking, onMarkComplete, setNodes]);

    // Re-layout when roadmap data changes (e.g. after mark-complete or regen)
    useEffect(() => {
        if (!roadmapNodes?.length) return;
        const { nodes: ln, edges: le } = getLayoutedElements(roadmapNodes, roadmapEdges || []);

        // Re-inject callbacks into freshly laid-out nodes
        const withCallbacks = ln.map((node) => ({
            ...node,
            data: {
                ...node.data,
                onMarkComplete,
                onViewResources: setSelectedSkill,
                marking,
            },
        }));

        setNodes(withCallbacks);
        setEdges(le);
    }, [roadmapNodes, roadmapEdges]); // intentionally exclude callbacks (handled by the other effect)

    // ── Prevent React Flow from adding new edges via drag ────────────────────
    const onConnect = useCallback(() => {}, []);

    return (
        <div className="relative" style={{ height: "620px" }}>
            {/* ── React Flow Canvas ─────────────────────────────────────── */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.25, maxZoom: 1.2 }}
                minZoom={0.2}
                maxZoom={2}
                attributionPosition="bottom-left"
                proOptions={{ hideAttribution: true }}
                className="rounded-xl overflow-hidden"
                style={{ background: "#f8fafc" }} // slate-50
            >
                {/* ── Background pattern ────────────────────────────────── */}
                <Background
                    variant="dots"
                    gap={18}
                    size={1.2}
                    color="#cbd5e1" // slate-300
                />

                {/* ── Zoom / fit controls (bottom-left) ─────────────────── */}
                <Controls
                    style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                />

                {/* ── Mini-map (bottom-right) ───────────────────────────── */}
                <MiniMap
                    nodeColor={minimapNodeColor}
                    nodeStrokeWidth={0}
                    style={{
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                    }}
                    maskColor="rgba(100,116,139,0.08)"
                />
            </ReactFlow>

            {/* ── Legend overlay ────────────────────────────────────────── */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5
                bg-white/90 backdrop-blur-sm border border-zinc-200 rounded-xl px-3 py-2.5 shadow-sm">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Legend</p>
                {[
                    { color: "bg-emerald-500", label: "Completed" },
                    { color: "bg-indigo-500",  label: "Available" },
                    { color: "bg-zinc-300",    label: "Locked" },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                        <span className="text-[10px] text-zinc-600 font-medium">{label}</span>
                    </div>
                ))}
            </div>

            {/* ── Hover tip overlay ────────────────────────────────────── */}
            <div className="absolute bottom-14 left-3 z-10
                bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-xl px-3 py-2 shadow-sm">
                <p className="text-[9px] text-zinc-400">
                    💡 Hover a node to see resources
                </p>
            </div>

            {/* ── Resource Modal ───────────────────────────────────────── */}
            <ResourceModal
                skillName={selectedSkill}
                onClose={() => setSelectedSkill(null)}
                backendUrl={backendUrl}
                token={token}
            />
        </div>
    );
};

export default GraphRoadmap;
