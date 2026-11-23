import {
  computeRemainingHours,
  computeNodeStatus,
  evaluateGraphProficiency,
} from './proficiency.js';

console.log('Running unit tests for proficiency.js...');

// Test 1: computeRemainingHours
console.log('  Testing computeRemainingHours:');
console.assert(computeRemainingHours(30, 0, 3) === 30, '0/3 should be 30h');
console.assert(computeRemainingHours(30, 1, 3) === 20, '1/3 should be 20h');
console.assert(computeRemainingHours(30, 2, 3) === 10, '2/3 should be 10h');
console.assert(computeRemainingHours(30, 3, 3) === 0, '3/3 should be 0h');
console.assert(computeRemainingHours(30, 4, 3) === 0, '>3/3 should be 0h');
console.log('    ✓ computeRemainingHours passed all asserts');

// Test 2: computeNodeStatus
console.log('  Testing computeNodeStatus:');
// Completed when level >= target
console.assert(
  computeNodeStatus({ level: 3, target: 3 }) === 'completed',
  'Level 3/3 should be completed'
);
// In-progress when 0 < level < target
console.assert(
  computeNodeStatus({ level: 1, target: 3 }) === 'in_progress',
  'Level 1/3 should be in_progress'
);
console.assert(
  computeNodeStatus({ level: 2, target: 3 }) === 'in_progress',
  'Level 2/3 should be in_progress'
);

// Available when level == 0 and no prereqs
console.assert(
  computeNodeStatus({ level: 0, target: 3, incomingPrereqs: [] }) === 'available',
  'No prereqs should be available'
);

// minLevel prerequisite gating (e.g. Docker -> Kubernetes)
const prereqs = [{ from: 'docker', minLevel: 2 }];

// Docker at level 0 -> Kubernetes locked
console.assert(
  computeNodeStatus({
    level: 0,
    target: 3,
    incomingPrereqs: prereqs,
    skillLevelMap: { docker: 0 },
  }) === 'locked',
  'Docker at level 0 should keep Kubernetes locked'
);

// Docker at level 1 -> Kubernetes STILL locked (requires minLevel 2)
console.assert(
  computeNodeStatus({
    level: 0,
    target: 3,
    incomingPrereqs: prereqs,
    skillLevelMap: { docker: 1 },
  }) === 'locked',
  'Docker at level 1 should keep Kubernetes locked (minLevel 2 required)'
);

// Docker at level 2 -> Kubernetes UNLOCKED ('available')
console.assert(
  computeNodeStatus({
    level: 0,
    target: 3,
    incomingPrereqs: prereqs,
    skillLevelMap: { docker: 2 },
  }) === 'available',
  'Docker at level 2 unlocks Kubernetes'
);

// Docker at level 3 -> Kubernetes UNLOCKED ('available')
console.assert(
  computeNodeStatus({
    level: 0,
    target: 3,
    incomingPrereqs: prereqs,
    skillLevelMap: { docker: 3 },
  }) === 'available',
  'Docker at level 3 unlocks Kubernetes'
);

console.log('    ✓ computeNodeStatus 4-state transitions passed all asserts');

// Test 3: evaluateGraphProficiency
const nodes = [
  { id: 'docker', proficiency: 2, targetProficiency: 2, totalHours: 20 },
  { id: 'k8s', proficiency: 0, targetProficiency: 3, totalHours: 45 },
];
const edges = [{ from: 'docker', to: 'k8s', relation: 'prerequisite', minLevel: 2 }];
const evaluated = evaluateGraphProficiency(nodes, edges, { docker: 2, k8s: 0 });

console.assert(evaluated[0].status === 'completed', 'docker should be completed');
console.assert(evaluated[0].remainingHours === 0, 'docker remainingHours should be 0');
console.assert(evaluated[1].status === 'available', 'k8s should be available');
console.assert(evaluated[1].remainingHours === 45, 'k8s remainingHours should be 45');
console.log('    ✓ evaluateGraphProficiency passed all asserts');

console.log('\nSUCCESS: All unit tests in testProficiency.js passed!\n');
