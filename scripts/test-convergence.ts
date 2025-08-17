import { generateExercise } from '../lib/generator';

console.log('🎯 Testing Convergence Logic - Ensuring Realistic Traffic Scenarios\n');

function calculateConvergence(exercise: any) {
  const { target, intruder } = exercise;
  
  // Calculate velocity vectors
  const targetVel = {
    x: Math.sin(target.heading * Math.PI / 180) * target.speed,
    y: Math.cos(target.heading * Math.PI / 180) * target.speed
  };
  
  const intruderVel = {
    x: Math.sin(intruder.heading * Math.PI / 180) * intruder.speed,
    y: Math.cos(intruder.heading * Math.PI / 180) * intruder.speed
  };
  
  // Relative velocity (intruder relative to target)
  const relativeVel = {
    x: intruderVel.x - targetVel.x,
    y: intruderVel.y - targetVel.y
  };
  
  // Position vector (target to intruder)
  const posVec = { x: intruder.position.x, y: intruder.position.y };
  
  // Dot product to check convergence
  const dotProduct = (posVec.x * relativeVel.x) + (posVec.y * relativeVel.y);
  const isConverging = dotProduct < 0;
  
  // Calculate closest point of approach (CPA)
  const currentDistance = Math.sqrt(posVec.x ** 2 + posVec.y ** 2);
  const relativeSpeed = Math.sqrt(relativeVel.x ** 2 + relativeVel.y ** 2);
  
  let timeToClosest = 0;
  let closestDistance = currentDistance;
  
  if (relativeSpeed > 0) {
    timeToClosest = -dotProduct / (relativeSpeed ** 2);
    if (timeToClosest > 0) {
      const futureTargetPos = {
        x: target.position.x + targetVel.x * timeToClosest / 60, // Convert to minutes
        y: target.position.y + targetVel.y * timeToClosest / 60
      };
      const futureIntruderPos = {
        x: intruder.position.x + intruderVel.x * timeToClosest / 60,
        y: intruder.position.y + intruderVel.y * timeToClosest / 60
      };
      closestDistance = Math.sqrt(
        (futureIntruderPos.x - futureTargetPos.x) ** 2 + 
        (futureIntruderPos.y - futureTargetPos.y) ** 2
      );
    }
  }
  
  return {
    isConverging,
    currentDistance,
    closestDistance,
    timeToClosest: Math.max(0, timeToClosest),
    relativeSpeed
  };
}

console.log('Testing 10 scenarios for convergence...\n');

let convergingCount = 0;
let meaningfulTrafficCount = 0;

for (let i = 1; i <= 10; i++) {
  const exercise = generateExercise();
  const convergence = calculateConvergence(exercise);
  
  console.log(`Scenario ${i}:`);
  console.log(`  Target: ${exercise.target.callsign} (${exercise.target.heading}°, ${exercise.target.speed}kts)`);
  console.log(`  Intruder: ${exercise.intruder.callsign} (${exercise.intruder.heading}°, ${exercise.intruder.speed}kts)`);
  console.log(`  Current Distance: ${convergence.currentDistance.toFixed(1)} NM`);
  console.log(`  Converging: ${convergence.isConverging ? '✅ YES' : '❌ NO'}`);
  
  if (convergence.isConverging) {
    convergingCount++;
    console.log(`  Closest Approach: ${convergence.closestDistance.toFixed(1)} NM in ${convergence.timeToClosest.toFixed(1)} minutes`);
    
    if (convergence.closestDistance < 5) { // Within 5 NM CPA
      meaningfulTrafficCount++;
      console.log(`  ⚠️  SIGNIFICANT TRAFFIC - Close approach expected!`);
    }
  } else {
    console.log(`  ⚠️  DIVERGING - Aircraft will not approach each other`);
  }
  
  console.log(`  Solution: "${exercise.solution}"`);
  console.log('---');
}

console.log(`\n📊 Results:`);
console.log(`  Converging scenarios: ${convergingCount}/10 (${convergingCount * 10}%)`);
console.log(`  Meaningful traffic: ${meaningfulTrafficCount}/10 (${meaningfulTrafficCount * 10}%)`);

if (convergingCount < 7) {
  console.log(`\n⚠️  WARNING: Too many diverging scenarios! Need to improve convergence logic.`);
} else {
  console.log(`\n✅ Good: Most scenarios involve converging or meaningful traffic patterns.`);
}
