import { generateExercise } from '../lib/generator';

console.log('🔍 MULTI-DEBUG: 5 scenarios');

for (let i = 1; i <= 5; i++) {
  const ex = generateExercise();
  const { target, intruder } = ex;
  
  // Calculate convergence like the test
  const tVel = {
    x: Math.sin(target.heading * Math.PI / 180) * target.speed,
    y: Math.cos(target.heading * Math.PI / 180) * target.speed
  };
  
  const iVel = {
    x: Math.sin(intruder.heading * Math.PI / 180) * intruder.speed,
    y: Math.cos(intruder.heading * Math.PI / 180) * intruder.speed
  };
  
  const relVel = { x: iVel.x - tVel.x, y: iVel.y - tVel.y };
  const pos = intruder.position;
  const dotProduct = pos.x * relVel.x + pos.y * relVel.y;
  const converging = dotProduct < 0;
  
  console.log(`\n--- Scenario ${i} ---`);
  console.log(`Target: ${target.heading.toFixed(1)}°, ${target.speed} kts`);
  console.log(`Intruder: ${intruder.heading.toFixed(1)}°, ${intruder.speed} kts`);
  console.log(`Position: (${intruder.position.x.toFixed(1)}, ${intruder.position.y.toFixed(1)})`);
  console.log(`Dot product: ${dotProduct.toFixed(1)}`);
  console.log(`Result: ${converging ? '✅ CONVERGING' : '❌ DIVERGING'}`);
  console.log(`Direction: ${ex.situation.direction}`);
}
