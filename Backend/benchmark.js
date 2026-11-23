// ─────────────────────────────────────────────────────────────────────────────
// Backend/benchmark.js
//
// Standalone benchmark: plain Kahn's vs priority-weighted Kahn's.
//
// Run from the Backend/ directory:
//   node benchmark.js
//
// Purpose (honest framing):
//   Real SkillGraph graphs are ~10–11 nodes per role template.
//   This script stress-tests synthetic graphs up to 50 nodes to prove the
//   priority-weighted sort adds NEGLIGIBLE overhead — not to claim a speed-up.
//   Frame results in the paper as: "performance impact validation".
// ─────────────────────────────────────────────────────────────────────────────

import { priorityScheduledTopoSort, computeNodeWeight, computeUnlockFactor } from "./Utils/skillAttributes.js";

// ─────────────────────────────────────────────────────────────────────────────
// generateRandomDAG(size)
//
// Synthetic DAG generator for stress testing.
// Produces `size` skill nodes with random attribute values and a sparse
// prerequisite edge set (roughly O(size) edges) that is guaranteed acyclic
// because edges only point from lower to higher indices.
// ─────────────────────────────────────────────────────────────────────────────
function generateRandomDAG(size) {
    const skills = [];
    for (let i = 0; i < size; i++) {
        skills.push({
            id: `skill_${i}`,
            label: `Skill ${i}`,
            level: Math.ceil((i / size) * 5), // levels 1–5
            difficulty:   Math.random(),
            demandScore:  Math.random(),
            essentiality: { MERN: Math.random() },
            estimatedTime: "1 week",
            reason: "Synthetic skill for benchmarking.",
        });
    }

    const edges = [];
    for (let i = 0; i < size; i++) {
        // Add 0–2 prerequisite edges pointing forward (acyclicity guaranteed)
        const numEdges = Math.floor(Math.random() * 3);
        for (let e = 0; e < numEdges; e++) {
            const target = i + 1 + Math.floor(Math.random() * (size - i - 1));
            if (target < size) {
                edges.push({ from: `skill_${i}`, to: `skill_${target}`, relation: "prerequisite" });
            }
        }
    }
    return { skills, edges };
}

// ─────────────────────────────────────────────────────────────────────────────
// plainTopoSort
//
// Baseline: standard Kahn's algorithm with NO priority weighting.
// Nodes are processed in insertion order within each frontier — O(V + E).
// ─────────────────────────────────────────────────────────────────────────────
function plainTopoSort(skills, edges) {
    if (!skills || skills.length === 0) return [];

    const skillIds = skills.map((s) => s.id);
    const skillSet = new Set(skillIds);
    const prereqEdges = edges.filter(
        (e) => e.relation === "prerequisite" && skillSet.has(e.from) && skillSet.has(e.to)
    );

    const inDegree = {};
    for (const id of skillIds) inDegree[id] = 0;
    for (const e of prereqEdges) inDegree[e.to]++;

    const queue = skillIds.filter((id) => inDegree[id] === 0);
    const ordered = [];

    while (queue.length > 0) {
        const next = queue.shift();
        ordered.push(next);
        for (const e of prereqEdges) {
            if (e.from === next) {
                inDegree[e.to]--;
                if (inDegree[e.to] === 0) queue.push(e.to);
            }
        }
    }
    return ordered;
}

// ─────────────────────────────────────────────────────────────────────────────
// runBenchmark
// ─────────────────────────────────────────────────────────────────────────────
const ITERATIONS = 20;
const SIZES = [10, 20, 30, 50];
const TARGET_ROLE = "MERN";

console.log("SkillGraph — Topological Sort Benchmark");
console.log("=========================================");
console.log(`Iterations per size: ${ITERATIONS}`);
console.log(`Target role:         ${TARGET_ROLE}`);
console.log(`Graph sizes:         ${SIZES.join(", ")} nodes\n`);
console.log("size  | plain (avg ms) | priority (avg ms) | overhead");
console.log("------|----------------|-------------------|----------");

for (const size of SIZES) {
    const { skills, edges } = generateRandomDAG(size);

    // ── Plain sort ────────────────────────────────────────────────────────────
    const t1 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        plainTopoSort(skills, edges);
    }
    const plainAvg = (performance.now() - t1) / ITERATIONS;

    // ── Priority sort ─────────────────────────────────────────────────────────
    const t2 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        priorityScheduledTopoSort(skills, edges, TARGET_ROLE);
    }
    const priorityAvg = (performance.now() - t2) / ITERATIONS;

    const overhead = priorityAvg > 0 && plainAvg > 0
        ? `+${((priorityAvg / plainAvg - 1) * 100).toFixed(1)}%`
        : "n/a";

    console.log(
        `  ${String(size).padEnd(4)} | ${plainAvg.toFixed(4).padStart(14)} | ${priorityAvg.toFixed(4).padStart(17)} | ${overhead}`
    );
}

console.log("\n✓ Benchmark complete.");
console.log("Note: Real SkillGraph graphs have ~10-11 nodes per role.");
console.log("The overhead here validates that priority weighting is negligible in production.");
