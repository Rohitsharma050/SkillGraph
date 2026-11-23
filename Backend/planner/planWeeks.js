// ─────────────────────────────────────────────────────────────────────────────
// planner/planWeeks.js
//
// Capacity-constrained scheduler:
//   Simulates learner weeks one by one under weekly budget H and max parallel skills P.
//   Distributes hours in two passes (fair share among top P, then leftover spend).
//   Unlocks dependents on the NEXT week boundary.
// ─────────────────────────────────────────────────────────────────────────────

import { computeNodeWeight, computeUnlockFactor } from "../Utils/skillAttributes.js";
import { computeMinimumWeeks } from "./minimumWeeks.js";
import { trimToDeadline } from "./trimToDeadline.js";

/**
 * Builds a deterministic week-by-week study plan.
 *
 * @param {Object} params
 * @param {Array<Object>} params.nodes - Roadmap nodes
 * @param {Array<Object>} params.edges - Prerequisite edges
 * @param {string} params.targetRole - Target career role
 * @param {number} params.hoursPerWeek - Weekly study hours (H)
 * @param {Date|string} params.startDate - Schedule start date
 * @param {number} params.deadlineWeeks - Maximum allowed weeks
 * @param {number} params.maxParallelSkills - Max concurrent skills per week (default 2)
 * @param {number} params.speedFactor - Pace multiplier (default 1.0)
 * @param {Map<string, Array<Object>>|Object} params.resourcesBySkill - Curated resources by skill name
 * @returns {Object} Final plan object
 */
