// ─────────────────────────────────────────────────────────────────────────────
// SkillGraph/utils/graphLayout.js
//
// Converts SkillGraph roadmap nodes + edges into React Flow-compatible data
// with positions computed by the Dagre graph layout algorithm.
//
// Public API:
//   getLayoutedElements(roadmapNodes, roadmapEdges, direction?)
//     → { nodes: ReactFlowNode[], edges: ReactFlowEdge[] }
// ─────────────────────────────────────────────────────────────────────────────

import dagre from "@dagrejs/dagre";

// Default node dimensions (pixels) used by dagre for spacing calculations.
// These should loosely match the rendered SkillNode card size.
const NODE_WIDTH = 220;
const NODE_HEIGHT = 110;

/**
 * getLayoutedElements
 *
 * Runs a top-to-bottom Dagre layout over the roadmap graph and returns
 * React Flow-compatible node and edge arrays.
 *
 * @param {Object[]} roadmapNodes  — nodes from the roadmap API (id, label, status, level, description)
 * @param {Object[]} roadmapEdges  — edges from the roadmap API (from, to, relation)
 * @param {"TB"|"LR"} direction    — layout direction (default: top-to-bottom)
 * @returns {{ nodes: Object[], edges: Object[] }}
 */
export function getLayoutedElements(roadmapNodes, roadmapEdges, direction = "TB") {
    // ── Build a new Dagre graph ──────────────────────────────────────────────
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // rankdir: TB = top-to-bottom (skill prerequisites above their dependents)
    // nodesep / ranksep control spacing between nodes in the same rank and
    // between different ranks respectively.
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 60,   // horizontal gap between sibling nodes
        ranksep: 80,   // vertical gap between levels
        marginx: 30,
        marginy: 30,
    });

    // Register each node with dagre
    for (const node of roadmapNodes) {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }

    // Register prerequisite edges with dagre (we only layout prerequisite relations)
    for (const edge of roadmapEdges) {
        if (edge.relation === "prerequisite") {
            // Dagre edge: from prerequisite → to dependent (parent → child)
            dagreGraph.setEdge(edge.from, edge.to);
        }
    }

    // Run the layout algorithm
    dagre.layout(dagreGraph);

    // ── Transform nodes to React Flow format ─────────────────────────────────
    const layoutedNodes = roadmapNodes.map((node) => {
        const dagreNode = dagreGraph.node(node.id);

        return {
            id: node.id,
            // dagre gives us the center point; React Flow positions from top-left
            position: {
                x: dagreNode.x - NODE_WIDTH / 2,
                y: dagreNode.y - NODE_HEIGHT / 2,
            },
            // Custom node type renders as SkillNode component
            type: "skillNode",
            // All roadmap data is passed through `data` so SkillNode can render it
            data: {
                id: node.id,
                label: node.label,
                status: node.status,      // "completed" | "available" | "locked"
                level: node.level,
                description: node.description,
            },
        };
    });

    // ── Transform edges to React Flow format ─────────────────────────────────
    const layoutedEdges = roadmapEdges
        .filter((edge) => edge.relation === "prerequisite")
        .map((edge, idx) => ({
            id: `edge-${edge.from}-${edge.to}-${idx}`,
            source: edge.from,
            target: edge.to,
            // Edge style varies based on whether the source is completed
            type: "smoothstep",
            animated: false,
            // markerEnd adds the directional arrow
            markerEnd: {
                type: "arrowclosed",
                width: 16,
                height: 16,
                color: "#94a3b8", // slate-400
            },
            style: {
                stroke: "#cbd5e1",   // slate-300
                strokeWidth: 1.5,
            },
        }));

    return { nodes: layoutedNodes, edges: layoutedEdges };
}
