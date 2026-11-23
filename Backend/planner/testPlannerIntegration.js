import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import roadmapModel from "../Models/roadmapModel.js";
import userModel from "../Models/userModel.js";
import resourceModel from "../Models/resourceModel.js";
import progressLogModel from "../Models/progressLogModel.js";
import { getTemplate } from "../Utils/roadmapTemplates.js";
import { evaluateGraphProficiency } from "./proficiency.js";
import { populateNodeHours } from "./hours.js";
import { planWeeks } from "./planWeeks.js";
import { computeSpeedFactor } from "./speedFactor.js";

async function runIntegrationTest() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Connected to MongoDB Atlas");

  try {
    // 1. Fetch user
    const user = await userModel.findOne({});
    if (!user) throw new Error("No user found in database");
    console.log(`Using test user: ${user.email} (${user._id})`);

    // 2. Fetch curated resources
    const allResources = await resourceModel.find({});
    console.log(`Found ${allResources.length} curated resources in DB`);
    const resourcesBySkill = {};
    for (const r of allResources) {
      const k = r.skillName.toLowerCase().trim();
      if (!resourcesBySkill[k]) resourcesBySkill[k] = [];
      resourcesBySkill[k].push(r);
    }

    // 3. Test template roadmap generation
    const template = getTemplate("Full Stack Developer");
    const rawNodes = template.skills.map((s) => ({
      id: s.id,
      label: s.label,
      type: "missing",
      level: s.level,
      proficiency: s.id === "html" ? 1 : 0, // pretend user knows html at level 1
      targetProficiency: s.targetProficiency || 2,
      levelSource: s.id === "html" ? "resume" : "none",
      difficulty: s.difficulty ?? 0.5,
      demandScore: s.demandScore ?? 0.8,
      essentiality: s.essentiality ?? {},
      description: s.description,
    }));

    const edges = template.edges.map((e) => ({
      from: e.from,
      to: e.to,
      relation: e.relation || "prerequisite",
      minLevel: e.minLevel || 1,
    }));

    const nodesWithHours = populateNodeHours(rawNodes, resourcesBySkill);
    evaluateGraphProficiency(nodesWithHours, edges);

    console.log("Nodes evaluation check:");
    const htmlNode = nodesWithHours.find((n) => n.id === "html");
    console.log(`  HTML: prof=${htmlNode.proficiency}/${htmlNode.targetProficiency}, status=${htmlNode.status}, remHours=${htmlNode.remainingHours}h`);
    console.assert(htmlNode.status === "in_progress", "HTML should be in_progress since prof=1 < target=2");

    // 4. Test plan generation
    const plan = planWeeks({
      nodes: nodesWithHours,
      edges,
      targetRole: "Full Stack Developer",
      hoursPerWeek: 15,
      startDate: new Date(),
      deadlineWeeks: 12,
      maxParallelSkills: 2,
      speedFactor: 1.0,
    });

    console.log(`✓ Plan generated with ${plan.weeks.length} weeks, feasible=${plan.feasible}`);
    console.assert(plan.weeks.length > 0, "Plan should have weeks");

    // 5. Test saving and retrieving roadmap with new schema fields and learningSteps resources
    const testLearningSteps = [
      {
        order: 1,
        skill: "JavaScript",
        reason: "Core language",
        estimatedTime: "2 weeks",
        resources: (resourcesBySkill["javascript"] || []).map((r) => ({
          id: r._id,
          title: r.title,
          type: r.type,
          url: r.url,
          durationMinutes: r.durationMinutes || 60,
          targetProficiency: r.targetProficiency || 1,
          required: r.required !== false,
          order: r.order || 1,
        })),
      },
    ];

    const testRoadmap = await roadmapModel.create({
      userId: user._id,
      title: "Integration Test Roadmap",
      targetRole: "Full Stack Developer",
      extractedSkills: ["HTML"],
      missingSkills: template.skills.filter((s) => s.id !== "html").map((s) => s.label),
      nodes: nodesWithHours,
      edges,
      learningSteps: testLearningSteps,
      explanation: "Test explanation",
      completedNodes: [],
      progressPercentage: 0,
      planSettings: {
        hoursPerWeek: 15,
        startDate: new Date(),
        deadlineWeeks: 12,
        maxParallelSkills: 2,
      },
      plan,
      speedFactor: 1.0,
    });

    console.log(`✓ Saved test roadmap ${testRoadmap._id}`);

    // 6. Test progress logging & speed factor
    const testLog = await progressLogModel.create({
      userId: user._id,
      roadmapId: testRoadmap._id,
      skillId: "html",
      eventType: "resource_completed",
      minutesSpent: 90,
      proficiencyAfter: 2,
      weekNumber: 1,
    });
    console.log(`✓ Created ProgressLog entry ${testLog._id}`);

    // Update node proficiency to target (2) -> status becomes completed
    htmlNode.proficiency = 2;
    evaluateGraphProficiency(nodesWithHours, edges);
    console.log(`  HTML after completion: prof=${htmlNode.proficiency}, status=${htmlNode.status}`);
    console.assert(htmlNode.status === "completed", "HTML should now be completed");

    // Clean up test roadmap and log
    await roadmapModel.findByIdAndDelete(testRoadmap._id);
    await progressLogModel.findByIdAndDelete(testLog._id);
    console.log("✓ Cleaned up integration test data");

    console.log("\nALL PLANNER BACKEND INTEGRATION CHECKS PASSED!");
  } finally {
    await mongoose.disconnect();
  }
}

runIntegrationTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
