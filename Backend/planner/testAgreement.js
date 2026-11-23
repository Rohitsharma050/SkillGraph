import assert from "node:assert";
import { replanRoadmap } from "./replanRoadmap.js";
import { buildWeeklySummary } from "./weeklySummary.js";
import { buildCalendarIcs } from "./calendarExport.js";
import { buildReportModel } from "./reportModel.js";
import { renderReportPdf } from "./reportPdf.js";

console.log(">>> Running Multi-Component Agreement Test (Chart vs Calendar vs PDF)...");

// Monday Nov 2, 2026 00:00:00 UTC
const mondayWeek1 = "2026-11-02T00:00:00.000Z";
const wednesdayWeek1 = "2026-11-04T12:00:00.000Z"; // Mid-week point (2.5 days in)

const roadmap = {
  _id: "67890abcdef1234567890123",
  targetRole: "Full Stack Developer",
  planSettings: {
    startDate: new Date(mondayWeek1),
    hoursPerWeek: 10,
    deadlineWeeks: 4,
    maxParallelSkills: 1,
  },
  speedFactor: 1.0,
  nodes: [
    {
      id: "js",
      label: "JavaScript",
      proficiency: 0,
      targetProficiency: 2,
      remainingHours: 10,
      status: "available",
      hoursSource: "resources",
    },
    {
      id: "react",
      label: "React",
      proficiency: 0,
      targetProficiency: 2,
      remainingHours: 10,
      status: "locked",
      hoursSource: "resources",
    },
  ],
  edges: [
    { from: "js", to: "react", relation: "prerequisite", minLevel: 1 },
  ],
  plan: null,
};

// ── Step 1: Initial Plan on Monday ───────────────────────────────────────────
const initialPlan = replanRoadmap(roadmap, { now: mondayWeek1 });
assert.strictEqual(initialPlan.weeks[0].weekNumber, 1);
assert.strictEqual(initialPlan.weeks[0].plannedHours, 10, "Initial Week 1 planned hours must be 10h");
assert.strictEqual(initialPlan.weeks[0].totalHours, 10);

// ── Step 2: Mid-Week Progress Logging on Wednesday ───────────────────────────
// User logs 4 hours of JavaScript on Wednesday:
const logs = [
  {
    skillId: "js",
    minutesSpent: 240, // 4 hours
    studiedAt: new Date("2026-11-03T18:00:00.000Z"), // Tuesday evening study
    loggedAt: new Date(wednesdayWeek1),
  },
];

// Update node remaining hours in roadmap: 10h - 4h = 6h remaining
roadmap.nodes[0].remainingHours = 6;
roadmap.nodes[0].status = "in_progress";

// ── Step 3: Replan Mid-Week on Wednesday ────────────────────────────────────
const adaptedPlan = replanRoadmap(roadmap, { now: wednesdayWeek1 });

// Assert baseline preservation on plan object
assert.strictEqual(adaptedPlan.currentWeekNumber, 1);
assert.strictEqual(
  adaptedPlan.weeks[0].plannedHours,
  10,
  "Chart baseline for Week 1 must remain frozen at 10h"
);
assert.strictEqual(
  adaptedPlan.weeks[0].totalHours,
  6,
  "Scheduled remaining study work for Week 1 must be 6h"
);

// ── Step 4: Component Agreement Check ────────────────────────────────────────

// 1. Chart Data (weeklySummary.js):
const summary = buildWeeklySummary({
  plan: adaptedPlan,
  logs,
  startDate: mondayWeek1,
  now: wednesdayWeek1,
});

assert.strictEqual(
  summary.weeklySummary[0].plannedHours,
  10,
  "CHART: Must show original planned baseline of 10h for Week 1"
);
assert.strictEqual(
  summary.weeklySummary[0].actualHours,
  4,
  "CHART: Must show actual logged progress of 4h"
);
assert.strictEqual(
  summary.totals.currentWeek.plannedHours,
  10,
  "CHART: Current week target is 10h"
);
assert.strictEqual(
  summary.totals.currentWeek.remainingHours,
  6,
  "CHART: Current week remaining is 6h"
);
console.log("  ✓ Agreement Check 1 Passed: Chart reflects frozen baseline (10h) and logged progress (4h)");

// 2. Calendar Export (calendarExport.js):
// Learner chooses Friday (Day 5) at 19:00 for the remainder of the week
const ics = buildCalendarIcs({
  plan: adaptedPlan,
  roadmapId: roadmap._id,
  startDate: mondayWeek1,
  weekdays: [5], // Friday
  startTime: "19:00",
  now: wednesdayWeek1,
});

// Since Friday is in the future, it should schedule the REMAINING 6 hours, NOT the 10h baseline:
// DTSTART: 19:00 -> DTEND: 19:00 + 6h = 01:00 next day
assert.ok(ics.includes("DTSTART:20261106T190000"), "Calendar must schedule Friday session");
assert.ok(ics.includes("DTEND:20261107T010000"), "Calendar event duration must be 6 hours (remaining work)");
assert.ok(ics.includes("JavaScript: 6h"), "Calendar description must state 6h remaining");
console.log("  ✓ Agreement Check 2 Passed: Calendar exports remaining 6 hours for upcoming sessions");

// 3. PDF Gap Report (reportModel.js & reportPdf.js):
const reportModel = buildReportModel({
  roadmap,
  user: { name: "Full Stack Student" },
  now: wednesdayWeek1,
});

// Schedule table in PDF must show the remaining work to be done (6h)
assert.strictEqual(
  reportModel.scheduleRows[0].totalHours,
  6,
  "PDF Schedule: Week 1 study work must show 6h remaining"
);
assert.strictEqual(
  reportModel.summary.totalRemainingHours,
  16,
  "PDF Summary: Total remaining hours must be 16h (6h JS + 10h React)"
);

const pdfBuffer = await renderReportPdf(reportModel);
assert.ok(Buffer.isBuffer(pdfBuffer));
assert.strictEqual(pdfBuffer.subarray(0, 4).toString("utf8"), "%PDF");
console.log("  ✓ Agreement Check 3 Passed: PDF report schedule displays remaining 6 hours of work");

console.log("\nALL COMPONENTS (CHART, CALENDAR, PDF) ARE IN 100% PURPOSEFUL AGREEMENT!\n");
