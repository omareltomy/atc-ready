import { generateExercise } from '../lib/generator.js';

interface TestResult {
  passed: boolean;
  errors: string[];
  scenario: any;
}

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  errors: string[];
  clockDistribution: { [key: number]: number };
  directionDistribution: { [key: string]: number };
  convergenceRate: number;
  averageDistance: number;
  speedRange: { min: number; max: number };
  altitudeRange: { min: number; max: number };
}

const ALLOWED_DIRECTIONS = [
  'crossing left to right',
  'crossing right to left',
  'converging',
  'opposite direction',
  'overtaking'
];

function calculateClockPosition(targetPos: { x: number; y: number }, intruderPos: { x: number; y: number }, targetHeading: number): number {
  const dx = intruderPos.x - targetPos.x;
  const dy = intruderPos.y - targetPos.y;
  
  // Calculate the absolute bearing from target to intruder
  let bearing = Math.atan2(dx, dy) * 180 / Math.PI;
  if (bearing < 0) bearing += 360;
  
  // Convert to relative bearing (relative to target's heading)
  let relativeBearing = bearing - targetHeading;
  while (relativeBearing < 0) relativeBearing += 360;
  while (relativeBearing >= 360) relativeBearing -= 360;
  
  // Convert to clock position (12 o'clock = 0°, 3 o'clock = 90°, etc.)
  let clock = Math.round(relativeBearing / 30);
  if (clock === 0) clock = 12;
  
  return clock;
}

function validateClockPosition(scenario: any): { valid: boolean; error?: string } {
  const actualClock = calculateClockPosition(scenario.target.position, scenario.intruder.position, scenario.target.heading);
  const reportedClock = scenario.situation.clock;
  
  // Allow ±1 clock position tolerance due to rounding
  if (Math.abs(actualClock - reportedClock) <= 1 || 
      Math.abs(actualClock - reportedClock) >= 11) { // Handle 12/1 wraparound
    return { valid: true };
  }
  
  return { 
    valid: false, 
    error: `Clock mismatch: actual ${actualClock}, reported ${reportedClock}` 
  };
}

function validateDirection(scenario: any): { valid: boolean; error?: string } {
  const target = scenario.target;
  const intruder = scenario.intruder;
  const reportedDirection = scenario.situation.direction;
  
  // Normalize headings
  const normalizeHeading = (heading: number) => {
    while (heading < 0) heading += 360;
    while (heading >= 360) heading -= 360;
    return heading;
  };
  
  const targetHdg = normalizeHeading(target.heading);
  const intruderHdg = normalizeHeading(intruder.heading);
  
  let headingDiff = Math.abs(targetHdg - intruderHdg);
  if (headingDiff > 180) headingDiff = 360 - headingDiff;
  
  // Validate based on heading difference
  if (headingDiff <= 45) {
    if (reportedDirection !== 'same direction') {
      return { 
        valid: false, 
        error: `Should be 'same direction' (diff: ${headingDiff}°), got '${reportedDirection}'` 
      };
    }
  } else if (headingDiff >= 135) {
    if (reportedDirection !== 'opposite direction') {
      return { 
        valid: false, 
        error: `Should be 'opposite direction' (diff: ${headingDiff}°), got '${reportedDirection}'` 
      };
    }
  } else {
    // Crossing traffic - validate direction
    if (!reportedDirection.includes('crossing')) {
      return { 
        valid: false, 
        error: `Should be crossing traffic (diff: ${headingDiff}°), got '${reportedDirection}'` 
      };
    }
    
    // Validate crossing direction using relative velocity
    const targetVelX = Math.sin(targetHdg * Math.PI / 180);
    const targetVelY = Math.cos(targetHdg * Math.PI / 180);
    const intruderVelX = Math.sin(intruderHdg * Math.PI / 180);
    const intruderVelY = Math.cos(intruderHdg * Math.PI / 180);
    
    const relVelX = intruderVelX - targetVelX;
    const relVelY = intruderVelY - targetVelY;
    
    const crossComponent = relVelX * Math.cos(targetHdg * Math.PI / 180) - 
                          relVelY * Math.sin(targetHdg * Math.PI / 180);
    
    const expectedDirection = crossComponent > 0 ? 'crossing left to right' : 'crossing right to left';
    
    if (reportedDirection !== expectedDirection) {
      return { 
        valid: false, 
        error: `Wrong crossing direction: expected '${expectedDirection}', got '${reportedDirection}'` 
      };
    }
  }
  
  return { valid: true };
}

