/**
 * replanRoadmap.js
 * 
 * Re-runs capacity-constrained scheduling while guaranteeing:
 * 1. Past weeks (<= currentWeekNumber - 1) are permanently frozen into pastWeeks.
 * 2. Current week's plannedHours baseline is preserved across repeated replans.
 * 3. Schedule starts at the current week's start date, and week numbers are offset.
 * 4. Remaining deadline is computed (configuredDeadline - elapsedWeeks); if <= 0,
 *    scheduler runs unconstrained and flags deadlinePassed: true.
 */

import { planWeeks } from "./planWeeks.js";
import { normalizeToMidnight } from "./weeklySummary.js";

const ONE_WEEK_MS = 7 * 86400000;

export function replanRoadmap(roadmap, { now = new Date() } = {}) {
  if (!roadmap) return null;

  // 1. Ensure startDate is normalized to midnight
  const rawStart = roadmap.planSettings?.startDate || roadmap.createdAt || now;
  const startDate = normalizeToMidnight(rawStart);
  if (roadmap.planSettings) {
    roadmap.planSettings.startDate = startDate;
  }

  const startMs = startDate.getTime();
  const nowMs = new Date(now).getTime();

  // 2. Absolute week numbering
  const currentWeekNumber = Math.max(1, Math.floor((nowMs - startMs) / ONE_WEEK_MS) + 1);
  const elapsedWeeks = currentWeekNumber - 1;

  // 3. Freeze past weeks (never overwrite an already frozen week)
  const oldPlan = roadmap.plan || { weeks: [], pastWeeks: [] };
  const existingPast = oldPlan.pastWeeks || [];
  const pastMap = new Map();

  for (const pw of existingPast) {
    if (pw && pw.weekNumber) {
      pastMap.set(pw.weekNumber, pw);
    }
  }

  for (const w of (oldPlan.weeks || [])) {
    if (w && w.weekNumber <= elapsedWeeks && !pastMap.has(w.weekNumber)) {
      pastMap.set(w.weekNumber, {
        weekNumber: w.weekNumber,
        startDate: w.startDate,
        plannedHours: Number(w.plannedHours ?? w.totalHours) || 0,
      });
    }
  }

  const mergedPastWeeks = Array.from(pastMap.values()).sort((a, b) => a.weekNumber - b.weekNumber);

  // 4. Preserve current week's plannedHours baseline
  const existingCurrentWeek = (oldPlan.weeks || []).find((w) => w && w.weekNumber === currentWeekNumber);
  const currentWeekOriginalPlanned = existingCurrentWeek?.plannedHours ?? existingCurrentWeek?.totalHours ?? null;

  // 5. Compute current week's start date & remaining deadline
  const currentWeekStartDate = new Date(startMs + elapsedWeeks * ONE_WEEK_MS);
  const configuredDeadline = roadmap.planSettings?.deadlineWeeks;
  let remainingDeadlineWeeks = null;

  if (configuredDeadline) {
    const rawRemaining = configuredDeadline - elapsedWeeks;
    // If deadline has passed or is 0, do not pass 0/negative to planWeeks (avoid nonsense trimming)
    remainingDeadlineWeeks = rawRemaining > 0 ? rawRemaining : null;
  }

  // 6. Execute deterministic capacity-constrained scheduler for future work
  const newRawPlan = planWeeks({
    nodes: roadmap.nodes,
    edges: roadmap.edges,
    targetRole: roadmap.targetRole,
    hoursPerWeek: roadmap.planSettings?.hoursPerWeek || 10,
    startDate: currentWeekStartDate,
    deadlineWeeks: remainingDeadlineWeeks,
    maxParallelSkills: roadmap.planSettings?.maxParallelSkills || 2,
    speedFactor: roadmap.speedFactor || 1.0,
  });

  // 7. Offset week numbers and assign current week baseline
  const offsetWeeks = (newRawPlan.weeks || []).map((w, idx) => {
    const isCurrentWeek = idx === 0;
    const plannedHours = (isCurrentWeek && currentWeekOriginalPlanned !== null)
      ? currentWeekOriginalPlanned
      : (w.totalHours || 0);

    return {
      ...w,
      weekNumber: currentWeekNumber + idx,
      plannedHours: Math.round(plannedHours * 10) / 10,
    };
  });

  const adaptedPlan = {
    ...newRawPlan,
    weeks: offsetWeeks,
    pastWeeks: mergedPastWeeks,
    currentWeekNumber,
    deadlinePassed: configuredDeadline ? (currentWeekNumber > configuredDeadline) : false,
  };

  roadmap.plan = adaptedPlan;
  return adaptedPlan;
}
