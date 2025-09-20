import { generateExercise } from './lib/generator.js';

console.log('Testing distance accuracy after fix...\n');

for (let i = 0; i < 10; i++) {
  const exercise = generateExercise();
  
  // Calculate actual distance between aircraft
  const dx = exercise.intruder.position.x - exercise.target.position.x;
  const dy = exercise.intruder.position.y - exercise.target.position.y;
  const actualDistance = Math.sqrt(dx * dx + dy * dy);
  const reportedDistance = exercise.situation.distance;
  
  console.log(`Test ${i + 1}:`);
  console.log(`  Reported: ${reportedDistance} miles`);
  console.log(`  Actual: ${actualDistance.toFixed(2)} miles`);
  console.log(`  Rounded Actual: ${Math.round(actualDistance)} miles`);
  console.log(`  Match: ${reportedDistance === Math.round(actualDistance) ? '✅' : '❌'}`);
  console.log(`  Direction: ${exercise.situation.direction}`);
  console.log(`  Clock: ${exercise.situation.clock} o'clock`);
  console.log();
}