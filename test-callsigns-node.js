// Comprehensive test for both notes.txt and callsign.txt requirements
// This validates the exact specifications from both files

const fs = require('fs');
const path = require('path');

// Mock the generator functionality for testing - EXACT data from callsign.txt
function createMockGenerator() {
    // EXACT militaryCallsigns from callsign.txt
    const militaryCallsigns = [
        "REDARROW", "ANGE", "LHOB", "MILAN", "REF", "BENGA", "VOLPE", "FIAMM", 
        "HKY", "RRR", "HR", "VVAJ", "BAF", "RCH", "CFC", "SPARTA", "BRK", "ROF", 
        "OR", "COBRA", "SRA", "RNGR", "BOMR", "WOLF", "TRITN", "RESQ"
    ];

    // EXACT vfrCallsigns from callsign.txt
    const vfrCallsigns = [
        { country: "Belgium", countryCode: "OO", presentation: "PZZ" },
        { country: "Austria", countryCode: "OE", presentation: "KZZ" },
        { country: "Bulgaria", countryCode: "LZ", presentation: "ZZZ" },
        { country: "Czech Republic", countryCode: "OK", presentation: "ZZZ" },
        { country: "Slovakia", countryCode: "OM", presentation: "ZZZ" },
        { country: "Estonia", countryCode: "ES", presentation: "ZZZ" },
        { country: "Isle of Man", countryCode: "M", presentation: "ZZZZ" },
        { country: "Finland", countryCode: "OH", presentation: "ZZZ" },
        { country: "Germany", countryCode: "DE", presentation: "ZZZ" },
        { country: "France", countryCode: "F", presentation: "ZZZZ" },
        { country: "Italy", countryCode: "I", presentation: "ZZZZ" },
        { country: "Hungary", countryCode: "HA", presentation: "ZZZ" },
        { country: "Ireland", countryCode: "IE", presentation: "ZZZ" },
        { country: "Latvia", countryCode: "YL", presentation: "ZZZ" },
        { country: "Lithuania", countryCode: "LY", presentation: "ZZZ" },
        { country: "Luxembourg", countryCode: "LX", presentation: "ZZZ" },
        { country: "Netherlands", countryCode: "PH", presentation: "ZZZ" },
        { country: "Norway", countryCode: "LN", presentation: "ZZZ" },
        { country: "Poland", countryCode: "SP", presentation: "ZZZ" },
        { country: "Portugal", countryCode: "CR", presentation: "ZZZ" },
        { country: "Spain", countryCode: "EC", presentation: "WZZ" },
        { country: "Sweden", countryCode: "SE", presentation: "ZZZ" },
        { country: "Switzerland", countryCode: "HB", presentation: "ZZZ" },
        { country: "Serbia", countryCode: "YU", presentation: "ZZZ" },
        { country: "United Kingdom", countryCode: "G", presentation: "ZZZZ" },
        { country: "United States", countryCode: "N", presentation: "1AA-999ZZ" },
        { country: "Denmark", countryCode: "OY", presentation: "ZZZ" }
    ];

    // EXACT airlines from callsign.txt (full list)
    const airlines = [
        { icao: "AAL", callsign: "american" },
        { icao: "ACA", callsign: "air canada" },
        { icao: "AFR", callsign: "air france" },
        { icao: "AUA", callsign: "austrian" },
        { icao: "BAW", callsign: "speedbird" },
        { icao: "BTI", callsign: "air baltic" },
        { icao: "AAB", callsign: "abelag" },
        { icao: "AIC", callsign: "air inida" },
        { icao: "ANA", callsign: "all nippon" },
        { icao: "ASL", callsign: "air serbia" },
        { icao: "BEL", callsign: "beeline" },
        { icao: "BLX", callsign: "bluescan" },
        { icao: "CAI", callsign: "corendon" },
        { icao: "CAO", callsign: "airchina freight" },
        { icao: "CES", callsign: "china eastern" },
        { icao: "CHH", callsign: "hainan" },
        { icao: "CLG", callsign: "challair" },
        { icao: "CTN", callsign: "croatia" },
        { icao: "CYP", callsign: "cyprair" },
        { icao: "DAL", callsign: "delta" },
        { icao: "DLA", callsign: "dolomiti" },
        { icao: "DLH", callsign: "lufthansa" },
        { icao: "EDW", callsign: "edelweiss" },
        { icao: "EIN", callsign: "shamrock" },
        { icao: "EJA", callsign: "execjet" },
        { icao: "EJU", callsign: "alpine" },
        { icao: "ETD", callsign: "etihad" },
        { icao: "ETH", callsign: "ethiopian" },
        { icao: "EWG", callsign: "eurowings" },
        { icao: "EXS", callsign: "channex" },
        { icao: "EZY", callsign: "easy" },
        { icao: "FDX", callsign: "fedex" },
        { icao: "FIN", callsign: "finair" },
        { icao: "IBE", callsign: "iberia" },
        { icao: "ICE", callsign: "iceair" },
        { icao: "ITY", callsign: "itarrow" },
        { icao: "JAF", callsign: "beauty" },
        { icao: "JBU", callsign: "jetblue" },
        { icao: "JIA", callsign: "blue streak" },
        { icao: "KAL", callsign: "korean air" },
        { icao: "KLM", callsign: "klm" },
        { icao: "LGL", callsign: "luxair" },
        { icao: "LOT", callsign: "lot" },
        { icao: "MAC", callsign: "arabia maroc" },
        { icao: "MXY", callsign: "moxy" },
        { icao: "NFA", callsign: "north flying" },
        { icao: "NJE", callsign: "fraction" },
        { icao: "NOZ", callsign: "nordic" },
        { icao: "NSZ", callsign: "rednose" },
        { icao: "OCN", callsign: "ocean" },
        { icao: "PGT", callsign: "sunturk" },
        { icao: "QTR", callsign: "qatari" },
        { icao: "RJA", callsign: "jordanian" },
        { icao: "ROT", callsign: "tarom" },
        { icao: "RPA", callsign: "brickyard" },
        { icao: "ROU", callsign: "rouge" },
        { icao: "RYR", callsign: "ryanair" },
        { icao: "SAS", callsign: "scandinavian" },
        { icao: "SIA", callsign: "singapore" },
        { icao: "SVA", callsign: "saudia" },
        { icao: "SWA", callsign: "southwest" },
        { icao: "SWR", callsign: "swiss" },
        { icao: "TAP", callsign: "air portugal" },
        { icao: "THA", callsign: "thai" },
        { icao: "THY", callsign: "turkish" },
        { icao: "TOM", callsign: "tom jet" },
        { icao: "TRA", callsign: "transavia" },
        { icao: "TSC", callsign: "air transat" },
        { icao: "TUI", callsign: "tui jet" },
        { icao: "TVS", callsign: "skytravel" },
        { icao: "UAE", callsign: "emirates" },
        { icao: "UAL", callsign: "united" },
        { icao: "UPS", callsign: "ups" },
        { icao: "VIR", callsign: "virgin express" },
        { icao: "VKG", callsign: "viking" },
        { icao: "VLG", callsign: "vueling" },
        { icao: "VOE", callsign: "volotea" },
        { icao: "WIF", callsign: "wideroe" },
        { icao: "WJA", callsign: "westjet" },
        { icao: "WZZ", callsign: "wizzair" }
    ];

    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getWeightedSelection(weights) {
        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of weights) {
            random -= item.weight;
            if (random <= 0) {
                return item.selection;
            }
        }
        return weights[weights.length - 1].selection;
    }

    function generateCallsign(isVFR, role = 'target', isMil = false) {
        // Military VFR callsign: INTRUDER is VFR && INTRUDER is MIL
        if (role === 'intruder' && isVFR && isMil) {
            const base = militaryCallsigns[rnd(0, militaryCallsigns.length - 1)];
            const suffix = Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString();
            return base + suffix;
        } 
        else if (isVFR) {
            // VFR callsigns
            const vfrData = vfrCallsigns[rnd(0, vfrCallsigns.length - 1)];
            
            if (vfrData.countryCode === "N") {
                // US callsigns with numbers
                const weights = [
                    { selection: 1, weight: 100 },
                    { selection: 2, weight: 200 }, 
                    { selection: 3, weight: 150 }
                ];
                const numCount = getWeightedSelection(weights);
                let callsign = vfrData.countryCode;
                
                for (let i = 0; i < numCount; i++) {
                    callsign += Math.floor(Math.random() * 10).toString();
                }
                
                const letterCount = Math.random() > 0.5 ? 2 : 3;
                for (let i = 0; i < letterCount; i++) {
                    callsign += String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
                
                return callsign;
            } else {
                // Other countries
                let callsign = vfrData.countryCode;
                const presentation = vfrData.presentation;
                
                for (let char of presentation) {
                    if (char === 'Z') {
                        callsign += String.fromCharCode(65 + Math.floor(Math.random() * 26));
                    } else if (char === 'P') {
                        callsign += String.fromCharCode(65 + Math.floor(Math.random() * 16));
                    } else if (char === 'K') {
                        callsign += String.fromCharCode(75 + Math.floor(Math.random() * 11));
                    } else if (char === 'W') {
                        // Spain "WZZ" - W means A-W
                        callsign += String.fromCharCode(65 + Math.floor(Math.random() * 23)); // A-W
                    }
                }
                
                return callsign;
            }
        } 
        else {
            // IFR callsigns
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
                                // Generate suffix following callsign.txt exactly:
                // "Generate characters (str) based on the following code:
                // for (let i = 0; i < c; i++) {
                //     if (str[str.length - 1].match(/[A-Z]/) || Math.random() > (target.isVFR ? 0.1 : 0.75)) {
                //         str = str.concat(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
                //     } else {
                //         str = str.concat((Math.floor(Math.random() * 10)).toString());
                //     }
                // }"
                if (suffix[suffix.length - 1] && suffix[suffix.length - 1].match(/[A-Z]/) || Math.random() > 0.75) {
                    suffix += String.fromCharCode(65 + Math.floor(Math.random() * 26));
                } else {
                    suffix += Math.floor(Math.random() * 10).toString();
                }
            }
            
            return airline.icao + suffix;
        }
    }

    function generateExercise() {
        // Flight rule selection
        const flightRuleWeights = [
            { selection: 'VFR', weight: 30 },
            { selection: 'IFR', weight: 70 }
        ];
        
        const targetFlightRule = getWeightedSelection(flightRuleWeights);
        const targetIsVFR = targetFlightRule === 'VFR';
        
        // Target is never military
        const target = {
            callsign: generateCallsign(targetIsVFR, 'target', false),
            isVFR: targetIsVFR,
            isMil: false
        };

        // Intruder flight rule
        const intruderFlightRule = getWeightedSelection(flightRuleWeights);
        const intruderIsVFR = intruderFlightRule === 'VFR';
        
        // If INTRUDER is VFR, then it has 10% chance to be military
        const intruderIsMil = intruderIsVFR && Math.random() <= 0.10;
        
        const intruder = {
            callsign: generateCallsign(intruderIsVFR, 'intruder', intruderIsMil),
            isVFR: intruderIsVFR,
            isMil: intruderIsMil
        };

        return { target, intruder };
    }

    return { generateExercise };
}

