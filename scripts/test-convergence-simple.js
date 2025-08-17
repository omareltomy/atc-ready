// Simple convergence test without TypeScript dependencies
const { generateExercise } = require('../lib/generator.ts');

function testConvergence() {
  console.log('🔍 Testing Aircraft Convergence...\n');
  
  let convergingCount = 0;
  const testCount = 10;
  
  for (let i = 1; i <= testCount; i++) {
    try {
      const exercise = generateExercise();
      const { target, intruder } = exercise;
      
      // Calculate if aircraft are converging
      const targetVel = {
        x: Math.sin(target.heading * Math.PI / 180) * target.speed,
        y: Math.cos(target.heading * Math.PI / 180) * target.speed
      };
      
      const intruderVel = {
        x: Math.sin(intruder.heading * Math.PI / 180) * intruder.speed,
        y: Math.cos(intruder.heading * Math.PI / 180) * intruder.speed
      };
      
      // Relative velocity
      const relVel = {
        x: intruderVel.x - targetVel.x,
        y: intruderVel.y - targetVel.y
      };
      
      // Position vector (target to intruder)
      const posVec = { x: intruder.position.x, y: intruder.position.y };
      
      // Dot product test for convergence
      const dotProduct = posVec.x * relVel.x + posVec.y * relVel.y;
      const isConverging = dotProduct < 0;
      
      console.log(`Test ${i}:`);
      console.log(`  Target: ${target.heading}° at ${target.speed}kts`);
      console.log(`  Intruder: ${intruder.heading}° at ${intruder.speed}kts`);
      console.log(`  Distance: ${Math.sqrt(posVec.x**2 + posVec.y**2).toFixed(1)} NM`);
      console.log(`  Converging: ${isConverging ? '✅ YES' : '❌ NO'}`);
      
      if (isConverging) convergingCount++;
      
    } catch (error) {
      console.log(`❌ Test ${i} failed: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Results: ${convergingCount}/${testCount} scenarios converging`);
  
  if (convergingCount < testCount * 0.7) {
    console.log('❌ FAILED: Too many diverging scenarios!');
  } else {
    console.log('✅ PASSED: Most scenarios show convergence');
  }
}

testConvergence();
