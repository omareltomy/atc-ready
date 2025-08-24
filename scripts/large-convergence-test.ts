import { generateExercise } from '../lib/generator';

console.log('🔍 LARGE SAMPLE CONVERGENCE TEST\n');

let convergingCount = 0;
let directionCounts = {
  'crossing left to right': { total: 0, converging: 0 },
  'crossing right to left': { total: 0, converging: 0 },
  'opposite direction': { total: 0, converging: 0 },
  'same direction': { total: 0, converging: 0 },
  'converging': { total: 0, converging: 0 }
};

const tests = 50;

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
  
  if (converging) convergingCount++;
  
  // Track by direction
  const direction = ex.situation.direction as keyof typeof directionCounts;
  if (directionCounts[direction]) {
    directionCounts[direction].total++;
    if (converging) directionCounts[direction].converging++;
  }
}

console.log(`Overall Result: ${convergingCount}/${tests} converging (${(convergingCount/tests*100).toFixed(0)}%)\n`);

console.log('=== BY DIRECTION ===');
for (const [dir, stats] of Object.entries(directionCounts)) {
  if (stats.total > 0) {
    const rate = (stats.converging / stats.total * 100).toFixed(0);
    console.log(`${dir}: ${stats.converging}/${stats.total} (${rate}%)`);
  }
}

const passed = convergingCount >= tests * 0.8;
console.log(passed ? '\n🎉 CONVERGENCE TEST PASSED!' : '\n💥 CONVERGENCE TEST FAILED!');
