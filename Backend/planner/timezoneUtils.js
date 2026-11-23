/**
 * timezoneUtils.js
 * 
 * Host-timezone-independent date and time arithmetic for SkillGraph.
 * Never calls setHours(), getDay(), or getDate() on server ambient local time.
 * Uses clientTzOffsetMinutes (from browser getTimezoneOffset()) to perform
 * all date normalization, week indexing, and floating calendar formatting.
 */

/**
 * Normalizes an instant to the exact UTC instant representing the learner's local midnight.
 * @param {Date|string|number} instant - The timestamp or Date
 * @param {number} [clientTzOffsetMinutes=0] - Learner's browser getTimezoneOffset() (e.g. -330 for IST)
 * @returns {Date} UTC instant corresponding to local midnight
 */
export function getLocalMidnightInstant(instant, clientTzOffsetMinutes = 0) {
  const ms = new Date(instant || Date.now()).getTime();
  const shiftMs = -Number(clientTzOffsetMinutes || 0) * 60000;
  const wallClock = new Date(ms + shiftMs);

  const y = wallClock.getUTCFullYear();
  const m = wallClock.getUTCMonth();
  const d = wallClock.getUTCDate();

  // Create UTC date for midnight of that wall-clock day
  const utcMidnightMs = Date.UTC(y, m, d, 0, 0, 0, 0);

  // Shift back to exact UTC instant
  return new Date(utcMidnightMs - shiftMs);
}

/**
 * Returns wall-clock year, month, date, hours, minutes, and ISO weekday (1=Mon..7=Sun).
 * @param {Date|string|number} instant
 * @param {number} [clientTzOffsetMinutes=0]
 * @returns {{ year: number, month: number, date: number, hours: number, minutes: number, seconds: number, isoDay: number }}
 */
export function getWallClockParts(instant, clientTzOffsetMinutes = 0) {
  const ms = new Date(instant).getTime();
  const shiftMs = -Number(clientTzOffsetMinutes || 0) * 60000;
  const wall = new Date(ms + shiftMs);

  const year = wall.getUTCFullYear();
  const month = wall.getUTCMonth() + 1; // 1-12
  const date = wall.getUTCDate(); // 1-31
  const hours = wall.getUTCHours();
  const minutes = wall.getUTCMinutes();
  const seconds = wall.getUTCSeconds();

  // getUTCDay(): 0 = Sun, 1 = Mon ... 6 = Sat
  const utcDay = wall.getUTCDay();
  const isoDay = utcDay === 0 ? 7 : utcDay; // 1 = Mon ... 7 = Sun

  return { year, month, date, hours, minutes, seconds, isoDay };
}

/**
 * Formats an instant into RFC 5545 floating local date-time: YYYYMMDDTHHMMSS
 * @param {Date|string|number} instant
 * @param {number} [clientTzOffsetMinutes=0]
 * @returns {string} e.g. "20261102T190000"
 */
export function formatFloatingDateTime(instant, clientTzOffsetMinutes = 0) {
  const { year, month, date, hours, minutes, seconds } = getWallClockParts(instant, clientTzOffsetMinutes);
  const pad = (n) => String(n).padStart(2, "0");
  return `${year}${pad(month)}${pad(date)}T${pad(hours)}${pad(minutes)}${pad(seconds)}`;
}

/**
 * Formats an instant into UTC timestamp for DTSTAMP: YYYYMMDDTHHMMSSZ
 * @param {Date|string|number} instant
 * @returns {string} e.g. "20261123T060000Z"
 */
export function formatUtcDateTime(instant) {
  const d = new Date(instant || Date.now());
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/**
 * Formats an instant into ISO date string YYYY-MM-DD in the learner's wall-clock date.
 * @param {Date|string|number} instant
 * @param {number} [clientTzOffsetMinutes=0]
 * @returns {string} e.g. "2026-11-01"
 */
export function formatWallClockDate(instant, clientTzOffsetMinutes = 0) {
  const { year, month, date } = getWallClockParts(instant, clientTzOffsetMinutes);
  const pad = (n) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(date)}`;
}
