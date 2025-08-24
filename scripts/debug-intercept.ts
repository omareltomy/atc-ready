import { generateExercise } from '../lib/generator';

console.log('🔍 DETAILED INTERCEPT ANALYSIS\n');

const ex = generateExercise();
const { target, intruder } = ex;

console.log('=== SCENARIO ===');
console.log(`Target: ${target.callsign} at (0, 0), heading ${target.heading}°, ${target.speed} kts`);
console.log(`Intruder: ${intruder.callsign} at (${intruder.position.x.toFixed(1)}, ${intruder.position.y.toFixed(1)}), heading ${intruder.heading}°, ${intruder.speed} kts`);
console.log(`Direction: ${ex.situation.direction}`);

console.log('\n=== VELOCITY VECTORS ===');
const targetVel = {
  x: Math.sin(target.heading * Math.PI / 180) * target.speed,
  y: Math.cos(target.heading * Math.PI / 180) * target.speed
};

const intruderVel = {
  x: Math.sin(intruder.heading * Math.PI / 180) * intruder.speed,
  y: Math.cos(intruder.heading * Math.PI / 180) * intruder.speed
};

console.log(`Target velocity: (${targetVel.x.toFixed(1)}, ${targetVel.y.toFixed(1)})`);
console.log(`Intruder velocity: (${intruderVel.x.toFixed(1)}, ${intruderVel.y.toFixed(1)})`);

console.log('\n=== CONVERGENCE ANALYSIS ===');
const relativeVel = { x: intruderVel.x - targetVel.x, y: intruderVel.y - targetVel.y };
const positionVector = { x: intruder.position.x, y: intruder.position.y };
const dotProduct = positionVector.x * relativeVel.x + positionVector.y * relativeVel.y;

console.log(`Relative velocity: (${relativeVel.x.toFixed(1)}, ${relativeVel.y.toFixed(1)})`);
console.log(`Position vector: (${positionVector.x.toFixed(1)}, ${positionVector.y.toFixed(1)})`);
console.log(`Dot product: ${dotProduct.toFixed(1)}`);
console.log(`Converging: ${dotProduct < 0 ? '✅ YES' : '❌ NO'}`);

if (dotProduct < 0) {
  // Calculate time to closest approach
  const relativeSpeed = Math.sqrt(relativeVel.x * relativeVel.x + relativeVel.y * relativeVel.y);
  const timeToClosest = -dotProduct / (relativeSpeed * relativeSpeed);
  const closestDistance = Math.sqrt(
    Math.pow(positionVector.x + relativeVel.x * timeToClosest, 2) +
    Math.pow(positionVector.y + relativeVel.y * timeToClosest, 2)
  );
  
  console.log(`Time to closest approach: ${(timeToClosest * 60).toFixed(1)} minutes`);
  console.log(`Closest approach distance: ${closestDistance.toFixed(1)} NM`);
}

console.log(`\nSolution: ${ex.solution}`);
