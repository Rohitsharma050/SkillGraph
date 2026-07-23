// ─────────────────────────────────────────────────────────────────────────────
// Utils/skillAttributes.js
//
// Priority-weighted topological sort (Kahn's algorithm variant).
//
// Replaces the simple level-based sort in buildRoadmapFromTemplate() with a
// priority-aware ordering that surfaces high-impact, high-unlock skills first.
//
// Priority formula per node:
//   priority(skill) = nodeWeight(skill, targetRole) × unlockFactor(skillId, edges)
//
// Where:
//   nodeWeight     = (1/3 × difficulty) + (1/3 × demandScore) + (1/3 × essentiality)
//   unlockFactor   = number of OTHER skills in the current missing set that list
//                    this skill as a prerequisite (i.e. out-degree in prereq graph)
//
// Public API:
//   computeNodeWeight(skill, targetRole)          → Number
//   computeUnlockFactor(skillId, edges)            → Number
//   priorityScheduledTopoSort(skills, edges, targetRole) → String[] (ordered skill IDs)
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHT = 1 / 3;

// ─────────────────────────────────────────────────────────────────────────────
// computeNodeWeight
//
// Returns a score in [0, 1] representing how valuable this skill is to learn
// for the given targetRole.
// Falls back to 0.5 for essentiality when the role is not mapped.
// ─────────────────────────────────────────────────────────────────────────────
export function computeNodeWeight(skill, targetRole) {
    const difficulty   = skill.difficulty   ?? 0.5;
    const demandScore  = skill.demandScore  ?? 0.5;
    const essentiality = skill.essentiality?.[targetRole] ?? 0.5;
    return WEIGHT * difficulty + WEIGHT * demandScore + WEIGHT * essentiality;
}

// ─────────────────────────────────────────────────────────────────────────────
// computeUnlockFactor
//
// Counts how many skills in the current candidate set have `skillId` as a
// *direct* prerequisite (i.e. out-degree restricted to the missing-skill graph).
// A higher unlock factor means learning this skill sooner unblocks more work.
// ─────────────────────────────────────────────────────────────────────────────
export function computeUnlockFactor(skillId, edges) {
    return edges.filter(
        (e) => e.from === skillId && e.relation === "prerequisite"
    ).length;
}

// ─────────────────────────────────────────────────────────────────────────────
// computeInDegrees
//
// Returns a map { skillId → Number } of prerequisite in-degrees restricted to
// the provided skill set (missing skills only, not the whole template graph).
// ─────────────────────────────────────────────────────────────────────────────
function computeInDegrees(skillIds, edges) {
    const skillSet = new Set(skillIds);
    const inDegree = {};
    for (const id of skillIds) inDegree[id] = 0;

    for (const edge of edges) {
        if (
            edge.relation === "prerequisite" &&
            skillSet.has(edge.from) &&
            skillSet.has(edge.to)
        ) {
            inDegree[edge.to]++;
        }
    }
    return inDegree;
}

// ─────────────────────────────────────────────────────────────────────────────
// priorityScheduledTopoSort
//
// Drop-in replacement for the simple level sort inside buildRoadmapFromTemplate.
//
// Input:
//   skills     — Array of skill objects (missing skills only, each has id + attributes)
//   edges      — Full edge list from the template (prerequisite / uses / etc.)
//   targetRole — String role name used by computeNodeWeight's essentiality lookup
//
// Output:
//   Ordered Array of skill IDs — topologically valid AND priority-sorted within
//   each "frontier" (i.e. among all currently available nodes, highest priority first).
//
// Algorithm:
//   Standard Kahn's BFS topological sort, except at each step instead of
//   picking any available node we sort the available set by descending priority
//   score before picking the best one.
// ─────────────────────────────────────────────────────────────────────────────
export function priorityScheduledTopoSort(skills, edges, targetRole) {
    if (!skills || skills.length === 0) return [];

    const skillIds = skills.map((s) => s.id);
    const skillById = Object.fromEntries(skills.map((s) => [s.id, s]));

    // Restrict edges to only the missing-skill subgraph
    const skillSet = new Set(skillIds);
    const subEdges = edges.filter(
        (e) => skillSet.has(e.from) && skillSet.has(e.to)
    );

    // Build adjacency list (from → [to, ...]) for prerequisite edges only
    const prereqEdges = subEdges.filter((e) => e.relation === "prerequisite");

    const inDegree = computeInDegrees(skillIds, prereqEdges);

    // Seed the available queue with zero-in-degree nodes
    let available = skillIds.filter((id) => inDegree[id] === 0);

    const ordered = [];

    while (available.length > 0) {
        // Sort available nodes by descending priority score
        available.sort((a, b) => {
            const skillA = skillById[a];
            const skillB = skillById[b];
            const pa =
                computeNodeWeight(skillA, targetRole) *
                (computeUnlockFactor(a, prereqEdges) + 1); // +1 avoids zero-product
            const pb =
                computeNodeWeight(skillB, targetRole) *
                (computeUnlockFactor(b, prereqEdges) + 1);
            return pb - pa; // highest priority first
        });

        const next = available.shift();
        ordered.push(next);

        // Unlock neighbours
        for (const edge of prereqEdges) {
            if (edge.from === next) {
                inDegree[edge.to]--;
                if (inDegree[edge.to] === 0) {
                    available.push(edge.to);
                }
            }
        }
    }

    // Safety: if graph had a cycle (shouldn't happen with our static templates),
    // append any remaining nodes in original order so we never lose data.
    const orderedSet = new Set(ordered);
    for (const id of skillIds) {
        if (!orderedSet.has(id)) ordered.push(id);
    }

    return ordered;
}
