const target = {};
const intruder = {};
const solution = {};

function startGeneration() {

    // HELPER FUNCTIONS
    const getWeightedSelection = (weights) => {        // Select based on weighted scale
        const cumulativeWeights = []

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

    const randomBetween = (a, b) => {
        return Math.floor(a + Math.random() * (b - a + 1)); // + 1 to include upper boundary
    }

    const wrapDeg360 = (angle) => {
        const a = ((angle % 360) + 360) % 360;
        return a === 0 ? 360 : a;
    }

    // GENERATION

    const isVFR = () => {
        return Math.random() > 0.75 ? false : true;
    };

    const isMil = () => {
        if (target.isVFR) {
            return Math.random() > 0.10 ? false : true;
        } else {
            return false;
        }
    };

    const pickAircraft = () => {
        if (target.isVFR) {
            const selectVfr = vfrList[Math.floor(Math.random() * vfrList.length)];
            return selectVfr;
        }
        else {
            const selectIfr = ifrList[Math.floor(Math.random() * ifrList.length)];
            return selectIfr;
        }
    };


    const callsign = () => {
        const addSuffix = (c) => {
            let str = "";
            let repeat = target.isVFR && c > 2 ?
                (c == 5 ? 3 : 2) : 1;

            for (let i = 0; i < repeat; i++) {
                str += Math.floor(Math.random() * 9 + 1).toString();
            }

            c -= str.length;
            for (let i = 0; i < c; i++) {
                if (str[str.length - 1].match(/[A-Z]/) || Math.random() > (target.isVFR ? 0.1 : 0.75)) {
                    str = str.concat(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
                } else {
                    str = str.concat((Math.floor(Math.random() * 10)).toString());
                }
            }
            return str;
        }

        if (intruder.isVFR && intruder.isMil) { // Military callsign
            const milCode = milCallsign[Math.floor(Math.random() * milCallsign.length)];
            return milCode.concat(Math.floor(Math.random() * 10).toString());
        }
        else if (target.isVFR) { // VFR callsign
            const country = vfrCallsign[Math.floor(Math.random() * vfrCallsign.length)];
            const vfrCode = country.countryCode;
            const vfrPresentation = country.presentation;
            let vfrSuffix = "";
            if (country.country == "United States") {
                const weights = [
                    { selection: 5, weight: 300 },
                    { selection: 4, weight: 150 },
                    { selection: 3, weight: 75 },
                    { selection: 2, weight: 20 },
                    { selection: 1, weight: 10 }
                ]
                const selection = getWeightedSelection(weights);
                const vfrSuffix = addSuffix(selection);
                return vfrCode + vfrSuffix;
            } else {
                for (let i = 0; i < vfrPresentation.length; i++) {
                    let charCode = vfrPresentation[i].charCodeAt();
                    vfrSuffix = vfrSuffix.concat(String.fromCharCode(65 + Math.floor(Math.random() * (charCode - 65 + 1))));
                }
            }
            return vfrCode + vfrSuffix;
        }
        else { // IFR callsign
            const airline = airlineCode[Math.floor(Math.random() * airlineCode.length)];
            const code = airline.icao;
            const weights = [
                { selection: 3, weight: 150 },
                { selection: 4, weight: 45 },
                { selection: 2, weight: 20 },
                { selection: 1, weight: 10 }
            ]
            const selection = getWeightedSelection(weights);
            const suffix = addSuffix(selection);
            return code + suffix;
        }
    }

    const heading = () => {
        let headingSpread = 30;
        const calcHeading = (startPoint) => {
            const base = (target.heading + startPoint);
            const angle = base + randomBetween(-headingSpread, headingSpread);
            const intruderHeading = wrapDeg360(angle);
            return intruderHeading;
        }
        if (target.heading) {
            if (solution.direction == "crossing left to right") {
                return calcHeading(90);
            } else if (solution.direction == "crossing right to left") {
                return calcHeading(-90);
            } else if (solution.direction == "converging") {
                return calcHeading(0);
            } else if (solution.direction == "opposite direction") {
                return calcHeading(180);
            } else if (solution.direction == "overtaking")
                headingSpread = 10;
            return calcHeading(0);
        } else {
            return Math.round(Math.floor(Math.random() * 360 + 1) / 5) * 5;
        }
    }

    const level = () => {
        if (target.level) {
            const l = target.isVFR ? 4 : 8;
            const relativeDifference = Math.floor(Math.random() * l) + 2;

            if (target.level < 10 || (target.level < 70 && !target.isVFR)) {
                return target.level + relativeDifference;
            } else if ((target.level > 50 && target.isVFR) || target.level > 230) {
                return target.level - relativeDifference;
            } else {
                return Math.random() > 0.5 ? target.level + relativeDifference : target.level - relativeDifference;
            }
        }

        if (target.isVFR) {
            return Math.floor(Math.random() * 51) + 5;
        } else {
            return Math.floor(Math.random() * 91) + 60;
        }
    }

    const levelChange = () => {
        if (target.level != intruder.level && !target.isVFR && Math.random() > 0.7 && target.level > 70) {
            let changingTo;
            while (!changingTo || changingTo == target.level) {
                if (target.level > intruder.level) {
                    changingTo = intruder.level + 10;
                } else {
                    changingTo = intruder.level - 10;
                }
                return Math.round(changingTo / 5) * 5;
            }
        } else {
            return 0;
        }
    }

    const speed = (selected) => {
        const min = selected.speed.min;
        const max = selected.speed.max;
        return randomBetween(min, max);
    }

    const clock = () => {
        const randomClock = Math.floor(Math.random() * 12) + 1;
        return randomClock;
    }

    const distance = () => {
        const randomDistance = Math.floor(Math.random() * 5) + 3;
        return randomDistance;
    }

    const direction = () => {
        const weights = [
            { selection: "crossing right to left", weight: 50 },
            { selection: "crossing left to right", weight: 11150 },
            { selection: "converging", weight: 50 },
            { selection: "opposite direction", weight: 20 },
            { selection: "overtaking", weight: 5 }
        ]
        const selection = getWeightedSelection(weights);
        return selection;
    }

    const solutionLevel = () => {
        const levelDifference = target.level - intruder.level;
        const aboveBelow = () => {
            if (levelDifference < 0) {
                return "feet above";
            } else if (levelDifference > 0) {
                return "feet below";
            } else {
                return "same level";
            }
        }
        const levelStr = () => {
            if (levelDifference != 0) {
                return (Math.abs(levelDifference) * 100) + " " + aboveBelow();
            } else {
                return aboveBelow();
            }
        }
        return levelStr();
    }


    const generateEverything = () => {
        // These need to be generated first
        target.isVFR = isVFR();
        intruder.isVFR = target.isVFR;
        solution.direction = direction();
        const pickedTarget = pickAircraft();
        const pickedIntruder = pickAircraft();

        // Generate Target Aircraft
        target.type = pickedTarget.type;
        target.wtc = pickedTarget.wtc;
        target.callsign = callsign();
        target.heading = heading();
        target.level = level();
        target.speed = speed(pickedTarget);

        // Generate Intruder Aircraft
        intruder.isMil = isMil();
        intruder.type = pickedIntruder.type;
        intruder.wtc = pickedIntruder.wtc;
        intruder.callsign = callsign();
        intruder.heading = heading();
        intruder.level = level();
        intruder.levelChange = levelChange();
        intruder.speed = speed(pickedIntruder);

        // Generate Solution
        solution.callsign = target.callsign;
        solution.clock = clock();
        solution.distance = distance();
        solution.level = solutionLevel();
        solution.type = intruder.type;
        solution.wtc = intruder.wtc;
    }

    generateEverything();

    const createSolutionPhrase = () => {
        let str = "";
        str += solution.callsign + ", ";
        str += "Traffic, ";
        str += solution.clock + " o'clock, ";
        str += solution.distance + " miles, ";
        str += solution.direction + ", ";
        str += solution.level + ", ";
        str += solution.type;
        solution.wtc == "H" ? str += ", Heavy" : str;
        return str;
    }

    const solutionPhrase = createSolutionPhrase();

    console.log(target);
    console.log(intruder);
    console.log(solution);
    console.log(solutionPhrase);

    draw(target, intruder, solution);
}