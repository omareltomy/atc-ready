import { generateExercise } from './lib/generator.js';

console.log('Testing mixed VFR/IFR altitude scenarios...\n');

let mixedCount = 0;
let attempts = 0;
const maxAttempts = 50;

while (mixedCount < 10 && attempts < maxAttempts) {
  attempts++;
  const exercise = generateExercise();
  
  const targetIsVFR = exercise.target.flightRule === 'VFR';
  const intruderIsVFR = exercise.intruder.flightRule === 'VFR';
  
  // Only show mixed scenarios
  if (targetIsVFR !== intruderIsVFR) {
    mixedCount++;
    
    const targetAlt = exercise.target.level;
    const intruderAlt = exercise.intruder.level;
    const altitudeDiff = Math.abs(targetAlt - intruderAlt);
    
    console.log(`Mixed Test ${mixedCount}:`);
    console.log(`  Target: ${exercise.target.callsign} (${exercise.target.flightRule}) - ${targetAlt}ft`);
    console.log(`  Intruder: ${exercise.intruder.callsign} (${exercise.intruder.flightRule}) - ${intruderAlt}ft`);
    console.log(`  Altitude Difference: ${altitudeDiff}ft`);
    console.log(`  Relevant: ${altitudeDiff <= 5000 ? '✅ YES' : '❌ NO (too far apart)'}`);
    console.log(`  Aircraft Types: ${exercise.target.type.name} vs ${exercise.intruder.type.name}`);
    console.log();
  }
}

console.log(`Found ${mixedCount} mixed VFR/IFR scenarios in ${attempts} attempts.`);
if (mixedCount === 0) {
  console.log('⚠️  No mixed scenarios found - this might indicate an issue with the aircraft selection logic.');
}