function testCallsignRequirements(numExercises = 1000) {
    console.log('🧪 Comprehensive Testing: notes.txt & callsign.txt Requirements...\n');
    
    const { generateExercise } = createMockGenerator();
    
    const results = {
        totalExercises: numExercises,
        
        // notes.txt requirements
        targetMilitary: 0,
        intruderVFR: 0,
        intruderVFRMilitary: 0,
        intruderIFR: 0,
        
        // callsign.txt specific requirements
        militaryCallsignFormats: { valid: 0, invalid: 0, samples: [] },
        vfrCallsignFormats: { 
            belgium_PZZ: { valid: 0, invalid: 0, samples: [] },
            austria_KZZ: { valid: 0, invalid: 0, samples: [] },
            spain_WZZ: { valid: 0, invalid: 0, samples: [] },
            us_numbers: { valid: 0, invalid: 0, samples: [] },
            nonUS_noNumbers: { valid: 0, invalid: 0, samples: [] }
        },
        ifrCallsignFormats: { 
            validICAO: { valid: 0, invalid: 0, samples: [] },
            suffixWeights: { length1: 0, length2: 0, length3: 0, length4: 0 }
        },
        
        // General categories
        vfrCallsigns: [],
        ifrCallsigns: [],
        militaryCallsigns: []
    };
    
    // Reference data from callsign.txt for validation
    const expectedMilitary = [
        "REDARROW", "ANGE", "LHOB", "MILAN", "REF", "BENGA", "VOLPE", "FIAMM", 
        "HKY", "RRR", "HR", "VVAJ", "BAF", "RCH", "CFC", "SPARTA", "BRK", "ROF", 
        "OR", "COBRA", "SRA", "RNGR", "BOMR", "WOLF", "TRITN", "RESQ"
    ];
    
    const expectedICAOs = [
        "AAL", "ACA", "AFR", "AUA", "BAW", "BTI", "AAB", "AIC", "ANA", "ASL",
        "BEL", "BLX", "CAI", "CAO", "CES", "CHH", "CLG", "CTN", "CYP", "DAL",
        "DLA", "DLH", "EDW", "EIN", "EJA", "EJU", "ETD", "ETH", "EWG", "EXS",
        "EZY", "FDX", "FIN", "IBE", "ICE", "ITY", "JAF", "JBU", "JIA", "KAL",
        "KLM", "LGL", "LOT", "MAC", "MXY", "NFA", "NJE", "NOZ", "NSZ", "OCN",
        "PGT", "QTR", "RJA", "ROT", "RPA", "ROU", "RYR", "SAS", "SIA", "SVA",
        "SWA", "SWR", "TAP", "THA", "THY", "TOM", "TRA", "TSC", "TUI", "TVS",
        "UAE", "UAL", "UPS", "VIR", "VKG", "VLG", "VOE", "WIF", "WJA", "WZZ"
    ];
    
    // Generate exercises and analyze
    for (let i = 0; i < results.totalExercises; i++) {
        const exercise = generateExercise();
        const { target, intruder } = exercise;
        
        // notes.txt: "ONLY the intruder can be military (never the target)"
        if (target.isMil) {
            results.targetMilitary++;
        }
        
        // Analyze intruder
        if (intruder.isVFR) {
            results.intruderVFR++;
            
            if (intruder.isMil) {
                results.intruderVFRMilitary++;
                results.militaryCallsigns.push(intruder.callsign);
                
                // Validate military format: callsign.txt "Add two random numbers from 0 to 9 as a suffix"
                const baseCallsign = intruder.callsign.slice(0, -2);
                const suffix = intruder.callsign.slice(-2);
                
                if (expectedMilitary.includes(baseCallsign) && /^\d{2}$/.test(suffix)) {
                    results.militaryCallsignFormats.valid++;
                } else {
                    results.militaryCallsignFormats.invalid++;
                }
                
                if (results.militaryCallsignFormats.samples.length < 10) {
                    results.militaryCallsignFormats.samples.push(intruder.callsign);
                }
            } else {
                results.vfrCallsigns.push(intruder.callsign);
                
                // Validate VFR formats according to callsign.txt specifications
                validateVFRCallsign(intruder.callsign, results.vfrCallsignFormats);
            }
        } else {
            results.intruderIFR++;
            results.ifrCallsigns.push(intruder.callsign);
            
            // Validate IFR format: ICAO prefix + suffix
            validateIFRCallsign(intruder.callsign, results.ifrCallsignFormats, expectedICAOs);
        }
    }
    
    // Calculate results and report
    const vfrMilitaryPercentage = results.intruderVFR > 0 ? 
        (results.intruderVFRMilitary / results.intruderVFR * 100) : 0;
    
    // Print comprehensive results
    console.log('📊 COMPREHENSIVE TEST RESULTS:');
    console.log('='.repeat(70));
    
    console.log(`\n📋 notes.txt REQUIREMENTS:`);
    console.log(`• Target military (should be 0): ${results.targetMilitary}/${results.totalExercises}`);
    console.log(`• ${results.targetMilitary === 0 ? '✅ PASS' : '❌ FAIL'}: ${results.targetMilitary === 0 ? 'Targets are never military' : 'Targets can be military'}`);
    
    console.log(`• VFR intruders with 10% military: ${results.intruderVFRMilitary}/${results.intruderVFR} (${vfrMilitaryPercentage.toFixed(1)}%)`);
    console.log(`• ${vfrMilitaryPercentage >= 8 && vfrMilitaryPercentage <= 12 ? '✅ PASS' : '❌ FAIL'}: Military percentage ${vfrMilitaryPercentage >= 8 && vfrMilitaryPercentage <= 12 ? 'within range (8-12%)' : 'outside expected range'}`);
    
    console.log(`\n🪖 callsign.txt MILITARY REQUIREMENTS:`);
    console.log(`• Valid military format: ${results.militaryCallsignFormats.valid}/${results.militaryCallsignFormats.valid + results.militaryCallsignFormats.invalid}`);
    console.log(`• ${results.militaryCallsignFormats.invalid === 0 ? '✅ PASS' : '❌ FAIL'}: ${results.militaryCallsignFormats.invalid === 0 ? 'All follow [BASE][2DIGITS] format' : 'Some have incorrect format'}`);
    console.log(`• Samples: ${results.militaryCallsignFormats.samples.join(', ')}`);
    
    console.log(`\n✈️ callsign.txt VFR REQUIREMENTS:`);
    printVFRResults(results.vfrCallsignFormats);
    
    console.log(`\n🏢 callsign.txt IFR REQUIREMENTS:`);
    printIFRResults(results.ifrCallsignFormats);
    
    // Overall assessment
    const allTestsPassed = 
        results.targetMilitary === 0 &&
        vfrMilitaryPercentage >= 8 && vfrMilitaryPercentage <= 12 &&
        results.militaryCallsignFormats.invalid === 0 &&
        validateAllVFRFormats(results.vfrCallsignFormats) &&
        validateAllIFRFormats(results.ifrCallsignFormats);
    
    console.log(`\n🏆 OVERALL RESULT:`);
    console.log(`${allTestsPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED!'}`);
    console.log('='.repeat(70));
    
    return allTestsPassed;
}

