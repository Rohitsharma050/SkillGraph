import { templates } from '../Utils/roadmapTemplates.js';
import { validateAllTemplates } from './validation.js';

console.log('Running DAG Validation on all role templates...');
const { allValid, report } = validateAllTemplates(templates);

for (const [role, res] of Object.entries(report)) {
  if (res.valid) {
    console.log(`  ✓ [${role}]: Valid DAG (0 cycles, 0 orphans)`);
  } else {
    console.error(`  ✗ [${role}]: ERRORS FOUND:`);
    res.errors.forEach((err) => console.error(`      - ${err}`));
  }
}

if (!allValid) {
  console.error('\nFAIL: One or more role templates contain cycles or orphan edges.');
  process.exit(1);
} else {
  console.log('\nSUCCESS: All templates are strictly acyclic Directed Acyclic Graphs (DAGs)!');
}
