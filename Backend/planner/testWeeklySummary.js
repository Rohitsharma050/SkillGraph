import assert from "node:assert";
import { buildWeeklySummary, normalizeToMidnight } from "./weeklySummary.js";

console.log(">>> Running Unit Tests for buildWeeklySummary (with Timezone & studiedAt)...");

const fixedStart = "2026-11-01T00:00:00.000Z"; // Week 1: Nov 1 - Nov 7

// ── Test 1: No logs yet ──────────────────────────────────────────────────────
{
  const plan = {
    planSettings: { hoursPerWeek: 10 },
    weeks: [
      { weekNumber: 1, totalHours: 10, items: [{ label: "HTML" }] },
      { weekNumber: 2, totalHours: 10, items: [{ label: "CSS" }] },
      { weekNumber: 3, totalHours: 10, items: [{ label: "JavaScript" }] },
    ],
  };

  const summary = buildWeeklySummary({
    plan,
    logs: [],
    startDate: fixedStart,
    now: "2026-11-02T12:00:00.000Z", // Day 2 of Week 1
  });

  assert.strictEqual(summary.totals.currentWeekNumber, 1, "Should be Week 1");
  assert.strictEqual(summary.totals.completedWeeksCount, 0, "No completed weeks in Week 1");
  assert.strictEqual(summary.totals.status, "on_track", "Week 1 should be on_track with no verdict");
  assert.strictEqual(summary.totals.behindByHours, 0, "behindByHours should be 0");
  assert.strictEqual(summary.weeklySummary.length, 3, "All 3 planned weeks returned");
  console.log("  ✓ Test 1 Passed: No logs yet (on_track, no false behind warning)");
}

// ── Test 2: Fallback to plan.weeks when pastWeeks lacks the week ─────────────
{
  const plan = {
    planSettings: { hoursPerWeek: 10 },
    pastWeeks: [],
    weeks: [
      { weekNumber: 1, totalHours: 12, items: [{ label: "Python" }] },
      { weekNumber: 2, totalHours: 10, items: [{ label: "Django" }] },
      { weekNumber: 3, totalHours: 8, items: [{ label: "PostgreSQL" }] },
    ],
  };

  const nowWeek3 = new Date(new Date(fixedStart).getTime() + 16 * 86400000);

  const logs = [
    { studiedAt: new Date(new Date(fixedStart).getTime() + 2 * 86400000), minutesSpent: 720 }, // 12h in Week 1
    { studiedAt: new Date(new Date(fixedStart).getTime() + 9 * 86400000), minutesSpent: 600 }, // 10h in Week 2
  ];

  const summary = buildWeeklySummary({
    plan,
    logs,
    startDate: fixedStart,
    now: nowWeek3,
  });

  assert.strictEqual(summary.totals.currentWeekNumber, 3);
  assert.strictEqual(summary.totals.completedWeeksCount, 2);
  assert.strictEqual(summary.weeklySummary[0].plannedHours, 12, "Fell back to 12h from plan.weeks");
  assert.strictEqual(summary.weeklySummary[0].actualHours, 12, "Logged 12h in Week 1");
  assert.strictEqual(summary.weeklySummary[1].plannedHours, 10, "Fell back to 10h from plan.weeks");
  assert.strictEqual(summary.weeklySummary[1].actualHours, 10, "Logged 10h in Week 2");
  assert.strictEqual(summary.totals.status, "on_track");
  console.log("  ✓ Test 2 Passed: Fallback to plan.weeks when pastWeeks lacks entry");
}

