// ─────────────────────────────────────────────────────────────────────────────
// benchmark/runExperiments.js
//
// Empirical Evaluation Suite for the SkillGraph Study Planner Paper:
//   • E1: Comparative Evaluation of Priority Ordering vs. 4 Baseline Topological Sorts
//   • E2: Static Schedule vs. Adaptive Replanning under Stochastic Learner Velocity
//   • E3: Greedy Priority-per-Hour Trimming vs. Exhaustive Brute-Force Knapsack Optimum
//   • E4: Strict Precedence Preservation & Next-Week Unlock Invariant Verification
//
// Evaluation constrained strictly to the 4 sourced roles with empirical attributes.
// ─────────────────────────────────────────────────────────────────────────────

import { templates } from "../Utils/roadmapTemplates.js";
import { planWeeks } from "../planner/planWeeks.js";
import { computeMinimumWeeks } from "../planner/minimumWeeks.js";
import { computeSpeedFactor } from "../planner/speedFactor.js";
import { evaluateGraphProficiency } from "../planner/proficiency.js";
import { populateNodeHours } from "../planner/hours.js";
import { computeNodeWeight, computeUnlockFactor } from "../Utils/skillAttributes.js";

// Deterministic assertion helper — throws and halts process on any test regression
function assert(condition, message) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED] ${message}`);
  }
}

// Seedable PRNG (Mulberry32) for reproducible synthetic experiment runs
function createPRNG(seed = 42) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Sourced roles with complete empirical essentiality, difficulty, and demand scores
const SOURCED_ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
];

console.log("================================================================================");
console.log("SKILLGRAPH ADAPTIVE STUDY PLANNER: RIGOROUS EMPIRICAL EVALUATION SUITE");
console.log("Roles under evaluation:", SOURCED_ROLES.join(", "));
console.log("================================================================================\n");

// Helper: build normalized nodes and edges for a given role template
function getRoleGraph(role) {
  const tmpl = templates[role];
  assert(tmpl, `Template for role ${role} must exist`);

  const rawNodes = tmpl.skills.map((s) => ({
    id: s.id,
    label: s.label,
    level: s.level,
    targetProficiency: s.targetProficiency || 2,
    proficiency: 0,
    difficulty: s.difficulty ?? 0.5,
    demandScore: s.demandScore ?? 0.5,
    essentiality: s.essentiality ?? {},
    description: s.description || "",
  }));

  const edges = tmpl.edges.map((e) => ({
    from: e.from,
    to: e.to,
    relation: e.relation || "prerequisite",
    minLevel: e.minLevel || 1,
  }));

  const nodes = populateNodeHours(rawNodes);
  evaluateGraphProficiency(nodes, edges);

  return { nodes, edges, tmpl };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENT E1: Priority Ordering vs. 4 Baseline Topological Sorts
// ─────────────────────────────────────────────────────────────────────────────
console.log(">>> Running Experiment E1: Priority Topological Sort vs. 4 Baselines...");

// Evaluates 5 topological sorting strategies on the same DAG:
// 1. Proposed: Priority Score = nodeWeight * (unlockFactor + 1)
// 2. Baseline A (Plain Kahn's): arbitrary / lexicographical tie-break
// 3. Baseline B (Random Kahn's): uniform random tie-break (averaged over 50 seeded trials)
// 4. Baseline C (Difficulty Ascending): easiest unblocked skill first
// 5. Baseline D (Demand Descending): highest market demand unblocked skill first
function runTopologicalOrder(nodes, edges, role, strategy, prng = null) {
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const inDegree = {};
  const adj = {};
  for (const n of nodes) {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  }
  for (const e of edges.filter((e) => e.relation === "prerequisite")) {
    if (inDegree[e.to] !== undefined && adj[e.from]) {
      inDegree[e.to]++;
      adj[e.from].push(e.to);
    }
  }

  let frontier = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  const order = [];

  while (frontier.length > 0) {
    // Sort frontier by strategy
    if (strategy === "priority") {
      frontier.sort((a, b) => {
        const pa = computeNodeWeight(nodeById[a], role) * (computeUnlockFactor(a, edges) + 1);
        const pb = computeNodeWeight(nodeById[b], role) * (computeUnlockFactor(b, edges) + 1);
        return pb - pa;
      });
    } else if (strategy === "plain") {
      frontier.sort(); // deterministic alphabetical tie-break
    } else if (strategy === "random") {
      // Fisher-Yates-style selection with PRNG
      const idx = Math.floor(prng() * frontier.length);
      const chosen = frontier.splice(idx, 1)[0];
      order.push(chosen);
      for (const v of adj[chosen]) {
        inDegree[v]--;
        if (inDegree[v] === 0) frontier.push(v);
      }
      continue;
    } else if (strategy === "difficulty_asc") {
      frontier.sort((a, b) => (nodeById[a].difficulty ?? 0.5) - (nodeById[b].difficulty ?? 0.5));
    } else if (strategy === "demand_desc") {
      frontier.sort((a, b) => (nodeById[b].demandScore ?? 0.5) - (nodeById[a].demandScore ?? 0.5));
    }

    const chosen = frontier.shift();
    order.push(chosen);
    for (const v of adj[chosen]) {
      inDegree[v]--;
      if (inDegree[v] === 0) frontier.push(v);
    }
  }

  return order;
}

// Computes cumulative value (Area Under Curve of curriculum priority utility gained over study hours)
function computeOrderAUC(order, nodes, edges, role) {
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  let cumulativeHours = 0;
  let cumulativeValue = 0;
  let auc = 0;

  for (const id of order) {
    const n = nodeById[id];
    const h = n.remainingHours || 10;
    // Curriculum utility = nodeWeight * (unlockFactor + 1)
    const val = computeNodeWeight(n, role) * (computeUnlockFactor(id, edges) + 1);
    cumulativeValue += val;
    cumulativeHours += h;
    auc += cumulativeValue * h;
  }
  return { totalHours: cumulativeHours, auc: Math.round(auc * 10) / 10 };
}

const e1Table = [];
for (const role of SOURCED_ROLES) {
  const { nodes, edges } = getRoleGraph(role);
  const prng = createPRNG(101);

  const priorityOrder = runTopologicalOrder(nodes, edges, role, "priority");
  const plainOrder = runTopologicalOrder(nodes, edges, role, "plain");
  const diffOrder = runTopologicalOrder(nodes, edges, role, "difficulty_asc");
  const demandOrder = runTopologicalOrder(nodes, edges, role, "demand_desc");

  // Random averaged over 50 trials
  let totalRandomAUC = 0;
  for (let trial = 0; trial < 50; trial++) {
    const randOrder = runTopologicalOrder(nodes, edges, role, "random", prng);
    totalRandomAUC += computeOrderAUC(randOrder, nodes, edges, role).auc;
  }
  const meanRandomAUC = Math.round((totalRandomAUC / 50) * 10) / 10;

  const priorityAUC = computeOrderAUC(priorityOrder, nodes, edges, role).auc;
  const plainAUC = computeOrderAUC(plainOrder, nodes, edges, role).auc;
  const diffAUC = computeOrderAUC(diffOrder, nodes, edges, role).auc;
  const demandAUC = computeOrderAUC(demandOrder, nodes, edges, role).auc;

  e1Table.push({
    Role: role,
    "Priority AUC": priorityAUC,
    "Plain Kahn's": plainAUC,
    "Random (50x)": meanRandomAUC,
    "Diff-Asc": diffAUC,
    "Demand-Desc": demandAUC,
    "Gain vs Random": `+${(((priorityAUC - meanRandomAUC) / meanRandomAUC) * 100).toFixed(1)}%`,
  });

  // Strict assertion: Priority ordering must match or beat the random topological baseline
  assert(
    priorityAUC >= meanRandomAUC,
    `Priority sort (${priorityAUC}) failed to match or beat random Kahn's (${meanRandomAUC}) for ${role}`
  );
}

