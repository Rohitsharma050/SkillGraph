// ─────────────────────────────────────────────────────────────────────────────
// planner/proficiency.js
//
// Pure proficiency calculations and node status determination:
//   • Levels: 0 (None), 1 (Beginner), 2 (Working), 3 (Proficient)
//   • 4-state status: completed, in_progress, available, locked
//   • Remaining hours proportional decay
// ─────────────────────────────────────────────────────────────────────────────

export const PROFICIENCY_LEVELS = {
  0: "None",
  1: "Beginner",
  2: "Working",
  3: "Proficient",
};

/**
 * Computes remaining study hours for a skill node based on its current level
 * and target proficiency.
 *
 * Formula: remainingHours = totalHours * (target - current) / target
 *
 * @param {number} totalHours
 * @param {number} currentProficiency - L(v) in [0, 3]
 * @param {number} targetProficiency - T(v) in [1, 3]
 * @returns {number}
 */
export function computeRemainingHours(totalHours, currentProficiency = 0, targetProficiency = 3) {
  if (!totalHours || totalHours <= 0) return 0;
  if (currentProficiency >= targetProficiency) return 0;
  if (currentProficiency <= 0) return Math.round(totalHours * 10) / 10;

  const fractionRemaining = (targetProficiency - currentProficiency) / targetProficiency;
  return Math.round(totalHours * fractionRemaining * 10) / 10;
}

/**
 * Computes the 4-state status for a node:
 *   - 'completed': L(v) >= T(v)
 *   - 'in_progress': 0 < L(v) < T(v)
 *   - 'available': L(v) == 0 AND for all (u, v) in E, L(u) >= minLevel(u, v)
 *   - 'locked': otherwise
 *
 * @param {Object} params
 * @param {number} params.level - Current learner proficiency L(v)
 * @param {number} params.target - Target proficiency T(v)
 * @param {Array<{ from: string, minLevel: number }>} params.incomingPrereqs - Incoming prerequisites
 * @param {Map<string, number>|Object} params.skillLevelMap - Map of skillId -> current proficiency
 * @returns {'completed'|'in_progress'|'available'|'locked'}
 */
export function computeNodeStatus({ level = 0, target = 3, incomingPrereqs = [], skillLevelMap = {} }) {
  // 1. If reached target level, marked completed
  if (level >= target) {
    return "completed";
  }

  // 2. If already started (level > 0) but not yet target, it is in_progress
  if (level > 0 && level < target) {
    return "in_progress";
  }

  // 3. If level == 0, check if all prerequisite edges satisfy their minimum level
  const allPrereqsSatisfied = incomingPrereqs.every((prereq) => {
    const parentLevel =
      skillLevelMap instanceof Map
        ? skillLevelMap.get(prereq.from) ?? 0
        : skillLevelMap[prereq.from] ?? 0;
    const requiredMin = prereq.minLevel || 1;
    return parentLevel >= requiredMin;
  });

  return allPrereqsSatisfied ? "available" : "locked";
}

/**
 * Evaluates statuses and remaining hours for an entire set of nodes and edges.
 *
 * @param {Array<Object>} nodes - Roadmap nodes
 * @param {Array<Object>} edges - Roadmap edges
 * @param {Map<string, number>|Object} skillLevelMap - Map of skillId -> learner level
 * @returns {Array<Object>} Updated nodes with calculated status and remainingHours
 */
export function evaluateGraphProficiency(nodes, edges = [], skillLevelMap = {}) {
  // If skillLevelMap is empty, build it from the node proficiencies
  const levelLookup = {};
  for (const node of nodes) {
    const p = skillLevelMap instanceof Map
      ? skillLevelMap.get(node.id) ?? node.proficiency ?? 0
      : skillLevelMap[node.id] ?? node.proficiency ?? 0;
    levelLookup[node.id] = p;
  }

  // Build lookup of incoming prerequisites per node: node.id -> [{ from, minLevel }]
  const incomingMap = {};
  for (const node of nodes) {
    incomingMap[node.id] = [];
  }

  for (const edge of edges) {
    if (edge.relation === "prerequisite" && incomingMap[edge.to]) {
      incomingMap[edge.to].push({
        from: edge.from,
        minLevel: edge.minLevel || 1,
      });
    }
  }

  return nodes.map((node) => {
    const currentLevel = levelLookup[node.id] ?? 0;
    const targetLevel = node.targetProficiency || 3;
    const totalHours = node.totalHours || 0;

    const status = computeNodeStatus({
      level: currentLevel,
      target: targetLevel,
      incomingPrereqs: incomingMap[node.id] || [],
      skillLevelMap: levelLookup,
    });

    const remainingHours = computeRemainingHours(totalHours, currentLevel, targetLevel);

    // Mutate in place for Mongoose document array compatibility
    node.proficiency = currentLevel;
    node.targetProficiency = targetLevel;
    node.status = status;
    node.remainingHours = remainingHours;

    return node;
  });
}