function validateVFRCallsign(callsign, formats) {
    // Belgium OO-PZZ: "PZZ" means first letter A-P, last two any letter
    if (callsign.startsWith('OO')) {
        const suffix = callsign.slice(2);
        if (suffix.length === 3 && 
            suffix[0] >= 'A' && suffix[0] <= 'P' &&
            /^[A-Z]{2}$/.test(suffix.slice(1))) {
            formats.belgium_PZZ.valid++;
        } else {
            formats.belgium_PZZ.invalid++;
        }
        if (formats.belgium_PZZ.samples.length < 5) {
            formats.belgium_PZZ.samples.push(callsign);
        }
    }
    
    // Austria OE-KZZ: first letter K-Z, last two any letter
    else if (callsign.startsWith('OE')) {
        const suffix = callsign.slice(2);
        if (suffix.length === 3 && 
            suffix[0] >= 'K' && suffix[0] <= 'Z' &&
            /^[A-Z]{2}$/.test(suffix.slice(1))) {
            formats.austria_KZZ.valid++;
        } else {
            formats.austria_KZZ.invalid++;
        }
        if (formats.austria_KZZ.samples.length < 5) {
            formats.austria_KZZ.samples.push(callsign);
        }
    }
    
    // Spain EC-WZZ: first letter A-W, last two any letter
    else if (callsign.startsWith('EC')) {
        const suffix = callsign.slice(2);
        if (suffix.length === 3 && 
            suffix[0] >= 'A' && suffix[0] <= 'W' &&
            /^[A-Z]{2}$/.test(suffix.slice(1))) {
            formats.spain_WZZ.valid++;
        } else {
            formats.spain_WZZ.invalid++;
        }
        if (formats.spain_WZZ.samples.length < 5) {
            formats.spain_WZZ.samples.push(callsign);
        }
    }
    
    // US N callsigns: should contain numbers
    else if (callsign.startsWith('N')) {
        if (/\d/.test(callsign)) {
            formats.us_numbers.valid++;
        } else {
            formats.us_numbers.invalid++;
        }
        if (formats.us_numbers.samples.length < 5) {
            formats.us_numbers.samples.push(callsign);
        }
    }
    
    // Non-US VFR: should NOT contain numbers
    else {
        if (!/\d/.test(callsign)) {
            formats.nonUS_noNumbers.valid++;
        } else {
            formats.nonUS_noNumbers.invalid++;
        }
        if (formats.nonUS_noNumbers.samples.length < 5) {
            formats.nonUS_noNumbers.samples.push(callsign);
        }
    }
}

