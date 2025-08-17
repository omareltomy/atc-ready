import { generateExercise } from '../lib/generator';

console.log('🛩️ Sample Traffic Information Exercises\n');

for (let i = 1; i <= 5; i++) {
  const exercise = generateExercise();
  
  console.log(`Example ${i}:`);
  console.log(`Target: ${exercise.target.callsign} (${exercise.target.isVFR ? 'VFR' : 'IFR'}) ${exercise.target.type.name}`);
  console.log(`  Position: Center (0,0) | Heading: ${exercise.target.heading}° | Level: ${exercise.target.level} ft | Speed: ${exercise.target.speed} kts`);
  
  console.log(`Intruder: ${exercise.intruder.callsign} (${exercise.intruder.isVFR ? 'VFR' : 'IFR'}) ${exercise.intruder.type.name}`);
  console.log(`  Position: (${exercise.intruder.position.x.toFixed(1)}, ${exercise.intruder.position.y.toFixed(1)}) | Heading: ${exercise.intruder.heading}° | Level: ${exercise.intruder.level} ft | Speed: ${exercise.intruder.speed} kts`);
  
  if (exercise.intruder.levelChange) {
    console.log(`  Level Change: ${exercise.intruder.levelChange.dir} to ${exercise.intruder.levelChange.to} ft`);
  }
  
  console.log(`Solution: "${exercise.solution}"`);
  console.log('---');
}
