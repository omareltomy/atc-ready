/**
 * Comprehensive Generator Quality Test Suite
 * 
 * This test suite validates all generator requirements from context.txt to ensure quality doesn't degrade.
 * Run with: npx tsx comprehensive-generator-test.ts
 */

// Use require for TypeScript modules with tsx
const { generateExercise } = require('./lib/generator');
const { MILITARY_CALLSIGNS } = require('./lib/constants');

class GeneratorTester {
  private testCount = 10000; // Large sample for statistical validation
  private results: any[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];
  
  // Military callsign list from context.txt
  private milCallsigns = MILITARY_CALLSIGNS;

  // Main test runner
  async runAllTests() {
    console.log('🧪 Starting Comprehensive Generator Quality Tests...\n');
    console.log('📋 Validating against context.txt requirements\n');
    
    // Generate test samples
    console.log(`📊 Generating ${this.testCount} test exercises...`);
    this.generateTestSamples();
    
    // Run all test categories from context.txt
    this.testVFRIFRDistribution();
    this.testFlightRuleCompatibility();
    this.testVFRLevelDifferences();
    this.testIFRLevelDifferences();
    this.testCallsignFormats();
    this.testMilitaryCallsignRules();
    this.testAircraftLevels();
    this.testDirectionProbabilities();
    this.testDirectionSpecificRules();
    this.testDistanceRules();
    this.testLevelChangeLogic();
    this.testSolutionFormat();
    this.testDataValidationRequirements();
    
    // Print comprehensive report
    this.printTestReport();
    
    return this.errors.length === 0;
  }

  generateTestSamples(): void {
    for (let i = 0; i < this.testCount; i++) {
      try {
        const exercise = generateExercise();
        this.results.push(exercise);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.errors.push(`Exercise ${i}: Generation failed - ${errorMessage}`);
      }
    }
    console.log(`✅ Generated ${this.results.length}/${this.testCount} exercises successfully\n`);
  }

  // Test 1: VFR/IFR Distribution - Exactly 75%/25%
  testVFRIFRDistribution() {
    console.log('1️⃣  Testing VFR/IFR Distribution (Context: Exactly 75%/25%)...');
    
    const vfrCount = this.results.filter(ex => ex.target.flightRule === 'VFR').length;
    const ifrCount = this.results.filter(ex => ex.target.flightRule === 'IFR').length;
    
    const vfrPercentage = (vfrCount / this.results.length) * 100;
    const ifrPercentage = (ifrCount / this.results.length) * 100;
    
    // Context.txt says "VFR probability should be exactly 75%" - allow ±2% for statistical variation
    if (Math.abs(vfrPercentage - 75) > 2) {
      this.errors.push(`VFR percentage ${vfrPercentage.toFixed(1)}% not exactly 75% ±2%`);
    }
    if (Math.abs(ifrPercentage - 25) > 2) {
      this.errors.push(`IFR percentage ${ifrPercentage.toFixed(1)}% not exactly 25% ±2%`);
    }
    
    console.log(`   VFR: ${vfrPercentage.toFixed(1)}% | IFR: ${ifrPercentage.toFixed(1)}%`);
  }

  // Test 2: Flight Rule Compatibility - Never mix VFR with IFR
  testFlightRuleCompatibility() {
    console.log('2️⃣  Testing Flight Rule Compatibility (Context: Never mix VFR with IFR)...');
    
    const mixedRules = this.results.filter(ex => 
      ex.target.flightRule !== ex.intruder.flightRule
    );
    
    if (mixedRules.length > 0) {
      this.errors.push(`${mixedRules.length} exercises mix VFR with IFR traffic (should be 0)`);
      mixedRules.slice(0, 3).forEach((ex, i) => {
        this.errors.push(`  Example ${i + 1}: Target=${ex.target.flightRule}, Intruder=${ex.intruder.flightRule}`);
      });
    }
    
    console.log(`   Mixed rules: ${mixedRules.length} (should be 0)`);
  }

