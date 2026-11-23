// ─────────────────────────────────────────────────────────────────────────────
// planner/hours.js
//
// Calculates totalHours and remainingHours for skill nodes:
//   • Sums durationMinutes of required resources with targetProficiency <= targetLevel
//   • Falls back to difficulty-based default if no resources are curated
//   • Calculates proportional remaining hours
// ─────────────────────────────────────────────────────────────────────────────

import { computeRemainingHours } from "./proficiency.js";

const DEFAULT_HOURS_BY_DIFFICULTY = {
  beginner: 15,
  intermediate: 30,
  advanced: 50,
};

/**
 * Returns default hours based on skill difficulty score (0.0 to 1.0) or label.
 *
 * @param {number|string} difficulty
 * @returns {number}
 */
export function getDefaultHours(difficulty = 0.5) {
  if (typeof difficulty === "string") {
    return DEFAULT_HOURS_BY_DIFFICULTY[difficulty.toLowerCase()] || 30;
  }
  if (difficulty <= 0.35) return 15;
  if (difficulty <= 0.7) return 30;
  return 50;
}

/**
 * Aggregates required resource hours for a skill up to the target proficiency.
 *
 * @param {Array<Object>} resources - Resources matching this skill
 * @param {number} targetProficiency - Target level (1 to 3)
 * @param {number|string} fallbackDifficulty - Skill difficulty for fallback
 * @returns {{ totalHours: number, hoursSource: 'resources'|'default', requiredResources: Array<Object> }}
 */
export function computeSkillHours(resources = [], targetProficiency = 3, fallbackDifficulty = 0.5) {
  // Filter resources: required == true AND targetProficiency <= targetLevel
  const requiredResources = (resources || [])
    .filter(
      (r) =>
        (r.required !== false) &&
        (r.targetProficiency || 1) <= targetProficiency
    )
    .sort((a, b) => (a.order || 1) - (b.order || 1));

  if (requiredResources.length > 0) {
    const totalMinutes = requiredResources.reduce(
      (sum, r) => sum + (r.durationMinutes || 60),
      0
    );
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    return {
      totalHours,
      hoursSource: "resources",
      requiredResources,
    };
  }

  // Fallback to default
  const defaultHours = getDefaultHours(fallbackDifficulty);
  return {
    totalHours: defaultHours,
    hoursSource: "default",
    requiredResources: [],
  };
}

/**
 * Populates totalHours, remainingHours, and hoursSource for an array of roadmap nodes.
 *
 * @param {Array<Object>} nodes - Roadmap nodes
 * @param {Map<string, Array<Object>>|Object} resourcesBySkill - Map of skillName (norm) -> resources
 * @returns {Array<Object>}
 */
export function populateNodeHours(nodes, resourcesBySkill = {}) {
  return nodes.map((node) => {
    const normName = (node.label || node.id || "").toLowerCase().trim();
    const resources =
      resourcesBySkill instanceof Map
        ? resourcesBySkill.get(normName) || []
        : resourcesBySkill[normName] || [];

    const targetProficiency = node.targetProficiency || 3;
    const currentProficiency = node.proficiency || 0;

    const { totalHours, hoursSource } = computeSkillHours(
      resources,
      targetProficiency,
      node.difficulty || 0.5
    );

    const remainingHours = computeRemainingHours(
      totalHours,
      currentProficiency,
      targetProficiency
    );

    return {
      ...node,
      totalHours,
      remainingHours,
      hoursSource,
    };
  });
}