function validateDirectionStrict(scenario: any): { valid: boolean; error?: string } {
  const target = scenario.target;
  const intruder = scenario.intruder;
  const reportedDirection = scenario.situation.direction;
  if (!ALLOWED_DIRECTIONS.includes(reportedDirection)) {
    return { valid: false, error: `Direction '${reportedDirection}' is not allowed.` };
  }
  // Calculate intersection angle
  const normalize = (h: number) => ((h % 360) + 360) % 360;
  const tHdg = normalize(target.heading);
  const iHdg = normalize(intruder.heading);
  let diff = Math.abs(iHdg - tHdg);
  if (diff > 180) diff = 360 - diff;
  const relAngle = (iHdg - tHdg + 360) % 360;
  // Overtaking: same direction, intruder faster
  if (reportedDirection === 'overtaking') {
    if (!(diff <= 45 && intruder.speed > target.speed)) {
      return { valid: false, error: `Not overtaking: diff=${diff}, speeds ${intruder.speed} vs ${target.speed}` };
    }
  } else if (reportedDirection === 'converging') {
    if (!(diff < 45)) {
      return { valid: false, error: `Not converging: diff=${diff}` };
    }
  } else if (reportedDirection === 'opposite direction') {
    if (!(diff > 315 || diff >= 135)) {
      return { valid: false, error: `Not opposite: diff=${diff}` };
    }
  } else if (reportedDirection === 'crossing left to right') {
    if (!(diff >= 45 && diff <= 135 && relAngle < 180)) {
      return { valid: false, error: `Not crossing left to right: diff=${diff}, relAngle=${relAngle}` };
    }
  } else if (reportedDirection === 'crossing right to left') {
    if (!(diff >= 45 && diff <= 135 && relAngle > 180)) {
      return { valid: false, error: `Not crossing right to left: diff=${diff}, relAngle=${relAngle}` };
    }
  }
  return { valid: true };
}

function validateDistance(scenario: any): { valid: boolean; error?: string } {
  const target = scenario.target;
  const intruder = scenario.intruder;
  const reportedDistance = scenario.situation.distance;
  
  const dx = intruder.position.x - target.position.x;
  const dy = intruder.position.y - target.position.y;
  const actualDistance = Math.sqrt(dx * dx + dy * dy);
  
  // Allow 20% tolerance
  const tolerance = Math.max(0.5, actualDistance * 0.2);
  
  if (Math.abs(actualDistance - reportedDistance) > tolerance) {
    return { 
      valid: false, 
      error: `Distance mismatch: actual ${actualDistance.toFixed(1)}NM, reported ${reportedDistance}NM` 
    };
  }
  
  return { valid: true };
}

function validateConvergence(scenario: any): { valid: boolean; error?: string } {
  // Simple convergence check - project positions 5 minutes forward
  const timeStep = 5 / 60; // 5 minutes in hours
  
  const targetFutureX = scenario.target.position.x + 
    Math.sin(scenario.target.heading * Math.PI / 180) * scenario.target.speed * timeStep;
  const targetFutureY = scenario.target.position.y + 
    Math.cos(scenario.target.heading * Math.PI / 180) * scenario.target.speed * timeStep;
    
  const intruderFutureX = scenario.intruder.position.x + 
    Math.sin(scenario.intruder.heading * Math.PI / 180) * scenario.intruder.speed * timeStep;
  const intruderFutureY = scenario.intruder.position.y + 
    Math.cos(scenario.intruder.heading * Math.PI / 180) * scenario.intruder.speed * timeStep;
  
  const currentDistance = Math.sqrt(
    Math.pow(scenario.intruder.position.x - scenario.target.position.x, 2) +
    Math.pow(scenario.intruder.position.y - scenario.target.position.y, 2)
  );
  
  const futureDistance = Math.sqrt(
    Math.pow(intruderFutureX - targetFutureX, 2) +
    Math.pow(intruderFutureY - targetFutureY, 2)
  );
  
  // Aircraft should be converging (getting closer) unless it's same direction overtaking
  if (scenario.situation.direction !== 'same direction' && futureDistance >= currentDistance) {
    return { 
      valid: false, 
      error: `Aircraft diverging: current ${currentDistance.toFixed(1)}NM, future ${futureDistance.toFixed(1)}NM` 
    };
  }
  
  return { valid: true };
}

