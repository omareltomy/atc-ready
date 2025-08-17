import { generateExercise } from '../lib/generator';

interface ConvergenceResult {
  isConverging: boolean;
  closestApproachDistance: number;
  timeToClosestApproach: number;
  currentDistance: number;
}

function analyzeConvergence(exercise: any): ConvergenceResult {
  const { target, intruder } = exercise;
  
  // Calculate current positions (target at origin)
  const targetPos = { x: 0, y: 0 };
  const intruderPos = { x: intruder.position.x, y: intruder.position.y };
  
  // Calculate velocity vectors (NM per hour)
  const targetVel = {
    x: Math.sin(target.heading * Math.PI / 180) * target.speed,
    y: Math.cos(target.heading * Math.PI / 180) * target.speed
  };
  
  const intruderVel = {
    x: Math.sin(intruder.heading * Math.PI / 180) * intruder.speed,
    y: Math.cos(intruder.heading * Math.PI / 180) * intruder.speed
  };
  
  // Relative velocity (intruder relative to target)
  const relVel = {
    x: intruderVel.x - targetVel.x,
    y: intruderVel.y - targetVel.y
  };
  
  // Current relative position vector
  const relPos = {
    x: intruderPos.x - targetPos.x,
    y: intruderPos.y - targetPos.y
  };
  
  const currentDistance = Math.sqrt(relPos.x ** 2 + relPos.y ** 2);
  const relativeSpeed = Math.sqrt(relVel.x ** 2 + relVel.y ** 2);
  
  // Check if converging using dot product
  const dotProduct = relPos.x * relVel.x + relPos.y * relVel.y;
  const isConverging = dotProduct < 0; // Negative means getting closer
  
  // Calculate closest point of approach (CPA)
  let timeToClosestApproach = 0;
  let closestApproachDistance = currentDistance;
  
  if (relativeSpeed > 0.1) { // Avoid division by zero
    timeToClosestApproach = -dotProduct / (relativeSpeed ** 2);
    
    if (timeToClosestApproach > 0) {
      // Project positions to closest approach time
      const futureRelPos = {
        x: relPos.x + relVel.x * timeToClosestApproach,
        y: relPos.y + relVel.y * timeToClosestApproach
      };
      closestApproachDistance = Math.sqrt(futureRelPos.x ** 2 + futureRelPos.y ** 2);
    }
  }
  
  return {
    isConverging,
    closestApproachDistance,
    timeToClosestApproach,
    currentDistance
  };
}

console.log('🔍 CONVERGENCE VALIDATION TESTS\n');

let convergingCount = 0;
let meaningfulTrafficCount = 0;
let testCount = 20;

console.log(`Testing ${testCount} scenarios for realistic convergence...\n`);

for (let i = 1; i <= testCount; i++) {
  const exercise = generateExercise();
  const convergence = analyzeConvergence(exercise);
  
  console.log(`Test ${i}:`);
  console.log(`  Target: ${exercise.target.callsign} (${exercise.target.heading}°, ${exercise.target.speed}kts)`);
  console.log(`  Intruder: ${exercise.intruder.callsign} (${exercise.intruder.heading}°, ${exercise.intruder.speed}kts)`);
  console.log(`  Current Distance: ${convergence.currentDistance.toFixed(1)} NM`);
  console.log(`  Converging: ${convergence.isConverging ? '✅ YES' : '❌ NO - DIVERGING!'}`);
  
  if (convergence.isConverging) {
    convergingCount++;
    console.log(`  Closest Approach: ${convergence.closestApproachDistance.toFixed(1)} NM in ${convergence.timeToClosestApproach.toFixed(1)} hours`);
    
    if (convergence.closestApproachDistance < 10 && convergence.timeToClosestApproach < 0.5) {
      meaningfulTrafficCount++;
      console.log(`  ⚠️  SIGNIFICANT TRAFFIC - Will approach within 10 NM in 30 minutes`);
    } else {
      console.log(`  ℹ️  Distant convergence - minimal traffic significance`);
    }
  } else {
    console.log(`  ❌ DIVERGING - Aircraft are flying away from each other!`);
  }
  
  console.log('---');
}

console.log(`\n📊 RESULTS:`);
console.log(`  Converging scenarios: ${convergingCount}/${testCount} (${(convergingCount/testCount*100).toFixed(1)}%)`);
console.log(`  Meaningful traffic: ${meaningfulTrafficCount}/${testCount} (${(meaningfulTrafficCount/testCount*100).toFixed(1)}%)`);
console.log(`  Diverging scenarios: ${testCount - convergingCount}/${testCount} (${((testCount - convergingCount)/testCount*100).toFixed(1)}%)`);

// Test validation
const convergenceRate = convergingCount / testCount;
const meaningfulRate = meaningfulTrafficCount / testCount;

console.log(`\n🧪 TEST RESULTS:`);

if (convergenceRate < 0.7) {
  console.log(`❌ FAIL: Only ${(convergenceRate*100).toFixed(1)}% converging - should be at least 70%`);
} else {
  console.log(`✅ PASS: ${(convergenceRate*100).toFixed(1)}% converging scenarios`);
}

if (meaningfulRate < 0.4) {
  console.log(`❌ FAIL: Only ${(meaningfulRate*100).toFixed(1)}% meaningful traffic - should be at least 40%`);
} else {
  console.log(`✅ PASS: ${(meaningfulRate*100).toFixed(1)}% meaningful traffic scenarios`);
}

if (convergenceRate >= 0.7 && meaningfulRate >= 0.4) {
  console.log(`\n🎉 OVERALL: TESTS PASSED - Realistic traffic scenarios being generated`);
} else {
  console.log(`\n💥 OVERALL: TESTS FAILED - Need to fix convergence logic!`);
}

export { analyzeConvergence };
