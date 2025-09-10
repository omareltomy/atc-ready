/**
 * Test script to verify callsign generation meets requirements
 * 
 * Requirements from notes.txt:
 * - If intruder is a VFR, then they have a 10% chance of being military
 * - ONLY the intruder can be military (never the target)
 * - VFR callsigns should not contain numbers (except US)
 * 
 * Requirements from callsign.txt:
 * - INTRUDER is VFR && INTRUDER is MIL: Use military callsigns + 2 digits
 * - INTRUDER IS VFR: Use country codes with proper presentation patterns
 * - INTRUDER IS IFR: Use airline codes with mixed letter/number suffixes
 */

// Import the generator
const { generateExercise } = require('./lib/generator.ts');

function testCallsignRequirements() {
    console.log('🧪 Testing Callsign Requirements...\n');
    
    const results = {
        totalExercises: 1000,
        targetMilitary: 0,
        intruderVFR: 0,
        intruderVFRMilitary: 0,
        intruderIFR: 0,
        vfrWithNumbers: 0,
        usVFRWithNumbers: 0,
        militaryCallsigns: [],
        vfrCallsigns: [],
        ifrCallsigns: []
    };
    
    // Generate exercises and analyze callsigns
    for (let i = 0; i < results.totalExercises; i++) {
        const exercise = generateExercise();
        const { target, intruder } = exercise;
        
        // Check if target is ever military
        if (target.isMil) {
            results.targetMilitary++;
        }
        
        // Analyze intruder
        if (intruder.isVFR) {
            results.intruderVFR++;
            
            if (intruder.isMil) {
                results.intruderVFRMilitary++;
                results.militaryCallsigns.push(intruder.callsign);
            } else {
                results.vfrCallsigns.push(intruder.callsign);
                
                // Check for numbers in VFR callsigns
                if (/\d/.test(intruder.callsign)) {
                    results.vfrWithNumbers++;
                    
                    // Check if it's a US callsign (starts with N)
                    if (intruder.callsign.startsWith('N')) {
                        results.usVFRWithNumbers++;
                    }
                }
            }
        } else {
            results.intruderIFR++;
            results.ifrCallsigns.push(intruder.callsign);
        }
    }
    
    // Calculate percentages
    const vfrMilitaryPercentage = results.intruderVFR > 0 ? 
        (results.intruderVFRMilitary / results.intruderVFR * 100) : 0;
    
    const nonUSVFRWithNumbers = results.vfrWithNumbers - results.usVFRWithNumbers;
    
    // Print results
    console.log('📊 TEST RESULTS:');
    console.log('='.repeat(50));
    
    console.log(`\n🎯 TARGET REQUIREMENTS:`);
    console.log(`• Targets that are military: ${results.targetMilitary}/${results.totalExercises}`);
    console.log(`• ✅ PASS: ${results.targetMilitary === 0 ? 'Targets are never military' : '❌ FAIL: Targets can be military'}`);
    
    console.log(`\n✈️ INTRUDER FLIGHT RULES:`);
    console.log(`• VFR intruders: ${results.intruderVFR}/${results.totalExercises} (${(results.intruderVFR/results.totalExercises*100).toFixed(1)}%)`);
    console.log(`• IFR intruders: ${results.intruderIFR}/${results.totalExercises} (${(results.intruderIFR/results.totalExercises*100).toFixed(1)}%)`);
    
    console.log(`\n🪖 MILITARY REQUIREMENTS:`);
    console.log(`• VFR military intruders: ${results.intruderVFRMilitary}/${results.intruderVFR} (${vfrMilitaryPercentage.toFixed(1)}%)`);
    console.log(`• Expected: ~10% of VFR intruders should be military`);
    console.log(`• ✅ ${vfrMilitaryPercentage >= 8 && vfrMilitaryPercentage <= 12 ? 'PASS' : '❌ FAIL'}: Military percentage is ${vfrMilitaryPercentage >= 8 && vfrMilitaryPercentage <= 12 ? 'within acceptable range (8-12%)' : 'outside expected range'}`);
    
    console.log(`\n🔢 VFR CALLSIGN NUMBER REQUIREMENTS:`);
    console.log(`• VFR callsigns with numbers: ${results.vfrWithNumbers}/${results.vfrCallsigns.length}`);
    console.log(`• US VFR callsigns with numbers: ${results.usVFRWithNumbers}`);
    console.log(`• Non-US VFR callsigns with numbers: ${nonUSVFRWithNumbers}`);
    console.log(`• ✅ ${nonUSVFRWithNumbers === 0 ? 'PASS' : '❌ FAIL'}: ${nonUSVFRWithNumbers === 0 ? 'Only US VFR callsigns contain numbers' : 'Non-US VFR callsigns incorrectly contain numbers'}`);
    
    console.log(`\n📋 SAMPLE CALLSIGNS:`);
    console.log(`• Military VFR (first 10): ${results.militaryCallsigns.slice(0, 10).join(', ')}`);
    console.log(`• Regular VFR (first 10): ${results.vfrCallsigns.slice(0, 10).join(', ')}`);
    console.log(`• IFR (first 10): ${results.ifrCallsigns.slice(0, 10).join(', ')}`);
    
    // Validate military callsign format
    console.log(`\n🔍 MILITARY CALLSIGN FORMAT VALIDATION:`);
    const validMilitaryCallsigns = results.militaryCallsigns.filter(cs => {
        // Should be military base + 2 digits
        return /^[A-Z]+\d{2}$/.test(cs);
    });
    
    console.log(`• Valid military format: ${validMilitaryCallsigns.length}/${results.militaryCallsigns.length}`);
    console.log(`• ✅ ${validMilitaryCallsigns.length === results.militaryCallsigns.length ? 'PASS' : '❌ FAIL'}: ${validMilitaryCallsigns.length === results.militaryCallsigns.length ? 'All military callsigns follow correct format' : 'Some military callsigns have incorrect format'}`);
    
    // Overall assessment
    const allTestsPassed = 
        results.targetMilitary === 0 &&
        vfrMilitaryPercentage >= 8 && vfrMilitaryPercentage <= 12 &&
        nonUSVFRWithNumbers === 0 &&
        validMilitaryCallsigns.length === results.militaryCallsigns.length;
    
    console.log(`\n🏆 OVERALL RESULT:`);
    console.log(`${allTestsPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED!'}`);
    console.log('='.repeat(50));
    
    return allTestsPassed;
}

// Run the test
if (require.main === module) {
    try {
        testCallsignRequirements();
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

module.exports = { testCallsignRequirements };
