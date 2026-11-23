// ─────────────────────────────────────────────────────────────────────────────
// planner/trimToDeadline.js
//
// Heuristic deadline trimming when W_min > deadlineWeeks:
//   1. Identify candidate leaf skills in remaining unlearned subgraph (out-degree == 0)
//   2. Filter to non-essential skills (essentiality < 0.95)
//   3. Pick the candidate with the lowest (priority / remainingHours) ROI
//   4. Drop it and repeat until W_min <= deadlineWeeks or no droppables remain
// ─────────────────────────────────────────────────────────────────────────────

import { computeMinimumWeeks } from "./minimumWeeks.js";
import { computeNodeWeight, computeUnlockFactor } from "../Utils/skillAttributes.js";

/**
 * Trims a set of nodes to fit within deadlineWeeks if impossible.
 *
 * @param {Array<Object>} nodes - Incomplete skill nodes
 * @param {Array<Object>} edges - Prerequisite edges
 * @param {string} targetRole - Role name for essentiality lookup
 * @param {number} hoursPerWeek - H
 * @param {number} deadlineWeeks - W
 * @param {number} speedFactor - s
 * @returns {{ activeNodes: Array<Object>, droppedSkills: Array<{ skillId: string, reason: string }>, feasible: boolean, minimumWeeks: number }}
 */
export function trimToDeadline(
  nodes,
  edges,
  targetRole,
  hoursPerWeek = 10,
  deadlineWeeks = 12,
  speedFactor = 1.0
) {
  let activeNodes = [...nodes];
  const droppedSkills = [];

  let check = computeMinimumWeeks(
    activeNodes,
    edges,
    hoursPerWeek,
    speedFactor
  );
  let minimumWeeks = check.minimumWeeks;

  if (minimumWeeks <= deadlineWeeks) {
    return {
      activeNodes,
      droppedSkills: [],
      feasible: true,
      minimumWeeks,
    };
  }

  // Iteratively drop lowest priority-per-hour non-essential leaf skills
  while (minimumWeeks > deadlineWeeks) {
    const activeIds = new Set(activeNodes.map((n) => n.id));
    const activeEdges = edges.filter(
      (e) =>
        e.relation === "prerequisite" &&
        activeIds.has(e.from) &&
        activeIds.has(e.to)
    );

    // Candidates must have out-degree == 0 in remaining prerequisite graph
    const hasDependents = new Set(activeEdges.map((e) => e.from));
    const leafCandidates = activeNodes.filter(
      (n) => !hasDependents.has(n.id) && n.status !== "completed"
    );

    // Filter to non-essential skills (essentiality < 0.9 for this role)
    const droppable = leafCandidates.filter((n) => {
      const essentiality =
        typeof n.essentiality === "object"
          ? n.essentiality?.[targetRole] ?? 0.5
          : n.essentiality ?? 0.5;
      return essentiality < 0.9;
    });

    if (droppable.length === 0) {
      // Cannot trim any further without dropping essential skills or breaking prerequisites
      break;
    }

    // Identify binding constraint: if critical path exceeds deadline, prioritize critical-path leaves
    const isCriticalPathBinding = check.criticalPathWeeks > deadlineWeeks;
    let candidates = droppable;
    if (isCriticalPathBinding && check.criticalPath && check.criticalPath.length > 0) {
      const cpSet = new Set(check.criticalPath);
      const cpCandidates = droppable.filter((n) => cpSet.has(n.id));
      if (cpCandidates.length > 0) {
        candidates = cpCandidates;
      }
    }

    // Sort by lowest efficiency: priority / remainingHours
    candidates.sort((a, b) => {
      const pa =
        computeNodeWeight(a, targetRole) *
        (computeUnlockFactor(a.id, activeEdges) + 1);
      const pb =
        computeNodeWeight(b, targetRole) *
        (computeUnlockFactor(b.id, activeEdges) + 1);

      const roiA = pa / Math.max(a.remainingHours || 1, 0.5);
      const roiB = pb / Math.max(b.remainingHours || 1, 0.5);
      return roiA - roiB; // lowest first
    });

    const victim = candidates[0];
    activeNodes = activeNodes.filter((n) => n.id !== victim.id);
    droppedSkills.push({
      skillId: victim.id,
      label: victim.label || victim.id,
      reason: `Dropped to fit deadline: non-essential leaf skill with lowest ROI (${victim.remainingHours || 0}h).`,
    });

    check = computeMinimumWeeks(activeNodes, edges, hoursPerWeek, speedFactor);
    minimumWeeks = check.minimumWeeks;
  }

  const feasible = minimumWeeks <= deadlineWeeks;

  return {
    activeNodes,
    droppedSkills,
    feasible,
    minimumWeeks,
  };
}
