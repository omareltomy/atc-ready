import { generateExercise } from './lib/generator.js';

console.log('Testing altitude relevance after fix...\n');

for (let i = 0; i < 15; i++) {
  const exercise = generateExercise();
  
  const targetAlt = exercise.target.level;
  const intruderAlt = exercise.intruder.level;
  const altitudeDiff = Math.abs(targetAlt - intruderAlt);
  
  console.log(`Test ${i + 1}:`);
  console.log(`  Target: ${exercise.target.callsign} (${exercise.target.flightRule}) - ${targetAlt}ft`);
  console.log(`  Intruder: ${exercise.intruder.callsign} (${exercise.intruder.flightRule}) - ${intruderAlt}ft`);
  console.log(`  Altitude Difference: ${altitudeDiff}ft`);
  console.log(`  Relevant: ${altitudeDiff <= 5000 ? '✅ YES' : '❌ NO (too far apart)'}`);
  console.log(`  Aircraft Types: ${exercise.target.type.name} vs ${exercise.intruder.type.name}`);
  console.log();
}