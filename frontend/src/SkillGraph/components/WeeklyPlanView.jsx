import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sliders,
  ChevronDown,
  ChevronUp,
  Zap,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileDown,
} from "lucide-react";
import WeeklyProgressChart from "./WeeklyProgressChart.jsx";
import CalendarExportModal from "./CalendarExportModal.jsx";

export default function WeeklyPlanView({
  roadmap,
  onUpdateSettings,
  onLogProgress,
  backendUrl,
  token,
}) {
  const plan = roadmap?.plan || { weeks: [] };
  const planSettings = roadmap?.planSettings || {
    hoursPerWeek: 10,
    startDate: new Date(),
    maxParallelSkills: 2,
  };
  const speedFactor = roadmap?.speedFactor || 1.0;

  // Settings edit modal state
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [hoursPerWeek, setHoursPerWeek] = useState(planSettings.hoursPerWeek || 10);
  const [deadlineWeeks, setDeadlineWeeks] = useState(planSettings.deadlineWeeks || "");
  const [maxParallel, setMaxParallel] = useState(planSettings.maxParallelSkills || 2);
  const [savingSettings, setSavingSettings] = useState(false);

  // Quick log progress modal state
  const [logModalSkill, setLogModalSkill] = useState(null);
  const [logMinutes, setLogMinutes] = useState(60);
  const [logEventType, setLogEventType] = useState("time_logged");
  const [targetLevel, setTargetLevel] = useState(1);
  const [studiedDate, setStudiedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loggingProgress, setLoggingProgress] = useState(false);

  // Expanded weeks state
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true, 2: true });

  // Progress chart data state
  const [progressData, setProgressData] = useState({ weeklySummary: [], totals: {} });
  const [loadingProgress, setLoadingProgress] = useState(true);

  const fetchProgress = async () => {
    if (!roadmap?._id) return;
    try {
      const tzOffset = new Date().getTimezoneOffset();
      const res = await axios.get(`${backendUrl}/api/roadmaps/${roadmap._id}/progress`, {
        params: { tzOffset },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProgressData({
          weeklySummary: res.data.weeklySummary || [],
          totals: res.data.totals || {},
        });
      }
    } catch (err) {
      console.error("Failed to load progress summary:", err);
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [roadmap?._id]);

  const toggleWeek = (weekNum) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await onUpdateSettings({
        hoursPerWeek: Number(hoursPerWeek),
        deadlineWeeks: deadlineWeeks ? Number(deadlineWeeks) : null,
        maxParallelSkills: Number(maxParallel),
      });
      setShowSettings(false);
      await fetchProgress();
    } catch (err) {
      console.error("Failed to update settings:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleConfirmLog = async () => {
    if (!logModalSkill) return;
    setLoggingProgress(true);
    try {
      await onLogProgress({
        eventType: logEventType,
        skillId: logModalSkill.skillId || logModalSkill.id,
        minutesSpent: Number(logMinutes) || 0,
        newLevel: Number(targetLevel) || 1,
        studiedAt: studiedDate,
        tzOffset: new Date().getTimezoneOffset(),
      });
      setLogModalSkill(null);
      setStudiedDate(new Date().toISOString().split("T")[0]);
      await fetchProgress();
    } catch (err) {
      console.error("Failed to log progress:", err);
    } finally {
      setLoggingProgress(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!roadmap?._id) return;
    setDownloadingPdf(true);
    try {
      const tzOffset = new Date().getTimezoneOffset();
      const res = await axios.get(`${backendUrl}/api/roadmaps/${roadmap._id}/report.pdf`, {
        params: { tzOffset },
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `skillgraph-gap-report-${roadmap._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Summary calculations
  const totalWeeks = plan.weeks?.length || 0;
  const totalPlannedHours = plan.weeks?.reduce((s, w) => s + (w.totalHours || 0), 0) || 0;
  const isTrimmed = plan.droppedSkills && plan.droppedSkills.length > 0;

  return (
    <div className="space-y-6">
      {/* ── KPI & Control Banner ─────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">
                  Adaptive Study Schedule
                </h3>
                <p className="text-xs text-zinc-500">
                  Capacity-constrained weekly study plan with dynamic pace adjustment
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition disabled:opacity-50"
              title="Download vector PDF Gap Analysis & Study Report"
            >
              <FileDown className="w-4 h-4 text-zinc-600" />
              {downloadingPdf ? "Generating PDF..." : "Export Report (PDF)"}
            </button>

            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition"
              title="Export study sessions as .ics file for calendar apps"
            >
              <Calendar className="w-4 h-4 text-zinc-600" />
              Sync to Calendar (.ics)
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition"
            >
              <Sliders className="w-4 h-4 text-zinc-600" />
              Adjust Capacity & Deadline
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium mb-1">
              <Clock className="w-4 h-4 text-zinc-400" />
              Weekly Commitment
            </div>
            <div className="text-xl font-bold text-zinc-900">
              {planSettings.hoursPerWeek || 10}
              <span className="text-xs font-normal text-zinc-500 ml-1">hrs/wk</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium mb-1">
              <Calendar className="w-4 h-4 text-zinc-400" />
              Total Duration
            </div>
            <div className="text-xl font-bold text-zinc-900">
              {totalWeeks}
              <span className="text-xs font-normal text-zinc-500 ml-1">weeks</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium mb-1">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              Total Study Work
            </div>
            <div className="text-xl font-bold text-zinc-900">
              {Math.round(totalPlannedHours * 10) / 10}
              <span className="text-xs font-normal text-zinc-500 ml-1">hours</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              Learning Speed Factor
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-zinc-900">
                {speedFactor.toFixed(2)}x
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  speedFactor < 0.95
                    ? "bg-emerald-100 text-emerald-700"
                    : speedFactor > 1.05
                    ? "bg-amber-100 text-amber-700"
                    : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {speedFactor < 0.95
                  ? "Ahead of pace"
                  : speedFactor > 1.05
                  ? "Extra time taken"
                  : "Normal pace"}
              </span>
            </div>
          </div>
        </div>

        {/* Feasibility Alert */}
        {isTrimmed && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Deadline Capacity Notice: </span>
              Your requested deadline required pruning non-essential skills to remain feasible. The
              following {plan.droppedSkills.length} skill(s) were trimmed:{" "}
              <span className="font-semibold">{plan.droppedSkills.join(", ")}</span>. You can
              increase your weekly hours or extend your deadline in settings to fit all skills.
            </div>
          </div>
        )}
      </div>

      {/* ── Planned vs Actual Progress Chart ────────────────────────────── */}
      <WeeklyProgressChart
        weeklySummary={progressData.weeklySummary}
        totals={progressData.totals}
        loading={loadingProgress}
      />

      {/* ── Week by Week Plan Timeline ────────────────────────────────────── */}
      <div className="space-y-4">
        {(!plan.weeks || plan.weeks.length === 0) && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-zinc-800">No remaining skills to schedule!</h4>
            <p className="text-xs text-zinc-500 mt-1">
              You have completed all prerequisite and target skills for this career path.
            </p>
          </div>
        )}

        {plan.weeks?.map((week) => {
          const isExpanded = expandedWeeks[week.weekNumber] ?? true;
          const weekStart = new Date(week.startDate);
          const weekEnd = new Date(week.endDate);
          const dateStr = `${weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} – ${weekEnd.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`;

          const pctUsed = Math.min(
            100,
            Math.round((week.totalHours / (planSettings.hoursPerWeek || 10)) * 100)
          );

          return (
            <motion.div
              key={week.weekNumber}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:border-zinc-300 transition"
            >
              {/* Week Header */}
              <div
                onClick={() => toggleWeek(week.weekNumber)}
                className="p-5 flex items-center justify-between cursor-pointer select-none bg-zinc-50/50 hover:bg-zinc-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    W{week.weekNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900">
                        Week {week.weekNumber}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">{dateStr}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {week.items.length} skill focus area{week.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Hours Allocation Bar */}
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold text-zinc-700">
                      {week.totalHours} hrs / {planSettings.hoursPerWeek || 10} hrs
                    </span>
                    <div className="w-28 h-2 rounded-full bg-zinc-200 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${pctUsed}%` }}
                      />
                    </div>
                  </div>

                  <span className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </div>
              </div>

              {/* Week Items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-5 border-t border-zinc-100 space-y-3"
                  >
                    {week.items.map((item) => {
                      const nodeRef = roadmap?.nodes?.find((n) => n.id === item.skillId);
                      const currentLvl = nodeRef?.proficiency || 0;
                      const targetLvl = nodeRef?.targetProficiency || 2;
                      const isComplete = currentLvl >= targetLvl;

                      return (
                        <div
                          key={item.skillId}
                          className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/30 hover:bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-zinc-900">
                                {item.label}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                Lvl {currentLvl} / {targetLvl}
                              </span>
                              {item.isSplit && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  Carried forward
                                </span>
                              )}
                              {isComplete && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  ✓ Done
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500">
                              Scheduled this week:{" "}
                              <span className="font-semibold text-zinc-800">
                                {item.hoursScheduled} hrs
                              </span>
                              {item.remainingAfter > 0 && (
                                <span className="text-zinc-400">
                                  {" "}
                                  ({item.remainingAfter} hrs remaining afterwards)
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setLogModalSkill(item);
                                setLogMinutes(Math.round(item.hoursScheduled * 60));
                                setTargetLevel(Math.min(3, currentLvl + 1));
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Log Study / Check-off
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Settings Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
            >
              <h3 className="text-lg font-bold text-zinc-900 mb-1">
                Study Capacity & Deadline Settings
              </h3>
              <p className="text-xs text-zinc-500 mb-6">
                Adjust your weekly availability. The scheduler will automatically replan your timeline.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Hours Available Per Week ({hoursPerWeek} hrs)
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="40"
                    step="1"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>3 hrs (Light)</span>
                    <span>15 hrs (Moderate)</span>
                    <span>40 hrs (Intensive)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Target Deadline in Weeks (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    placeholder="e.g. 12 (leave blank for flexible)"
                    value={deadlineWeeks}
                    onChange={(e) => setDeadlineWeeks(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    If set, the planner will verify feasibility against volume and critical path lower bound Wmin.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Max Parallel Skills At Once
                  </label>
                  <select
                    value={maxParallel}
                    onChange={(e) => setMaxParallel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>1 Skill (Sequential focus)</option>
                    <option value={2}>2 Skills (Recommended balance)</option>
                    <option value={3}>3 Skills (Multi-tasking)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition disabled:opacity-50"
                  >
                    {savingSettings ? "Simulating Plan…" : "Apply & Replan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Log Progress Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {logModalSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200"
            >
              <h3 className="text-lg font-bold text-zinc-900 mb-1">
                Record Study Activity: {logModalSkill.label}
              </h3>
              <p className="text-xs text-zinc-500 mb-6">
                Logging time adjusts your Bayesian pace factor and dynamically adapts subsequent weeks.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Action Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLogEventType("time_logged")}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition ${
                        logEventType === "time_logged"
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      ⏱ Log Study Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogEventType("level_set")}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition ${
                        logEventType === "level_set"
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      🎯 Update Proficiency Level
                    </button>
                  </div>
                </div>

                {/* Date Studied Picker */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Date Studied
                  </label>
                  <input
                    type="date"
                    value={studiedDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStudiedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Defaults to today. Backfilled dates are accurately attributed to their respective study week.
                  </p>
                </div>

                {logEventType === "time_logged" ? (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                      Actual Minutes Spent
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="1200"
                      step="5"
                      value={logMinutes}
                      onChange={(e) => setLogMinutes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Estimated was {logModalSkill.hoursScheduled * 60} mins. If you were faster or slower, the scheduler will calibrate future weeks.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                      Set New Level
                    </label>
                    <select
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>Level 1: Beginner (Concepts understood)</option>
                      <option value={2}>Level 2: Working (Small projects built)</option>
                      <option value={3}>Level 3: Proficient (Real-world production)</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setLogModalSkill(null);
                      setStudiedDate(new Date().toISOString().split("T")[0]);
                    }}
                    className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLog}
                    disabled={loggingProgress}
                    className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition disabled:opacity-50"
                  >
                    {loggingProgress ? "Saving & Replanning…" : "Confirm & Adapt"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Calendar Export Modal ────────────────────────────────────────── */}
      <CalendarExportModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        roadmapId={roadmap?._id}
        hoursPerWeek={planSettings.hoursPerWeek}
        backendUrl={backendUrl}
        token={token}
      />
    </div>
  );
}
