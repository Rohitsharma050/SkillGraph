// ─────────────────────────────────────────────────────────────────────────────
// planner/validation.js
//
// Validation utilities for roadmap templates and graphs:
//   • Cycle detection using DFS (Tarjan / 3-color graph coloring)
//   • Orphan detection (edges referencing non-existent nodes)
//   • DAG property assertion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a template graph for cycles, orphan edges, and basic invariants.
 *
 * @param {Object} template - { skills: Array, edges: Array }
 * @param {string} roleName - Optional identifier for error reporting
 * @returns {{ valid: boolean, errors: string[], cycles: string[][] }}
 */
export function validateTemplateGraph(template, roleName = "Unknown Role") {
  const errors = [];
  const cycles = [];

  if (!template || !Array.isArray(template.skills) || !Array.isArray(template.edges)) {
    return {
      valid: false,
      errors: [`[${roleName}] Template must have skills and edges arrays.`],
      cycles: [],
    };
  }

  const skillIds = new Set(template.skills.map((s) => s.id));

  // 1. Check for duplicate skill IDs
  const seenIds = new Set();
  for (const skill of template.skills) {
    if (seenIds.has(skill.id)) {
      errors.push(`[${roleName}] Duplicate skill ID found: "${skill.id}"`);
    }
    seenIds.add(skill.id);
  }

  // 2. Check for orphan edges (from or to does not exist in skills)
  for (const edge of template.edges) {
    if (!skillIds.has(edge.from)) {
      errors.push(`[${roleName}] Orphan edge: 'from' node "${edge.from}" does not exist in skills.`);
    }
    if (!skillIds.has(edge.to)) {
      errors.push(`[${roleName}] Orphan edge: 'to' node "${edge.to}" does not exist in skills.`);
    }
  }

  // 3. Cycle detection using 3-color DFS (WHITE=0, GRAY=1, BLACK=2)
  // Prerequisite relation means: 'from' must be completed BEFORE 'to'.
  // Dependency direction: edge.from -> edge.to
  const adj = {};
  for (const id of skillIds) adj[id] = [];
  for (const edge of template.edges) {
    if (skillIds.has(edge.from) && skillIds.has(edge.to)) {
      adj[edge.from].push(edge.to);
    }
  }

  const color = {};
  const parent = {};
  for (const id of skillIds) color[id] = 0; // 0 = unvisited

  function dfs(u, path) {
    color[u] = 1; // 1 = visiting (in recursion stack)
    path.push(u);

    for (const v of adj[u]) {
      if (color[v] === 1) {
        // Cycle detected!
        const cycleStartIndex = path.indexOf(v);
        const cyclePath = path.slice(cycleStartIndex).concat(v);
        cycles.push(cyclePath);
        errors.push(`[${roleName}] Cycle detected: ${cyclePath.join(" -> ")}`);
      } else if (color[v] === 0) {
        parent[v] = u;
        dfs(v, path);
      }
    }

    path.pop();
    color[u] = 2; // 2 = completely visited
  }

  for (const id of skillIds) {
    if (color[id] === 0) {
      dfs(id, []);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    cycles,
  };
}

/**
 * Validates that all configured role templates are strictly acyclic.
 *
 * @param {Object} templatesMap - Map of roleName -> template
 * @returns {{ allValid: boolean, report: Object }}
 */
export function validateAllTemplates(templatesMap) {
  const report = {};
  let allValid = true;

  for (const [roleName, template] of Object.entries(templatesMap)) {
    const result = validateTemplateGraph(template, roleName);
    report[roleName] = result;
    if (!result.valid) {
      allValid = false;
    }
  }

  return { allValid, report };
}
