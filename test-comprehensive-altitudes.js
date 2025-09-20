import { generateExercise } from './lib/generator.js';

console.log('Comprehensive altitude relevance test after fix...\n');

let totalTests = 0;
let relevantTests = 0;
let maxDiff = 0;
let minDiff = Infinity;

for (let i = 0; i < 25; i++) {
  const exercise = generateExercise();
  
  const targetAlt = exercise.target.level;
  const intruderAlt = exercise.intruder.level;
  const altitudeDiff = Math.abs(targetAlt - intruderAlt);
  
  totalTests++;
  if (altitudeDiff <= 5000) relevantTests++;
  
  maxDiff = Math.max(maxDiff, altitudeDiff);
  minDiff = Math.min(minDiff, altitudeDiff);
  
  const targetMil = exercise.target.isMil ? ' MIL' : '';
  const intruderMil = exercise.intruder.isMil ? ' MIL' : '';
  
  console.log(`${i + 1}. ${exercise.target.callsign} (${exercise.target.flightRule}${targetMil}) ${targetAlt}ft vs ${exercise.intruder.callsign} (${exercise.intruder.flightRule}${intruderMil}) ${intruderAlt}ft - Diff: ${altitudeDiff}ft ${altitudeDiff <= 5000 ? '✅' : '❌'}`);
}

console.log('\n--- SUMMARY ---');
console.log(`Relevant scenarios: ${relevantTests}/${totalTests} (${((relevantTests/totalTests)*100).toFixed(1)}%)`);
console.log(`Max altitude difference: ${maxDiff}ft`);
console.log(`Min altitude difference: ${minDiff}ft`);
console.log(`Fix success: ${relevantTests === totalTests ? '✅ ALL SCENARIOS NOW RELEVANT' : '❌ Some scenarios still irrelevant'}`);