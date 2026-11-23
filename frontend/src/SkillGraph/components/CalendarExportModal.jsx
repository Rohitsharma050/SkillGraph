import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Download, X, Check, Info } from "lucide-react";
import axios from "axios";

const WEEKDAYS = [
  { id: 1, label: "Mon", short: "M" },
  { id: 2, label: "Tue", short: "T" },
  { id: 3, label: "Wed", short: "W" },
  { id: 4, label: "Thu", short: "Th" },
  { id: 5, label: "Fri", short: "F" },
  { id: 6, label: "Sat", short: "Sa" },
  { id: 7, label: "Sun", short: "Su" },
];

export default function CalendarExportModal({
  isOpen,
  onClose,
  roadmapId,
  hoursPerWeek = 10,
  backendUrl,
  token,
}) {
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]); // Mon, Wed, Fri by default
  const [startTime, setStartTime] = useState("19:00");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const toggleDay = (dayId) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((d) => d !== dayId);
      } else {
        return [...prev, dayId].sort((a, b) => a - b);
      }
    });
  };

  // Compute live estimated session duration
  const daysCount = selectedDays.length;
  const hoursPerDay = daysCount > 0 ? hoursPerWeek / daysCount : 0;
  const fullHours = Math.floor(hoursPerDay);
  const remainingMinutes = Math.round((hoursPerDay - fullHours) * 60);

  let durationText = "";
  if (fullHours > 0) durationText += `${fullHours}h `;
  if (remainingMinutes > 0) durationText += `${remainingMinutes}m`;
  if (!durationText) durationText = "0m";

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const weekdaysParam = selectedDays.join(",");
      const tzOffset = new Date().getTimezoneOffset();
      const res = await axios.get(
        `${backendUrl}/api/roadmaps/${roadmapId}/plan.ics`,
        {
          params: { weekdays: weekdaysParam, startTime, tzOffset },
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Create download link
      const blob = new Blob([res.data], { type: "text/calendar;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `skillgraph-study-plan.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error("Calendar export error:", err);
      setError("Failed to generate calendar export. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Sync Schedule to Calendar
              </h3>
              <p className="text-xs text-zinc-500">
                Export study blocks (.ics) for Google, Apple or Outlook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form Body */}
        <div className="space-y-5 pt-4">
          {/* Weekday selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">
              Study Days per Week
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                        : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">
              Preferred Session Start Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Live Session Duration Indicator */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-indigo-900">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Estimated block length:
              </span>
            </div>
            <span className="text-xs font-bold text-indigo-700">
              Up to {daysCount} sessions of {durationText} / wk
            </span>
          </div>

          {/* Tip */}
          <div className="flex items-start gap-2 text-[11px] text-zinc-500 bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
            <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              <strong>Tip:</strong> Import into a dedicated <em>"SkillGraph"</em> calendar in your calendar app so you can easily update or replace it after replanning.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 flex items-center justify-end gap-2 border-t border-zinc-100 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 hover:bg-zinc-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || selectedDays.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Generating..." : "Download .ics File"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
