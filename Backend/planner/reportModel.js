/**
 * reportModel.js
 * 
 * Pure data model builder for the SkillGraph Gap Analysis & Study Report.
 * Prepares all statistics, skill matrices, curriculum justifications,
 * and weekly schedules for deterministic PDF rendering.
 */

function round1(v) {
  return Math.round((Number(v) || 0) * 10) / 10;
}

export function buildReportModel({
  roadmap = {},
  user = {},
  resources = [],
  documentation = null,
  now = new Date(),
}) {
  const nodes = roadmap.nodes || [];
  const edges = roadmap.edges || [];
  const plan = roadmap.plan || { weeks: [] };
  const planSettings = roadmap.planSettings || { hoursPerWeek: 10, maxParallelSkills: 2 };

  // 1. Meta (Strictly omit email for privacy!)
  const learnerName = user.name || "SkillGraph Learner";
  const targetRole = roadmap.targetRole || roadmap.title || "Career Path";
  const reportDate = new Date(now).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 2. Continuous Proficiency Readiness
  // Formula: (1 / |R|) * sum(min(level / targetLevel, 1.0)) * 100
  let readinessSum = 0;
  let completedCount = 0;
  let inProgressCount = 0;
  let missingCount = 0;

  for (const n of nodes) {
    const lvl = Number(n.proficiency) || 0;
    const target = Number(n.targetProficiency) || 2;
    const ratio = Math.min(lvl / target, 1.0);
    readinessSum += ratio;

    if (lvl >= target) {
      completedCount++;
    } else if (lvl > 0) {
      inProgressCount++;
    } else {
      missingCount++;
    }
  }

  const totalRequired = nodes.length;
  const readinessPercent =
    totalRequired > 0 ? Math.round((readinessSum / totalRequired) * 1000) / 10 : 0;

  // 3. Curriculum & Work Totals
  const totalRemainingHours = round1(
    nodes.reduce((sum, n) => sum + (Number(n.remainingHours) || 0), 0)
  );

  const totalCuratedHours = round1(
    nodes.reduce((sum, n) => sum + (Number(n.curatedHours) || 0), 0)
  );

  const hoursPerWeek = planSettings.hoursPerWeek || 10;
  const speedFactor = roadmap.speedFactor || 1.0;
  const estimatedWeeks = plan.weeks?.length || Math.ceil(totalRemainingHours / hoursPerWeek);

  // Hours source count
  let curatedCount = 0;
  let fallbackCount = 0;
  for (const n of nodes) {
    if (n.hoursSource === "resources") {
      curatedCount++;
    } else {
      fallbackCount++;
    }
  }

  // 4. Detailed Skill Rows
  const skillRows = nodes.map((n) => {
    let displayStatus = "Locked";
    if (n.status === "completed") displayStatus = "Completed";
    else if (n.status === "in_progress") displayStatus = "In Progress";
    else if (n.status === "available") displayStatus = "Available";

    return {
      id: n.id,
      label: n.label || n.id,
      currentLevel: n.proficiency || 0,
      targetLevel: n.targetProficiency || 2,
      status: displayStatus,
      remainingHours: round1(n.remainingHours || 0),
      hoursSource: n.hoursSource === "resources" ? "Curated" : "Estimate",
    };
  });

  // 5. Learning Order with Cached DAG Rationale (Zero Gemini Calls!)
  const cachedContent = documentation?.content || roadmap.documentation?.content;
  const learningSteps = roadmap.learningSteps || [];
  const whyThisOrderText =
    cachedContent?.explanation ||
    cachedContent?.summary ||
    roadmap.explanation ||
    "Curriculum sequence generated via topological prerequisite dependency ordering with industry demand prioritization.";

  // 6. Condensed Weekly Schedule
  const scheduleRows = (plan.weeks || []).map((w) => ({
    weekNumber: w.weekNumber,
    startDate: w.startDate ? new Date(w.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : `W${w.weekNumber}`,
    totalHours: round1(w.totalHours || 0),
    skills: (w.items || []).map((i) => `${i.label || i.skillId} (${i.hours}h)`).join(", "),
  }));

  // 7. Top Recommended Resources
  const resourceMap = new Map();
  for (const r of resources) {
    if (r && r.skill) {
      const normSkill = r.skill.toLowerCase().trim();
      if (!resourceMap.has(normSkill)) resourceMap.set(normSkill, []);
      resourceMap.get(normSkill).push(r);
    }
  }

  const topResources = [];
  for (const n of nodes) {
    const normName = (n.label || n.id).toLowerCase().trim();
    const list = resourceMap.get(normName) || [];
    for (const res of list.slice(0, 2)) {
      topResources.push({
        skill: n.label || n.id,
        title: res.title,
        type: res.type || "course",
        durationMinutes: res.durationMinutes || 60,
        url: res.url || "",
      });
    }
  }

  return {
    learnerName,
    targetRole,
    reportDate,
    planSettings: {
      hoursPerWeek,
      maxParallelSkills: planSettings.maxParallelSkills || 2,
      deadlineWeeks: planSettings.deadlineWeeks || null,
      speedFactor,
    },
    summary: {
      readinessPercent,
      readinessFormula: "Average of min(proficiency / targetLevel, 1.0) across all role skills",
      completedCount,
      inProgressCount,
      missingCount,
      totalRequired,
      totalRemainingHours,
      totalCuratedHours,
      estimatedWeeks,
      curatedSkillsCount: curatedCount,
      fallbackSkillsCount: fallbackCount,
      isFeasible: !plan.droppedSkills || plan.droppedSkills.length === 0,
      droppedSkills: plan.droppedSkills || [],
    },
    skillRows,
    whyThisOrderText,
    scheduleRows,
    topResources,
    methodologyNote:
      "Proficiency claims extracted from resume analysis are capped at Level 1 (Beginner). Durations without verified syllabus sources use difficulty-calibrated estimates (Beginner: 8h, Intermediate: 15h, Advanced: 25h).",
  };
}