export function planWeeks({
  nodes = [],
  edges = [],
  targetRole = "",
  hoursPerWeek = 10,
  startDate = new Date(),
  deadlineWeeks = null,
  maxParallelSkills = 2,
  speedFactor = 1.0,
  resourcesBySkill = {},
}) {
  const H = Math.max(hoursPerWeek, 1);
  const P = Math.max(maxParallelSkills, 1);
  const s = Math.max(speedFactor, 0.1);

  // 1. If an explicit deadline is set, run trimming if necessary
  let activeNodes = [...nodes];
  let droppedSkills = [];
  let minimumWeeks = computeMinimumWeeks(nodes, edges, H, s).minimumWeeks;

  if (deadlineWeeks && deadlineWeeks > 0) {
    const trimResult = trimToDeadline(
      nodes,
      edges,
      targetRole,
      H,
      deadlineWeeks,
      s
    );
    activeNodes = trimResult.activeNodes;
    droppedSkills = trimResult.droppedSkills;
    minimumWeeks = trimResult.minimumWeeks;
  }

  // 2. Initialize simulation state
  const hoursLeft = {};
  const skillById = {};
  const finishedSkills = new Set();

  for (const node of activeNodes) {
    skillById[node.id] = node;
    const remainingH = (node.remainingHours !== undefined ? node.remainingHours : node.totalHours) || 0;
    hoursLeft[node.id] = Math.round(remainingH * s * 10) / 10;

    if (node.status === "completed" || hoursLeft[node.id] <= 0) {
      finishedSkills.add(node.id);
      hoursLeft[node.id] = 0;
    }
  }

  // Pre-calculate resource queues per skill for detailed checklist mapping
  const skillResourcesQueue = {};
  for (const node of activeNodes) {
    const normName = (node.label || node.id || "").toLowerCase().trim();
    const resources =
      resourcesBySkill instanceof Map
        ? resourcesBySkill.get(normName) || []
        : resourcesBySkill[normName] || [];

    skillResourcesQueue[node.id] = [...resources];
  }

  // Prerequisite edge lookup: skillId -> [{ from, minLevel }]
  const prereqMap = {};
  for (const node of activeNodes) {
    prereqMap[node.id] = [];
  }
  for (const edge of edges) {
    if (edge.relation === "prerequisite" && prereqMap[edge.to]) {
      prereqMap[edge.to].push({
        from: edge.from,
        minLevel: edge.minLevel || 1,
      });
    }
  }

  const weeks = [];
  const baseDate = new Date(startDate);
  const simLimit = deadlineWeeks ? deadlineWeeks : Math.max(minimumWeeks * 5, 200);

  // 3. Simulate week by week
  for (let weekNum = 1; weekNum <= simLimit; weekNum++) {
    // Check completion condition
    const allDone = activeNodes.every(
      (n) => finishedSkills.has(n.id) || (hoursLeft[n.id] || 0) <= 0.05
    );
    if (allDone && weekNum > 1) {
      break;
    }

    let budget = H;
    const perSkillCap = Math.round((H / P) * 10) / 10;

    // Determine unlocked skills at START of this week
    const unlocked = activeNodes.filter((node) => {
      if (finishedSkills.has(node.id) || (hoursLeft[node.id] || 0) <= 0.05) {
        return false;
      }
      // If already in_progress, it is always unlocked
      if (node.status === "in_progress") {
        return true;
      }
      // Otherwise all prerequisites must be in finishedSkills
      const prereqs = prereqMap[node.id] || [];
      return prereqs.every((p) => finishedSkills.has(p.from));
    });

    if (unlocked.length === 0) {
      // Deadlock or no more unlocked work available
      break;
    }

    // Sort unlocked skills by priority score (descending)
    // Priority = nodeWeight * (unlockFactor + 1)
    const activeMissingEdges = edges.filter(
      (e) =>
        e.relation === "prerequisite" &&
        !finishedSkills.has(e.from) &&
        !finishedSkills.has(e.to)
    );

    unlocked.sort((a, b) => {
      const pa =
        computeNodeWeight(a, targetRole) *
        (computeUnlockFactor(a.id, activeMissingEdges) + 1);
      const pb =
        computeNodeWeight(b, targetRole) *
        (computeUnlockFactor(b.id, activeMissingEdges) + 1);
      if (Math.abs(pb - pa) > 1e-6) return pb - pa;
      return a.id.localeCompare(b.id);
    });

    const weekItemsMap = {}; // skillId -> allocated hours

    // Discrete hour allocation helper (rounds to 0.1h without floating point drift)
    const allocateHours = (nodeId, desired) => {
      if (budget <= 0.05) return 0;
      const needed = hoursLeft[nodeId] || 0;
      if (needed <= 0.05) return 0;
      let alloc = Math.min(desired, needed, budget);
      alloc = Math.round(alloc * 10) / 10;
      if (alloc <= 0) return 0;
      weekItemsMap[nodeId] = Math.round(((weekItemsMap[nodeId] || 0) + alloc) * 10) / 10;
      hoursLeft[nodeId] = Math.max(0, Math.round((hoursLeft[nodeId] - alloc) * 10) / 10);
      budget = Math.max(0, Math.round((budget - alloc) * 10) / 10);
      return alloc;
    };

    // Pass 1: Share week between top min(P, unlocked.length) skills up to perSkillCap
    const topCandidates = unlocked.slice(0, P);
    for (const node of topCandidates) {
      if (budget <= 0.05) break;
      allocateHours(node.id, perSkillCap);
    }

    // Pass 2: Spend leftover budget across unlocked skills so no study hours are wasted
    if (budget > 0.05) {
      for (const node of unlocked) {
        if (budget <= 0.05) break;
        allocateHours(node.id, budget);
      }
    }

    // Build item records with resource assignment
    const weekItems = [];
    let weekTotalHours = 0;

    for (const [skillId, allocatedHours] of Object.entries(weekItemsMap)) {
      const roundedH = Math.round(allocatedHours * 10) / 10;
      if (roundedH <= 0) continue;
      weekTotalHours = Math.round((weekTotalHours + roundedH) * 10) / 10;
      const node = skillById[skillId];

      // Assign resources from queue up to allocated minutes
      const allocatedMinutes = Math.round(roundedH * 60);
      let minutesCovered = 0;
      const itemResources = [];

      const queue = skillResourcesQueue[skillId] || [];
      while (queue.length > 0 && minutesCovered < allocatedMinutes) {
        const res = queue[0];
        const resMins = res.durationMinutes || 60;
        itemResources.push({
          resourceId: res._id || null,
          title: res.title,
          type: res.type,
          url: res.url,
          minutes: resMins,
        });
        minutesCovered += resMins;
        queue.shift(); // consume resource
      }

      // If hoursLeft reached 0, mark finished for NEXT week
      if (hoursLeft[skillId] <= 0.05) {
        hoursLeft[skillId] = 0;
        finishedSkills.add(skillId);
      }

      weekItems.push({
        skillId,
        label: node.label || skillId,
        hours: roundedH,
        hoursLeftAfter: Math.round(hoursLeft[skillId] * 10) / 10,
        remainingAfter: Math.round(hoursLeft[skillId] * 10) / 10,
        resources: itemResources,
      });
    }

    const weekStartDate = new Date(baseDate);
    weekStartDate.setDate(baseDate.getDate() + (weekNum - 1) * 7);

    weeks.push({
      weekNumber: weekNum,
      startDate: weekStartDate,
      totalHours: Math.round(weekTotalHours * 10) / 10,
      items: weekItems,
    });
  }

  // Determine feasibility from actual simulation results
  const unfinishedSkillIds = activeNodes
    .filter((node) => (hoursLeft[node.id] || 0) > 0.05)
    .map((node) => node.id);
  const finishedWithinDeadline = deadlineWeeks
    ? (unfinishedSkillIds.length === 0 && weeks.length <= deadlineWeeks)
    : (unfinishedSkillIds.length === 0);

  return {
    generatedAt: new Date(),
    feasible: finishedWithinDeadline,
    unfinishedSkillIds,
    totalWeeks: weeks.length,
    minimumWeeks,
    speedFactorUsed: s,
    droppedSkills,
    weeks,
  };
}