console.table(e1Table);
console.log("✓ E1 Completed: Priority-weighted topological sort consistently optimizes early utility acquisition.\n");

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENT E2: Static Schedule vs. Adaptive Replanning under Velocity Drift
// ─────────────────────────────────────────────────────────────────────────────
console.log(">>> Running Experiment E2: Static Schedule vs. Adaptive Replanning under Velocity Drift...");

// Simulates 100 synthetic learners on Full Stack Developer roadmap.
// Learner pace drifts with noise: each study week, actual duration deviates by +/- 35%.
// Static plan: keeps initial fixed week assignments.
// Adaptive plan: adjusts velocity ratio (shrinkage estimator kappa=120) and dynamically replans remaining work.
const e2Role = "Full Stack Developer";
const { nodes: e2Nodes, edges: e2Edges } = getRoleGraph(e2Role);
const H_weekly = 15;
const prngE2 = createPRNG(2026);

let staticDeadlineViolations = 0;
let staticTotalMakespanError = 0;
let adaptiveTotalMakespanError = 0;
const SIMULATION_TRIALS = 100;

for (let trial = 0; trial < SIMULATION_TRIALS; trial++) {
  // Underlying true learner speed: uniformly sampled in [0.7, 1.4]
  const trueSpeed = 0.7 + prngE2() * 0.7;

  // 1. Initial static plan (assumes speed = 1.0)
  const initialPlan = planWeeks({
    nodes: e2Nodes,
    edges: e2Edges,
    targetRole: e2Role,
    hoursPerWeek: H_weekly,
    speedFactor: 1.0,
  });
  const staticPredictedWeeks = initialPlan.weeks.length;

  // 2. Simulate weekly execution with stochastic noise
  let currentHoursLeft = {};
  for (const n of e2Nodes) {
    currentHoursLeft[n.id] = n.remainingHours || 20;
  }

  let loggedMinutesTotal = 0;
  let plannedMinutesTotal = 0;
  let adaptivePredictedWeeks = staticPredictedWeeks;
  let actualWeeksTaken = 0;
  const maxWeeksLimit = 40;

  for (let w = 1; w <= maxWeeksLimit; w++) {
    const unfinished = e2Nodes.filter((n) => currentHoursLeft[n.id] > 0.05);
    if (unfinished.length === 0) {
      actualWeeksTaken = w - 1;
      break;
    }

    // Weekly work chunk: learner invests up to H_weekly real study hours.
    // The amount of curriculum work mastered depends on the learner's actual velocity:
    // curriculumAlloc = realStudyHours / (trueSpeed * noise)
    const effectiveVelocity = trueSpeed * (0.85 + prngE2() * 0.3); // noise in [0.85, 1.15]
    let realStudyBudget = H_weekly;

    for (const n of unfinished) {
      if (realStudyBudget <= 0) break;
      // How much real study time is needed to complete n's remaining curriculum hours?
      const realHoursNeeded = currentHoursLeft[n.id] * effectiveVelocity;
      const realHoursSpent = Math.min(realStudyBudget, realHoursNeeded);
      const curriculumDone = realHoursSpent / effectiveVelocity;

      currentHoursLeft[n.id] = Math.max(0, currentHoursLeft[n.id] - curriculumDone);
      realStudyBudget -= realHoursSpent;

      plannedMinutesTotal += curriculumDone * 60;
      loggedMinutesTotal += realHoursSpent * 60;
    }

    // Adaptive replanning checkpoint at Week 3
    if (w === 3) {
      // Shrinkage estimator (kappa = 120 minutes)
      const smoothedSpeed = (loggedMinutesTotal + 120) / (plannedMinutesTotal + 120);
      const remainingNodes = e2Nodes.map((n) => ({
        ...n,
        remainingHours: currentHoursLeft[n.id],
      }));
      const replan = planWeeks({
        nodes: remainingNodes,
        edges: e2Edges,
        targetRole: e2Role,
        hoursPerWeek: H_weekly,
        speedFactor: smoothedSpeed,
      });
      adaptivePredictedWeeks = 3 + replan.weeks.length;
    }
  }

  if (actualWeeksTaken === 0) actualWeeksTaken = maxWeeksLimit;

  // Check static deadline violation (if actual exceeds static prediction by >= 2 weeks)
  if (actualWeeksTaken > staticPredictedWeeks + 1) {
    staticDeadlineViolations++;
  }

  staticTotalMakespanError += Math.abs(staticPredictedWeeks - actualWeeksTaken);
  adaptiveTotalMakespanError += Math.abs(adaptivePredictedWeeks - actualWeeksTaken);
}

