/**
 * reportPdf.js
 * 
 * In-memory vector PDF generator using PDFKit.
 * Features:
 * - Builds entire PDF into an in-memory Buffer (no half-streamed corrupt files)
 * - Safe typography using built-in Helvetica (no icon/emoji dependencies)
 * - Explicit continuous readiness formula printed
 * - Auto-page-breaking table helper for 40+ skills
 * - Monochrome & subtle slate editorial palette
 */

import PDFDocument from "pdfkit";

/**
 * Sanitizes strings for PDFKit's standard Type 1 Helvetica font.
 * Replaces non-printable and non-Latin-1 characters (such as Devanagari, Cyrillic, emoji)
 * with Latin characters or safe fallback to prevent crashes or corrupt streams.
 */
export function cleanPdfText(text, fallback = "") {
  if (!text) return fallback;
  // Normalize Unicode
  const normalized = String(text).normalize("NFKD");
  // Filter to Latin-1 printable range
  const sanitized = normalized.replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, "");
  return sanitized.trim() || fallback;
}

/**
 * Draws a clean, auto-wrapping table with header and row pagination.
 */
function drawTable(doc, { headers, rows, colWidths, startX = 40, startY = null }) {
  let y = startY !== null ? startY : doc.y;
  const bottomMargin = doc.page.height - 50;
  const rowHeight = 20;

  function renderHeader(curY) {
    doc.rect(startX, curY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill("#f4f4f5");
    doc.fillColor("#18181b").fontSize(8).font("Helvetica-Bold");

    let curX = startX;
    headers.forEach((h, idx) => {
      doc.text(cleanPdfText(h), curX + 4, curY + 6, { width: colWidths[idx] - 8, align: "left" });
      curX += colWidths[idx];
    });
    return curY + rowHeight;
  }

  // Draw initial header
  y = renderHeader(y);

  doc.font("Helvetica").fontSize(8);

  rows.forEach((row, rowIndex) => {
    // Check if new page is needed
    if (y + rowHeight > bottomMargin) {
      doc.addPage();
      y = 40;
      y = renderHeader(y);
      doc.font("Helvetica").fontSize(8);
    }

    // Alternating zebra row background
    if (rowIndex % 2 === 1) {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill("#fafafa");
    }

    // Border line
    doc.strokeColor("#e4e4e7").lineWidth(0.5).rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();

    doc.fillColor("#27272a");
    let curX = startX;
    row.forEach((cell, idx) => {
      const safeText = cleanPdfText(cell, "-");
      doc.text(safeText, curX + 4, y + 6, {
        width: colWidths[idx] - 8,
        align: "left",
        ellipsis: true,
      });
      curX += colWidths[idx];
    });

    y += rowHeight;
  });

  doc.y = y + 10;
}

export function renderReportPdf(reportModel) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const {
        learnerName,
        targetRole,
        reportDate,
        planSettings,
        summary,
        skillRows,
        whyThisOrderText,
        scheduleRows,
        topResources,
        methodologyNote,
      } = reportModel;

      const safeLearner = cleanPdfText(learnerName, "SkillGraph Learner");
      const safeRole = cleanPdfText(targetRole, "Career Path");
      const safeWhy = cleanPdfText(whyThisOrderText, "Curriculum sequence generated via topological prerequisite dependency ordering.");

      // ── Document Header ───────────────────────────────────────────────
      doc.fillColor("#09090b").fontSize(18).font("Helvetica-Bold").text("SkillGraph Gap Analysis & Study Report");
      doc.fontSize(9).font("Helvetica").fillColor("#71717a").text(`Career Path: ${safeRole}  |  Learner: ${safeLearner}  |  Generated: ${reportDate}`);
      doc.moveDown(0.5);

      doc.strokeColor("#e4e4e7").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.8);

      // ── Executive Readiness & Summary Cards ────────────────────────────
      doc.fillColor("#18181b").fontSize(11).font("Helvetica-Bold").text("1. Executive Summary & Readiness");
      doc.moveDown(0.3);

      const cardY = doc.y;
      const cardWidth = 120;
      const cardHeight = 44;

      // Card 1: Readiness %
      doc.rect(40, cardY, cardWidth, cardHeight).fill("#f4f4f5");
      doc.fillColor("#71717a").fontSize(7).font("Helvetica").text("OVERALL READINESS", 46, cardY + 6);
      doc.fillColor("#4f46e5").fontSize(14).font("Helvetica-Bold").text(`${summary.readinessPercent}%`, 46, cardY + 18);

      // Card 2: Skill Breakdown
      doc.rect(170, cardY, cardWidth, cardHeight).fill("#f4f4f5");
      doc.fillColor("#71717a").fontSize(7).font("Helvetica").text("SKILLS STATUS", 176, cardY + 6);
      doc.fillColor("#18181b").fontSize(9).font("Helvetica-Bold").text(
        `${summary.completedCount} Done / ${summary.inProgressCount} In-Prog / ${summary.missingCount} Missing`,
        176,
        cardY + 22
      );

      // Card 3: Remaining Work
      doc.rect(300, cardY, cardWidth, cardHeight).fill("#f4f4f5");
      doc.fillColor("#71717a").fontSize(7).font("Helvetica").text("REMAINING STUDY TIME", 306, cardY + 6);
      doc.fillColor("#18181b").fontSize(13).font("Helvetica-Bold").text(`${summary.totalRemainingHours} hrs`, 306, cardY + 20);

      // Card 4: Estimated Horizon
      doc.rect(430, cardY, cardWidth, cardHeight).fill("#f4f4f5");
      doc.fillColor("#71717a").fontSize(7).font("Helvetica").text("ESTIMATED DURATION", 436, cardY + 6);
      doc.fillColor("#18181b").fontSize(13).font("Helvetica-Bold").text(`${summary.estimatedWeeks} wks`, 436, cardY + 20);

      doc.y = cardY + cardHeight + 10;

      // Readiness Formula note
      doc.fillColor("#71717a").fontSize(8).font("Helvetica-Oblique").text(`* ${summary.readinessFormula}`);
      doc.moveDown(0.8);

      // ── Section 2: Skill Matrix Table ─────────────────────────────────
      doc.fillColor("#18181b").fontSize(11).font("Helvetica-Bold").text("2. Competency Gap Matrix");
      doc.moveDown(0.4);

      const skillHeaders = ["Skill", "Current Level", "Target Level", "Status", "Remaining Time", "Source"];
      const skillColWidths = [150, 65, 65, 80, 80, 75];
      const skillData = skillRows.map((s) => [
        s.label,
        `Level ${s.currentLevel}`,
        `Level ${s.targetLevel}`,
        s.status,
        `${s.remainingHours} hrs`,
        s.hoursSource,
      ]);

      drawTable(doc, { headers: skillHeaders, rows: skillData, colWidths: skillColWidths });
      doc.moveDown(0.5);

      // ── Section 3: Learning Order & Rationale ──────────────────────────
      if (doc.y > doc.page.height - 120) doc.addPage();
      doc.fillColor("#18181b").fontSize(11).font("Helvetica-Bold").text("3. Curriculum Sequencing Rationale");
      doc.moveDown(0.3);
      doc.fillColor("#3f3f46").fontSize(8.5).font("Helvetica").text(safeWhy, {
        align: "justify",
        lineGap: 2,
      });
      doc.moveDown(0.8);

      // ── Section 4: Condensed Weekly Plan ──────────────────────────────
      if (scheduleRows.length > 0) {
        if (doc.y > doc.page.height - 140) doc.addPage();
        doc.fillColor("#18181b").fontSize(11).font("Helvetica-Bold").text("4. Weekly Study Schedule");
        doc.moveDown(0.4);

        const scheduleHeaders = ["Week", "Start Date", "Study Work", "Focus Skills"];
        const scheduleColWidths = [50, 75, 75, 315];
        const scheduleData = scheduleRows.map((s) => [
          `Week ${s.weekNumber}`,
          s.startDate,
          `${s.totalHours} hrs`,
          s.skills || "Rest / buffer",
        ]);

        drawTable(doc, { headers: scheduleHeaders, rows: scheduleData, colWidths: scheduleColWidths });
        doc.moveDown(0.5);
      }

      // ── Section 5: Top Recommended Resources ──────────────────────────
      if (topResources.length > 0) {
        if (doc.y > doc.page.height - 140) doc.addPage();
        doc.fillColor("#18181b").fontSize(11).font("Helvetica-Bold").text("5. Curated Learning Resources");
        doc.moveDown(0.4);

        const resHeaders = ["Skill", "Resource Title", "Type", "Duration", "Link"];
        const resColWidths = [100, 160, 65, 55, 135];
        const resData = topResources.slice(0, 15).map((r) => [
          r.skill,
          r.title,
          r.type,
          `${r.durationMinutes}m`,
          r.url,
        ]);

        drawTable(doc, { headers: resHeaders, rows: resData, colWidths: resColWidths });
        doc.moveDown(0.5);
      }

      // ── Section 6: Methodology & Limitations Notice ───────────────────
      if (doc.y > doc.page.height - 80) doc.addPage();
      doc.rect(40, doc.y, 515, 36).fill("#f8fafc");
      doc.fillColor("#475569").fontSize(7.5).font("Helvetica-Oblique").text(
        `METHODOLOGY NOTICE: ${methodologyNote}`,
        46,
        doc.y + 8,
        { width: 503, lineGap: 1 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
