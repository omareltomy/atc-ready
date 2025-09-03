import { generateExercise } from '../lib/generator';
import { VFR_TYPES, IFR_TYPES, MIL_TYPES } from '../lib/constants';

// Simple test framework
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];

  test(name: string, testFn: () => void) {
    try {
      testFn();
      this.results.push({ name, passed: true });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.results.push({ 
        name, 
        passed: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
      console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  expect(actual: any) {
    return {
      toBe: (expected: any) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`);
        }
      },
      toBeGreaterThan: (expected: number) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeLessThan: (expected: number) => {
        if (actual >= expected) {
          throw new Error(`Expected ${actual} to be less than ${expected}`);
        }
      },
      toBeGreaterThanOrEqual: (expected: number) => {
        if (actual < expected) {
          throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
        }
      },
      toBeLessThanOrEqual: (expected: number) => {
        if (actual > expected) {
          throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
        }
      },
      toContain: (expected: any) => {
        if (!Array.isArray(actual) || !actual.includes(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to contain ${expected}`);
        }
      },
      toMatch: (regex: RegExp) => {
        if (!regex.test(actual)) {
          throw new Error(`Expected ${actual} to match ${regex}`);
        }
      },
      toEqual: (expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
        }
      },
      toBeCloseTo: (expected: number, precision = 2) => {
        const diff = Math.abs(actual - expected);
        const tolerance = Math.pow(10, -precision);
        if (diff > tolerance) {
          throw new Error(`Expected ${actual} to be close to ${expected} (within ${tolerance})`);
        }
      },
      toBeDefined: () => {
        if (actual === undefined) {
          throw new Error('Expected value to be defined');
        }
      },
      toBeUndefined: () => {
        if (actual !== undefined) {
          throw new Error('Expected value to be undefined');
        }
      },
      toHaveLength: (expected: number) => {
        if (!actual || actual.length !== expected) {
          throw new Error(`Expected array to have length ${expected}, got ${actual?.length}`);
        }
      }
    };
  }

  getSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    console.log(`\n📊 Test Summary: ${passed}/${total} tests passed`);
    
    if (passed < total) {
      console.log('\nFailed tests:');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  ❌ ${r.name}: ${r.error}`);
      });
    }
    
    return { passed, total, success: passed === total };
  }
}

// Run tests
const runner = new TestRunner();

console.log('🧪 Running Exercise Generator Tests...\n');

// Basic generation test
runner.test('should generate valid exercise', () => {
  const exercise = generateExercise();
  runner.expect(exercise).toBeDefined();
  runner.expect(exercise.target).toBeDefined();
  runner.expect(exercise.intruder).toBeDefined();
  runner.expect(exercise.solution).toBeDefined();
  runner.expect(exercise.situation).toBeDefined();
});

// Target validation tests
runner.test('should generate valid target aircraft', () => {
  const exercise = generateExercise();
  const { target } = exercise;
  
  runner.expect(target.callsign).toBeDefined();
  runner.expect(['L', 'M', 'H']).toContain(target.wtc);
  runner.expect(target.heading).toBeGreaterThanOrEqual(0);
  runner.expect(target.heading).toBeLessThan(360);
  runner.expect(target.level).toBeGreaterThan(0);
  runner.expect(target.speed).toBeGreaterThan(0);
  runner.expect(target.position).toEqual({ x: 0, y: 0 });
  runner.expect(target.history).toHaveLength(3);
});

// VFR altitude validation
runner.test('should generate VFR altitudes following rules', () => {
  for (let i = 0; i < 20; i++) {
    const exercise = generateExercise();
    if (exercise.target.isVFR) {
      // VFR should use altitudes ending in 500
      runner.expect(exercise.target.level % 1000).toBe(500);
      runner.expect(exercise.target.level).toBeGreaterThanOrEqual(500);
      runner.expect(exercise.target.level).toBeLessThanOrEqual(17500);
    }
  }
});

// IFR altitude validation
runner.test('should generate IFR altitudes following flight level rules', () => {
  for (let i = 0; i < 20; i++) {
    const exercise = generateExercise();
    if (!exercise.target.isVFR) {
      if (exercise.target.level >= 18000) {
        // Above FL180 should be in hundreds
        runner.expect(exercise.target.level % 100).toBe(0);
      } else {
        // Below FL180 should be in thousands
        runner.expect(exercise.target.level % 1000).toBe(0);
      }
    }
  }
});

// Distance and clock position validation
runner.test('should place intruder at correct distance and bearing', () => {
  const exercise = generateExercise();
  const { intruder, situation } = exercise;
  const distance = Math.sqrt(
    intruder.position.x ** 2 + intruder.position.y ** 2
  );
  
  runner.expect(distance).toBeCloseTo(situation.distance, 1);
  runner.expect(situation.distance).toBeGreaterThanOrEqual(2);
  runner.expect(situation.distance).toBeLessThanOrEqual(8);
  runner.expect(situation.clock).toBeGreaterThanOrEqual(1);
  runner.expect(situation.clock).toBeLessThanOrEqual(12);
});

// Altitude separation validation
runner.test('should ensure minimum altitude separation', () => {
  for (let i = 0; i < 10; i++) {
    const exercise = generateExercise();
    const { target, intruder } = exercise;
    const altDiff = Math.abs(intruder.level - target.level);
    
    // Should have at least 500 feet separation (unless specifically "same level")
    if (Math.abs(exercise.situation.levelDiff) > 200) {
      runner.expect(altDiff).toBeGreaterThanOrEqual(500);
    }
  }
});

// Direction classification validation
runner.test('should classify directions correctly', () => {
  const exercise = generateExercise();
  const { target, intruder, situation } = exercise;
  const headingDiff = (intruder.heading - target.heading + 360) % 360;
  
  if (headingDiff <= 45 || headingDiff >= 315) {
    runner.expect(situation.direction).toBe('same direction');
  } else if (headingDiff >= 135 && headingDiff <= 225) {
    runner.expect(situation.direction).toBe('opposite direction');
  } else if (headingDiff > 45 && headingDiff < 135) {
    runner.expect(situation.direction).toBe('crossing left to right');
  } else {
    runner.expect(situation.direction).toBe('crossing right to left');
  }
});

// Level change validation
runner.test('should generate realistic level changes for IFR aircraft', () => {
  for (let i = 0; i < 20; i++) {
    const exercise = generateExercise();
    if (exercise.intruder.levelChange && !exercise.intruder.isVFR) {
      const { level, levelChange } = exercise.intruder;
      
      runner.expect(['↑', '↓']).toContain(levelChange.dir);
      
      if (levelChange.dir === '↑') {
        runner.expect(levelChange.to).toBeGreaterThan(level);
      } else {
        runner.expect(levelChange.to).toBeLessThan(level);
      }
      
      // Level change should be reasonable (1000-3000 feet)
      const change = Math.abs(levelChange.to - level);
      runner.expect(change).toBeGreaterThanOrEqual(1000);
      runner.expect(change).toBeLessThanOrEqual(3000);
    }
  }
});

// Solution string validation
runner.test('should generate properly formatted solution strings', () => {
  const exercise = generateExercise();
  const { solution, target, situation } = exercise;
  
  runner.expect(solution).toBeDefined();
  runner.expect(typeof solution).toBe('string');
  runner.expect(solution.length).toBeGreaterThan(20);
  
  // Check that all required components are present
  const hasCallsign = solution.includes(target.callsign);
  const hasTraffic = solution.includes('traffic');
  const hasClock = solution.includes(`${situation.clock} o'clock`);
  const hasDistance = solution.includes(`${situation.distance} miles`);
  const hasDirection = solution.includes(situation.direction);
  const hasType = solution.includes(situation.type);
  
  runner.expect(hasCallsign).toBe(true);
  runner.expect(hasTraffic).toBe(true);
  runner.expect(hasClock).toBe(true);
  runner.expect(hasDistance).toBe(true);
  runner.expect(hasDirection).toBe(true);
  runner.expect(hasType).toBe(true);
});

