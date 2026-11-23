// ─────────────────────────────────────────────────────────────────────────────
// planner/minimumWeeks.js
//
// Computes the theoretical lower bound on weeks needed to complete a roadmap:
//   W_min = max( ceil(sum(h_v * s) / H), max_path(sum(ceil(h_v * s / H))) )
//
// Where:
//   H = hoursPerWeek
//   s = speedFactor
//   h_v = remainingHours for skill v
//   Critical path uses prerequisite edges only
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes minimum weeks required under capacity H and dependency constraints.
 *
 * @param {Array<Object>} nodes - Incomplete skill nodes
 * @param {Array<Object>} edges - Prerequisite edges
 * @param {number} hoursPerWeek - Available hours per week (H)
 * @param {number} speedFactor - Learner speed multiplier (s)
 * @returns {{ minimumWeeks: number, volumeWeeks: number, criticalPathWeeks: number, criticalPath: string[] }}
 */
export function computeMinimumWeeks(nodes = [], edges = [], hoursPerWeek = 10, speedFactor = 1.0) {
  const H = Math.max(hoursPerWeek, 1);
  const s = Math.max(speedFactor, 0.1);

  const missingNodes = nodes.filter((n) => (n.remainingHours || 0) > 0 && n.status !== "completed");
  if (missingNodes.length === 0) {
    return { minimumWeeks: 0, volumeWeeks: 0, criticalPathWeeks: 0, criticalPath: [] };
  }

  const skillIds = new Set(missingNodes.map((n) => n.id));
  const nodeById = Object.fromEntries(missingNodes.map((n) => [n.id, n]));

  // 1. Volume lower bound: total work divided by weekly capacity
  const totalScaledHours = missingNodes.reduce((sum, n) => sum + (n.remainingHours || 0) * s, 0);
  const volumeWeeks = Math.ceil(totalScaledHours / H);

  // 2. Critical path lower bound (Longest Path in DAG)
  // Each skill v costs at least ceil((h_v * s) / H) weeks because of the next-week unlock rule.
  const cost = {};
  for (const n of missingNodes) {
    const scaledH = (n.remainingHours || 0) * s;
    cost[n.id] = Math.max(Math.ceil(scaledH / H), 1);
  }

  // Filter edges to only missing-skill subgraph
  const prereqEdges = edges.filter(
    (e) => e.relation === "prerequisite" && skillIds.has(e.from) && skillIds.has(e.to)
  );

  // Adjacency and in-degree
  const adj = {};
  const inDegree = {};
  for (const id of skillIds) {
    adj[id] = [];
    inDegree[id] = 0;
  }
  for (const e of prereqEdges) {
    adj[e.from].push(e.to);
    inDegree[e.to]++;
  }

  // Topological order via Kahn's algorithm
  const queue = Array.from(skillIds).filter((id) => inDegree[id] === 0);
  const topo = [];
  while (queue.length > 0) {
    const u = queue.shift();
    topo.push(u);
    for (const v of adj[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }

  // Dynamic programming for longest path (critical path)
  const dist = {};
  const parent = {};
  for (const id of skillIds) dist[id] = cost[id];

  for (const u of topo) {
    for (const v of adj[u]) {
      if (dist[u] + cost[v] > dist[v]) {
        dist[v] = dist[u] + cost[v];
        parent[v] = u;
      }
    }
  }

  let maxDist = 0;
  let endNode = null;
  for (const id of skillIds) {
    if (dist[id] > maxDist) {
      maxDist = dist[id];
      endNode = id;
    }
  }

  // Reconstruct critical path
  const criticalPath = [];
  let curr = endNode;
  while (curr) {
    criticalPath.unshift(curr);
    curr = parent[curr];
  }

  const criticalPathWeeks = maxDist;
  const minimumWeeks = Math.max(volumeWeeks, criticalPathWeeks);

  return {
    minimumWeeks,
    volumeWeeks,
    criticalPathWeeks,
    criticalPath,
  };
}
