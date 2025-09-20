/**
 * Test IFR Callsign Format
 * Verifies that IFR callsigns have a number as the first character after the 3-letter airline code
 */

// Mock airline data from the generator
const airlines = [
    { icao: "AAL", callsign: "american" },
    { icao: "ACA", callsign: "air canada" },
    { icao: "AFR", callsign: "air france" },
    { icao: "DLH", callsign: "lufthansa" },
    { icao: "KLM", callsign: "klm" },
    { icao: "UAL", callsign: "united" },
    { icao: "BAW", callsign: "speedbird" }
];

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

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateIFRCallsign() {
    const airline = airlines[rnd(0, airlines.length - 1)];
    const weights = [
        { selection: 3, weight: 150 },
        { selection: 4, weight: 45 },
        { selection: 2, weight: 20 },
        { selection: 1, weight: 10 }
    ];
    const suffixLength = getWeightedSelection(weights);
    
    let suffix = "";
    for (let i = 0; i < suffixLength; i++) {
        if (i === 0) {
            // First character after airline code MUST be a number
            suffix += (Math.floor(Math.random() * 10)).toString();
        } else {
            // For subsequent characters, use the existing logic
            if (suffix[suffix.length - 1] && suffix[suffix.length - 1].match(/[A-Z]/) || Math.random() > 0.75) {
                suffix += String.fromCharCode(65 + Math.floor(Math.random() * 26));
            } else {
                suffix += (Math.floor(Math.random() * 10)).toString();
            }
        }
    }
    
    return airline.icao + suffix;
}

function testIFRCallsignFormat() {
    console.log('🧪 Testing IFR Callsign Format...\n');
    
    const sampleSize = 1000;
    let validCallsigns = 0;
    let invalidCallsigns = [];
    
    console.log(`📊 Generating ${sampleSize} IFR callsigns to test format...`);
    
    for (let i = 0; i < sampleSize; i++) {
        try {
            const callsign = generateIFRCallsign();
            
            // Check if callsign follows the correct format:
            // - 3 letters (airline code)
            // - First character after airline code must be a number
            // - Subsequent characters can be letters or numbers
            
            if (callsign.length < 4) {
                invalidCallsigns.push(`${callsign} (too short)`);
                continue;
            }
            
            const airlineCode = callsign.substring(0, 3);
            const suffix = callsign.substring(3);
            const firstSuffixChar = suffix[0];
            
            // Check if first character after airline code is a number
            if (/[0-9]/.test(firstSuffixChar)) {
                validCallsigns++;
            } else {
                invalidCallsigns.push(`${callsign} (first suffix char '${firstSuffixChar}' is not a number)`);
            }
            
            // Progress indicator every 100 callsigns
            if ((i + 1) % 100 === 0) {
                process.stdout.write(`Progress: ${i + 1}/${sampleSize} (${Math.round(((i + 1) / sampleSize) * 100)}%)\r`);
            }
        } catch (error) {
            console.error(`\n❌ Error generating callsign ${i + 1}:`, error.message);
        }
    }
    
    console.log('\n\n📋 RESULTS:');
    console.log('======================================================================');
    
    const validPercentage = (validCallsigns / sampleSize) * 100;
    
    console.log(`Valid IFR Callsigns: ${validCallsigns}/${sampleSize} (${validPercentage.toFixed(1)}%)`);
    console.log(`Invalid IFR Callsigns: ${sampleSize - validCallsigns}/${sampleSize} (${(100 - validPercentage).toFixed(1)}%)`);
    
    if (invalidCallsigns.length > 0 && invalidCallsigns.length <= 10) {
        console.log('\n🔍 SAMPLE INVALID CALLSIGNS:');
        invalidCallsigns.slice(0, 10).forEach(invalid => {
            console.log(`  • ${invalid}`);
        });
        if (invalidCallsigns.length > 10) {
            console.log(`  ... and ${invalidCallsigns.length - 10} more`);
        }
    }
    
    // Show some valid examples
    console.log('\n✅ SAMPLE VALID CALLSIGNS:');
    const validExamples = [];
    for (let i = 0; i < 20; i++) {
        const callsign = generateIFRCallsign();
        if (callsign.length >= 4 && /[0-9]/.test(callsign[3])) {
            validExamples.push(callsign);
        }
        if (validExamples.length >= 10) break;
    }
    validExamples.forEach(callsign => {
        console.log(`  • ${callsign}`);
    });
    
    const isSuccess = validPercentage === 100;
    
    console.log('\n🎯 VALIDATION:');
    console.log(`Target: 100% valid format | Actual: ${validPercentage.toFixed(1)}% | ${isSuccess ? '✅ PASS' : '❌ FAIL'}`);
    
    if (isSuccess) {
        console.log('\n🏆 OVERALL RESULT: ✅ ALL TESTS PASSED!');
        console.log('All IFR callsigns follow the correct format (airline code + number + optional letters/numbers)');
    } else {
        console.log('\n❌ OVERALL RESULT: TESTS FAILED!');
        console.log('Some IFR callsigns do not follow the correct format');
    }
    
    console.log('======================================================================');
}

// Run the test
testIFRCallsignFormat();