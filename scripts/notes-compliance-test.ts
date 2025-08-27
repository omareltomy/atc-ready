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
  directionDistribution: { [key: string]: number };
  clockPositionValidation: { [key: string]: { expected: number[], actual: number[] } };
  distanceValidation: { [key: string]: { expected: [number, number], actual: number[] } };
  convergenceAngleValidation: { [key: string]: { expected: string, actual: number[] } };
  intersectionDistanceRange: number[];
  intersectionSymmetry: number[];
}

function calculateClockPosition(targetPos: { x: number; y: number }, intruderPos: { x: number; y: number }, targetHeading: number): number {
  const dx = intruderPos.x - targetPos.x;
  const dy = intruderPos.y - targetPos.y;
  
  let bearing = Math.atan2(dx, dy) * 180 / Math.PI;
  if (bearing < 0) bearing += 360;
  
  let relativeBearing = bearing - targetHeading;
  while (relativeBearing < 0) relativeBearing += 360;
  while (relativeBearing >= 360) relativeBearing -= 360;
  
  let clock = Math.round(relativeBearing / 30);
  if (clock === 0) clock = 12;
  
  return clock;
}

function calculateConvergenceAngle(targetHeading: number, intruderHeading: number): number {
  const normalize = (h: number) => ((h % 360) + 360) % 360;
  const tHdg = normalize(targetHeading);
  const iHdg = normalize(intruderHeading);
  let diff = Math.abs(iHdg - tHdg);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function calculateIntersectionPoint(target: any, intruder: any): { distance: number; targetDist: number; intruderDist: number; symmetry: number } | null {
  // Calculate intersection using parametric line equations
  const t1x = target.position.x;
  const t1y = target.position.y;
  const t1dx = Math.sin(target.heading * Math.PI / 180);
  const t1dy = Math.cos(target.heading * Math.PI / 180);
  
  const t2x = intruder.position.x;
  const t2y = intruder.position.y;
  const t2dx = Math.sin(intruder.heading * Math.PI / 180);
  const t2dy = Math.cos(intruder.heading * Math.PI / 180);
  
  // Solve for intersection: t1 + s1*d1 = t2 + s2*d2
  const det = t1dx * t2dy - t1dy * t2dx;
  if (Math.abs(det) < 0.001) return null; // Parallel lines
  
  const s1 = ((t2x - t1x) * t2dy - (t2y - t1y) * t2dx) / det;
  const s2 = ((t2x - t1x) * t1dy - (t2y - t1y) * t1dx) / det;
  
  if (s1 < 0 || s2 < 0) return null; // Intersection is behind aircraft
  
  const intersectionX = t1x + s1 * t1dx;
  const intersectionY = t1y + s1 * t1dy;
  
  const targetDist = Math.sqrt(Math.pow(intersectionX - t1x, 2) + Math.pow(intersectionY - t1y, 2));
  const intruderDist = Math.sqrt(Math.pow(intersectionX - t2x, 2) + Math.pow(intersectionY - t2y, 2));
  const distance = Math.sqrt(intersectionX * intersectionX + intersectionY * intersectionY);
  
  const symmetry = Math.abs(targetDist - intruderDist);
  
  return { distance, targetDist, intruderDist, symmetry };
}

function validateDirectionRequirements(scenario: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const direction = scenario.situation.direction;
  const clock = scenario.situation.clock;
  const distance = scenario.situation.distance;
  const convergenceAngle = calculateConvergenceAngle(scenario.target.heading, scenario.intruder.heading);
  const actualClock = calculateClockPosition(scenario.target.position, scenario.intruder.position, scenario.target.heading);
  
  switch (direction) {
    case 'crossing left to right':
      // Clock position should be 10 or 11
      if (actualClock !== 10 && actualClock !== 11) {
        errors.push(`Crossing L2R: Clock should be 10 or 11, got ${actualClock}`);
      }
      // Distance between 3 and 8 miles
      if (distance < 3 || distance > 8) {
        errors.push(`Crossing L2R: Distance should be 3-8NM, got ${distance}NM`);
      }
      // Angle of convergence between 55° and 125°
      if (convergenceAngle < 55 || convergenceAngle > 125) {
        errors.push(`Crossing L2R: Convergence angle should be 55-125°, got ${convergenceAngle}°`);
      }
      break;
      
    case 'crossing right to left':
      // Clock position should be 1 or 2
      if (actualClock !== 1 && actualClock !== 2) {
        errors.push(`Crossing R2L: Clock should be 1 or 2, got ${actualClock}`);
      }
      // Distance between 3 and 8 miles
      if (distance < 3 || distance > 8) {
        errors.push(`Crossing R2L: Distance should be 3-8NM, got ${distance}NM`);
      }
      // Angle of convergence between 55° and 125°
      if (convergenceAngle < 55 || convergenceAngle > 125) {
        errors.push(`Crossing R2L: Convergence angle should be 55-125°, got ${convergenceAngle}°`);
      }
      break;
      
    case 'converging':
      // Clock position should be 2, 3, 9, or 10
      if (![2, 3, 9, 10].includes(actualClock)) {
        errors.push(`Converging: Clock should be 2, 3, 9, or 10, got ${actualClock}`);
      }
      // Distance between 2 and 5 miles
      if (distance < 2 || distance > 5) {
        errors.push(`Converging: Distance should be 2-5NM, got ${distance}NM`);
      }
      // Angle of convergence less than 40°
      if (convergenceAngle >= 40) {
        errors.push(`Converging: Convergence angle should be <40°, got ${convergenceAngle}°`);
      }
      break;
      
    case 'opposite direction':
      // Clock position should be 12 (with 10° tolerance)
      if (actualClock !== 12) {
        errors.push(`Opposite: Clock should be 12, got ${actualClock}`);
      }
      // Distance between 4 and 9 miles
      if (distance < 4 || distance > 9) {
        errors.push(`Opposite: Distance should be 4-9NM, got ${distance}NM`);
      }
      // Angle of convergence should NOT be less than 170°
      if (convergenceAngle < 170) {
        errors.push(`Opposite: Convergence angle should be ≥170°, got ${convergenceAngle}°`);
      }
      break;
      
    case 'overtaking':
      // Clock position should be 5, 6, or 7
      if (![5, 6, 7].includes(actualClock)) {
        errors.push(`Overtaking: Clock should be 5, 6, or 7, got ${actualClock}`);
      }
      // Distance between 2 and 6 miles
      if (distance < 2 || distance > 6) {
        errors.push(`Overtaking: Distance should be 2-6NM, got ${distance}NM`);
      }
      // Should be same direction with intruder faster
      if (convergenceAngle > 45) {
        errors.push(`Overtaking: Should be same direction (≤45°), got ${convergenceAngle}°`);
      }
      if (scenario.intruder.speed <= scenario.target.speed) {
        errors.push(`Overtaking: Intruder should be faster (${scenario.intruder.speed}kt vs ${scenario.target.speed}kt)`);
      }
      break;
      
    default:
      errors.push(`Unknown direction: ${direction}`);
  }
  
  return { valid: errors.length === 0, errors };
}

function validateIntersectionRequirements(scenario: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const intersection = calculateIntersectionPoint(scenario.target, scenario.intruder);
  
  if (!intersection) {
    errors.push('No intersection point found - aircraft paths do not cross');
    return { valid: false, errors };
  }
  
  // Intersection point should be between 2 and 6 miles from center
  if (intersection.distance < 2 || intersection.distance > 6) {
    errors.push(`Intersection distance should be 2-6NM from center, got ${intersection.distance.toFixed(1)}NM`);
  }
  
  // Intersection should be ±2 miles the same distance from each aircraft
  if (intersection.symmetry > 2) {
    errors.push(`Intersection asymmetry too high: ${intersection.symmetry.toFixed(1)}NM (target: ${intersection.targetDist.toFixed(1)}NM, intruder: ${intersection.intruderDist.toFixed(1)}NM)`);
  }
  
  // For opposite direction, intersection should be halfway
  if (scenario.situation.direction === 'opposite direction') {
    const halfwayTolerance = 1.5; // More realistic tolerance
    if (intersection.symmetry > halfwayTolerance) {
      errors.push(`Opposite direction: Intersection should be halfway between aircraft, asymmetry: ${intersection.symmetry.toFixed(1)}NM`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

function validateAircraftData(scenario: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check callsign format (more lenient)
  const targetCallsign = scenario.target.callsign;
  const intruderCallsign = scenario.intruder.callsign;
  
  // Validate target callsign
  const isValidCallsign = (callsign: string): boolean => {
    // Airlines: 3 letters + numbers (e.g., KLM1234)
    if (/^[A-Z]{3}\d{3,4}$/.test(callsign)) return true;
    // Military: Word + numbers (e.g., FALCON12)
    if (/^[A-Z]{4,8}\d{1,2}$/.test(callsign)) return true;
    // GA: Various patterns (N123AB, G-123, D-E123, etc.)
    if (/^N\d{3}[A-Z]{2}$/.test(callsign)) return true; // N123AB
    if (/^[A-Z]-\d{3}$/.test(callsign)) return true; // G-123, F-123, etc.
    if (/^[A-Z]{2}\d{3}$/.test(callsign)) return true; // PH123, OO123
    if (/^[A-Z]-[A-Z]\d{3}$/.test(callsign)) return true; // D-E123
    if (/^[A-Z]\d{3}$/.test(callsign)) return true; // C123
    return false;
  };
  
  if (!isValidCallsign(targetCallsign)) {
    errors.push(`Invalid target callsign format: ${targetCallsign}`);
  }
  if (!isValidCallsign(intruderCallsign)) {
    errors.push(`Invalid intruder callsign format: ${intruderCallsign}`);
  }
  
  // Check aircraft type is abbreviated (should be 4 characters or less)
  if (scenario.target.type.type && scenario.target.type.type.length > 4) {
    errors.push(`Target aircraft type too long (should be abbreviated): ${scenario.target.type.type}`);
  }
  if (scenario.intruder.type.type && scenario.intruder.type.type.length > 4) {
    errors.push(`Intruder aircraft type too long (should be abbreviated): ${scenario.intruder.type.type}`);
  }
  
  // Check flight levels are rounded to nearest 10
  if (scenario.target.level % 10 !== 0) {
    errors.push(`Target level not rounded to nearest 10: ${scenario.target.level}ft`);
  }
  if (scenario.intruder.level % 10 !== 0) {
    errors.push(`Intruder level not rounded to nearest 10: ${scenario.intruder.level}ft`);
  }
  
  // Check level change is rounded to nearest 10
  if (scenario.target.levelChange && scenario.target.levelChange.to % 10 !== 0) {
    errors.push(`Target level change not rounded to nearest 10: ${scenario.target.levelChange.to}ft`);
  }
  if (scenario.intruder.levelChange && scenario.intruder.levelChange.to % 10 !== 0) {
    errors.push(`Intruder level change not rounded to nearest 10: ${scenario.intruder.levelChange.to}ft`);
  }
  
  return { valid: errors.length === 0, errors };
}

function validateDirectionDistribution(directionCounts: { [key: string]: number }, total: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Expected percentages from notes
  const expectedDistribution = {
    'crossing left to right': 28,
    'crossing right to left': 28,
    'converging': 28,
    'opposite direction': 11,
    'overtaking': 5
  };
  
  // Allow ±5% tolerance
  const tolerance = 5;
  
  Object.entries(expectedDistribution).forEach(([direction, expectedPercent]) => {
    const actualCount = directionCounts[direction] || 0;
    const actualPercent = (actualCount / total) * 100;
    
    if (Math.abs(actualPercent - expectedPercent) > tolerance) {
      errors.push(`Direction '${direction}': expected ${expectedPercent}%, got ${actualPercent.toFixed(1)}% (${actualCount}/${total})`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

function runNotesComplianceTest(numScenarios: number = 1000): TestStats {
  const results: TestResult[] = [];
  const directionDistribution: { [key: string]: number } = {};
  const clockPositionValidation: { [key: string]: { expected: number[], actual: number[] } } = {};
  const distanceValidation: { [key: string]: { expected: [number, number], actual: number[] } } = {};
  const convergenceAngleValidation: { [key: string]: { expected: string, actual: number[] } } = {};
  const intersectionDistanceRange: number[] = [];
  const intersectionSymmetry: number[] = [];
  
  console.log(`🧪 Running Notes Compliance Test with ${numScenarios} scenarios...\n`);
  
  for (let i = 0; i < numScenarios; i++) {
    try {
      const scenario = generateExercise();
      const errors: string[] = [];
      
      // Validate direction requirements
      const directionCheck = validateDirectionRequirements(scenario);
      if (!directionCheck.valid) {
        errors.push(...directionCheck.errors);
      }
      
      // Validate intersection requirements
      const intersectionCheck = validateIntersectionRequirements(scenario);
      if (!intersectionCheck.valid) {
        errors.push(...intersectionCheck.errors);
      }
      
      // Validate aircraft data
      const aircraftCheck = validateAircraftData(scenario);
      if (!aircraftCheck.valid) {
        errors.push(...aircraftCheck.errors);
      }
      
      // Collect statistics
      const direction = scenario.situation.direction;
      directionDistribution[direction] = (directionDistribution[direction] || 0) + 1;
      
      // Track clock positions per direction
      if (!clockPositionValidation[direction]) {
        clockPositionValidation[direction] = { expected: [], actual: [] };
      }
      const actualClock = calculateClockPosition(scenario.target.position, scenario.intruder.position, scenario.target.heading);
      clockPositionValidation[direction].actual.push(actualClock);
      
      // Track distances per direction
      if (!distanceValidation[direction]) {
        distanceValidation[direction] = { expected: [0, 0], actual: [] };
      }
      distanceValidation[direction].actual.push(scenario.situation.distance);
      
      // Track convergence angles per direction
      if (!convergenceAngleValidation[direction]) {
        convergenceAngleValidation[direction] = { expected: '', actual: [] };
      }
      const convergenceAngle = calculateConvergenceAngle(scenario.target.heading, scenario.intruder.heading);
      convergenceAngleValidation[direction].actual.push(convergenceAngle);
      
      // Track intersection data
      const intersection = calculateIntersectionPoint(scenario.target, scenario.intruder);
      if (intersection) {
        intersectionDistanceRange.push(intersection.distance);
        intersectionSymmetry.push(intersection.symmetry);
      }
      
      results.push({
        passed: errors.length === 0,
        errors,
        scenario
      });
      
      if (errors.length > 0) {
        console.log(`❌ Scenario ${i + 1} FAILED:`);
        errors.forEach(error => console.log(`   ${error}`));
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
  
  // Validate overall distribution
  const distributionCheck = validateDirectionDistribution(directionDistribution, numScenarios);
  if (!distributionCheck.valid) {
    allErrors.push(...distributionCheck.errors);
  }
  
  const stats: TestStats = {
    total: numScenarios,
    passed,
    failed,
    errors: allErrors,
    directionDistribution,
    clockPositionValidation,
    distanceValidation,
    convergenceAngleValidation,
    intersectionDistanceRange,
    intersectionSymmetry
  };
  
  // Print comprehensive results
  console.log('📊 NOTES COMPLIANCE TEST RESULTS');
  console.log('=================================');
  console.log(`Total scenarios: ${stats.total}`);
  console.log(`✅ Passed: ${stats.passed} (${(stats.passed/stats.total*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${stats.failed} (${(stats.failed/stats.total*100).toFixed(1)}%)\n`);
  
  console.log('🧭 DIRECTION DISTRIBUTION ANALYSIS:');
  const expectedDistribution = {
    'crossing left to right': 28,
    'crossing right to left': 28,
    'converging': 28,
    'opposite direction': 11,
    'overtaking': 5
  };
  
  Object.entries(expectedDistribution).forEach(([direction, expectedPercent]) => {
    const actualCount = directionDistribution[direction] || 0;
    const actualPercent = (actualCount / stats.total) * 100;
    const status = Math.abs(actualPercent - expectedPercent) <= 5 ? '✅' : '❌';
    console.log(`   ${status} ${direction}: ${actualCount} (${actualPercent.toFixed(1)}%) - Expected: ${expectedPercent}%`);
  });
  
  console.log('\n🕐 CLOCK POSITION ANALYSIS BY DIRECTION:');
  Object.entries(clockPositionValidation).forEach(([direction, data]) => {
    const uniqueClocks = [...new Set(data.actual)].sort((a, b) => a - b);
    console.log(`   ${direction}: Clock positions used: ${uniqueClocks.join(', ')}`);
  });
  
  console.log('\n📏 DISTANCE ANALYSIS BY DIRECTION:');
  Object.entries(distanceValidation).forEach(([direction, data]) => {
    const distances = data.actual;
    const min = Math.min(...distances);
    const max = Math.max(...distances);
    const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
    console.log(`   ${direction}: ${min.toFixed(1)}-${max.toFixed(1)}NM (avg: ${avg.toFixed(1)}NM)`);
  });
  
  console.log('\n🎯 INTERSECTION ANALYSIS:');
  if (intersectionDistanceRange.length > 0) {
    const minIntersection = Math.min(...intersectionDistanceRange);
    const maxIntersection = Math.max(...intersectionDistanceRange);
    const avgIntersection = intersectionDistanceRange.reduce((a, b) => a + b, 0) / intersectionDistanceRange.length;
    console.log(`   Intersection distance range: ${minIntersection.toFixed(1)}-${maxIntersection.toFixed(1)}NM (avg: ${avgIntersection.toFixed(1)}NM)`);
    
    const minSymmetry = Math.min(...intersectionSymmetry);
    const maxSymmetry = Math.max(...intersectionSymmetry);
    const avgSymmetry = intersectionSymmetry.reduce((a, b) => a + b, 0) / intersectionSymmetry.length;
    console.log(`   Intersection symmetry: ${minSymmetry.toFixed(1)}-${maxSymmetry.toFixed(1)}NM (avg: ${avgSymmetry.toFixed(1)}NM)`);
  }
  
  if (stats.failed > 0) {
    console.log('\n💥 FAILURE BREAKDOWN:');
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
const testResults = runNotesComplianceTest(1000);

console.log('\n🏆 FINAL VERDICT:');
if (testResults.passed === testResults.total) {
  console.log('✅ ALL TESTS PASSED! Generator fully complies with notes.txt requirements.');
} else {
  console.log(`❌ ${testResults.failed} TESTS FAILED. Generator needs adjustments to match notes.txt requirements.`);
  process.exit(1);
}
