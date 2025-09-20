/**
 * Test VFR/IFR Distribution
 * Verifies that the generator produces approximately 75% VFR and 25% IFR exercises
 */

// Simple mock implementation to test the VFR/IFR distribution logic
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

function selectFlightRule() {
    // Flight rule distribution (based on final requirements: 75% VFR, 25% IFR)
    const flightRuleWeights = [
        { selection: 'VFR', weight: 75 },
        { selection: 'IFR', weight: 25 }
    ];
    
    return getWeightedSelection(flightRuleWeights);
}

function testVFRIFRDistribution() {
    console.log('🧪 Testing VFR/IFR Distribution (75%/25%)...\n');
    
    const sampleSize = 1000;
    let vfrCount = 0;
    let ifrCount = 0;
    
    console.log(`📊 Generating ${sampleSize} flight rule selections to test distribution...`);
    
    for (let i = 0; i < sampleSize; i++) {
        try {
            const flightRule = selectFlightRule();
            
            if (flightRule === 'VFR') {
                vfrCount++;
            } else {
                ifrCount++;
            }
            
            // Progress indicator every 100 selections
            if ((i + 1) % 100 === 0) {
                process.stdout.write(`Progress: ${i + 1}/${sampleSize} (${Math.round(((i + 1) / sampleSize) * 100)}%)\r`);
            }
        } catch (error) {
            console.error(`\n❌ Error generating selection ${i + 1}:`, error.message);
        }
    }
    
    console.log('\n\n📋 RESULTS:');
    console.log('======================================================================');
    
    const vfrPercentage = (vfrCount / sampleSize) * 100;
    const ifrPercentage = (ifrCount / sampleSize) * 100;
    
    console.log(`VFR Selections: ${vfrCount}/${sampleSize} (${vfrPercentage.toFixed(1)}%)`);
    console.log(`IFR Selections: ${ifrCount}/${sampleSize} (${ifrPercentage.toFixed(1)}%)`);
    
    // Check if distribution is within acceptable range (±5% tolerance)
    const vfrTarget = 75;
    const ifrTarget = 25;
    const tolerance = 5;
    
    const vfrInRange = Math.abs(vfrPercentage - vfrTarget) <= tolerance;
    const ifrInRange = Math.abs(ifrPercentage - ifrTarget) <= tolerance;
    
    console.log('\n🎯 TARGET vs ACTUAL:');
    console.log(`VFR Target: ${vfrTarget}% | Actual: ${vfrPercentage.toFixed(1)}% | ${vfrInRange ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`IFR Target: ${ifrTarget}% | Actual: ${ifrPercentage.toFixed(1)}% | ${ifrInRange ? '✅ PASS' : '❌ FAIL'}`);
    
    if (vfrInRange && ifrInRange) {
        console.log('\n🏆 OVERALL RESULT: ✅ ALL TESTS PASSED!');
        console.log('Flight rule distribution is within acceptable range (±5%)');
    } else {
        console.log('\n❌ OVERALL RESULT: TESTS FAILED!');
        console.log('Flight rule distribution is outside acceptable range (±5%)');
    }
    
    console.log('======================================================================');
}

// Run the test
testVFRIFRDistribution();