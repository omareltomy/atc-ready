import { generateExercise } from './lib/generator.js';

console.log('Testing altitude relevance with military aircraft scenarios...\n');

let militaryCount = 0;
let attempts = 0;
const maxAttempts = 100;

while (militaryCount < 10 && attempts < maxAttempts) {
  attempts++;
  const exercise = generateExercise();
  
  const targetIsMilitary = exercise.target.isMil === true;
  const intruderIsMilitary = exercise.intruder.isMil === true;
  
  // Only show scenarios involving military aircraft
  if (targetIsMilitary || intruderIsMilitary) {
    militaryCount++;
    
    const targetAlt = exercise.target.level;
    const intruderAlt = exercise.intruder.level;
    const altitudeDiff = Math.abs(targetAlt - intruderAlt);
    
    console.log(`Military Test ${militaryCount}:`);
    console.log(`  Target: ${exercise.target.callsign} (${exercise.target.flightRule}${targetIsMilitary ? ' MIL' : ''}) - ${targetAlt}ft`);
    console.log(`  Intruder: ${exercise.intruder.callsign} (${exercise.intruder.flightRule}${intruderIsMilitary ? ' MIL' : ''}) - ${intruderAlt}ft`);
    console.log(`  Altitude Difference: ${altitudeDiff}ft`);
    console.log(`  Relevant: ${altitudeDiff <= 5000 ? '✅ YES' : '❌ NO (too far apart)'}`);
    console.log(`  Aircraft Types: ${exercise.target.type.name} vs ${exercise.intruder.type.name}`);
    console.log();
  }
}

console.log(`Found ${militaryCount} military scenarios in ${attempts} attempts.`);
if (militaryCount === 0) {
  console.log('⚠️  No military scenarios found - military aircraft might be rare or disabled.');
}