  // Test 3: VFR Level Differences - 200-1000 feet
  testVFRLevelDifferences() {
    console.log('3️⃣  Testing VFR Level Differences (Context: 200-1000 feet)...');
    
    const vfrExercises = this.results.filter(ex => ex.target.flightRule === 'VFR');
    const invalidVFRLevels = vfrExercises.filter(ex => {
      const levelDiff = Math.abs(ex.target.level - ex.intruder.level);
      return levelDiff < 200 || levelDiff > 1000;
    });
    
    if (invalidVFRLevels.length > 0) {
      this.errors.push(`${invalidVFRLevels.length} VFR exercises have level differences outside 200-1000 feet range`);
    }
    
    console.log(`   Invalid VFR level differences: ${invalidVFRLevels.length}`);
  }

  // Test 4: IFR Level Differences - Exactly 1000 feet
  testIFRLevelDifferences() {
    console.log('4️⃣  Testing IFR Level Differences (Context: Exactly 1000 feet)...');
    
    const ifrExercises = this.results.filter(ex => ex.target.flightRule === 'IFR');
    const invalidIFRLevels = ifrExercises.filter(ex => {
      const levelDiff = Math.abs(ex.target.level - ex.intruder.level);
      return levelDiff !== 1000;
    });
    
    if (invalidIFRLevels.length > 0) {
      this.errors.push(`${invalidIFRLevels.length} IFR exercises don't have exactly 1000 feet difference`);
    }
    
    console.log(`   IFR exercises with wrong level difference: ${invalidIFRLevels.length}`);
  }

  // Test 5: Callsign Format Validation from context.txt
  testCallsignFormats() {
    console.log('5️⃣  Testing Callsign Formats (Context: Specific format rules)...');
    
    // Test IFR callsigns - first char after 3-letter prefix must be number
    const ifrExercises = this.results.filter(ex => ex.target.flightRule === 'IFR');
    const invalidIFRCallsigns = ifrExercises.filter(ex => {
      const callsign = ex.target.callsign;
      if (callsign.length < 4) return true;
      const fourthChar = callsign.charAt(3);
      return !/[0-9]/.test(fourthChar);
    });
    
    // Test VFR callsigns - should be 5 letters total (or follow specific patterns)
    const vfrExercises = this.results.filter(ex => ex.target.flightRule === 'VFR');
    const invalidVFRCallsigns = vfrExercises.filter(ex => {
      const callsign = ex.target.callsign;
      // Check if it's military (different rules)
      if (this.milCallsigns.some((mil: string) => callsign.startsWith(mil))) return false;
      // Most VFR should be 5 letters or follow specific patterns
      return callsign.length < 4 || callsign.length > 6;
    });
    
    if (invalidIFRCallsigns.length > 0) {
      this.errors.push(`${invalidIFRCallsigns.length} IFR callsigns don't have number as 4th character`);
    }
    
    if (invalidVFRCallsigns.length > 0) {
      this.warnings.push(`${invalidVFRCallsigns.length} VFR callsigns have unusual format`);
    }
    
    console.log(`   Invalid IFR callsigns: ${invalidIFRCallsigns.length} | Unusual VFR: ${invalidVFRCallsigns.length}`);
  }

  // Test 6: Military Callsign Rules from context.txt
  testMilitaryCallsignRules() {
    console.log('6️⃣  Testing Military Callsign Rules (Context: 10% chance, VFR intruders only)...');
    
    const vfrTargetExercises = this.results.filter(ex => ex.target.flightRule === 'VFR');
    const militaryIntruders = vfrTargetExercises.filter(ex => 
      this.milCallsigns.some((mil: string) => ex.intruder.callsign.startsWith(mil))
    );
    
    const militaryPercentage = (militaryIntruders.length / vfrTargetExercises.length) * 100;
    
    // Should be around 10% ±2%
    if (Math.abs(militaryPercentage - 10) > 2) {
      this.warnings.push(`Military aircraft percentage ${militaryPercentage.toFixed(1)}% not near 10%`);
    }
    
    // Check military callsign format (should end with 2 numbers)
    const invalidMilitaryFormat = militaryIntruders.filter(ex => {
      const callsign = ex.intruder.callsign;
      const lastTwoChars = callsign.slice(-2);
      return !/^\d{2}$/.test(lastTwoChars);
    });
    
    if (invalidMilitaryFormat.length > 0) {
      this.errors.push(`${invalidMilitaryFormat.length} military callsigns don't end with 2 numbers`);
    }
    
    // Check no military targets
    const militaryTargets = this.results.filter(ex => 
      this.milCallsigns.some((mil: string) => ex.target.callsign.startsWith(mil))
    );
    if (militaryTargets.length > 0) {
      this.errors.push(`${militaryTargets.length} exercises have military targets (should be 0)`);
    }
    
    console.log(`   Military intruders: ${militaryPercentage.toFixed(1)}% | Invalid format: ${invalidMilitaryFormat.length} | Military targets: ${militaryTargets.length}`);
  }

