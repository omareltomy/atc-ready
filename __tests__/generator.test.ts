import { generateExercise, Exercise, Ac } from '../lib/generator';
import { VFR_TYPES, IFR_TYPES, MIL_TYPES } from '../lib/constants';

describe('Exercise Generator', () => {
  let exercise: Exercise;

  beforeEach(() => {
    exercise = generateExercise();
  });

  describe('Target Aircraft Validation', () => {
    test('should generate valid target aircraft', () => {
      const { target } = exercise;
      
      expect(target.callsign).toBeDefined();
      expect(target.callsign).toMatch(/^[A-Z0-9-]+$/);
      expect(['L', 'M', 'H']).toContain(target.wtc);
      expect(target.heading).toBeGreaterThanOrEqual(0);
      expect(target.heading).toBeLessThan(360);
      expect(target.level).toBeGreaterThan(0);
      expect(target.speed).toBeGreaterThan(0);
      expect(target.position).toEqual({ x: 0, y: 0 });
      expect(target.history).toHaveLength(3);
    });

    test('should generate VFR altitudes following hemispheric rules', () => {
      // Generate multiple exercises to test VFR altitude rules
      for (let i = 0; i < 50; i++) {
        const ex = generateExercise();
        if (ex.target.isVFR) {
          // VFR should use altitudes ending in 500
          expect(ex.target.level % 1000).toBe(500);
          expect(ex.target.level).toBeGreaterThanOrEqual(500);
          expect(ex.target.level).toBeLessThanOrEqual(17500);
        }
      }
    });

    test('should generate IFR altitudes following flight level rules', () => {
      for (let i = 0; i < 50; i++) {
        const ex = generateExercise();
        if (!ex.target.isVFR) {
          if (ex.target.level >= 18000) {
            // Above FL180 should be in hundreds
            expect(ex.target.level % 100).toBe(0);
          } else {
            // Below FL180 should be in thousands
            expect(ex.target.level % 1000).toBe(0);
          }
        }
      }
    });
  });

  describe('Intruder Aircraft Validation', () => {
    test('should generate valid intruder aircraft', () => {
      const { intruder } = exercise;
      
      expect(intruder.callsign).toBeDefined();
      expect(intruder.callsign).toMatch(/^[A-Z0-9-]+$/);
      expect(['L', 'M', 'H']).toContain(intruder.wtc);
      expect(intruder.heading).toBeGreaterThanOrEqual(0);
      expect(intruder.heading).toBeLessThan(360);
      expect(intruder.level).toBeGreaterThan(0);
      expect(intruder.speed).toBeGreaterThan(0);
      expect(intruder.history).toHaveLength(3);
    });

    test('should place intruder at correct distance and bearing', () => {
      const { intruder, situation } = exercise;
      const distance = Math.sqrt(
        intruder.position.x ** 2 + intruder.position.y ** 2
      );
      
      expect(distance).toBeCloseTo(situation.distance, 1);
      expect(situation.distance).toBeGreaterThanOrEqual(2);
      expect(situation.distance).toBeLessThanOrEqual(8);
      expect(situation.clock).toBeGreaterThanOrEqual(1);
      expect(situation.clock).toBeLessThanOrEqual(12);
    });

    test('should ensure minimum altitude separation', () => {
      const { target, intruder } = exercise;
      const altDiff = Math.abs(intruder.level - target.level);
      
      // Should have at least 500 feet separation (unless specifically "same level")
      if (Math.abs(exercise.situation.levelDiff) > 200) {
        expect(altDiff).toBeGreaterThanOrEqual(500);
      }
    });
  });

  describe('Clock Position Calculation', () => {
    test('should correctly calculate clock positions', () => {
      // Test specific scenarios
      for (let i = 0; i < 100; i++) {
        const ex = generateExercise();
        const { target, intruder, situation } = ex;
        
        // Calculate expected bearing from target to intruder
        const dx = intruder.position.x - target.position.x;
        const dy = intruder.position.y - target.position.y;
        let bearing = Math.atan2(dx, dy) * 180 / Math.PI;
        if (bearing < 0) bearing += 360;
        
        // Calculate relative bearing
        let relativeBearing = (bearing - target.heading + 360) % 360;
        
        // Convert to clock position
        const expectedClock = relativeBearing === 0 ? 12 : Math.round(relativeBearing / 30);
        const normalizedExpected = expectedClock === 0 ? 12 : expectedClock;
        
        expect(situation.clock).toBe(normalizedExpected);
      }
    });
  });

  describe('Direction Classification', () => {
    test('should classify directions correctly', () => {
      const { target, intruder, situation } = exercise;
      const headingDiff = (intruder.heading - target.heading + 360) % 360;
      
      if (headingDiff <= 45 || headingDiff >= 315) {
        expect(situation.direction).toBe('same direction');
      } else if (headingDiff >= 135 && headingDiff <= 225) {
        expect(situation.direction).toBe('opposite direction');
      } else if (headingDiff > 45 && headingDiff < 135) {
        expect(situation.direction).toBe('crossing left to right');
      } else {
        expect(situation.direction).toBe('crossing right to left');
      }
    });
  });

  describe('Level Change Logic', () => {
    test('should generate realistic level changes for IFR aircraft', () => {
      for (let i = 0; i < 100; i++) {
        const ex = generateExercise();
        if (ex.intruder.levelChange && !ex.intruder.isVFR) {
          const { level, levelChange } = ex.intruder;
          
          expect(['↑', '↓']).toContain(levelChange.dir);
          
          if (levelChange.dir === '↑') {
            expect(levelChange.to).toBeGreaterThan(level);
          } else {
            expect(levelChange.to).toBeLessThan(level);
          }
          
          // Level change should be reasonable (1000-3000 feet)
          const change = Math.abs(levelChange.to - level);
          expect(change).toBeGreaterThanOrEqual(1000);
          expect(change).toBeLessThanOrEqual(3000);
        }
      }
    });

    test('should not generate level changes for VFR aircraft', () => {
      for (let i = 0; i < 50; i++) {
        const ex = generateExercise();
        if (ex.intruder.isVFR) {
          expect(ex.intruder.levelChange).toBeUndefined();
        }
      }
    });
  });

  describe('Solution String Validation', () => {
    test('should generate properly formatted solution strings', () => {
      const { solution, target, situation } = exercise;
      
      expect(solution).toContain(target.callsign);
      expect(solution).toContain('traffic');
      expect(solution).toContain(`${situation.clock} o'clock`);
      expect(solution).toContain(`${situation.distance} miles`);
      expect(solution).toContain(situation.direction);
      expect(solution).toContain(situation.type);
    });

    test('should include heavy designation for heavy aircraft', () => {
      for (let i = 0; i < 50; i++) {
        const ex = generateExercise();
        if (ex.intruder.wtc === 'H') {
          expect(ex.solution).toContain('heavy');
        } else {
          expect(ex.solution).not.toContain('heavy');
        }
      }
    });

    test('should correctly report altitude differences', () => {
      const { solution, situation } = exercise;
      
      if (Math.abs(situation.levelDiff) <= 200) {
        expect(solution).toContain('same level');
      } else {
        expect(solution).toContain('feet');
        if (situation.levelDiff > 0) {
          expect(solution).toContain('above');
        } else {
          expect(solution).toContain('below');
        }
      }
    });
  });

  describe('Aircraft Type Consistency', () => {
    test('should use appropriate aircraft types for flight rules', () => {
      for (let i = 0; i < 100; i++) {
        const ex = generateExercise();
        
        // Check if aircraft type is from the correct category
        const allTypes = [...VFR_TYPES, ...IFR_TYPES, ...MIL_TYPES];
        const targetType = allTypes.find(t => t.name === ex.target.type.name);
        const intruderType = allTypes.find(t => t.name === ex.intruder.type.name);
        
        expect(targetType).toBeDefined();
        expect(intruderType).toBeDefined();
        
        // Verify WTC consistency
        expect(ex.target.wtc).toBe(targetType!.wtc);
        expect(ex.intruder.wtc).toBe(intruderType!.wtc);
      }
    });
  });

  describe('Boundary Conditions', () => {
    test('should handle edge cases for headings', () => {
      for (let i = 0; i < 100; i++) {
        const ex = generateExercise();
        
        expect(ex.target.heading).toBeGreaterThanOrEqual(0);
        expect(ex.target.heading).toBeLessThan(360);
        expect(ex.intruder.heading).toBeGreaterThanOrEqual(0);
        expect(ex.intruder.heading).toBeLessThan(360);
      }
    });

    test('should generate realistic callsigns', () => {
      for (let i = 0; i < 50; i++) {
        const ex = generateExercise();
        
        // VFR callsigns should match registration patterns
        if (ex.target.isVFR) {
          expect(ex.target.callsign).toMatch(/^(N\d[A-Z]{2}|[A-Z]+-[A-Z0-9]+|TRAINER\d+|STUDENT\d+|CESSNA\d+|PIPER\d+|DIAMOND\d+)$/);
        } else {
          // IFR callsigns should match airline patterns
          expect(ex.target.callsign).toMatch(/^[A-Z]{3}\d+$/);
        }
      }
    });
  });

  describe('Statistical Distribution', () => {
    test('should have reasonable distribution of aircraft types', () => {
      const vfrCount = { target: 0, intruder: 0 };
      const heavyCount = { target: 0, intruder: 0 };
      const milCount = { target: 0, intruder: 0 };
      
      for (let i = 0; i < 1000; i++) {
        const ex = generateExercise();
        
        if (ex.target.isVFR) vfrCount.target++;
        if (ex.intruder.isVFR) vfrCount.intruder++;
        
        if (ex.target.wtc === 'H') heavyCount.target++;
        if (ex.intruder.wtc === 'H') heavyCount.intruder++;
        
        // Check if aircraft is military (simplified check)
        if (ex.target.callsign.match(/^(REACH|CONVOY|SENTRY|VADER|HAWK|EAGLE)/)) milCount.target++;
        if (ex.intruder.callsign.match(/^(REACH|CONVOY|SENTRY|VADER|HAWK|EAGLE)/)) milCount.intruder++;
      }
      
      // Should have reasonable mix of VFR/IFR
      expect(vfrCount.target / 1000).toBeGreaterThan(0.3);
      expect(vfrCount.target / 1000).toBeLessThan(0.9);
      
      // Heavy aircraft should be present but not dominant
      expect(heavyCount.target + heavyCount.intruder).toBeGreaterThan(0);
      expect((heavyCount.target + heavyCount.intruder) / 2000).toBeLessThan(0.3);
      
      // Military aircraft should be present but relatively rare
      expect(milCount.target + milCount.intruder).toBeGreaterThan(0);
      expect((milCount.target + milCount.intruder) / 2000).toBeLessThan(0.25);
    });
  });
});
