import { generateExercise } from '../lib/generator';

function debugConvergence() {
  console.log('🔍 DETAILED CONVERGENCE DEBUG\n');
  
  const ex = generateExercise();
  const { target, intruder } = ex;
  
  console.log('Target Aircraft:');
  console.log(`  Position: (0, 0)`);
  console.log(`  Heading: ${target.heading}°`);
  console.log(`  Speed: ${target.speed} kts`);
  
  console.log('\nIntruder Aircraft:');
  console.log(`  Position: (${intruder.position.x.toFixed(1)}, ${intruder.position.y.toFixed(1)})`);
  console.log(`  Heading: ${intruder.heading}°`);
  console.log(`  Speed: ${intruder.speed} kts`);
  
  // Calculate velocity vectors
  const tVel = {
    x: Math.sin(target.heading * Math.PI / 180) * target.speed,
    y: Math.cos(target.heading * Math.PI / 180) * target.speed
  };
  
  const iVel = {
    x: Math.sin(intruder.heading * Math.PI / 180) * intruder.speed,
    y: Math.cos(intruder.heading * Math.PI / 180) * intruder.speed
  };
  
  console.log('\nVelocity Vectors:');
  console.log(`  Target velocity: (${tVel.x.toFixed(1)}, ${tVel.y.toFixed(1)})`);
  console.log(`  Intruder velocity: (${iVel.x.toFixed(1)}, ${iVel.y.toFixed(1)})`);
  
  // Relative velocity
  const relVel = { x: iVel.x - tVel.x, y: iVel.y - tVel.y };
  console.log(`  Relative velocity: (${relVel.x.toFixed(1)}, ${relVel.y.toFixed(1)})`);
  
  // Position vector
  const pos = intruder.position;
  console.log(`  Position vector: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`);
  
  // Convergence test
  const dotProduct = pos.x * relVel.x + pos.y * relVel.y;
  const converging = dotProduct < 0;
  
  console.log('\nConvergence Analysis:');
  console.log(`  Dot product: ${dotProduct.toFixed(2)}`);
  console.log(`  Converging: ${converging ? '✅ YES' : '❌ NO'}`);
  
  if (converging) {
    const relSpeed = Math.sqrt(relVel.x ** 2 + relVel.y ** 2);
    if (relSpeed > 0) {
      const timeToClosest = -dotProduct / (relSpeed ** 2);
      console.log(`  Time to closest approach: ${timeToClosest.toFixed(2)} hours`);
      
      if (timeToClosest > 0) {
        const futureRelPos = {
          x: pos.x + relVel.x * timeToClosest,
          y: pos.y + relVel.y * timeToClosest
        };
        const closestDistance = Math.sqrt(futureRelPos.x ** 2 + futureRelPos.y ** 2);
        console.log(`  Closest approach distance: ${closestDistance.toFixed(1)} NM`);
      }
    }
  }
  
  console.log(`\nSolution: "${ex.solution}"`);
}

debugConvergence();