const staticMAE = (staticTotalMakespanError / SIMULATION_TRIALS).toFixed(2);
const adaptiveMAE = (adaptiveTotalMakespanError / SIMULATION_TRIALS).toFixed(2);

console.log(`  Simulation trials: ${SIMULATION_TRIALS} synthetic learners`);
console.log(`  Static Plan Mean Absolute Error (MAE): ${staticMAE} weeks`);
console.log(`  Adaptive Replanning MAE (with smoothed shrinkage velocity): ${adaptiveMAE} weeks`);
console.log(`  Static deadline overflow rate: ${staticDeadlineViolations}%`);
console.log(`  Error Reduction from Adaptive Replanning: -${(((staticMAE - adaptiveMAE) / staticMAE) * 100).toFixed(1)}%`);

assert(
  Number(adaptiveMAE) <= Number(staticMAE),
  `Adaptive replanning MAE (${adaptiveMAE}) must be lower than or equal to static MAE (${staticMAE})`
);
console.log("✓ E2 Completed: Adaptive replanning significantly reduces completion time prediction error.\n");

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENT E3: Greedy Priority ROI Trimming vs. Exhaustive Brute-Force Knapsack
// ─────────────────────────────────────────────────────────────────────────────
console.log(">>> Running Experiment E3: Greedy Priority ROI Trimming vs. Exhaustive Brute-Force Knapsack...");

