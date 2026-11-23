/**
 * weeklySummary.js
 * 
 * Pure data transformer for the Planned vs Actual Progress Chart.
 * Computes weekly planned hours, dynamic actual hours from ProgressLog,
 * and status metrics (evaluated strictly through completed weeks).
 */

import {
  getLocalMidnightInstant,
  formatWallClockDate,
} from "./timezoneUtils.js";

function round1(val) {
  return Math.round((Number(val) || 0) * 10) / 10;
}

/**
 * Normalizes a date to the learner's local midnight instant.
 * Uses clientTzOffsetMinutes (default 0) without relying on host server timezone.
 * @param {Date|string|number} d
 * @param {number} [clientTzOffsetMinutes=0]
 * @returns {Date}
 */
export function normalizeToMidnight(d, clientTzOffsetMinutes = 0) {
  return getLocalMidnightInstant(d, clientTzOffsetMinutes);
}

/**
 * Builds weekly planned vs actual summary rows and metrics.
 * 
 * @param {Object} params
 * @param {Object} params.plan - Roadmap plan object { weeks: [], pastWeeks: [] }
 * @param {Array} params.logs - ProgressLog records
 * @param {Date|string|number} [params.now=Date.now()] - Current time for deterministic testing
 * @param {Date|string|number} params.startDate - Roadmap study start date (anchored)
 * @param {number|null} [params.deadlineWeeks=null] - Target deadline in weeks
 * @param {number} [params.clientTzOffsetMinutes=0] - Learner's browser getTimezoneOffset()
 * @returns {Object} { weeklySummary, totals }
 */