// Heavy aircraft designation
runner.test('should include heavy designation for heavy aircraft', () => {
  for (let i = 0; i < 20; i++) {
    const exercise = generateExercise();
    if (exercise.intruder.wtc === 'H') {
      runner.expect(exercise.solution.includes('heavy')).toBe(true);
    }
  }
});

// Callsign format validation
runner.test('should generate realistic callsigns', () => {
  for (let i = 0; i < 10; i++) {
    const exercise = generateExercise();
    
    // Basic format check - callsigns should be alphanumeric
    runner.expect(exercise.target.callsign).toMatch(/^[A-Z0-9-]+$/);
    runner.expect(exercise.intruder.callsign).toMatch(/^[A-Z0-9-]+$/);
  }
});

// Boundary conditions
runner.test('should handle boundary conditions for headings', () => {
  for (let i = 0; i < 10; i++) {
    const exercise = generateExercise();
    
    runner.expect(exercise.target.heading).toBeGreaterThanOrEqual(0);
    runner.expect(exercise.target.heading).toBeLessThan(360);
    runner.expect(exercise.intruder.heading).toBeGreaterThanOrEqual(0);
    runner.expect(exercise.intruder.heading).toBeLessThan(360);
  }
});

// Statistical validation
runner.test('should have reasonable distribution of aircraft types', () => {
  let vfrCount = 0;
  let heavyCount = 0;
  const sampleSize = 100;
  
  for (let i = 0; i < sampleSize; i++) {
    const exercise = generateExercise();
    
    if (exercise.target.isVFR || exercise.intruder.isVFR) vfrCount++;
    if (exercise.target.wtc === 'H' || exercise.intruder.wtc === 'H') heavyCount++;
  }
  
  // Should have reasonable mix
  runner.expect(vfrCount).toBeGreaterThan(10); // At least 10% VFR
  runner.expect(vfrCount).toBeLessThan(90); // At most 90% VFR
  runner.expect(heavyCount).toBeLessThan(50); // Heavy aircraft should be less common
});

// Get test summary
const summary = runner.getSummary();

if (summary.success) {
  console.log('\n🎉 All tests passed! The exercise generation logic is working correctly.');
} else {
  console.log('\n⚠️ Some tests failed. Please review the logic.');
}

export default summary;