  // Test 7: Aircraft Levels - All rounded to 10, max 1000ft difference
  testAircraftLevels() {
    console.log('7️⃣  Testing Aircraft Levels (Context: Rounded to 10, max 1000ft diff)...');
    
    const invalidLevels = this.results.filter(ex => {
      return (ex.target.level % 10 !== 0) || (ex.intruder.level % 10 !== 0);
    });
    
    const largeLevelDifferences = this.results.filter(ex => {
      return Math.abs(ex.target.level - ex.intruder.level) > 1000;
    });
    
    // Check target aircraft don't have level changes
    const targetLevelChanges = this.results.filter(ex => ex.target.levelChange);
    
    if (invalidLevels.length > 0) {
      this.errors.push(`${invalidLevels.length} exercises have levels not rounded to 10`);
    }
    
    if (largeLevelDifferences.length > 0) {
      this.errors.push(`${largeLevelDifferences.length} exercises have level differences > 1000ft`);
    }
    
    if (targetLevelChanges.length > 0) {
      this.errors.push(`${targetLevelChanges.length} exercises have target aircraft with level changes (should be 0)`);
    }
    
    console.log(`   Invalid levels: ${invalidLevels.length} | Large differences: ${largeLevelDifferences.length} | Target level changes: ${targetLevelChanges.length}`);
  }

  // Test 8: Direction Probabilities from context.txt
  testDirectionProbabilities(): void {
    console.log('8️⃣  Testing Direction Probabilities (Context: Specific percentages)...');
    
    const directionCounts: Record<string, number> = {};
    this.results.forEach(ex => {
      const dir = ex.situation.direction;
      directionCounts[dir] = (directionCounts[dir] || 0) + 1;
    });
    
    const total = this.results.length;
    const expectedProbs: Record<string, number> = {
      'crossing left to right': 28,
      'crossing right to left': 28,
      'converging': 28,
      'opposite direction': 11,
      'overtaking': 5
    };
    
    Object.entries(expectedProbs).forEach(([direction, expectedPercent]) => {
      const actualCount = directionCounts[direction] || 0;
      const actualPercent = (actualCount / total) * 100;
      const margin = 3; // ±3% margin
      
      if (Math.abs(actualPercent - expectedPercent) > margin) {
        this.warnings.push(`${direction}: ${actualPercent.toFixed(1)}% (expected ${expectedPercent}% ±${margin}%)`);
      }
    });
    
    console.log('   Direction distribution:');
    Object.entries(directionCounts).forEach(([dir, count]) => {
      console.log(`     ${dir}: ${((count / total) * 100).toFixed(1)}%`);
    });
  }