function validateRealism(scenario: any): { valid: boolean; error?: string } {
  const errors: string[] = [];
  
  // Speed validation
  if (scenario.target.speed < 80 || scenario.target.speed > 600) {
    errors.push(`Unrealistic target speed: ${scenario.target.speed}kt`);
  }
  if (scenario.intruder.speed < 80 || scenario.intruder.speed > 600) {
    errors.push(`Unrealistic intruder speed: ${scenario.intruder.speed}kt`);
  }
  
  // Altitude validation
  if (scenario.target.level < 1000 || scenario.target.level > 45000) {
    errors.push(`Unrealistic target altitude: ${scenario.target.level}ft`);
  }
  if (scenario.intruder.level < 1000 || scenario.intruder.level > 45000) {
    errors.push(`Unrealistic intruder altitude: ${scenario.intruder.level}ft`);
  }
  
  // Distance validation
  if (scenario.situation.distance < 2 || scenario.situation.distance > 15) {
    errors.push(`Unrealistic distance: ${scenario.situation.distance}NM`);
  }
  
  // Heading validation
  if (scenario.target.heading < 0 || scenario.target.heading >= 360) {
    errors.push(`Invalid target heading: ${scenario.target.heading}°`);
  }
  if (scenario.intruder.heading < 0 || scenario.intruder.heading >= 360) {
    errors.push(`Invalid intruder heading: ${scenario.intruder.heading}°`);
  }
  
  return { 
    valid: errors.length === 0, 
    error: errors.length > 0 ? errors.join('; ') : undefined 
  };
}

