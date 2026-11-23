import assert from "node:assert";
import { replanRoadmap } from "./replanRoadmap.js";

console.log(">>> Running Unit Tests for replanRoadmap...");

const fixedStart = "2026-11-01T00:00:00.000Z";

const baseRoadmap = {
  targetRole: "Frontend Developer",
  planSettings: {
    startDate: new Date(fixedStart),
    hoursPerWeek: 10,
    deadlineWeeks: 8,
    maxParallelSkills: 2,
  },
  speedFactor: 1.0,
  nodes: [
    { id: "html", label: "HTML", remainingHours: 10, status: "available", targetProficiency: 2 },
    { id: "css", label: "CSS", remainingHours: 10, status: "available", targetProficiency: 2 },
    { id: "js", label: "JavaScript", remainingHours: 20, status: "locked", targetProficiency: 2 },
  ],
  edges: [
    { from: "html", to: "js", relation: "prerequisite", minLevel: 1 },
    { from: "css", to: "js", relation: "prerequisite", minLevel: 1 },
  ],
  plan: null,
};

// ── Test 1: Initial plan generation (Week 1) ────────────────────────────────
{
  const rm = JSON.parse(JSON.stringify(baseRoadmap));
  rm.planSettings.startDate = new Date(fixedStart);

  const plan = replanRoadmap(rm, { now: "2026-11-01T10:00:00.000Z" });
  assert.strictEqual(plan.currentWeekNumber, 1);
  assert.strictEqual(plan.pastWeeks.length, 0, "No past weeks yet in Week 1");
  assert.strictEqual(plan.weeks[0].weekNumber, 1, "First week must be week 1");
  const initialWeek1Planned = plan.weeks[0].plannedHours;
  assert.ok(initialWeek1Planned > 0, "Initial planned hours > 0");

  // ── Test 2: Replan twice in the same week preserves plannedHours ──────────
  // Simulate user logging 2 hours mid-week, reducing html remaining hours to 8
  rm.nodes[0].remainingHours = 8;
  const replan2 = replanRoadmap(rm, { now: "2026-11-03T15:00:00.000Z" }); // Day 3 of Week 1

  assert.strictEqual(replan2.currentWeekNumber, 1);
  assert.strictEqual(replan2.pastWeeks.length, 0);
  assert.strictEqual(
    replan2.weeks[0].plannedHours,
    initialWeek1Planned,
    "Replan in same week must preserve initial week 1 planned hours baseline"
  );
  console.log("  ✓ Test 1 & 2 Passed: Initial plan & Replan twice in same week preserves baseline");
}

// ── Test 3: Replan after skipping 3 weeks freezes all 3 past weeks ──────────
{
  const rm = JSON.parse(JSON.stringify(baseRoadmap));
  rm.planSettings.startDate = new Date(fixedStart);

  // Generate initial plan at Week 1
  const initialPlan = replanRoadmap(rm, { now: "2026-11-01T10:00:00.000Z" });
  const w1Hours = initialPlan.weeks[0].plannedHours;
  const w2Hours = initialPlan.weeks[1].plannedHours;
  const w3Hours = initialPlan.weeks[2].plannedHours;

  // Jump to Week 4 (23 days later: Nov 24)
  const jumpDate = new Date(new Date(fixedStart).getTime() + 23 * 86400000);
  const replanWeek4 = replanRoadmap(rm, { now: jumpDate });

  assert.strictEqual(replanWeek4.currentWeekNumber, 4, "Current week should be Week 4");
  assert.strictEqual(replanWeek4.pastWeeks.length, 3, "Weeks 1, 2, and 3 must be frozen");
  assert.strictEqual(replanWeek4.pastWeeks[0].weekNumber, 1);
  assert.strictEqual(replanWeek4.pastWeeks[0].plannedHours, w1Hours);
  assert.strictEqual(replanWeek4.pastWeeks[1].weekNumber, 2);
  assert.strictEqual(replanWeek4.pastWeeks[1].plannedHours, w2Hours);
  assert.strictEqual(replanWeek4.pastWeeks[2].weekNumber, 3);
  assert.strictEqual(replanWeek4.pastWeeks[2].plannedHours, w3Hours);

  assert.strictEqual(replanWeek4.weeks[0].weekNumber, 4, "Remaining plan begins at Week 4");
  console.log("  ✓ Test 3 Passed: Skipping 3 weeks freezes all 3 past weeks with exact hours");
}

// ── Test 4: Replan after deadline passed ─────────────────────────────────────
{
  const rm = JSON.parse(JSON.stringify(baseRoadmap));
  rm.planSettings.startDate = new Date(fixedStart);
  rm.planSettings.deadlineWeeks = 2; // Strict 2-week deadline

  // Jump to Week 4 (deadline 2 weeks has passed!)
  const jumpDate = new Date(new Date(fixedStart).getTime() + 23 * 86400000);
  const plan = replanRoadmap(rm, { now: jumpDate });

  assert.strictEqual(plan.currentWeekNumber, 4);
  assert.strictEqual(plan.deadlinePassed, true, "deadlinePassed must be flagged true");
  assert.ok(plan.weeks.length > 0, "Plan should still generate unconstrained without crashing");
  console.log("  ✓ Test 4 Passed: Deadline passed handled gracefully without crash");
}

console.log("\nALL REPLAN UNIT TESTS PASSED SUCCESSFULLY!\n");
