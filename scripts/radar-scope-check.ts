import { generateExercise } from '../lib/generator';

console.log('🎯 RADAR SCOPE CHECK: Verifying aircraft positions\n');

for (let i = 1; i <= 5; i++) {
  const ex = generateExercise();
  const { target, intruder } = ex;
  
  // Calculate distance from center (target is at 0,0)
  const distance = Math.sqrt(intruder.position.x ** 2 + intruder.position.y ** 2);
  const withinScope = distance <= 10; // Radar shows ~10-12NM max
  
  console.log(`--- Scenario ${i} ---`);
  console.log(`Intruder position: (${intruder.position.x.toFixed(1)}, ${intruder.position.y.toFixed(1)})`);
  console.log(`Distance from center: ${distance.toFixed(1)} NM`);
  console.log(`Within radar scope: ${withinScope ? '✅ YES' : '❌ NO (TOO FAR)'}`);
  console.log(`Clock position: ${ex.situation.clock} o'clock, ${ex.situation.distance} miles`);
  console.log(`Solution: ${ex.solution.slice(0, 60)}...`);
  console.log('');
}