function runComprehensiveTest(numScenarios: number = 100): TestStats {
  const results: TestResult[] = [];
  const clockDistribution: { [key: number]: number } = {};
  const directionDistribution: { [key: string]: number } = {};
  let convergentCount = 0;
  let totalDistance = 0;
  let speedMin = Infinity, speedMax = -Infinity;
  let altMin = Infinity, altMax = -Infinity;
  
  console.log(`Running comprehensive test with ${numScenarios} scenarios...\n`);
  
  for (let i = 0; i < numScenarios; i++) {
    try {
      const scenario = generateExercise();
      const errors: string[] = [];
      
      // Validate all aspects
      const clockCheck = validateClockPosition(scenario);
      if (!clockCheck.valid) errors.push(`Clock: ${clockCheck.error}`);
      
      const directionCheck = validateDirectionStrict(scenario);
      if (!directionCheck.valid) errors.push(`Direction: ${directionCheck.error}`);
      
      const distanceCheck = validateDistance(scenario);
      if (!distanceCheck.valid) errors.push(`Distance: ${distanceCheck.error}`);
      
      const convergenceCheck = validateConvergence(scenario);
      if (!convergenceCheck.valid) errors.push(`Convergence: ${convergenceCheck.error}`);
      else convergentCount++;
      
      const realismCheck = validateRealism(scenario);
      if (!realismCheck.valid) errors.push(`Realism: ${realismCheck.error}`);
      
      // Collect statistics
      clockDistribution[scenario.situation.clock] = (clockDistribution[scenario.situation.clock] || 0) + 1;
      directionDistribution[scenario.situation.direction] = (directionDistribution[scenario.situation.direction] || 0) + 1;
      totalDistance += scenario.situation.distance;
      speedMin = Math.min(speedMin, scenario.target.speed, scenario.intruder.speed);
      speedMax = Math.max(speedMax, scenario.target.speed, scenario.intruder.speed);
      altMin = Math.min(altMin, scenario.target.level, scenario.intruder.level);
      altMax = Math.max(altMax, scenario.target.level, scenario.intruder.level);
      
      results.push({
        passed: errors.length === 0,
        errors,
        scenario
      });
      
      if (errors.length > 0) {
        console.log(`❌ Scenario ${i + 1} FAILED:`);
        errors.forEach(error => console.log(`   ${error}`));
        console.log(`   Target: ${scenario.target.heading}° at ${scenario.target.position.x.toFixed(1)},${scenario.target.position.y.toFixed(1)}`);
        console.log(`   Intruder: ${scenario.intruder.heading}° at ${scenario.intruder.position.x.toFixed(1)},${scenario.intruder.position.y.toFixed(1)}`);
        console.log(`   Solution: ${scenario.solution}`);
        console.log('');
      }
      
    } catch (error) {
      console.log(`💥 Scenario ${i + 1} CRASHED: ${error}`);
      results.push({
        passed: false,
        errors: [`CRASH: ${error}`],
        scenario: null
      });
    }
  }
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const allErrors = results.flatMap(r => r.errors);
  
  const stats: TestStats = {
    total: numScenarios,
    passed,
    failed,
    errors: allErrors,
    clockDistribution,
    directionDistribution,
    convergenceRate: convergentCount / numScenarios,
    averageDistance: totalDistance / numScenarios,
    speedRange: { min: speedMin, max: speedMax },
    altitudeRange: { min: altMin, max: altMax }
  };
  
  // Print comprehensive results
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`Total scenarios: ${stats.total}`);
  console.log(`✅ Passed: ${stats.passed} (${(stats.passed/stats.total*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${stats.failed} (${(stats.failed/stats.total*100).toFixed(1)}%)`);
  console.log(`🎯 Convergence rate: ${(stats.convergenceRate*100).toFixed(1)}%`);
  console.log(`📏 Average distance: ${stats.averageDistance.toFixed(1)}NM`);
  console.log(`⚡ Speed range: ${stats.speedRange.min}-${stats.speedRange.max}kt`);
  console.log(`🛩️  Altitude range: ${stats.altitudeRange.min}-${stats.altitudeRange.max}ft\n`);
  
  console.log('🕐 CLOCK DISTRIBUTION:');
  for (let clock = 1; clock <= 12; clock++) {
    const count = clockDistribution[clock] || 0;
    const percentage = (count / stats.total * 100).toFixed(1);
    console.log(`   ${clock} o'clock: ${count} (${percentage}%)`);
  }
  
  console.log('\n🧭 DIRECTION DISTRIBUTION:');
  Object.entries(directionDistribution).forEach(([direction, count]) => {
    const percentage = (count / stats.total * 100).toFixed(1);
    console.log(`   ${direction}: ${count} (${percentage}%)`);
  });
  
  // Check direction diversity
  const missing = ALLOWED_DIRECTIONS.filter(d => !(d in directionDistribution));
  if (missing.length > 0) {
    console.log(`\n❌ MISSING DIRECTIONS: ${missing.join(', ')}`);
  }
  const minCount = Math.floor(numScenarios * 0.10);
  Object.entries(directionDistribution).forEach(([direction, count]) => {
    if (count < minCount) {
      console.log(`❌ Direction '${direction}' is underrepresented: ${count} (<${minCount})`);
    }
  });
  
  if (stats.failed > 0) {
    console.log('\n💥 FAILURE ANALYSIS:');
    const errorCounts: { [key: string]: number } = {};
    stats.errors.forEach(error => {
      const errorType = error.split(':')[0];
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });
    Object.entries(errorCounts).forEach(([errorType, count]) => {
      console.log(`   ${errorType}: ${count} failures`);
    });
  }
  
  return stats;
}

// Run the test
const testResults = runComprehensiveTest(100);

console.log('\n🏆 FINAL VERDICT:');
if (testResults.passed === testResults.total) {
  console.log('✅ ALL TESTS PASSED! Algorithm is working correctly.');
} else {
  console.log(`❌ ${testResults.failed} TESTS FAILED. Algorithm needs fixes.`);
  process.exit(1);
}