  // Test 9: Direction-Specific Rules from context.txt
  testDirectionSpecificRules(): void {
    console.log('9️⃣  Testing Direction-Specific Rules (Context: Clock positions and distances)...');
    
    const violations: string[] = [];
    
    this.results.forEach((ex, index) => {
      const { clock, distance, direction } = ex.situation;
      
      switch (direction) {
        case 'crossing left to right':
          if (![10, 11].includes(clock)) {
            violations.push(`Ex${index}: ${direction} has clock ${clock} (should be 10 or 11)`);
          }
          if (distance < 3 || distance > 8) {
            violations.push(`Ex${index}: ${direction} has distance ${distance} (should be 3-8 miles)`);
          }
          break;
          
        case 'crossing right to left':
          if (![1, 2].includes(clock)) {
            violations.push(`Ex${index}: ${direction} has clock ${clock} (should be 1 or 2)`);
          }
          if (distance < 3 || distance > 8) {
            violations.push(`Ex${index}: ${direction} has distance ${distance} (should be 3-8 miles)`);
          }
          break;
          
        case 'converging':
          if (![2, 3, 9, 10].includes(clock)) {
            violations.push(`Ex${index}: ${direction} has clock ${clock} (should be 2, 3, 9, or 10)`);
          }
          if (distance < 2 || distance > 5) {
            violations.push(`Ex${index}: ${direction} has distance ${distance} (should be 2-5 miles)`);
          }
          break;
          
        case 'opposite direction':
          if (clock !== 12) {
            violations.push(`Ex${index}: ${direction} has clock ${clock} (should be 12)`);
          }
          if (distance < 4 || distance > 9) {
            violations.push(`Ex${index}: ${direction} has distance ${distance} (should be 4-9 miles)`);
          }
          break;
          
        case 'overtaking':
          if (![5, 6, 7].includes(clock)) {
            violations.push(`Ex${index}: ${direction} has clock ${clock} (should be 5, 6, or 7)`);
          }
          if (distance < 2 || distance > 6) {
            violations.push(`Ex${index}: ${direction} has distance ${distance} (should be 2-6 miles)`);
          }
          // Check intruder speed > target speed
          if (ex.intruder.speed <= ex.target.speed) {
            violations.push(`Ex${index}: Overtaking intruder speed ${ex.intruder.speed} not > target speed ${ex.target.speed}`);
          }
          break;
      }
    });
    
    if (violations.length > 0) {
      this.errors.push(`${violations.length} direction-specific rule violations`);
      violations.slice(0, 5).forEach(violation => {
        this.errors.push(`  ${violation}`);
      });
    }
    
    console.log(`   Direction-specific violations: ${violations.length}`);
  }

  // Test 10: Distance Rules from context.txt
  testDistanceRules() {
    console.log('🔟 Testing Distance Rules (Context: Proper distance calculations)...');
    
    const distanceIssues = this.results.filter(ex => {
      const distance = ex.situation.distance;
      // Based on direction-specific rules, distance should be within reasonable ranges
      return distance < 2 || distance > 9;
    });
    
    if (distanceIssues.length > 0) {
      this.warnings.push(`${distanceIssues.length} exercises have distances outside 2-9 mile range`);
    }
    
    console.log(`   Distance issues: ${distanceIssues.length}`);
  }

  // Test 11: Level Change Logic from context.txt
  testLevelChangeLogic() {
    console.log('1️⃣1️⃣ Testing Level Change Logic (Context: THROUGH level, not TO same level)...');
    
    const levelChangeExercises = this.results.filter(ex => ex.intruder.levelChange);
    const invalidLevelChanges = levelChangeExercises.filter(ex => {
      const targetLevel = ex.target.level;
      const intruderLevel = ex.intruder.level;
      const changeToLevel = ex.intruder.levelChange.to;
      const direction = ex.intruder.levelChange.dir;
      
      if (direction === 'descending') {
        // Should be descending THROUGH target level (from higher to lower than target)
        return !(intruderLevel > targetLevel && changeToLevel < targetLevel);
      } else if (direction === 'climbing') {
        // Should be climbing THROUGH target level (from lower to higher than target)  
        return !(intruderLevel < targetLevel && changeToLevel > targetLevel);
      }
      
      return false;
    });
    
    // Check level changes are rounded to 10
    const unroundedLevelChanges = levelChangeExercises.filter(ex => 
      ex.intruder.levelChange.to % 10 !== 0
    );
    
    if (invalidLevelChanges.length > 0) {
      this.errors.push(`${invalidLevelChanges.length} exercises have incorrect level change logic (not THROUGH)`);
    }
    
    if (unroundedLevelChanges.length > 0) {
      this.errors.push(`${unroundedLevelChanges.length} level changes not rounded to 10`);
    }
    
    console.log(`   Level changes: ${levelChangeExercises.length} | Invalid logic: ${invalidLevelChanges.length} | Unrounded: ${unroundedLevelChanges.length}`);
  }

