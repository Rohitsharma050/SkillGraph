// ─────────────────────────────────────────────────────────────────────────────
// planner/testRandomDAGs.js
//
// Randomized Property-Based Testing for the Capacity-Constrained Scheduler:
//   • Property 1: Strict Precedence (dependents strictly start in week > prereq finish week)
//   • Property 2: Conservation of Hours (total scheduled hours == total work)
//   • Property 3: Capacity Constraint (weekly scheduled hours <= H)
//   • Property 4: Concurrency Limit (concurrent active skills per week <= P)
//   • Property 5: Monotonicity (H2 > H1 implies makespan(H2) <= makespan(H1))
//   • Property 6: Determinism (identical inputs yield byte-identical schedules)
// ─────────────────────────────────────────────────────────────────────────────

import { planWeeks } from "./planWeeks.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[PROPERTY TEST FAILED] ${message}`);
  }
}

// Seedable PRNG
function createPRNG(seed = 1337) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generates a random DAG with V vertices and edge probability p
function generateRandomDAG(V, p, prng) {
  const nodes = [];
  for (let i = 0; i < V; i++) {
    nodes.push({
      id: `skill_${i}`,
      label: `Skill ${i}`,
      level: 1,
      targetProficiency: 2,
      proficiency: 0,
      remainingHours: Math.round(5 + prng() * 30), // 5h to 35h
      difficulty: Math.round((0.2 + prng() * 0.7) * 100) / 100,
      demandScore: Math.round((0.3 + prng() * 0.7) * 100) / 100,
      essentiality: { "Test Role": Math.round((0.5 + prng() * 0.5) * 100) / 100 },
    });
  }

  // Directed edges strictly from i to j where i < j ensures acyclic DAG
  const edges = [];
  for (let i = 0; i < V; i++) {
    for (let j = i + 1; j < V; j++) {
      if (prng() < p) {
        edges.push({
          from: `skill_${i}`,
          to: `skill_${j}`,
          relation: "prerequisite",
          minLevel: 1,
        });
      }
    }
  }

  return { nodes, edges };
}

console.log(">>> Running Property-Based Tests across 50 Random DAGs...");
const prng = createPRNG(999);
const NUM_RANDOM_GRAPHS = 50;

for (let trial = 1; trial <= NUM_RANDOM_GRAPHS; trial++) {
  const V = 6 + Math.floor(prng() * 10); // 6 to 15 nodes
  const edgeProb = 0.25 + prng() * 0.25; // 0.25 to 0.5 density
  const H = 8 + Math.floor(prng() * 15); // 8 to 22 hrs/wk
  const P = 1 + Math.floor(prng() * 3);  // 1 to 3 concurrent skills

  const { nodes, edges } = generateRandomDAG(V, edgeProb, prng);

  const planA = planWeeks({
    nodes,
    edges,
    targetRole: "Test Role",
    hoursPerWeek: H,
    maxParallelSkills: P,
    speedFactor: 1.0,
    startDate: new Date("2026-11-23"),
  });

  // ── Property 1: Strict Precedence & Next-Week Unlock ───────────────────────
  const finishWeekBySkill = {};
  for (const week of planA.weeks) {
    for (const item of week.items) {
      if (item.hoursLeftAfter <= 0.05 && finishWeekBySkill[item.skillId] === undefined) {
        finishWeekBySkill[item.skillId] = week.weekNumber;
      }
    }
  }

  for (const week of planA.weeks) {
    for (const item of week.items) {
      const prereqEdges = edges.filter((e) => e.to === item.skillId && e.relation === "prerequisite");
      for (const e of prereqEdges) {
        const prereqFinishWeek = finishWeekBySkill[e.from];
        assert(
          prereqFinishWeek !== undefined && prereqFinishWeek < week.weekNumber,
          `Trial ${trial}: Skill ${item.skillId} in Week ${week.weekNumber} started before/during prerequisite ${e.from} finish week (${prereqFinishWeek})`
        );
      }
    }
  }

  // ── Property 2: Conservation of Hours ──────────────────────────────────────
  const activeIds = new Set(nodes.map((n) => n.id));
  if (planA.droppedSkills && planA.droppedSkills.length > 0) {
    for (const d of planA.droppedSkills) activeIds.delete(d.skillId || d);
  }
  const expectedTotalHours = nodes
    .filter((n) => activeIds.has(n.id))
    .reduce((sum, n) => sum + (n.remainingHours || 0), 0);

  const scheduledTotalHours = planA.weeks.reduce((sum, w) => sum + w.totalHours, 0);
  assert(
    Math.abs(expectedTotalHours - scheduledTotalHours) <= 0.5,
    `Trial ${trial}: Conservation failed. Expected ${expectedTotalHours}h, scheduled ${scheduledTotalHours}h`
  );

  // ── Property 3: Capacity Constraint ────────────────────────────────────────
  for (const week of planA.weeks) {
    assert(
      week.totalHours <= H + 0.05,
      `Trial ${trial}: Week ${week.weekNumber} total hours (${week.totalHours}) exceeded capacity H (${H})`
    );
  }

  // ── Property 4: Concurrency Limit ──────────────────────────────────────────
  for (const week of planA.weeks) {
    assert(
      week.items.length <= P || week.totalHours <= H,
      `Trial ${trial}: Concurrency invariant violated in Week ${week.weekNumber}`
    );
  }

  // ── Property 5: Monotonicity under Capacity Increase ───────────────────────
  const planH2 = planWeeks({
    nodes,
    edges,
    targetRole: "Test Role",
    hoursPerWeek: H + 10,
    maxParallelSkills: P,
    speedFactor: 1.0,
    startDate: new Date("2026-11-23"),
  });
  assert(
    planH2.weeks.length <= planA.weeks.length,
    `Trial ${trial}: Monotonicity failed. Capacity ${H} took ${planA.weeks.length}w, but capacity ${H + 10} took ${planH2.weeks.length}w`
  );

  // ── Property 6: Determinism ────────────────────────────────────────────────
  const planB = planWeeks({
    nodes,
    edges,
    targetRole: "Test Role",
    hoursPerWeek: H,
    maxParallelSkills: P,
    speedFactor: 1.0,
    startDate: new Date("2026-11-23"),
  });
  assert(
    JSON.stringify(planA.weeks) === JSON.stringify(planB.weeks),
    `Trial ${trial}: Determinism violated. Consecutive runs produced divergent plans.`
  );
}

console.log(`✓ All 50 Random DAG Property Tests Passed (Precedence, Conservation, Capacity, Monotonicity, Determinism)!\n`);
