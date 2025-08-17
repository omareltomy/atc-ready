const { generateExercise } = require('../lib/generator');

function quickConvergenceTest() {
  console.log('🔍 Quick Convergence Test\n');
  
  let convergingCount = 0;
  const tests = 5;
  
  for (let i = 1; i <= tests; i++) {
    const ex = generateExercise();
    const { target, intruder } = ex;
    
    // Simple convergence check
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
    
    console.log(`Test ${i}: ${converging ? '✅ CONVERGING' : '❌ DIVERGING'}`);
    console.log(`  Target: ${target.heading}°, Intruder: ${intruder.heading}°`);
    console.log(`  Direction: ${ex.situation.direction}`);
    
    if (converging) convergingCount++;
  }
  
  console.log(`\nResult: ${convergingCount}/${tests} converging (${(convergingCount/tests*100).toFixed(0)}%)`);
  return convergingCount >= tests * 0.8; // 80% should converge
}

const passed = quickConvergenceTest();
console.log(passed ? '\n🎉 CONVERGENCE TEST PASSED!' : '\n💥 CONVERGENCE TEST FAILED!');

module.exports = { quickConvergenceTest };