// ── Test 3: Backfilled study session lands in the week it was studied ────────
{
  const plan = {
    planSettings: { hoursPerWeek: 10 },
    pastWeeks: [{ weekNumber: 1, plannedHours: 10 }],
    weeks: [
      { weekNumber: 2, totalHours: 10, items: [{ label: "Node.js" }] },
    ],
  };

  // Now is Tuesday of Week 2 (9 days after start)
  const tuesdayWeek2 = new Date(new Date(fixedStart).getTime() + 9 * 86400000);

  // The learner studied 10 hours on Saturday of Week 1 (day 6),
  // but only logs it today (Tuesday of Week 2):
  const logs = [
    {
      studiedAt: new Date(new Date(fixedStart).getTime() + 6 * 86400000), // Saturday Week 1
      loggedAt: tuesdayWeek2, // Audit timestamp: Tuesday Week 2
      minutesSpent: 600, // 10 hours
    },
  ];

  const summary = buildWeeklySummary({
    plan,
    logs,
    startDate: fixedStart,
    now: tuesdayWeek2,
  });

  // Verify Week 1 received the 10 hours based on studiedAt, NOT Week 2!
  assert.strictEqual(summary.weeklySummary[0].actualHours, 10, "Week 1 must receive the 10h");
  assert.strictEqual(summary.weeklySummary[1].actualHours, 0, "Week 2 must remain at 0h");
  assert.strictEqual(summary.totals.status, "on_track", "Week 1 is satisfied, learner is on track");
  console.log("  ✓ Test 3 Passed: Backfilled study session lands in the correct week based on studiedAt");
}

// ── Test 4: Dynamic Sensitivity Threshold (15% of H, min 0.5h) ───────────────
{
  const plan = {
    planSettings: { hoursPerWeek: 10 }, // 15% of 10h = 1.5h threshold
    pastWeeks: [{ weekNumber: 1, plannedHours: 10 }],
    weeks: [{ weekNumber: 2, totalHours: 10, items: [{ label: "Docker" }] }],
  };

  const mondayWeek2 = new Date(new Date(fixedStart).getTime() + 8 * 86400000);

  // Case A: 1.0h deficit (under 1.5h threshold) -> on_track
  const logsA = [
    { studiedAt: new Date(new Date(fixedStart).getTime() + 2 * 86400000), minutesSpent: 540 }, // 9h (1h behind)
  ];
  const summaryA = buildWeeklySummary({ plan, logs: logsA, startDate: fixedStart, now: mondayWeek2 });
  assert.strictEqual(summaryA.totals.behindByHours, 1);
  assert.strictEqual(summaryA.totals.threshold, 1.5);
  assert.strictEqual(summaryA.totals.status, "on_track", "1.0h behind < 1.5h threshold -> on_track");

  // Case B: 1.5h deficit (meets 1.5h threshold) -> behind
  const logsB = [
    { studiedAt: new Date(new Date(fixedStart).getTime() + 2 * 86400000), minutesSpent: 510 }, // 8.5h (1.5h behind)
  ];
  const summaryB = buildWeeklySummary({ plan, logs: logsB, startDate: fixedStart, now: mondayWeek2 });
  assert.strictEqual(summaryB.totals.behindByHours, 1.5);
  assert.strictEqual(summaryB.totals.status, "behind", "1.5h behind >= 1.5h threshold -> behind");
  console.log("  ✓ Test 4 Passed: Dynamic sensitivity threshold (15% of H) functions accurately");
}

// ── Test 5: Host Timezone Independence (IST learner on UTC/US host) ──────────
{
  // Learner in IST (UTC+5:30 -> offset = -330)
  // Local midnight IST on 2026-11-01 is 2026-10-31 18:30:00 UTC
  const istStartInstant = "2026-10-31T18:30:00.000Z";

  const plan = {
    planSettings: { hoursPerWeek: 10 },
    weeks: [
      { weekNumber: 1, totalHours: 10, items: [{ label: "React" }] },
      { weekNumber: 2, totalHours: 10, items: [{ label: "Next.js" }] },
    ],
  };

  const summary = buildWeeklySummary({
    plan,
    logs: [],
    startDate: istStartInstant,
    now: "2026-11-01T04:00:00.000Z", // Morning in IST
    clientTzOffsetMinutes: -330, // IST offset
  });

  assert.strictEqual(summary.totals.currentWeekNumber, 1);
  assert.strictEqual(summary.weeklySummary[0].startDate, "2026-11-01", "Week 1 must start on 2026-11-01 in IST local date");
  assert.strictEqual(summary.weeklySummary[0].endDate, "2026-11-07", "Week 1 must end on 2026-11-07 in IST local date");
  console.log("  ✓ Test 5 Passed: Timezone independence verified (dates match learner's local calendar)");
}

console.log("\nALL WEEKLY SUMMARY UNIT TESTS PASSED SUCCESSFULLY!\n");
