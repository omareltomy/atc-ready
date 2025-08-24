import { generateExercise } from '../lib/generator';

console.log('🔍 DIRECTION CLASSIFICATION TEST\n');

for (let i = 1; i <= 10; i++) {
  const ex = generateExercise();
  const { target, intruder } = ex;
  
  console.log(`--- Test ${i} ---`);
  console.log(`Target: ${target.callsign} at center, heading ${target.heading}°`);
  console.log(`Intruder: ${intruder.callsign} at ${ex.situation.clock} o'clock, heading ${intruder.heading}°`);
  console.log(`Classification: ${ex.situation.direction}`);
  
  // Analyze if classification makes sense
  const clock = ex.situation.clock;
  const direction = ex.situation.direction;
  
  let expectedDirection = '';
  if (clock >= 1 && clock <= 4) {
    expectedDirection = 'Should be crossing left to right (from right side)';
  } else if (clock >= 8 && clock <= 11) {
    expectedDirection = 'Should be crossing right to left (from left side)';
  } else if (clock >= 11 || clock <= 1) {
    expectedDirection = 'Should be opposite direction (from ahead)';
  } else if (clock >= 5 && clock <= 7) {
    expectedDirection = 'Should be same direction (from behind)';
  }
  
  console.log(`Analysis: ${expectedDirection}`);
  const correct = (
    (direction === 'crossing left to right' && clock >= 1 && clock <= 4) ||
    (direction === 'crossing right to left' && clock >= 8 && clock <= 11) ||
    (direction === 'opposite direction' && (clock >= 11 || clock <= 1)) ||
    (direction === 'same direction' && clock >= 5 && clock <= 7)
  );
  
  console.log(`${correct ? '✅ CORRECT' : '❌ WRONG'}\n`);
}
