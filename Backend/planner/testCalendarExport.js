import assert from "node:assert";
import {
  buildCalendarIcs,
  foldLine,
  escapeIcsText,
  formatFloatingDateTime,
  formatUtcDateTime,
} from "./calendarExport.js";

console.log(">>> Running Unit Tests for calendarExport (with Timezone & Rollover)...");

// ── Test 1: Byte-level folding without splitting UTF-8 ───────────────────────
{
  const textWithBullet = "SkillGraph · Week 3: Python, Machine Learning, Deep Neural Networks & Natural Language Processing";
  const folded = foldLine(textWithBullet);
  const lines = folded.split("\r\n");

  for (const line of lines) {
    const bytes = Buffer.byteLength(line, "utf8");
    assert.ok(bytes <= 75, `Line exceeded 75 bytes: ${bytes} bytes`);
  }
  const reconstructed = lines
    .map((l, idx) => (idx > 0 && l.startsWith(" ") ? l.slice(1) : l))
    .join("");
  assert.strictEqual(reconstructed, textWithBullet, "Reconstructed folded text must match original");
  console.log("  ✓ Test 1 Passed: Byte-level folding preserves UTF-8 characters under 75 octets");
}

// ── Test 2: Character escaping ───────────────────────────────────────────────
{
  const raw = "Special; symbols, with \\ backslash\nand newline";
  const escaped = escapeIcsText(raw);
  assert.strictEqual(
    escaped,
    "Special\\; symbols\\, with \\\\ backslash\\nand newline",
    "Commas, semicolons, backslashes, and newlines must be escaped"
  );
  console.log("  ✓ Test 2 Passed: Text escaping complies with RFC 5545");
}

// ── Test 3: Midnight Rollover Test (22:00 start + 3-hour study block) ───────
{
  const fixedStart = "2026-11-02T00:00:00.000Z"; // Monday Nov 2
  const plan = {
    weeks: [
      {
        weekNumber: 1,
        totalHours: 3, // 1 session of 3 hours
        items: [{ label: "Distributed Systems", hours: 3 }],
      },
    ],
  };

  // Study on Monday at 22:00 for 3 hours -> must end Tuesday at 01:00!
  const ics = buildCalendarIcs({
    plan,
    roadmapId: "rollover-test",
    startDate: fixedStart,
    weekdays: [1], // Monday
    startTime: "22:00",
    now: "2026-11-01T12:00:00.000Z", // Day before
  });

  assert.ok(ics.includes("DTSTART:20261102T220000"), "Must start at 22:00 on Nov 2");
  assert.ok(ics.includes("DTEND:20261103T010000"), "Must end at 01:00 on Nov 3 (next day rollover)");
  console.log("  ✓ Test 3 Passed: Events crossing midnight roll over DTEND to next day correctly");
}

// ── Test 4: Host Timezone Independence (IST learner) ────────────────────────
{
  // Learner in IST (UTC+5:30 -> clientTzOffsetMinutes = -330)
  // Local midnight on Monday 2026-11-02 IST is 2026-11-01 18:30:00 UTC
  const istStartInstant = "2026-11-01T18:30:00.000Z";
  const plan = {
    weeks: [
      {
        weekNumber: 1,
        totalHours: 4,
        items: [{ label: "Go", hours: 4 }],
      },
    ],
  };

  const ics = buildCalendarIcs({
    plan,
    roadmapId: "tz-test",
    startDate: istStartInstant,
    weekdays: [1, 3], // Mon, Wed
    startTime: "19:00",
    now: "2026-11-01T10:00:00.000Z",
    clientTzOffsetMinutes: -330, // IST
  });

  // Monday in IST is 2026-11-02
  assert.ok(ics.includes("DTSTART:20261102T190000"), "Monday session must format as 2026-11-02T190000");
  // Wednesday in IST is 2026-11-04
  assert.ok(ics.includes("DTSTART:20261104T190000"), "Wednesday session must format as 2026-11-04T190000");
  console.log("  ✓ Test 4 Passed: Timezone arithmetic produces exact local dates for IST");
}

console.log("\nALL CALENDAR EXPORT UNIT TESTS PASSED SUCCESSFULLY!\n");
