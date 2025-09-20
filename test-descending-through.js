import { generateExercise } from './lib/generator.js';

console.log('Testing "descending through level" scenarios...\n');

let totalWithLevelChange = 0;
let descendingThroughCount = 0;
let descendingToSameLevelCount = 0;
let climbingThroughCount = 0;
let attempts = 0;
const maxAttempts = 200;

while (totalWithLevelChange < 20 && attempts < maxAttempts) {
  attempts++;
  const exercise = generateExercise();
  
  // Only look at scenarios with level changes
  if (exercise.intruder.levelChange) {
    totalWithLevelChange++;
    
    const targetLevel = exercise.target.level;
    const intruderCurrentLevel = exercise.intruder.level;
    const intruderNewLevel = exercise.intruder.levelChange.to;
    const direction = exercise.intruder.levelChange.dir;
    
    console.log(`\nLevel Change Test ${totalWithLevelChange}:`);
    console.log(`  Target: ${exercise.target.callsign} at ${targetLevel}ft`);
    console.log(`  Intruder: ${exercise.intruder.callsign}`);
    console.log(`  Current Level: ${intruderCurrentLevel}ft`);
    console.log(`  ${direction === '↓' ? 'Descending' : 'Climbing'} to: ${intruderNewLevel}ft`);
    console.log(`  Level Text: "${exercise.situation.level}"`);
    
    if (direction === '↓') {
      // Descending scenarios
      if (intruderCurrentLevel >= targetLevel && intruderNewLevel < targetLevel) {
        descendingThroughCount++;
        console.log(`  ✅ DESCENDING THROUGH (${intruderCurrentLevel} → ${intruderNewLevel}, target at ${targetLevel})`);
      } else if (intruderCurrentLevel > targetLevel && intruderNewLevel === targetLevel) {
        descendingToSameLevelCount++;
        console.log(`  ❌ DESCENDING TO SAME LEVEL (${intruderCurrentLevel} → ${intruderNewLevel}, target at ${targetLevel})`);
      } else {
        console.log(`  ⚠️  OTHER DESCENDING SCENARIO (${intruderCurrentLevel} → ${intruderNewLevel}, target at ${targetLevel})`);
      }
    } else {
      // Climbing scenarios
      if (intruderCurrentLevel < targetLevel && intruderNewLevel > targetLevel) {
        climbingThroughCount++;
        console.log(`  ✅ CLIMBING THROUGH (${intruderCurrentLevel} → ${intruderNewLevel}, target at ${targetLevel})`);
      } else {
        console.log(`  ⚠️  OTHER CLIMBING SCENARIO (${intruderCurrentLevel} → ${intruderNewLevel}, target at ${targetLevel})`);
      }
    }
  }
}

console.log('\n--- SUMMARY ---');
console.log(`Total scenarios with level changes: ${totalWithLevelChange} (out of ${attempts} attempts)`);
console.log(`Descending THROUGH target level: ${descendingThroughCount}`);
console.log(`Descending TO same level (PROBLEM): ${descendingToSameLevelCount}`);
console.log(`Climbing THROUGH target level: ${climbingThroughCount}`);
console.log(`\nIssue still exists: ${descendingToSameLevelCount > 0 ? '❌ YES - Some aircraft descend TO target level instead of THROUGH' : '✅ NO - All descending aircraft properly go THROUGH target level'}`);