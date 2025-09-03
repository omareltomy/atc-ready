import { generateExercise } from './lib/generator.js';

console.log('Debugging callsign generation...\n');

for (let i = 0; i < 10; i++) {
  const scenario = generateExercise();
  const target = scenario.target;
  const intruder = scenario.intruder;
  
  console.log(`Scenario ${i + 1}:`);
  console.log(`  Target: ${target.callsign} (${target.flightRule}) - Type: ${target.type.type}`);
  console.log(`  Intruder: ${intruder.callsign} (${intruder.flightRule}) - Type: ${intruder.type.type}`);
  
  // Check if military callsign is valid
  const isMilitaryCallsign = /^[A-Z]{4,8}\d{1,2}$/.test(intruder.callsign);
  if (isMilitaryCallsign) {
    console.log(`  🔴 MILITARY CALLSIGN FOUND: ${intruder.callsign}`);
    console.log(`  Target is VFR: ${target.flightRule === 'VFR'}`);
    console.log(`  Valid rule: ${target.flightRule === 'VFR' ? '✅' : '❌'}`);
  }
  console.log();
}
