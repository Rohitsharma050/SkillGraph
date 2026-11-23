// ─────────────────────────────────────────────────────────────────────────────
// planner/speedFactor.js
//
// Calculates Bayesian smoothed speed factor from completed resources in ProgressLog:
//   s = clamp( (sum(actual) + kappa) / (sum(planned) + kappa), 0.5, 2.0 )
//
// kappa = 120 minutes (Bayesian smoothing prior)
// ─────────────────────────────────────────────────────────────────────────────

const KAPPA = 120; // 2 hours smoothing prior
const MIN_SPEED = 0.5; // twice as fast
const MAX_SPEED = 2.0; // twice as slow

/**
 * Computes smoothed speed factor based on progress events.
 *
 * @param {Array<Object>} logEntries - ProgressLog entries with minutesSpent and resourceId
 * @param {Map<string, Object>|Object} resourceMap - Resource lookup by ID for planned duration
 * @returns {{ speedFactor: number, totalActualMinutes: number, totalPlannedMinutes: number, completedCount: number }}
 */
export function computeSpeedFactor(logEntries = [], resourceMap = {}) {
  const completedLogs = logEntries.filter(
    (entry) => entry.eventType === "resource_completed"
  );

  if (completedLogs.length === 0) {
    return {
      speedFactor: 1.0,
      totalActualMinutes: 0,
      totalPlannedMinutes: 0,
      completedCount: 0,
    };
  }

  let totalActual = 0;
  let totalPlanned = 0;

  for (const log of completedLogs) {
    const actual = log.minutesSpent || 0;
    totalActual += actual;

    let planned = 60;
    if (log.resourceId) {
      const resId = log.resourceId.toString();
      const res =
        resourceMap instanceof Map
          ? resourceMap.get(resId)
          : resourceMap[resId];
      if (res && res.durationMinutes) {
        planned = res.durationMinutes;
      }
    }
    totalPlanned += planned;
  }

  const rawRatio = (totalActual + KAPPA) / (totalPlanned + KAPPA);
  const clamped = Math.min(Math.max(rawRatio, MIN_SPEED), MAX_SPEED);
  const speedFactor = Math.round(clamped * 100) / 100;

  return {
    speedFactor,
    totalActualMinutes: totalActual,
    totalPlannedMinutes: totalPlanned,
    completedCount: completedLogs.length,
  };
}