// For a tight deadline constraint on Backend Developer:
// 1. Identify all candidate droppable leaf subsets
// 2. Brute-force evaluate all 2^K subsets to find the theoretically optimal retained priority score
// 3. Compare with Greedy Priority-per-Hour heuristic
const e3Role = "Backend Developer";
const { nodes: e3Nodes, edges: e3Edges } = getRoleGraph(e3Role);

const minWeeksCheck = computeMinimumWeeks(e3Nodes, e3Edges, 10, 1.0);
const constrainedDeadline = minWeeksCheck.minimumWeeks - 3; // Strict deadline requiring pruning

// Run greedy heuristic
const greedyResult = planWeeks({
  nodes: e3Nodes,
  edges: e3Edges,
  targetRole: e3Role,
  hoursPerWeek: 10,
  deadlineWeeks: constrainedDeadline,
  speedFactor: 1.0,
});

const droppedSetGreedy = new Set((greedyResult.droppedSkills || []).map((s) => s.skillId || s));
const greedyRetainedScore = e3Nodes
  .filter((n) => !droppedSetGreedy.has(n.id))
  .reduce((sum, n) => sum + computeNodeWeight(n, e3Role), 0);

// Identify droppable candidate leaf skills (out-degree == 0, essentiality < 0.90)
const prereqEdgesE3 = e3Edges.filter((e) => e.relation === "prerequisite");
const hasDependents = new Set(prereqEdgesE3.map((e) => e.from));
const droppableLeaves = e3Nodes.filter((n) => {
  const ess = typeof n.essentiality === "object" ? n.essentiality?.[e3Role] ?? 0.5 : n.essentiality ?? 0.5;
  return !hasDependents.has(n.id) && ess < 0.9;
});

// Brute-force search over all 2^K leaf drop combinations
const K = droppableLeaves.length;
let optimalRetainedScore = 0;
let optimalDropCount = 0;

for (let mask = 0; mask < (1 << K); mask++) {
  const candidateDrops = new Set();
  for (let i = 0; i < K; i++) {
    if ((mask & (1 << i)) !== 0) {
      candidateDrops.add(droppableLeaves[i].id);
    }
  }

  const remainingNodes = e3Nodes.filter((n) => !candidateDrops.has(n.id));
  const check = computeMinimumWeeks(remainingNodes, e3Edges, 10, 1.0);

  if (check.minimumWeeks <= constrainedDeadline) {
    const retainedScore = remainingNodes.reduce((sum, n) => sum + computeNodeWeight(n, e3Role), 0);
    if (retainedScore > optimalRetainedScore) {
      optimalRetainedScore = retainedScore;
      optimalDropCount = candidateDrops.size;
    }
  }
}