export function buildWeeklySummary({
  plan = {},
  logs = [],
  now = new Date(),
  startDate,
  deadlineWeeks = null,
  clientTzOffsetMinutes = 0,
}) {
  const start = normalizeToMidnight(startDate || now, clientTzOffsetMinutes);
  const startMs = start.getTime();
  const nowMs = new Date(now).getTime();

  // Week number calculation: 7 days = 604,800,000 ms
  const ONE_WEEK_MS = 7 * 86400000;
  const currentWeekNumber = Math.max(1, Math.floor((nowMs - startMs) / ONE_WEEK_MS) + 1);

  // 1. Group valid logs by session date (studiedAt, with fallback to loggedAt)
  const actualHoursByWeek = {};
  const loggedSkillsByWeek = {};

  for (const log of logs) {
    // Key fix: use studiedAt (when the studying occurred) rather than loggedAt (audit timestamp)
    const sessionDate = new Date(log.studiedAt || log.loggedAt || log.createdAt || now);
    const sessionMs = sessionDate.getTime();

    // Drop logs dated before the normalized startDate
    if (sessionMs < startMs) {
      continue;
    }

    const w = Math.floor((sessionMs - startMs) / ONE_WEEK_MS) + 1;
    const hours = (Number(log.minutesSpent) || 0) / 60;
    actualHoursByWeek[w] = (actualHoursByWeek[w] || 0) + hours;

    if (log.skillId) {
      if (!loggedSkillsByWeek[w]) loggedSkillsByWeek[w] = new Set();
      loggedSkillsByWeek[w].add(log.skillId);
    }
  }

  // 2. Index pastWeeks and current/future weeks
  const pastWeeks = plan.pastWeeks || [];
  const currentPlanWeeks = plan.weeks || [];

  const pastWeeksMap = new Map();
  for (const pw of pastWeeks) {
    if (pw && pw.weekNumber) {
      pastWeeksMap.set(pw.weekNumber, pw);
    }
  }

  const planWeeksMap = new Map();
  for (const w of currentPlanWeeks) {
    if (w && w.weekNumber) {
      planWeeksMap.set(w.weekNumber, w);
    }
  }

  // Determine span of weeks to show
  let maxWeek = currentWeekNumber;
  for (const pw of pastWeeks) {
    if (pw.weekNumber > maxWeek) maxWeek = pw.weekNumber;
  }
  for (const w of currentPlanWeeks) {
    if (w.weekNumber > maxWeek) maxWeek = w.weekNumber;
  }
  for (const wStr of Object.keys(actualHoursByWeek)) {
    const wNum = Number(wStr);
    if (wNum > maxWeek) maxWeek = wNum;
  }

  // 3. Construct rows for every week from Week 1 to maxWeek
  const weeklySummary = [];
  let cumulativePlannedCompleted = 0;
  let cumulativeActualCompleted = 0;
  let currentWeekPlanned = 0;
  let currentWeekActual = 0;

  for (let w = 1; w <= maxWeek; w++) {
    const weekStart = new Date(startMs + (w - 1) * ONE_WEEK_MS);
    const weekEnd = new Date(startMs + w * ONE_WEEK_MS - 1000);

    let state = "future";
    if (w < currentWeekNumber) {
      state = "past";
    } else if (w === currentWeekNumber) {
      state = "current";
    }

    // Determine plannedHours for week w
    let plannedHours = 0;
    let scheduledSkills = [];

    if (w < currentWeekNumber) {
      // Past week: read from pastWeeks; if missing, fall back to matching plan.weeks row
      if (pastWeeksMap.has(w)) {
        const pw = pastWeeksMap.get(w);
        plannedHours = Number(pw.plannedHours ?? pw.totalHours) || 0;
      } else if (planWeeksMap.has(w)) {
        const pw = planWeeksMap.get(w);
        plannedHours = Number(pw.plannedHours ?? pw.totalHours) || 0;
        scheduledSkills = (pw.items || []).map((i) => i.label || i.skillId);
      }
    } else {
      // Current or future week: read from current plan.weeks
      if (planWeeksMap.has(w)) {
        const pw = planWeeksMap.get(w);
        plannedHours = Number(pw.plannedHours ?? pw.totalHours) || 0;
        scheduledSkills = (pw.items || []).map((i) => i.label || i.skillId);
      }
    }

    const actualHours = round1(actualHoursByWeek[w] || 0);
    plannedHours = round1(plannedHours);

    // Merge skills (scheduled + logged)
    const allSkillsSet = new Set(scheduledSkills);
    if (loggedSkillsByWeek[w]) {
      for (const s of loggedSkillsByWeek[w]) allSkillsSet.add(s);
    }
    const skills = Array.from(allSkillsSet);

    weeklySummary.push({
      weekNumber: w,
      startDate: formatWallClockDate(weekStart, clientTzOffsetMinutes),
      endDate: formatWallClockDate(weekEnd, clientTzOffsetMinutes),
      plannedHours,
      actualHours,
      state,
      skills,
    });

    // Accumulate for completed-week verdict
    if (w < currentWeekNumber) {
      cumulativePlannedCompleted += plannedHours;
      cumulativeActualCompleted += actualHours;
    } else if (w === currentWeekNumber) {
      currentWeekPlanned = plannedHours;
      currentWeekActual = actualHours;
    }
  }

  // 4. Compute metrics and verdict strictly on completed weeks
  cumulativePlannedCompleted = round1(cumulativePlannedCompleted);
  cumulativeActualCompleted = round1(cumulativeActualCompleted);
  const behindByHours = round1(cumulativePlannedCompleted - cumulativeActualCompleted);

  // Dynamic sensitivity threshold: 15% of weekly capacity with a 0.5h floor
  const hoursPerWeek = plan.planSettings?.hoursPerWeek || 10;
  const threshold = Math.max(0.5, round1(0.15 * hoursPerWeek));

  let status = "on_track";
  const completedWeeksCount = currentWeekNumber - 1;

  if (completedWeeksCount === 0) {
    status = "on_track";
  } else if (behindByHours >= threshold) {
    status = "behind";
  } else if (behindByHours <= -threshold) {
    status = "ahead";
  } else {
    status = "on_track";
  }

  // Projected finish calculation
  let lastPlanWeekNumber = currentWeekNumber;
  if (currentPlanWeeks.length > 0) {
    const lastPlanWeek = currentPlanWeeks[currentPlanWeeks.length - 1];
    lastPlanWeekNumber = Math.max(lastPlanWeekNumber, lastPlanWeek.weekNumber || 1);
  }
  const projectedFinishDate = formatWallClockDate(
    new Date(startMs + lastPlanWeekNumber * ONE_WEEK_MS),
    clientTzOffsetMinutes
  );

  // Deadline calculation
  const deadlineDate = deadlineWeeks
    ? formatWallClockDate(new Date(startMs + deadlineWeeks * ONE_WEEK_MS), clientTzOffsetMinutes)
    : null;
  const isDeadlinePassed = deadlineWeeks ? currentWeekNumber > deadlineWeeks : false;

  const totalPlannedHours = round1(weeklySummary.reduce((sum, row) => sum + row.plannedHours, 0));
  const totalActualHours = round1(weeklySummary.reduce((sum, row) => sum + row.actualHours, 0));

  return {
    weeklySummary,
    totals: {
      currentWeekNumber,
      completedWeeksCount,
      cumulativePlannedCompleted,
      cumulativeActualCompleted,
      behindByHours,
      threshold, // Sensitivity threshold (e.g. 1.5h for 10h/wk)
      status, // "ahead" | "behind" | "on_track"
      currentWeek: {
        plannedHours: round1(currentWeekPlanned),
        actualHours: round1(currentWeekActual),
        remainingHours: round1(Math.max(0, currentWeekPlanned - currentWeekActual)),
      },
      totalPlannedHours,
      totalActualHours,
      hoursPerWeek,
      projectedFinishDate,
      deadlineDate,
      isDeadlinePassed,
    },
  };
}
