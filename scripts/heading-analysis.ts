import { generateExercise } from '../lib/generator';

console.log('🔍 HEADING ANALYSIS: Before/After Convergence Correction\n');

// Let me temporarily modify the generator to see what happens
// Create a custom version that shows before/after

function customGenerate() {
  // Simulate the target
  const target = {
    heading: 90, // Fixed for testing
    speed: 150,
    position: { x: 0, y: 0 }
  };
  
  console.log(`Target: ${target.heading}°, ${target.speed} kts\n`);
  
  // Test each scenario type
  const scenarios = [
    { name: "Perpendicular Right", heading: (90 + 90) % 360, type: "crossing" },
    { name: "Perpendicular Left", heading: (90 - 90 + 360) % 360, type: "crossing" },
    { name: "Head-On", heading: (90 + 180) % 360, type: "opposite" },
    { name: "Oblique 45°", heading: (90 + 45) % 360, type: "crossing" },
    { name: "Same Direction", heading: (90 + 10) % 360, type: "same" }
  ];
  
  scenarios.forEach(scenario => {
    console.log(`--- ${scenario.name} ---`);
    console.log(`Initial heading: ${scenario.heading}° (${scenario.type})`);
    
    // Simulate convergence check
    const distance = 8;
    const intruderPos = { x: 0, y: distance }; // North of target
    
    const targetVel = {
      x: Math.sin(target.heading * Math.PI / 180) * target.speed,
      y: Math.cos(target.heading * Math.PI / 180) * target.speed
    };
    
    const intruderSpeed = 180;
    const intruderVel = {
      x: Math.sin(scenario.heading * Math.PI / 180) * intruderSpeed,
      y: Math.cos(scenario.heading * Math.PI / 180) * intruderSpeed
    };
    
    const relativeVel = {
      x: intruderVel.x - targetVel.x,
      y: intruderVel.y - targetVel.y
    };
    
    const dotProduct = (intruderPos.x * relativeVel.x) + (intruderPos.y * relativeVel.y);
    const converging = dotProduct < 0;
    
    console.log(`Dot product: ${dotProduct.toFixed(1)}`);
    console.log(`Converging: ${converging ? '✅ YES' : '❌ NO'}`);
    
    if (!converging) {
      console.log(`→ Would be corrected to ensure convergence`);
    }
    
    console.log('');
  });
}

customGenerate();