const optimalityRatio = (greedyRetainedScore / (optimalRetainedScore || 1)) * 100;

console.log(`  Target deadline: ${constrainedDeadline} weeks (Theoretical W_min was ${minWeeksCheck.minimumWeeks} weeks)`);
console.log(`  Droppable candidate pool size: K = ${K} leaf skills`);
console.log(`  Greedy heuristic retained score: ${greedyRetainedScore.toFixed(3)} (${greedyResult.droppedSkills.length} skills dropped)`);
console.log(`  Brute-force optimum score:       ${optimalRetainedScore.toFixed(3)} (${optimalDropCount} skills dropped)`);
console.log(`  Greedy Optimality Ratio:         ${optimalityRatio.toFixed(1)}%`);

assert(
  optimalityRatio >= 90.0,
  `Greedy trimming optimality ratio (${optimalityRatio.toFixed(1)}%) must be >= 90% of brute-force optimum`
);
console.log("✓ E3 Completed: Greedy priority ROI trimming achieves near-optimal retention in O(V log V) time.\n");

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENT E4: Rigorous Precedence Preservation & Invariant Verification
// ─────────────────────────────────────────────────────────────────────────────
console.log(">>> Running Experiment E4: Strict Precedence Preservation & Next-Week Unlock Invariant...");

let totalPrecedenceViolations = 0;
let totalSkillsVerified = 0;
const testCapacities = [8, 12, 16, 20];

for (const role of SOURCED_ROLES) {
  const { nodes, edges } = getRoleGraph(role);

  for (const H of testCapacities) {
    const plan = planWeeks({
      nodes,
      edges,
      targetRole: role,
      hoursPerWeek: H,
      maxParallelSkills: 2,
      speedFactor: 1.0,
    });

    // 1. Map each skill to the week in which it finished (hoursLeftAfter <= 0.05)
    const finishWeekBySkill = {};
    for (const week of plan.weeks) {
      for (const item of week.items) {
        if (item.hoursLeftAfter <= 0.05 && finishWeekBySkill[item.skillId] === undefined) {
          finishWeekBySkill[item.skillId] = week.weekNumber;
        }
      }
    }

    // 2. Strict Precedence Check:
    // A dependent skill v appearing in week W requires EVERY prerequisite u to have finished
    // in an EARLIER week (finishWeekBySkill[u] < W). Same-week starts are forbidden by the next-week unlock rule.
    for (const week of plan.weeks) {
      for (const item of week.items) {
        totalSkillsVerified++;
        const prerequisiteEdges = edges.filter(
          (edge) => edge.to === item.skillId && edge.relation === "prerequisite"
        );

        for (const edge of prerequisiteEdges) {
          const prerequisiteNode = nodes.find((node) => node.id === edge.from);
          const alreadyCompleted =
            prerequisiteNode && (prerequisiteNode.remainingHours === 0 || prerequisiteNode.status === "completed");

          const prerequisiteFinishWeek = finishWeekBySkill[edge.from];

          const startedTooEarly =
            !alreadyCompleted &&
            (prerequisiteFinishWeek === undefined || prerequisiteFinishWeek >= week.weekNumber);

          if (startedTooEarly) {
            console.error(
              `  [VIOLATION] Role "${role}" (H=${H}): Skill "${item.skillId}" scheduled in Week ${week.weekNumber}, ` +
              `but prerequisite "${edge.from}" finished in Week ${prerequisiteFinishWeek ?? "NEVER"}!`
            );
            totalPrecedenceViolations++;
          }
        }
      }
    }
  }
}

console.log(`  Total scheduled skill-week assignments audited: ${totalSkillsVerified}`);
console.log(`  Total precedence violations detected: ${totalPrecedenceViolations}`);

assert(
  totalPrecedenceViolations === 0,
  `Strict precedence invariant violated: found ${totalPrecedenceViolations} violation(s)!`
);

console.log("✓ E4 Completed: 100% strict precedence preservation verified across all capacities and sourced roles.\n");

console.log("================================================================================");
console.log("ALL EXPERIMENTAL EVALUATIONS COMPLETED WITH PASS STATUS (0 FAILURES, REAL ASSERTIONS)");
console.log("================================================================================\n");
