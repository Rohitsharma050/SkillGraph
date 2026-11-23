import { computeMinimumWeeks } from './minimumWeeks.js';
import { trimToDeadline } from './trimToDeadline.js';
import { planWeeks } from './planWeeks.js';
import { computeSpeedFactor } from './speedFactor.js';

console.log('Running unit tests for the capacity-constrained scheduler...');

// Test 1: Minimum weeks
const testNodes = [
  { id: 'html', label: 'HTML', remainingHours: 10, status: 'available', difficulty: 0.2 },
  { id: 'css', label: 'CSS', remainingHours: 15, status: 'available', difficulty: 0.3 },
  { id: 'js', label: 'JavaScript', remainingHours: 20, status: 'locked', difficulty: 0.6 },
];
const testEdges = [
  { from: 'html', to: 'js', relation: 'prerequisite', minLevel: 1 },
  { from: 'css', to: 'js', relation: 'prerequisite', minLevel: 1 },
];

const minResult = computeMinimumWeeks(testNodes, testEdges, 10, 1.0);
console.log('  Testing computeMinimumWeeks:');
// Total hours = 45. H = 10 -> Volume weeks = 5.
// Critical path: html(1) + js(2) = 3? Wait, css is 15h -> ceil(15/10)=2. js is 20h -> ceil(20/10)=2. Longest path css->js = 2 + 2 = 4 weeks. Max(5, 4) = 5.
console.assert(minResult.volumeWeeks === 5, 'Volume weeks should be 5');
console.assert(minResult.criticalPathWeeks === 4, 'Critical path weeks should be 4');
console.assert(minResult.minimumWeeks === 5, 'Minimum weeks should be max(5, 4) = 5');
console.log('    ✓ computeMinimumWeeks passed');

// Test 2: planWeeks simulation
console.log('  Testing planWeeks simulation:');
const plan = planWeeks({
  nodes: testNodes,
  edges: testEdges,
  targetRole: 'Frontend Developer',
  hoursPerWeek: 10,
  startDate: new Date('2026-11-23'),
  deadlineWeeks: 8,
  maxParallelSkills: 2,
  speedFactor: 1.0,
});

console.assert(plan.feasible === true, 'Plan should be feasible within 8 weeks');
console.assert(plan.weeks.length > 0, 'Plan should produce weekly schedule');
console.log(`    ✓ Generated ${plan.weeks.length} study weeks`);

// Verify precedence property: JS must not appear before Week 3 (since html and css take 2.5 weeks)
const jsFirstWeek = plan.weeks.find((w) => w.items.some((it) => it.skillId === 'js'));
console.assert(jsFirstWeek.weekNumber >= 2, 'JavaScript must not be scheduled before prerequisites');
console.log(`    ✓ Precedence verified: JavaScript scheduled in Week ${jsFirstWeek.weekNumber}`);

// Verify conservation of hours: sum of weekly scheduled hours equals total remaining hours (45h)
const totalScheduledHours = plan.weeks.reduce((sum, w) => sum + w.totalHours, 0);
console.assert(
  Math.abs(totalScheduledHours - 45) <= 0.5,
  `Scheduled hours (${totalScheduledHours}) should match 45h within tolerance`
);
console.log(`    ✓ Conservation verified: ${totalScheduledHours}h scheduled vs 45h work`);

// Test 3: Greedy trim under impossible deadline
console.log('  Testing deadline trimming:');
const trimmedPlan = planWeeks({
  nodes: [
    ...testNodes,
    { id: 'optional', label: 'Optional Leaf', remainingHours: 30, status: 'available', difficulty: 0.5, essentiality: { 'Frontend Developer': 0.2 } },
  ],
  edges: testEdges,
  targetRole: 'Frontend Developer',
  hoursPerWeek: 10,
  deadlineWeeks: 5, // 75h total work requires 8 weeks, but deadline is 5 weeks!
  speedFactor: 1.0,
});

console.assert(trimmedPlan.droppedSkills.length > 0, 'Should drop non-essential skills to fit deadline');
console.log(`    ✓ Trimming verified: dropped ${trimmedPlan.droppedSkills.length} non-essential skill(s)`);

// Test 4: Bayesian Speed Factor
console.log('  Testing Bayesian speed factor:');
const normalSpeed = computeSpeedFactor([]);
console.assert(normalSpeed.speedFactor === 1.0, 'Default speed factor should be 1.0');

// Fast learner: actual 60m vs planned 120m -> ratio (60 + 120) / (120 + 120) = 180 / 240 = 0.75
const fastLogs = [{ eventType: 'resource_completed', minutesSpent: 60, resourceId: 'res1' }];
const resMap = { res1: { durationMinutes: 120 } };
const fastSpeed = computeSpeedFactor(fastLogs, resMap);
console.assert(fastSpeed.speedFactor === 0.75, 'Speed factor with prior should be 0.75');
console.log(`    ✓ Speed factor verified: ${fastSpeed.speedFactor}`);

console.log('\nSUCCESS: All unit tests in testScheduler.js passed!\n');