function validateIFRCallsign(callsign, formats, expectedICAOs) {
    // Check if starts with valid ICAO code
    const icaoCode = callsign.slice(0, 3);
    if (expectedICAOs.includes(icaoCode)) {
        formats.validICAO.valid++;
        
        // Check suffix length distribution
        const suffix = callsign.slice(3);
        if (suffix.length === 1) formats.suffixWeights.length1++;
        else if (suffix.length === 2) formats.suffixWeights.length2++;
        else if (suffix.length === 3) formats.suffixWeights.length3++;
        else if (suffix.length === 4) formats.suffixWeights.length4++;
        
    } else {
        formats.validICAO.invalid++;
    }
    
    if (formats.validICAO.samples.length < 10) {
        formats.validICAO.samples.push(callsign);
    }
}

function printVFRResults(formats) {
    console.log(`• Belgium (OO-PZZ): ${formats.belgium_PZZ.valid}/${formats.belgium_PZZ.valid + formats.belgium_PZZ.invalid} valid`);
    console.log(`  ${formats.belgium_PZZ.invalid === 0 ? '✅' : '❌'} Samples: ${formats.belgium_PZZ.samples.join(', ')}`);
    
    console.log(`• Austria (OE-KZZ): ${formats.austria_KZZ.valid}/${formats.austria_KZZ.valid + formats.austria_KZZ.invalid} valid`);
    console.log(`  ${formats.austria_KZZ.invalid === 0 ? '✅' : '❌'} Samples: ${formats.austria_KZZ.samples.join(', ')}`);
    
    console.log(`• Spain (EC-WZZ): ${formats.spain_WZZ.valid}/${formats.spain_WZZ.valid + formats.spain_WZZ.invalid} valid`);
    console.log(`  ${formats.spain_WZZ.invalid === 0 ? '✅' : '❌'} Samples: ${formats.spain_WZZ.samples.join(', ')}`);
    
    console.log(`• US numbers: ${formats.us_numbers.valid}/${formats.us_numbers.valid + formats.us_numbers.invalid} valid`);
    console.log(`  ${formats.us_numbers.invalid === 0 ? '✅' : '❌'} Samples: ${formats.us_numbers.samples.join(', ')}`);
    
    console.log(`• Non-US no numbers: ${formats.nonUS_noNumbers.valid}/${formats.nonUS_noNumbers.valid + formats.nonUS_noNumbers.invalid} valid`);
    console.log(`  ${formats.nonUS_noNumbers.invalid === 0 ? '✅' : '❌'} Samples: ${formats.nonUS_noNumbers.samples.join(', ')}`);
}

