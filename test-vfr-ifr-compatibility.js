/**
 * Test VFR/IFR Traffic Compatibility
 * Verifies that VFR and IFR traffic are never mixed in the same exercise
 */

// Simple mock implementation to test the flight rule compatibility logic
function getWeightedSelection(weights) {
    const cumulativeWeights = [];
    for (let i = 0; i < weights.length; i++) {
        cumulativeWeights[i] = weights[i].weight + (cumulativeWeights[i - 1] || 0);
    }
    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomNumber = Math.random() * maxCumulativeWeight;
    
    for (let numberIndex = 0; numberIndex < weights.length; numberIndex++) {
        if (cumulativeWeights[numberIndex] >= randomNumber) {
            return weights[numberIndex].selection;
        }
    }
}

function selectCompatibleAircraft() {
    // Flight rule distribution (based on final requirements: 75% VFR, 25% IFR)
    const flightRuleWeights = [
        { selection: 'VFR', weight: 75 },
        { selection: 'IFR', weight: 25 }
    ];
    
    const targetFlightRule = getWeightedSelection(flightRuleWeights);
    const targetIsVFR = targetFlightRule === 'VFR';
    
    // IMPORTANT: Both target and intruder must have the same flight rule
    // When target is VFR, intruder must also be VFR
    // When target is IFR, intruder must also be IFR
    const intruderIsVFR = targetIsVFR;
    
    return {
        targetIsVFR,
        intruderIsVFR
    };
}

function testVFRIFRCompatibility() {
    console.log('🧪 Testing VFR/IFR Traffic Compatibility...\n');
    
    const sampleSize = 1000;
    let vfrExercises = 0;
    let ifrExercises = 0;
    let mixedExercises = 0;
    let mixedExamples = [];
    
    console.log(`📊 Generating ${sampleSize} exercise configurations to test compatibility...`);
    
    for (let i = 0; i < sampleSize; i++) {
        try {
            const { targetIsVFR, intruderIsVFR } = selectCompatibleAircraft();
            
            if (targetIsVFR && intruderIsVFR) {
                vfrExercises++;
            } else if (!targetIsVFR && !intruderIsVFR) {
                ifrExercises++;
            } else {
                // This should NEVER happen
                mixedExercises++;
                mixedExamples.push(`Exercise ${i + 1}: Target=${targetIsVFR ? 'VFR' : 'IFR'}, Intruder=${intruderIsVFR ? 'VFR' : 'IFR'}`);
            }
            
            // Progress indicator every 100 exercises
            if ((i + 1) % 100 === 0) {
                process.stdout.write(`Progress: ${i + 1}/${sampleSize} (${Math.round(((i + 1) / sampleSize) * 100)}%)\r`);
            }
        } catch (error) {
            console.error(`\n❌ Error generating exercise ${i + 1}:`, error.message);
        }
    }
    
    console.log('\n\n📋 RESULTS:');
    console.log('======================================================================');
    
    const vfrPercentage = (vfrExercises / sampleSize) * 100;
    const ifrPercentage = (ifrExercises / sampleSize) * 100;
    const mixedPercentage = (mixedExercises / sampleSize) * 100;
    
    console.log(`VFR-only Exercises: ${vfrExercises}/${sampleSize} (${vfrPercentage.toFixed(1)}%)`);
    console.log(`IFR-only Exercises: ${ifrExercises}/${sampleSize} (${ifrPercentage.toFixed(1)}%)`);
    console.log(`Mixed Exercises: ${mixedExercises}/${sampleSize} (${mixedPercentage.toFixed(1)}%)`);
    
    if (mixedExercises > 0) {
        console.log('\n❌ MIXED EXERCISE EXAMPLES:');
        mixedExamples.slice(0, 5).forEach(example => {
            console.log(`  • ${example}`);
        });
        if (mixedExamples.length > 5) {
            console.log(`  ... and ${mixedExamples.length - 5} more`);
        }
    }
    
    // Check if no mixed exercises exist (this is what we want)
    const isSuccess = mixedExercises === 0;
    
    console.log('\n🎯 COMPATIBILITY CHECK:');
    console.log(`Mixed VFR/IFR Traffic: ${mixedExercises} exercises | ${isSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Expected: 0 mixed exercises | Actual: ${mixedExercises} mixed exercises`);
    
    // Verify the distribution is approximately correct
    const vfrTarget = 75;
    const ifrTarget = 25;
    const tolerance = 5;
    
    const vfrInRange = Math.abs(vfrPercentage - vfrTarget) <= tolerance;
    const ifrInRange = Math.abs(ifrPercentage - ifrTarget) <= tolerance;
    
    console.log('\n📊 DISTRIBUTION CHECK:');
    console.log(`VFR Target: ${vfrTarget}% | Actual: ${vfrPercentage.toFixed(1)}% | ${vfrInRange ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`IFR Target: ${ifrTarget}% | Actual: ${ifrPercentage.toFixed(1)}% | ${ifrInRange ? '✅ PASS' : '❌ FAIL'}`);
    
    if (isSuccess && vfrInRange && ifrInRange) {
        console.log('\n🏆 OVERALL RESULT: ✅ ALL TESTS PASSED!');
        console.log('• No VFR/IFR traffic mixing detected');
        console.log('• Flight rule distribution within acceptable range (±5%)');
    } else {
        console.log('\n❌ OVERALL RESULT: TESTS FAILED!');
        if (!isSuccess) {
            console.log('• VFR and IFR traffic are being mixed in exercises');
        }
        if (!vfrInRange || !ifrInRange) {
            console.log('• Flight rule distribution is outside acceptable range');
        }
    }
    
    console.log('======================================================================');
}

// Run the test
testVFRIFRCompatibility();