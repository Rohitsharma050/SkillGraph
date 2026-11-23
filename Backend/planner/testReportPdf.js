import assert from "node:assert";
import { buildReportModel } from "./reportModel.js";
import { renderReportPdf } from "./reportPdf.js";

console.log(">>> Running Unit Tests for PDF Report Generator...");

// ── Test 1: Arithmetic invariants & Privacy ──────────────────────────────────
{
  const mockRoadmap = {
    targetRole: "Full Stack Developer",
    planSettings: { hoursPerWeek: 12, maxParallelSkills: 2 },
    nodes: [
      { id: "html", label: "HTML", proficiency: 2, targetProficiency: 2, remainingHours: 0, status: "completed", hoursSource: "resources" },
      { id: "css", label: "CSS", proficiency: 1, targetProficiency: 2, remainingHours: 4, status: "in_progress", hoursSource: "resources" },
      { id: "js", label: "JavaScript", proficiency: 0, targetProficiency: 2, remainingHours: 12, status: "available", hoursSource: "default" },
    ],
    edges: [],
    plan: {
      weeks: [{ weekNumber: 1, totalHours: 12, items: [{ label: "JavaScript", hours: 12 }] }],
    },
    documentation: {
      content: { summary: "Prerequisites first, building up to full stack mastery." },
    },
  };

  const mockUser = {
    name: "Saurabh",
    email: "secret.saurabh@example.com", // SENSITIVE EMAIL
  };

  const model = buildReportModel({
    roadmap: mockRoadmap,
    user: mockUser,
    resources: [],
    now: "2026-11-23T10:00:00.000Z",
  });

  // Check 1: Model arithmetic
  const { completedCount, inProgressCount, missingCount, totalRequired, totalRemainingHours } = model.summary;
  assert.strictEqual(
    completedCount + inProgressCount + missingCount,
    totalRequired,
    "Completed + In-Progress + Missing must equal totalRequired"
  );
  assert.strictEqual(totalRemainingHours, 16, "0 + 4 + 12 = 16 remaining hours");
  assert.strictEqual(model.summary.curatedSkillsCount, 2, "2 skills from resources");
  assert.strictEqual(model.summary.fallbackSkillsCount, 1, "1 skill from fallback estimate");

  // Check 2: Privacy - email must NOT be in model
  assert.strictEqual(JSON.stringify(model).includes("secret.saurabh@example.com"), false, "Email must be excluded!");
  console.log("  ✓ Test 1 Passed: Arithmetic invariants and privacy (email excluded) verified");

  // Check 3: Render to in-memory Buffer & verify %PDF header
  const pdfBuffer = await renderReportPdf(model);
  assert.ok(Buffer.isBuffer(pdfBuffer), "Output must be a Node Buffer");
  const header = pdfBuffer.subarray(0, 4).toString("utf8");
  assert.strictEqual(header, "%PDF", "PDF must begin with '%PDF'");
  assert.ok(pdfBuffer.length > 1000, "PDF buffer must contain vector page content");
  console.log(`  ✓ Test 2 Passed: In-memory PDF rendered successfully (${pdfBuffer.length} bytes, starts with %PDF)`);
}

// ── Test 3: Pagination with 45 skills (stress test page-wrapping) ─────────────
{
  const manyNodes = [];
  for (let i = 1; i <= 45; i++) {
    manyNodes.push({
      id: `skill_${i}`,
      label: `Enterprise Technical Skill #${i}`,
      proficiency: i % 3,
      targetProficiency: 2,
      remainingHours: (i % 5) * 4,
      status: i % 3 === 2 ? "completed" : i % 3 === 1 ? "in_progress" : "available",
      hoursSource: i % 2 === 0 ? "resources" : "default",
    });
  }

  const largeRoadmap = {
    targetRole: "Solutions Architect",
    nodes: manyNodes,
    edges: [],
    plan: {
      weeks: Array.from({ length: 8 }, (_, idx) => ({
        weekNumber: idx + 1,
        totalHours: 15,
        items: [{ label: `Skill ${idx + 1}`, hours: 15 }],
      })),
    },
    documentation: null,
  };

  const largeModel = buildReportModel({
    roadmap: largeRoadmap,
    user: { name: "Architect Candidate" },
    resources: [],
  });

  const pdfBuffer = await renderReportPdf(largeModel);
  assert.ok(Buffer.isBuffer(pdfBuffer));
  assert.strictEqual(pdfBuffer.subarray(0, 4).toString("utf8"), "%PDF");
  assert.ok(pdfBuffer.length > 4000, "Multi-page PDF must be generated without crashing");
  console.log(`  ✓ Test 3 Passed: 45-skill stress test handled clean multi-page pagination (${pdfBuffer.length} bytes)`);
}

// ── Test 4: Non-Latin / Devanagari character safety ─────────────────────────
{
  const nonLatinRoadmap = {
    targetRole: "Full Stack Engineer (पूर्ण स्टैक)",
    nodes: [
      { id: "s1", label: "डेटा संरचना (Data Structures)", proficiency: 1, targetProficiency: 2, remainingHours: 10, status: "in_progress", hoursSource: "resources" },
      { id: "s2", label: "Системный дизайн (System Design)", proficiency: 0, targetProficiency: 2, remainingHours: 20, status: "available", hoursSource: "default" },
    ],
    edges: [],
    plan: {
      weeks: [{ weekNumber: 1, totalHours: 10, items: [{ label: "Data Structures", hours: 10 }] }],
    },
    documentation: {
      content: { summary: "सीखने का क्रम: बुनियादी अवधारणाएं पहले (Fundamentals first)." },
    },
  };

  const model = buildReportModel({
    roadmap: nonLatinRoadmap,
    user: { name: "सौरभ कुशवाह (Saurabh)" },
  });

  const pdfBuffer = await renderReportPdf(model);
  assert.ok(Buffer.isBuffer(pdfBuffer));
  assert.strictEqual(pdfBuffer.subarray(0, 4).toString("utf8"), "%PDF");
  console.log(`  ✓ Test 4 Passed: Non-Latin characters (Devanagari/Cyrillic) handled safely without PDF crash (${pdfBuffer.length} bytes)`);
}

console.log("\nALL PDF REPORT GENERATION UNIT TESTS PASSED SUCCESSFULLY!\n");