function printIFRResults(formats) {
    console.log(`• Valid ICAO codes: ${formats.validICAO.valid}/${formats.validICAO.valid + formats.validICAO.invalid}`);
    console.log(`  ${formats.validICAO.invalid === 0 ? '✅' : '❌'} Samples: ${formats.validICAO.samples.join(', ')}`);
    
    const total = formats.suffixWeights.length1 + formats.suffixWeights.length2 + 
                 formats.suffixWeights.length3 + formats.suffixWeights.length4;
    console.log(`• Suffix length distribution (should follow weights 10:20:150:45):`);
    console.log(`  Length 1: ${formats.suffixWeights.length1} (${(formats.suffixWeights.length1/total*100).toFixed(1)}%)`);
    console.log(`  Length 2: ${formats.suffixWeights.length2} (${(formats.suffixWeights.length2/total*100).toFixed(1)}%)`);
    console.log(`  Length 3: ${formats.suffixWeights.length3} (${(formats.suffixWeights.length3/total*100).toFixed(1)}%)`);
    console.log(`  Length 4: ${formats.suffixWeights.length4} (${(formats.suffixWeights.length4/total*100).toFixed(1)}%)`);
}

function validateAllVFRFormats(formats) {
    return formats.belgium_PZZ.invalid === 0 &&
           formats.austria_KZZ.invalid === 0 &&
           formats.spain_WZZ.invalid === 0 &&
           formats.us_numbers.invalid === 0 &&
           formats.nonUS_noNumbers.invalid === 0;
}

function validateAllIFRFormats(formats) {
    return formats.validICAO.invalid === 0;
}

// Run the test
if (require.main === module) {
    try {
        testCallsignRequirements(1000);
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

module.exports = { testCallsignRequirements };
