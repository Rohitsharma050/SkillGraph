import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";

export default function WeeklyProgressChart({
  weeklySummary = [],
  totals = {},
  loading = false,
}) {
  const [hoveredWeek, setHoveredWeek] = useState(null);

  if (loading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-zinc-200 rounded-md mb-2" />
        <div className="h-4 w-72 bg-zinc-100 rounded-md mb-6" />
        <div className="h-56 w-full bg-zinc-50 rounded-2xl" />
      </div>
    );
  }

  if (!weeklySummary || weeklySummary.length === 0) {
    return null;
  }

  const {
    currentWeekNumber = 1,
    completedWeeksCount = 0,
    behindByHours = 0,
    status = "on_track",
    currentWeek = { plannedHours: 0, actualHours: 0, remainingHours: 0 },
    hoursPerWeek = 10,
    projectedFinishDate,
    deadlineDate,
    isDeadlinePassed = false,
  } = totals;

  // Calculate chart max height scale
  const maxBarValue = Math.max(
    ...weeklySummary.map((w) => Math.max(w.plannedHours || 0, w.actualHours || 0)),
    12
  );

  const currentWeekProgressPercent =
    currentWeek.plannedHours > 0
      ? Math.min(100, Math.round((currentWeek.actualHours / currentWeek.plannedHours) * 100))
      : 0;

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* ── Header & Status Verdict ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-zinc-900">
                  Planned vs. Actual Study Pace
                </h3>

                {/* Status chip judged strictly on completed weeks */}
                {status === "behind" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Behind by {behindByHours}h
                  </span>
                )}
                {status === "ahead" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Ahead by {Math.abs(behindByHours)}h
                  </span>
                )}
                {status === "on_track" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                    On Track
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {completedWeeksCount === 0
                  ? "Currently in Week 1 · Verdict begins after first completed week"
                  : `Verdict evaluated through Week ${completedWeeksCount} (completed weeks)`}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-zinc-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-zinc-300" />
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-600" />
            <span>Actual (Logged)</span>
          </div>
        </div>
      </div>

      {/* ── Deadline Passed Notice (when applicable) ───────────────────── */}
      {isDeadlinePassed && deadlineDate && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-950">
              Target Deadline ({deadlineDate}) Has Passed
            </p>
            <p className="text-amber-800 leading-relaxed">
              Your study schedule has adapted to finish all remaining skills comfortably at{" "}
              <strong>{hoursPerWeek} hrs/week</strong> without cutting essential skills, with a realistic completion date of{" "}
              <strong>{projectedFinishDate || "N/A"}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── Current Week Progress Banner ────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-700">
          <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            <strong className="font-semibold text-zinc-900">
              Week {currentWeekNumber} so far:
            </strong>{" "}
            {currentWeek.actualHours}h of {currentWeek.plannedHours}h completed
            {currentWeek.remainingHours > 0
              ? ` (${currentWeek.remainingHours}h remaining)`
              : " (weekly target reached! 🎉)"}
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full sm:w-48 flex items-center gap-2">
          <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${currentWeekProgressPercent}%` }}
            />
          </div>
          <span className="font-semibold text-zinc-700 w-8 text-right">
            {currentWeekProgressPercent}%
          </span>
        </div>
      </div>

      {/* ── Grouped Bar Chart ───────────────────────────────────────────── */}
      <div className="relative pt-6 pb-2">
        <div className="h-56 flex items-end gap-2 md:gap-4 px-2 overflow-x-auto pb-4">
          {weeklySummary.map((week) => {
            const isCurrent = week.weekNumber === currentWeekNumber;
            const isPast = week.state === "past";
            const isFuture = week.state === "future";

            const plannedHeight = Math.max(
              4,
              Math.round((week.plannedHours / maxBarValue) * 180)
            );
            const actualHeight = Math.max(
              week.actualHours > 0 ? 4 : 0,
              Math.round((week.actualHours / maxBarValue) * 180)
            );

            return (
              <div
                key={week.weekNumber}
                className="flex-1 min-w-[50px] max-w-[80px] flex flex-col items-center relative group"
                onMouseEnter={() => setHoveredWeek(week)}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                {/* Current week highlight badge */}
                {isCurrent && (
                  <span className="absolute -top-6 text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                    Now
                  </span>
                )}

                {/* Bars Container */}
                <div
                  className={`w-full flex items-end justify-center gap-1 h-48 px-1 rounded-xl transition ${
                    isCurrent
                      ? "bg-indigo-50/50 border border-dashed border-indigo-200"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  {/* Planned Bar */}
                  <div
                    style={{ height: `${plannedHeight}px` }}
                    className={`w-1/2 rounded-t transition-all ${
                      isFuture
                        ? "bg-zinc-200 border-t-2 border-zinc-300"
                        : "bg-zinc-300 group-hover:bg-zinc-400"
                    }`}
                    title={`Planned: ${week.plannedHours}h`}
                  />

                  {/* Actual Bar */}
                  {isFuture ? (
                    <div
                      className="w-1/2 h-0 opacity-0"
                      title="Future week - no logs yet"
                    />
                  ) : (
                    <div
                      style={{ height: `${actualHeight}px` }}
                      className={`w-1/2 rounded-t transition-all ${
                        week.actualHours >= week.plannedHours && week.plannedHours > 0
                          ? "bg-indigo-600 group-hover:bg-indigo-700"
                          : "bg-indigo-500 group-hover:bg-indigo-600"
                      }`}
                      title={`Actual: ${week.actualHours}h`}
                    />
                  )}
                </div>

                {/* X-axis Week Label */}
                <span
                  className={`mt-2 text-xs font-semibold ${
                    isCurrent
                      ? "text-indigo-600 font-bold"
                      : isPast
                      ? "text-zinc-600"
                      : "text-zinc-400"
                  }`}
                >
                  W{week.weekNumber}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Interactive Hover Tooltip ─────────────────────────────────── */}
        <AnimatePresence>
          {hoveredWeek && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mt-3 p-3 rounded-2xl bg-zinc-900 text-white text-xs shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>Week {hoveredWeek.weekNumber}</span>
                  <span className="text-[10px] font-normal text-zinc-400">
                    ({hoveredWeek.startDate} → {hoveredWeek.endDate})
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300">
                    {hoveredWeek.state}
                  </span>
                </div>
                {hoveredWeek.skills && hoveredWeek.skills.length > 0 && (
                  <div className="text-zinc-300 mt-1">
                    Skills: {hoveredWeek.skills.join(", ")}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                <div className="text-zinc-300">
                  Planned:{" "}
                  <span className="text-white font-bold">
                    {hoveredWeek.plannedHours}h
                  </span>
                </div>
                <div className="text-indigo-300">
                  Actual:{" "}
                  <span className="text-white font-bold">
                    {hoveredWeek.actualHours}h
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Projected Finish & Deadline Footer ──────────────────────────── */}
      <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <span>
            Projected Completion:{" "}
            <strong className="text-zinc-800 font-semibold">
              {projectedFinishDate || "N/A"}
            </strong>
          </span>
        </div>

        {deadlineDate && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span>
              Target Deadline:{" "}
              <strong className="text-zinc-800 font-semibold">
                {deadlineDate}
              </strong>
            </span>
            {isDeadlinePassed && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Deadline Passed
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
