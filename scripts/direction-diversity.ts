import { generateExercise } from '../lib/generator';

console.log('🔍 DIRECTION DIVERSITY TEST\n');

const directions = { 
  same: 0, 
  opposite: 0, 
  crossing: 0, 
  other: 0 
};

for (let i = 1; i <= 20; i++) {
  const ex = generateExercise();
  const direction = ex.situation.direction;
  
  if (direction.includes('same')) directions.same++;
  else if (direction.includes('opposite')) directions.opposite++;  
  else if (direction.includes('crossing')) directions.crossing++;
  else directions.other++;
  
  console.log(`${i}. ${direction}`);
}

console.log('\n--- Summary ---');
console.log(`Same direction: ${directions.same}/20 (${(directions.same/20*100).toFixed(0)}%)`);
console.log(`Opposite direction: ${directions.opposite}/20 (${(directions.opposite/20*100).toFixed(0)}%)`);
console.log(`Crossing: ${directions.crossing}/20 (${(directions.crossing/20*100).toFixed(0)}%)`);
console.log(`Other: ${directions.other}/20 (${(directions.other/20*100).toFixed(0)}%)`);

const diverse = (directions.same < 15) && (directions.opposite > 0 || directions.crossing > 0);
console.log(`\n${diverse ? '✅ GOOD DIVERSITY' : '❌ TOO UNIFORM'}`);
