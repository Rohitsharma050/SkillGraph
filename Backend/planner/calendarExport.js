/**
 * calendarExport.js
 * 
 * Generates RFC 5545 compliant iCalendar (.ics) files for the adaptive study plan.
 * Features:
 * - Option A: Study blocks at chosen times
 * - Byte-level line folding at 75 octets without splitting multi-byte UTF-8 characters
 * - Floating local times (DTSTART / DTEND with no Z or timezone definition)
 * - Required RFC headers: VERSION:2.0, PRODID, CALSCALE:GREGORIAN, and DTSTAMP
 * - Strict weekday mapping inside each 7-day week span using clientTzOffsetMinutes
 * - Past-day filtering in the current week (distributes remaining hours onto remaining days)
 * - Correct date rollover when events cross midnight (e.g. 22:00 start + 3h block -> 01:00 next day)
 */

import {
  getLocalMidnightInstant,
  getWallClockParts,
  formatFloatingDateTime,
  formatUtcDateTime,
} from "./timezoneUtils.js";

export { formatFloatingDateTime, formatUtcDateTime };

/**
 * Escapes special characters for RFC 5545 text values.
 * Commas, semicolons, backslashes and newlines must be escaped.
 */
export function escapeIcsText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\n|\r/g, "\\n");
}

/**
 * Folds lines longer than 75 octets (bytes) using CRLF + space.
 * Crucially, does NOT split multi-byte UTF-8 sequences.
 * 
 * @param {string} line
 * @returns {string}
 */
export function foldLine(line) {
  if (Buffer.byteLength(line, "utf8") <= 75) {
    return line;
  }

  const chars = Array.from(line); // Splits by Unicode code points
  let currentLine = "";
  const foldedLines = [];

  for (const char of chars) {
    const charBytes = Buffer.byteLength(char, "utf8");
    const currentBytes = Buffer.byteLength(currentLine, "utf8");

    if (currentBytes + charBytes > 75) {
      foldedLines.push(currentLine);
      currentLine = " " + char; // RFC 5545 fold continuation with leading space
    } else {
      currentLine += char;
    }
  }

  if (currentLine) {
    foldedLines.push(currentLine);
  }

  return foldedLines.join("\r\n");
}

/**
 * Main generator for the study plan .ics calendar.
 * 
 * @param {Object} params
 * @param {Object} params.plan - Roadmap plan object { weeks: [] }
 * @param {string} params.roadmapId - Roadmap ObjectId
 * @param {string} [params.roleTitle="Career Path"] - Target role
 * @param {Date|string} params.startDate - Anchored start date
 * @param {number[]} params.weekdays - Array of ISO weekdays (1 = Monday, 7 = Sunday)
 * @param {string} params.startTime - Time string "HH:MM" e.g. "19:00"
 * @param {Date|string} [params.now=new Date()] - Current time
 * @param {number} [params.clientTzOffsetMinutes=0] - Learner's browser getTimezoneOffset()
 * @returns {string} Complete .ics file content
 */
export function buildCalendarIcs({
  plan = {},
  roadmapId = "roadmap",
  roleTitle = "Study Plan",
  startDate,
  weekdays = [1, 3, 5],
  startTime = "19:00",
  now = new Date(),
  clientTzOffsetMinutes = 0,
}) {
  const start = getLocalMidnightInstant(startDate || now, clientTzOffsetMinutes);
  const startMs = start.getTime();
  const nowDate = new Date(now);
  const nowMs = nowDate.getTime();

  const ONE_WEEK_MS = 7 * 86400000;
  const currentWeekNumber = Math.max(1, Math.floor((nowMs - startMs) / ONE_WEEK_MS) + 1);

  // Parse start time (hours and minutes)
  const [startH, startM] = (startTime || "19:00").split(":").map(Number);

  // Normalize selected weekdays: unique, sorted 1..7
  const validWeekdays = Array.from(
    new Set((weekdays || []).map(Number).filter((d) => d >= 1 && d <= 7))
  ).sort((a, b) => a - b);

  if (validWeekdays.length === 0) {
    throw new Error("At least one valid weekday (1-7) must be selected.");
  }

  const dtstamp = formatUtcDateTime(nowDate);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SkillGraph//Adaptive Study Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:SkillGraph · ${roleTitle}`,
  ];

  const planWeeksList = plan.weeks || [];

  // Export strictly future weeks (>= currentWeekNumber)
  const activeWeeks = planWeeksList.filter((w) => w && w.weekNumber >= currentWeekNumber);

  for (const week of activeWeeks) {
    const wNum = week.weekNumber;
    const weekStartMs = startMs + (wNum - 1) * ONE_WEEK_MS;

    // Generate specific candidate dates for the chosen weekdays inside this 7-day span
    const candidateDays = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const candidateInstantMs = weekStartMs + dayOffset * 86400000;
      const { year, month, date, isoDay } = getWallClockParts(candidateInstantMs, clientTzOffsetMinutes);

      if (validWeekdays.includes(isoDay)) {
        // Construct session start instant using UTC date arithmetic with clientTzOffsetMinutes
        // wall clock -> UTC instant:
        const sessionStartUtcMs = Date.UTC(year, month - 1, date, startH, startM, 0) + (Number(clientTzOffsetMinutes) * 60000);

        // If this is the current week, skip sessions whose start time has already passed
        if (wNum === currentWeekNumber && sessionStartUtcMs <= nowMs) {
          continue;
        }

        candidateDays.push({
          sessionStartUtcMs,
          isoDay,
        });
      }
    }

    if (candidateDays.length === 0) {
      continue;
    }

    // Distribute totalHours across the remaining candidate days in this week
    const totalWeekHours = week.totalHours || 0;
    const hoursPerDay = totalWeekHours / candidateDays.length;
    const durationMinutes = Math.max(15, Math.round(hoursPerDay * 60));

    // Build event description
    const skillsList = (week.items || []).map((item) => {
      let desc = `${item.label || item.skillId}: ${item.hours}h`;
      if (item.resources && item.resources.length > 0) {
        const resTitles = item.resources.map((r) => `  • ${r.title} (${r.url || ""})`).join("\n");
        desc += `\n${resTitles}`;
      }
      return desc;
    });

    const description = `SkillGraph Study Session\nWeek ${wNum} Focus:\n${skillsList.join("\n\n")}`;
    const skillsSummary = (week.items || []).map((i) => i.label || i.skillId).join(", ");
    const summary = `SkillGraph · Week ${wNum}: ${skillsSummary || roleTitle}`;

    for (let i = 0; i < candidateDays.length; i++) {
      const { sessionStartUtcMs, isoDay } = candidateDays[i];
      const sessionEndUtcMs = sessionStartUtcMs + durationMinutes * 60000;

      const uid = `${roadmapId}-w${wNum}-d${isoDay}@skillgraph`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART:${formatFloatingDateTime(sessionStartUtcMs, clientTzOffsetMinutes)}`);
      lines.push(`DTEND:${formatFloatingDateTime(sessionEndUtcMs, clientTzOffsetMinutes)}`);
      lines.push(`SUMMARY:${escapeIcsText(summary)}`);
      lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
      lines.push("STATUS:CONFIRMED");
      lines.push("TRANSP:OPAQUE");
      lines.push("END:VEVENT");
    }
  }

  lines.push("END:VCALENDAR");

  // Apply RFC 5545 line folding and join with CRLF (\r\n)
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