  // Test 12: Solution Format from context.txt
  testSolutionFormat() {
    console.log('1️⃣2️⃣ Testing Solution Format (Context: Specific format with level change)...');
    
    const missingSolutions = this.results.filter(ex => !ex.solution || ex.solution.length < 10);
    const invalidSolutionFormat = this.results.filter(ex => {
      if (!ex.solution) return true;
      const solution = ex.solution.toLowerCase();
      return !solution.includes('traffic') || 
             !solution.includes('clock') || 
             !solution.includes('miles');
    });
    
    // Check level change information is included when applicable
    const levelChangeExercises = this.results.filter(ex => ex.intruder.levelChange);
    const missingLevelChangeInfo = levelChangeExercises.filter(ex => {
      const solution = ex.solution.toLowerCase();
      return !solution.includes('through your level');
    });
    
    if (missingSolutions.length > 0) {
      this.errors.push(`${missingSolutions.length} exercises missing solutions`);
    }
    
    if (invalidSolutionFormat.length > 0) {
      this.errors.push(`${invalidSolutionFormat.length} exercises have invalid solution format`);
    }
    
    if (missingLevelChangeInfo.length > 0) {
      this.errors.push(`${missingLevelChangeInfo.length} level change exercises missing 'through your level' info`);
    }
    
    console.log(`   Missing solutions: ${missingSolutions.length} | Invalid format: ${invalidSolutionFormat.length} | Missing level change info: ${missingLevelChangeInfo.length}`);
  }

  // Test 13: Data Validation Requirements from context.txt
  testDataValidationRequirements() {
    console.log('1️⃣3️⃣ Testing Data Validation Requirements (Context: Intersection, relevance, accuracy)...');
    
    // Check for irrelevant level traffic (same level with no level change)
    const irrelevantLevelTraffic = this.results.filter(ex => {
      const sameLevels = ex.target.level === ex.intruder.level;
      const noLevelChange = !ex.intruder.levelChange;
      return sameLevels && noLevelChange;
    });
    
    // Check speed ranges (60-350 knots from context.txt)
    const invalidSpeeds = this.results.filter(ex => {
      return ex.target.speed < 60 || ex.target.speed > 350 ||
             ex.intruder.speed < 60 || ex.intruder.speed > 350;
    });
    
    if (irrelevantLevelTraffic.length > 0) {
      this.errors.push(`${irrelevantLevelTraffic.length} exercises have irrelevant level traffic (same level, no level change)`);
    }
    
    if (invalidSpeeds.length > 0) {
      this.errors.push(`${invalidSpeeds.length} exercises have speeds outside 60-350 knot range`);
    }
    
    console.log(`   Irrelevant level traffic: ${irrelevantLevelTraffic.length} | Invalid speeds: ${invalidSpeeds.length}`);
  }

  // Print comprehensive test report
  printTestReport() {
    console.log('\n📋 GENERATOR QUALITY TEST REPORT');
    console.log('='.repeat(60));
    console.log('📖 Based on context.txt requirements');
    console.log('='.repeat(60));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ ALL TESTS PASSED - Generator quality is excellent!');
      console.log('🎯 All context.txt requirements met');
    } else {
      if (this.errors.length > 0) {
        console.log(`❌ CRITICAL ERRORS (${this.errors.length}):`);
        this.errors.forEach(error => console.log(`   • ${error}`));
        console.log('');
      }
      
      if (this.warnings.length > 0) {
        console.log(`⚠️  WARNINGS (${this.warnings.length}):`);
        this.warnings.forEach(warning => console.log(`   • ${warning}`));
        console.log('');
      }
    }
    
    console.log(`📊 Test Statistics:`);
    console.log(`   • Total exercises tested: ${this.results.length}`);
    console.log(`   • Generation success rate: ${((this.results.length / this.testCount) * 100).toFixed(1)}%`);
    console.log(`   • Critical errors: ${this.errors.length}`);
    console.log(`   • Warnings: ${this.warnings.length}`);
    console.log(`   • Context.txt compliance: ${this.errors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
    
    if (this.errors.length === 0) {
      console.log('\n🎉 Generator meets all context.txt quality standards!');
    } else {
      console.log('\n🚨 Generator violates context.txt requirements - please fix before deployment!');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new GeneratorTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = GeneratorTester;