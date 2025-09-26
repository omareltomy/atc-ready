/**
 * 🛩️ AVIATION TRAFFIC EXERCISE GENERATOR 🛩️
 * 
 * WHAT THIS FILE DOES (explain it like I'm 5):
 * Think of this like a video game that creates airplane scenarios for pilot training!
 * It randomly creates two airplanes that might crash into each other, and the pilot
 * needs to warn the first airplane about the second one.
 * 
 * HOW AIRPLANES APPROACH EACH OTHER (like directions on a clock):
 * - Crossing left to right: 28% - Airplane comes from 10-11 o'clock position
 * - Crossing right to left: 28% - Airplane comes from 1-2 o'clock position
 * - Converging: 28% - Both airplanes heading toward same spot
 * - Opposite direction: 11% - Airplanes flying straight at each other 
 * - Overtaking: 5% - Fast airplane catching up from behind
 * 
 * RULES FOR EACH DIRECTION (like rules for different games):
 * - Crossing L2R: Comes from 10-11 o'clock, 3-8 miles away, crossing angle 55-125°
 * - Crossing R2L: Comes from 1-2 o'clock, 3-8 miles away, crossing angle 55-125°
 * - Converging: Comes from 2,3,9,10 o'clock, 2-5 miles away, small angle <40°
 * - Opposite: Comes from 12 o'clock, 4-9 miles away, nearly straight on ≥170°
 * - Overtaking: Comes from 5,6,7 o'clock, 2-6 miles away, faster airplane behind
 * 
 * WHERE AIRPLANES MEET (intersection rules):
 * - Meeting point: 2-6 nautical miles from the main airplane
 * - Both airplanes should be about same distance from meeting point (±2 miles)
 * - For head-on crashes: meeting point should be exactly halfway between them
 */

// 📦 IMPORTING THE BUILDING BLOCKS
// Think of these imports like getting different boxes of LEGO pieces:

import { 
  // 🛩️ VFR_TYPES = Box of small private airplanes (like Cessna, Piper)
  VFR_TYPES, 
  // ✈️ IFR_TYPES = Box of big commercial airplanes (like Boeing, Airbus)
  IFR_TYPES, 
  // 🚁 MIL_TYPES = Box of military aircraft (like F-16, helicopters)
  MIL_TYPES, 
  // 📋 AcType = The instruction manual that tells us what each airplane can do
  type AcType,
  // 📊 DIRECTION_WEIGHTS = A list that says "28% crossing left, 28% crossing right..." 
  DIRECTION_WEIGHTS,
  // 🪖 MILITARY_CALLSIGNS = List of military code names like "EAGLE", "HAWK"
  MILITARY_CALLSIGNS,
  // 📻 VFR_CALLSIGN_PATTERNS = Rules for making small airplane names like "N1234A"
  VFR_CALLSIGN_PATTERNS,
  // 🏢 AIRLINES = List of airlines like "American", "Delta", "United" 
  AIRLINES
} from './constants';

// 📋 MORE INSTRUCTION MANUALS
// These tell us the exact format for our airplanes and exercises:
import { type Ac, type Exercise } from './types';

// =============================================================================
// 🏭 THE AIRPLANE SCENARIO FACTORY CLASS
// =============================================================================

/**
 * 🎯 WHAT THIS CLASS DOES:
 * Think of this class like a toy factory that makes airplane training scenarios.
 * It's designed so there's only ONE factory (singleton pattern) that everyone uses.
 * This ensures all the airplane scenarios follow the same rules.
 */
export class AviationTrafficGenerator {
  // 🏭 There can only be ONE factory instance (like Highlander: "There can be only one!")
  private static instance: AviationTrafficGenerator;
  
  // 📦 THE FACTORY'S SUPPLY BOXES (private = only this factory can use these):
  // Think of these like different storage boxes in our factory:
  private directionWeights = DIRECTION_WEIGHTS;     // 📊 Box with percentage rules for directions
  private militaryCallsigns = MILITARY_CALLSIGNS;   // 🪖 Box with military code names
  private vfrCallsigns = VFR_CALLSIGN_PATTERNS;     // 🏷️ Box with rules for small airplane names
  private airlines = AIRLINES;                       // 🏢 Box with airline company information

  /**
   * 🏭 GET THE FACTORY INSTANCE
   * This is like asking "Give me the airplane factory!"
   * If no factory exists yet, it creates one. If one exists, it gives you that same one.
   * This ensures everyone uses the same factory with the same rules.
   */
  public static getInstance(): AviationTrafficGenerator {
    // 🤔 Check: "Do we already have a factory?"
    if (!AviationTrafficGenerator.instance) {
      // 🏗️ "No factory exists, so let's build one!"
      AviationTrafficGenerator.instance = new AviationTrafficGenerator();
    }
    // 🎁 "Here's the factory (whether we just made it or already had it)"
    return AviationTrafficGenerator.instance;
  }

  /**
   * 🎲 RANDOM NUMBER GENERATOR (whole numbers only)
   * This is like rolling dice, but you can choose how many sides the dice has!
   * Example: rnd(1, 6) = roll a 6-sided dice (gives 1, 2, 3, 4, 5, or 6)
   * Example: rnd(10, 20) = pick random number between 10 and 20
   */
  private rnd(min: number, max: number): number {
    // 🎲 Math.random() gives 0.0 to 0.999999...
    // We multiply by (max-min+1) to get the right range
    // Then Math.floor() cuts off decimals, and we add min to shift to right range
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 🎲 RANDOM DECIMAL NUMBER GENERATOR 
   * Like the above, but allows decimal numbers (like 3.7 or 5.234)
   * Example: rndFloat(2.5, 8.7) might give 5.234 or 7.891
   */
  private rndFloat(min: number, max: number): number {
    // 🎲 Math.random() gives decimal between 0 and 1
    // We multiply by the range size and add the minimum
    return Math.random() * (max - min) + min;
  }

  /**
   * ✈️ FLIGHT LEVEL ROUNDER
   * In aviation, airplanes fly at specific "flight levels" - think like floors in a building!
   * Flight levels are multiples of 1000 feet (like 3000ft, 4000ft, 5000ft)
   * Then we round to nearest hundred for display (like 3000 becomes FL30, 4500 becomes FL45)
   * 
   * Example: If airplane is at 3456 feet:
   * 1. Round to nearest 1000: 3456 → 3000 
   * 2. Make it look nice: 3000 → 3000 (already rounded to hundreds)
   */
  private roundToNearestFL(value: number): number {
    // 🎯 Step 1: Round to nearest flight level (nearest 1000 feet)
    // Example: 3456 ÷ 1000 = 3.456, rounded = 3, then 3 × 1000 = 3000
    const fl = Math.round(value / 1000) * 1000;
    
    // 🎯 Step 2: Ensure it's in hundreds for display (like FL30, FL35, FL40)
    // Example: 3000 ÷ 100 = 30, rounded = 30, then 30 × 100 = 3000
    return Math.round(fl / 100) * 100;
  }

  /**
   * 📍 AIRPLANE BREADCRUMB TRAIL GENERATOR
   * Every airplane leaves a trail showing where it came from (like Hansel & Gretel!)
   * This creates 3 dots behind the airplane to show its path
   * 
   * Think of it like this:
   * • • • ✈️  (airplane with 3 history dots behind it)
   * 
   * How it works:
   * 1. Figure out opposite direction (where airplane came from)
   * 2. Place 3 dots going backwards at 0.5 mile intervals
   */
  private generateHistory(position: { x: number; y: number }, heading: number): { x: number; y: number }[] {
    // 📋 Create empty list to store history dots
    const history: { x: number; y: number }[] = [];
    
    // 🎯 Always create exactly 3 dots (like a short train behind the airplane)
    const numDots = 3;
    // 📏 Space dots 0.5 nautical miles apart (increased for better visibility)
    const spacing = 0.5; 
    
    // 🧭 Calculate where airplane came from (opposite direction)
    // If airplane heading north (0°), it came from south (180°)  
    // If airplane heading east (90°), it came from west (270°)
    const reverseHeading = (heading + 180) % 360;
    
    // 📐 Convert compass heading to math coordinates
    // In compass: North=0°, East=90°, South=180°, West=270°
    // In math: East=0°, North=90°, West=180°, South=270° 
    const radians = reverseHeading * Math.PI / 180;
    const dx = Math.sin(radians);  // How much to move sideways (east-west)
    const dy = Math.cos(radians);  // How much to move up-down (north-south)
    
    // 🎯 Create dots going backwards from current position
    for (let i = 1; i <= numDots; i++) {
      // 📏 Calculate how far back this dot should be
      const distance = spacing * i;  // First dot: 0.5mi, second: 1.0mi, third: 1.5mi back
      
      // 📍 Calculate exact position of this history dot
      history.push({
        x: position.x + dx * distance,  // Move backwards in x direction  
        y: position.y + dy * distance   // Move backwards in y direction
      });
    }
    
    // 🎁 Return the list of 3 history dot positions
    return history;
  }

  /**
   * 🎯 DIRECTION SELECTOR (like spinning a weighted wheel!)
   * This picks which direction the airplanes will approach each other from.
   * It's like having a wheel where some sections are bigger than others:
   * - 28% chance: crossing left to right (big section)
   * - 28% chance: crossing right to left (big section)  
   * - 28% chance: converging (big section)
   * - 11% chance: opposite direction (medium section)
   * - 5% chance: overtaking (small section)
   */
  private selectDirection(): string {
    // 🎲 Step 1: Add up all the percentages (should equal 100%)
    // Like counting total size of all wheel sections
    const totalWeight = this.directionWeights.reduce((sum, item) => sum + item.weight, 0);
    
    // 🎯 Step 2: Spin the wheel! Pick random number from 0 to 100
    const random = Math.random() * totalWeight;
    
    // 📊 Step 3: Keep track of where we are on the wheel
    let currentWeight = 0;
    
    // 🔍 Step 4: Go through each section until we find where our random number landed
    for (const item of this.directionWeights) {
      // Add this section's size to our running total
      currentWeight += item.weight;
      
      // 🎯 Did our random number land in this section?
      if (random <= currentWeight) {
        // 🎉 Yes! This is the direction we picked!
        return item.direction;
      }
    }
    
    // 🛡️ Safety net: if something goes wrong, default to crossing left to right
    return 'crossing left to right';
  }

  /**
   * ✈️ AIRPLANE COMPATIBILITY MATCHER
   * This is like matchmaking for airplanes! It picks two airplanes that follow the rules.
   * 
   * 🛩️ FLIGHT RULES EXPLAINED (like different neighborhoods):
   * - VFR (Visual Flight Rules) = Small airplanes that fly by looking outside (75% of traffic)
   * - IFR (Instrument Flight Rules) = Big airplanes that use instruments and follow ATC (25% of traffic)
   * 
   * 🏠 THE GOLDEN RULE: Both airplanes must live in the same neighborhood!
   * - If target airplane is VFR, intruder airplane must also be VFR
   * - If target airplane is IFR, intruder airplane must also be IFR  
   * - NEVER mix VFR and IFR in the same exercise (they follow different rules)
   * 
   * 🪖 MILITARY RULE: Only intruder airplanes can be military (10% chance if VFR)
   * - Target airplane: NEVER military (always civilian)
   * - Intruder airplane: 10% chance to be military IF it's VFR
   */
  private selectCompatibleAircraft(): { targetType: AcType; intruderType: AcType; targetIsVFR: boolean; intruderIsVFR: boolean } {
    // 🎯 STEP 1: Decide if this will be a VFR or IFR exercise
    // Think of it like flipping a weighted coin: 75% VFR, 25% IFR
    const flightRuleWeights = [
      { selection: 'VFR', weight: 75 },  // 75% chance for VFR neighborhood
      { selection: 'IFR', weight: 25 }   // 25% chance for IFR neighborhood
    ];
    
    // 🎲 Spin the flight rule wheel to pick VFR or IFR
    const targetFlightRule = this.getWeightedSelection(flightRuleWeights);
    const targetIsVFR = targetFlightRule === 'VFR';
    
    // 🏠 THE GOLDEN RULE: Both airplanes must be in same neighborhood! 
    // When target is VFR, intruder must also be VFR
    // When target is IFR, intruder must also be IFR  
    const intruderIsVFR = targetIsVFR;
    
    // 🎯 STEP 2: Pick the target airplane type (NEVER military - always civilian)
    let targetType: AcType;
    if (targetIsVFR) {
      // 🛩️ Pick from VFR box: small airplanes like Cessna, Piper
      targetType = VFR_TYPES[this.rnd(0, VFR_TYPES.length - 1)];
    } else {
      // ✈️ Pick from IFR box: big airplanes like Boeing, Airbus
      targetType = IFR_TYPES[this.rnd(0, IFR_TYPES.length - 1)];
    }
    
    // 🎯 STEP 3: Pick the intruder airplane type (maybe military!)
    let intruderType: AcType;
    
    // 🪖 MILITARY CHECK: If intruder is VFR, 10% chance to be military
    if (intruderIsVFR && Math.random() <= 0.10) {
      // 🚁 Pick military intruder from military box: F-16, C-130, UH-60, etc.
      intruderType = MIL_TYPES[this.rnd(0, MIL_TYPES.length - 1)];
    } else {
      // 👔 Pick civilian intruder (same neighborhood as target)
      if (intruderIsVFR) {
        // 🛩️ Civilian VFR: Cessna, Piper, etc.
        intruderType = VFR_TYPES[this.rnd(0, VFR_TYPES.length - 1)];
      } else {
        // ✈️ Civilian IFR: Boeing, Airbus, etc. 
        intruderType = IFR_TYPES[this.rnd(0, IFR_TYPES.length - 1)];
      }
    }

    // 🎁 Return the matched pair with all their info
    return {
      targetType,      // What kind of airplane is the target
      intruderType,    // What kind of airplane is the intruder  
      targetIsVFR,     // Is target using VFR rules?
      intruderIsVFR    // Is intruder using VFR rules?
    };
  }

  /**
   * ⬆️ REALISTIC ALTITUDE GENERATOR 
   * This is like assigning floors in a skyscraper where airplanes can fly!
   * Each airplane type has min/max altitude limits (like some elevators only go to certain floors)
   * 
   * 🏢 HOW ALTITUDE MATCHING WORKS:
   * 1. Find floors that BOTH airplanes can reach (overlapping range)
   * 2. If no overlap, find a reasonable compromise altitude  
   * 3. Add some vertical separation (like being on different floors for safety)
   * 4. Keep separation ≤ 1000 feet for training relevance
   * 
   * 📏 EXAMPLES:
   * - Small airplane: 1000-10000 feet, Big airplane: 5000-40000 feet
   * - Overlap: 5000-10000 feet (both can fly here!)
   * - Pick base altitude in overlap, then add ±500 or ±1000 feet separation
   */
  private generateRealisticAltitudes(targetType: AcType, intruderType: AcType, targetIsVFR: boolean, intruderIsVFR: boolean): { targetAltitude: number; intruderAltitude: number } {
    // 🎯 STEP 1: Find the altitude overlap (floors both airplanes can reach)
    // Like finding floors accessible to both elevator A and elevator B
    const minAltitude = Math.max(targetType.altitude.min, intruderType.altitude.min);  // Highest minimum
    const maxAltitude = Math.min(targetType.altitude.max, intruderType.altitude.max);  // Lowest maximum
    
    // 🚨 STEP 2: Handle no overlap case (elevators don't share any floors!)
    if (minAltitude > maxAltitude) {
      // 🎯 Find a reasonable compromise altitude for ATC training
      // For training, aircraft should be at altitudes where traffic separation matters
      let baseAltitude: number;
      
      if (targetIsVFR && !intruderIsVFR) {
        // 🛩️ VFR target with IFR intruder - use higher VFR range (4000-6000 feet)
        baseAltitude = this.roundToNearestFL(this.rnd(4000, 6000));
      } else if (!targetIsVFR && intruderIsVFR) {
        // ✈️ IFR target with VFR intruder - use lower IFR range (4000-6000 feet) 
        baseAltitude = this.roundToNearestFL(this.rnd(4000, 6000));
      } else {
        // 🤝 Both same type but different ranges - use midpoint compromise
        const midTarget = (targetType.altitude.min + targetType.altitude.max) / 2;
        const midIntruder = (intruderType.altitude.min + intruderType.altitude.max) / 2;
        baseAltitude = this.roundToNearestFL((midTarget + midIntruder) / 2);
      }
      
      // 📏 Add vertical separation (max 1000 feet for training relevance)
      const separations = [-1000, -500, 0, 500, 1000];  // Available floor differences
      const separation = separations[this.rnd(0, separations.length - 1)];
      
      // 🎯 Assign altitudes with separation
      const targetAltitude = this.roundToNearestFL(baseAltitude);
      const intruderAltitude = this.roundToNearestFL(baseAltitude + separation);
      
      return { targetAltitude, intruderAltitude };
    }
    
    // 🎯 STEP 3: Handle normal case (both airplanes can fly in overlapping range)
    // Pick a base altitude in the overlap range
    const baseAltitude = this.roundToNearestFL(this.rnd(minAltitude, maxAltitude));
    
    // 📏 Add some vertical separation for realism (max 1000 feet per requirements)
    const separations = [-1000, -500, 0, 500, 1000];  // Floor difference options
    const separation = separations[this.rnd(0, separations.length - 1)];
    
    // 🎯 Calculate tentative altitudes
    let targetAltitude = baseAltitude;
    let intruderAltitude = this.roundToNearestFL(baseAltitude + separation);
    
    // 🛡️ STEP 4: Safety check - ensure both altitudes are within airplane limits
    // Like making sure we don't assign floor 50 to an elevator that only goes to floor 20
    targetAltitude = Math.max(targetType.altitude.min, Math.min(targetType.altitude.max, targetAltitude));
    intruderAltitude = Math.max(intruderType.altitude.min, Math.min(intruderType.altitude.max, intruderAltitude));
    
    // 🎁 Return the final rounded altitudes
    return { 
      targetAltitude: this.roundToNearestFL(targetAltitude), 
      intruderAltitude: this.roundToNearestFL(intruderAltitude) 
    };
  }

  /**
   * 🎲 WEIGHTED SELECTION WHEEL
   * This is like a game show wheel where some sections are bigger than others!
   * The bigger sections have higher chance of being selected.
   * 
   * 🎪 HOW IT WORKS:
   * Imagine a wheel with sections:
   * - Section A: weight 70 (BIG section - 70% chance)
   * - Section B: weight 20 (medium section - 20% chance)  
   * - Section C: weight 10 (small section - 10% chance)
   * 
   * 🎯 PROCESS:
   * 1. Add up all weights: 70+20+10 = 100
   * 2. Spin! Get random number from 0 to 100
   * 3. See which section it lands in
   */
  private getWeightedSelection<T>(weights: { selection: T; weight: number }[]): T {
    // 🎯 STEP 1: Create cumulative weights (running totals)
    // Like marking where each section ends on the wheel
    const cumulativeWeights: number[] = [];
    for (let i = 0; i < weights.length; i++) {
      // Add this section's weight to the previous total
      // Example: [70, 90, 100] for weights [70, 20, 10]
      cumulativeWeights[i] = weights[i].weight + (cumulativeWeights[i - 1] || 0);
    }
    
    // 🎲 STEP 2: Get the total wheel size and spin it!
    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomNumber = Math.random() * maxCumulativeWeight;
    
    // 🔍 STEP 3: Find which section our spin landed in
    for (let numberIndex = 0; numberIndex < weights.length; numberIndex++) {
      // Did our random number fall in this section?
      if (cumulativeWeights[numberIndex] >= randomNumber) {
        // 🎉 Found it! Return this selection
        return weights[numberIndex].selection;
      }
    }
    
    // 🆘 Edge case fallback: if somehow nothing was found, return the first option
    // This should never happen with proper weights, but just in case!
    return weights[0].selection;
  }

  /**
   * 🕵️ MILITARY CALLSIGN DETECTIVE
   * This function looks at a callsign and guesses: "Is this military?"
   * 
   * 🪖 MILITARY CALLSIGN PATTERN:
   * - 4-8 letters + 1-2 numbers at the end
   * - Examples: "HAWK12", "EAGLE01", "VIPER7", "THUNDER84"
   * - NOT military: "N1234A" (numbers in middle), "DAL123" (only 3 letters)
   * 
   * 🔍 HOW THE DETECTIVE WORKS:
   * It uses a "regular expression" (regex) - like a pattern-matching rule:
   * ^[A-Z]{4,8}\d{1,2}$ means:
   * ^ = start of callsign
   * [A-Z]{4,8} = 4 to 8 capital letters  
   * \d{1,2} = 1 or 2 digits
   * $ = end of callsign
   */
  private looksLikeMilitaryCallsign(callsign: string): boolean {
    // 🔍 Use pattern matching to check if it looks military
    // Pattern: 4-8 letters followed by 1-2 numbers
    return /^[A-Z]{4,8}\d{1,2}$/.test(callsign);
  }

  /**
   * 🏷️ CALLSIGN NAME TAG GENERATOR
   * This creates the "name tag" for each airplane (like giving each airplane a unique name!)
   * 
   * 🎯 THREE TYPES OF AIRPLANE NAMES:
   * 1. 🪖 Military VFR: "HAWK12", "EAGLE01" (only for intruder + VFR + military)
   * 2. 🛩️ Civilian VFR: "N1234A", "G-ABCD" (small private airplanes)  
   * 3. ✈️ Civilian IFR: "DAL123", "UAL456" (big airline airplanes)
   * 
   * 🎪 THINK OF IT LIKE NAME TAGS AT A PARTY:
   * - Military guests get tough names like "HAWK12"
   * - Small airplane owners get registration numbers like "N1234A" 
   * - Big airlines get company codes like "DELTA123"
   */
  private generateCallsign(isVFR: boolean, role: 'target' | 'intruder' = 'target', isMil: boolean = false): string {
    // 🪖 MILITARY VFR CALLSIGNS (only for VFR intruders that are military)
    if (role === 'intruder' && isVFR && isMil) {
      // 🎯 Pick a military base name from our list (like "HAWK", "EAGLE", "VIPER")
      const base = this.militaryCallsigns[this.rnd(0, this.militaryCallsigns.length - 1)];
      
      // 🔢 Add two random numbers as suffix (like "12", "03", "88")
      // Each digit is 0-9, so we get numbers like 01, 23, 56, 99
      const suffix = (Math.floor(Math.random() * 10)).toString() + (Math.floor(Math.random() * 10)).toString();
      
      // 🎁 Combine them: "HAWK" + "12" = "HAWK12"
      return base + suffix;
    } 
    // 🛩️ CIVILIAN VFR CALLSIGNS (small private airplanes)
    else if (isVFR) {
      // 🎲 Pick a random VFR naming pattern from our collection
      // Each pattern has rules like "N" + numbers + letters (for US), or "G-" + letters (for UK)
      const vfrData = this.vfrCallsigns[this.rnd(0, this.vfrCallsigns.length - 1)];
      
      // 🇺🇸 SPECIAL CASE: United States callsigns (they're weird!)
      if (vfrData.countryCode === "N") {
        // 📝 US airplanes are special - they're the ONLY ones with numbers in the middle!
        // Other countries: letters only. US: mix of numbers and letters
        // Example: N123AB, N12C, N1234D
        
        // 🎲 Decide how many numbers to use (1, 2, or 3 numbers)
        // Weighted like a lottery: 2 numbers most common, then 3, then 1
        const weights = [
          { selection: 1, weight: 100 }, // 1 number: 100 weight
          { selection: 2, weight: 200 }, // 2 numbers: 200 weight (most common!)
          { selection: 3, weight: 150 }  // 3 numbers: 150 weight
        ];
        const numCount = this.getWeightedSelection(weights);
        
        // 🏗️ Start building the callsign with country code "N"
        let callsign = vfrData.countryCode;
        
        // 🔢 Add the numbers (1, 2, or 3 of them)
        for (let i = 0; i < numCount; i++) {
          callsign += Math.floor(Math.random() * 10).toString();  // Add random digit 0-9
        }
        
        // 🔤 Add letters at the end (2 or 3 letters)
        const letterCount = Math.random() > 0.5 ? 2 : 3;  // Flip coin: 2 or 3 letters
        for (let i = 0; i < letterCount; i++) {
          // Add random letter A-Z (65 is ASCII code for 'A', +26 letters in alphabet)
          callsign += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
        
        // 🎁 Return US-style callsign like "N123AB" or "N12ABC"
        return callsign;
      } else {
        // 🌍 OTHER COUNTRIES: Use presentation pattern (no numbers, letters only!)
        // 📝 Comment from original code: "Use the country code as prefix. Generate a suffix depending on the presentation."
        // Examples: G-ABCD (UK), D-EFGH (Germany), F-IJKL (France)
        
        // 🏗️ Start with country code (like "G-", "D-", "F-")
        let callsign = vfrData.countryCode;
        const presentation = vfrData.presentation;  // Pattern like "PZZ", "WZZ", "KZZ"
        
        // 🔤 Generate suffix letters based on presentation pattern
        for (const char of presentation) {
          if (char === 'Z') {
            // 📝 'Z' = any letter A-Z
            callsign += String.fromCharCode(65 + Math.floor(Math.random() * 26));
          } else if (char === 'P') {
            // 📝 'P' = letters A-P only (first 16 letters of alphabet)
            callsign += String.fromCharCode(65 + Math.floor(Math.random() * 16)); // A-P
          } else if (char === 'W') {
            // 📝 'W' = letters A-W only (first 23 letters of alphabet)
            callsign += String.fromCharCode(65 + Math.floor(Math.random() * 23)); // A-W
          } else if (char === 'K') {
            // 📝 'K' = letters K-Z only (from K to end of alphabet)
            callsign += String.fromCharCode(75 + Math.floor(Math.random() * 11)); // K-Z
          }
        }
        
        // 🎁 Return international callsign like "G-ABCD" or "D-WXYZ"
        return callsign;
      }
    } 
    // ✈️ CIVILIAN IFR CALLSIGNS (big airline airplanes)
    else {
      // 🏢 Pick a random airline from our collection (like "American", "Delta", "United")
      const airline = this.airlines[this.rnd(0, this.airlines.length - 1)];
      
      // 🎲 Decide how long the flight number should be (1-4 digits)
      // Weighted selection: 3 digits most common, then 4, then 2, then 1
      const weights = [
        { selection: 3, weight: 150 },  // 3 digits most common (like DAL123)
        { selection: 4, weight: 45 },   // 4 digits less common (like UAL1234)  
        { selection: 2, weight: 20 },   // 2 digits rare (like AAL12)
        { selection: 1, weight: 10 }    // 1 digit very rare (like SWA1)
      ];
      const suffixLength = this.getWeightedSelection(weights);
      
      // 🏗️ Build the flight number suffix
      let suffix = "";
      for (let i = 0; i < suffixLength; i++) {
        if (i === 0) {
          // 🔢 RULE: First character after airline code MUST be a number!
          // This is aviation regulation - no airline flight can start with a letter
          suffix += (Math.floor(Math.random() * 10)).toString();
        } else {
          // 🎲 For other characters, mix numbers and letters (but mostly numbers)
          // 75% chance for number, 25% chance for letter
          if (suffix[suffix.length - 1] && suffix[suffix.length - 1].match(/[A-Z]/) || Math.random() > 0.75) {
            // Add letter A-Z
            suffix += String.fromCharCode(65 + Math.floor(Math.random() * 26));
          } else {
            // Add number 0-9
            suffix += (Math.floor(Math.random() * 10)).toString();
          }
        }
      }
      
      // 🎁 Return airline callsign like "DAL123", "UAL1234A", "AAL12"
      return airline.icao + suffix;
    }
  }

  /**
   * ✈️ AIRPLANE TYPE ABBREVIATOR
   * This shortens long airplane names into short codes (like nicknames!)
   * 
   * 🏷️ EXAMPLES:
   * "Boeing 737" → "B737" (shorter and easier to say on radio)
   * "Airbus A320" → "A320" (remove extra words)
   * "Cessna 172" → "C172" (first letter + number)
   * 
   * 📻 WHY WE DO THIS:
   * In real aviation radio calls, pilots say "B737" not "Boeing 737" to save time!
   * Air Traffic Controllers need to say airplane types quickly and clearly.
   */
  private getAbbreviatedType(acType: AcType): string {
    // 📋 Dictionary of airplane name translations (like a nickname book!)
    const typeMap: { [key: string]: string } = {
      'Boeing 737': 'B737',           // Big airline airplane
      'Airbus A320': 'A320',          // Big airline airplane  
      'Boeing 777': 'B777',           // Huge airline airplane
      'Embraer 190': 'E190',          // Medium airline airplane
      'Bombardier CRJ900': 'CRJ9',    // Small airline jet
      'ATR 72': 'AT72',               // Turboprop airline airplane
      'Cessna 172': 'C172',           // Small training airplane
      'Piper PA-28': 'PA28',          // Small private airplane
      'Robinson R44': 'R44',          // Small helicopter
      'Cessna 152': 'C152',           // Very small training airplane
      'Diamond DA40': 'DA40',         // Modern training airplane
      'F-16': 'F16',                  // Military fighter jet
      'C-130': 'C130',                // Military cargo airplane
      'UH-60': 'UH60',                // Military helicopter
      'F/A-18': 'F18',                // Military fighter jet
      'KC-135': 'KC13'                // Military refueling airplane
    };
    
    // 🔍 Look up the airplane name in our dictionary
    // If found, return the short code. If not found, return first 4 characters as backup
    return typeMap[acType.name] || acType.name.substring(0, 4);
  }

  /**
   * ⬆️⬇️ LEVEL CHANGE ASSIGNMENT (when airplanes climb or descend)
   * This decides if the intruder airplane should be climbing or descending!
   * 
   * 🎯 LEVEL CHANGE RULES (like elevator movement rules):
   * 1. Only happens when airplanes are at DIFFERENT floors (levels)
   * 2. Only intruder airplanes change levels (target stays put like a landmark)
   * 3. Intruder must be crossing THROUGH target's level (not just going TO it)
   * 4. Only IFR airplanes get level changes (VFR fly wherever they want)
   * 5. Only 30% chance it happens (not too common, but realistic)
   * 
   * 🏢 THINK OF IT LIKE ELEVATORS IN A BUILDING:
   * - Target airplane = person standing on floor 5 (not moving)
   * - Intruder airplane = person in elevator on floor 8, going down to floor 2
   * - The elevator person will pass THROUGH floor 5 where target is standing
   * - This creates a conflict that needs traffic warning!
   */
  private assignLevelChange(target: Ac, intruder: Ac): void {
    // 🏢 RULE 1: If both airplanes on same floor, no elevator needed!
    if (target.level === intruder.level) {
      // Same level, no level change needed
      return;
    }
    
    // 🛩️ RULE 2: VFR airplanes don't get level changes (they fly free!)
    if (intruder.isVFR) {
      // VFR aircraft don't typically have level changes in controlled scenarios
      return;
    }
    
    // 🎲 RULE 3: Only 30% chance for level change (not too common)
    if (Math.random() < 0.3) {
      const targetLevel = target.level;      // Where target airplane is parked
      const intruderLevel = intruder.level;  // Where intruder starts
      
      // 🧭 RULE 4: Figure out which direction intruder should move
      const isAboveTarget = intruderLevel > targetLevel;  // Is intruder above target?
      const direction: '↑'|'↓' = isAboveTarget ? '↓' : '↑';  // If above, go down. If below, go up.
      
      // 🎯 RULE 5: Calculate where intruder will end up (must go THROUGH target level!)
      let newLevel: number;
      if (isAboveTarget) {
        // 📉 Descending: start above target, end up below target (passing through!)
        // Example: Target at 5000ft, intruder at 8000ft, goes to 3500ft (passes through 5000ft)
        newLevel = this.roundToNearestFL(targetLevel - this.rnd(500, 1500));
      } else {
        // 📈 Climbing: start below target, end up above target (passing through!)
        // Example: Target at 5000ft, intruder at 2000ft, goes to 6500ft (passes through 5000ft)
        newLevel = this.roundToNearestFL(targetLevel + this.rnd(500, 1500));
      }
      
      // 🛡️ RULE 6: Safety bounds (don't go too high or too low!)
      newLevel = Math.max(1000, Math.min(41000, newLevel));  // Keep between 1000ft and 41000ft
      
      // ✅ RULE 7: Double-check that we actually go THROUGH the target level
      // If bounds adjustment broke our "through" rule, cancel the level change
      if ((isAboveTarget && newLevel >= targetLevel) || (!isAboveTarget && newLevel <= targetLevel)) {
        // Oops! After safety bounds, we're not going through target level anymore. Cancel!
        return;
      }
      
      // 🎯 RULE 8: If everything checks out, assign the level change!
      if (newLevel !== intruderLevel) {
        intruder.levelChange = {
          to: newLevel,      // Where the airplane will end up
          dir: direction     // Which direction it's moving (up ↑ or down ↓)
        };
      }
    }
  }

  private generateAircraft(acType: AcType, isVFR: boolean, position: { x: number; y: number }, heading: number, speed: number, altitude?: number, role: 'target' | 'intruder' = 'target'): Ac {
    const level = altitude ? this.roundToNearestFL(altitude) : this.roundToNearestFL(this.rnd(acType.altitude.min, acType.altitude.max));
    
    // Check if this aircraft is military based on the aircraft type
    const isMil = MIL_TYPES.includes(acType);
    
    const callsign = this.generateCallsign(isVFR, role, isMil);
    
    // Level changes will be assigned later based on relationship between aircraft

    return {
      callsign,
      wtc: acType.wtc,
      type: { 
        name: acType.name, 
        type: this.getAbbreviatedType(acType) 
      },
      isVFR,
      flightRule: isVFR ? 'VFR' : 'IFR',
      isMil: role === 'intruder' ? isMil : undefined, // Only set for intruders
      heading,
      level,
      levelChange: undefined, // Will be set later if applicable
      speed,
      position,
      history: this.generateHistory(position, heading)
    };
  }

  private calculateIntersectionPoint(target: Ac, intruder: Ac): { x: number; y: number; targetDist: number; intruderDist: number } | null {
    const t1x = target.position.x;
    const t1y = target.position.y;
    const t1dx = Math.sin(target.heading * Math.PI / 180);
    const t1dy = Math.cos(target.heading * Math.PI / 180);
    
    const t2x = intruder.position.x;
    const t2y = intruder.position.y;
    const t2dx = Math.sin(intruder.heading * Math.PI / 180);
    const t2dy = Math.cos(intruder.heading * Math.PI / 180);
    
    const det = t1dx * t2dy - t1dy * t2dx;
    if (Math.abs(det) < 0.001) return null;
    
    const s1 = ((t2x - t1x) * t2dy - (t2y - t1y) * t2dx) / det;
    const s2 = ((t2x - t1x) * t1dy - (t2y - t1y) * t1dx) / det;
    
    if (s1 < 0 || s2 < 0) return null;
    
    const intersectionX = t1x + s1 * t1dx;
    const intersectionY = t1y + s1 * t1dy;
    
    const targetDist = Math.sqrt(Math.pow(intersectionX - t1x, 2) + Math.pow(intersectionY - t1y, 2));
    const intruderDist = Math.sqrt(Math.pow(intersectionX - t2x, 2) + Math.pow(intersectionY - t2y, 2));
    
    return { x: intersectionX, y: intersectionY, targetDist, intruderDist };
  }

  private generateScenarioByDirection(direction: string): Exercise {
    let attempts = 0;
    // More attempts for overtaking scenarios as they're harder to generate
    const maxAttempts = direction === 'overtaking' ? 300 : 100;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        const result = this.generateDirectionScenario(direction);
        if (result) return result;
      } catch {
        // Continue to next attempt
      }
    }
    
    throw new Error(`Failed to generate valid scenario for direction: ${direction}`);
  }

  private generateDirectionScenario(direction: string): Exercise | null {
    switch (direction) {
      case 'crossing left to right':
        return this.generateCrossingL2R();
      case 'crossing right to left':
        return this.generateCrossingR2L();
      case 'converging':
        return this.generateConverging();
      case 'opposite direction':
        return this.generateOppositeDirection();
      case 'overtaking':
        return this.generateOvertaking();
      default:
        throw new Error(`Unknown direction: ${direction}`);
    }
  }

  private generateCrossingL2R(): Exercise | null {
    // Clock 10-11, Distance 3-8NM, Angle 55-125°
    const targetHeading = this.rnd(0, 359);
    const distance = this.rndFloat(3, 8);
    const clock = this.rnd(10, 11);
    
    // Calculate intruder position based on clock position
    const relativeAngle = (targetHeading + (clock === 12 ? 0 : clock * 30)) * Math.PI / 180;
    
    const intruderX = Math.sin(relativeAngle) * distance;
    const intruderY = Math.cos(relativeAngle) * distance;
    
    // Calculate convergence angle (55-125°)
    const convergenceAngle = this.rndFloat(55, 125);
    
    // Determine intruder heading for crossing left to right
    let intruderHeading = targetHeading + convergenceAngle;
    if (intruderHeading >= 360) intruderHeading -= 360;
    
    // Select compatible aircraft types and realistic altitudes
    const { targetType, intruderType, targetIsVFR, intruderIsVFR } = this.selectCompatibleAircraft();
    const { targetAltitude, intruderAltitude } = this.generateRealisticAltitudes(targetType, intruderType, targetIsVFR, intruderIsVFR);
    
    const targetSpeed = this.rnd(targetType.speed.min, targetType.speed.max);
    const intruderSpeed = this.rnd(intruderType.speed.min, intruderType.speed.max);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, 'target'); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, 'intruder');
    
    // Validate intersection
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null; // As per notes: ±2 miles margin for realism
    
    return this.buildExercise(target, intruder, 'crossing left to right', clock);
  }

  private generateCrossingR2L(): Exercise | null {
    // Clock 1-2, Distance 3-8NM, Angle 55-125°
    const targetHeading = this.rnd(0, 359);
    const distance = this.rndFloat(3, 8);
    const clock = this.rnd(1, 2);
    
    const relativeAngle = (targetHeading + (clock === 12 ? 0 : clock * 30)) * Math.PI / 180;
    
    const intruderX = Math.sin(relativeAngle) * distance;
    const intruderY = Math.cos(relativeAngle) * distance;
    
    const convergenceAngle = this.rndFloat(55, 125);
    
    let intruderHeading = targetHeading - convergenceAngle;
    if (intruderHeading < 0) intruderHeading += 360;
    
    // Select compatible aircraft types and realistic altitudes
    const { targetType, intruderType, targetIsVFR, intruderIsVFR } = this.selectCompatibleAircraft();
    const { targetAltitude, intruderAltitude } = this.generateRealisticAltitudes(targetType, intruderType, targetIsVFR, intruderIsVFR);
    
    const targetSpeed = this.rnd(targetType.speed.min, targetType.speed.max);
    const intruderSpeed = this.rnd(intruderType.speed.min, intruderType.speed.max);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, 'target'); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, 'intruder');
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null; // As per notes: ±2 miles margin for realism
    
    return this.buildExercise(target, intruder, 'crossing right to left', clock);
  }

  private generateConverging(): Exercise | null {
    // Clock 2,3,9,10, Distance 2-5NM, Angle <40°
    const targetHeading = this.rnd(0, 359);
    const distance = this.rndFloat(2, 5);
    const clockOptions = [2, 3, 9, 10];
    const clock = clockOptions[this.rnd(0, clockOptions.length - 1)];
    
    const relativeAngle = (targetHeading + (clock === 12 ? 0 : clock * 30)) * Math.PI / 180;
    
    const intruderX = Math.sin(relativeAngle) * distance;
    const intruderY = Math.cos(relativeAngle) * distance;
    
    const convergenceAngle = this.rndFloat(5, 39);
    
    let intruderHeading = targetHeading + (Math.random() < 0.5 ? convergenceAngle : -convergenceAngle);
    if (intruderHeading < 0) intruderHeading += 360;
    if (intruderHeading >= 360) intruderHeading -= 360;
    
    // Select compatible aircraft types and realistic altitudes
    const { targetType, intruderType, targetIsVFR, intruderIsVFR } = this.selectCompatibleAircraft();
    const { targetAltitude, intruderAltitude } = this.generateRealisticAltitudes(targetType, intruderType, targetIsVFR, intruderIsVFR);
    
    const targetSpeed = this.rnd(targetType.speed.min, targetType.speed.max);
    const intruderSpeed = this.rnd(intruderType.speed.min, intruderType.speed.max);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, 'target'); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, 'intruder');
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null; // As per notes: ±2 miles margin for realism
    
    return this.buildExercise(target, intruder, 'converging', clock);
  }

  private generateOppositeDirection(): Exercise | null {
    // Clock 12, Distance 4-9NM, Angle ≥170°, Symmetric intersection
    const targetHeading = this.rnd(0, 359);
    const distance = this.rndFloat(4, 9);
    const clock = 12;
    
    // Allow ±5° variation for clock 12 while keeping it clearly at 12
    const clockVariation = this.rndFloat(-5, 5);
    const relativeAngle = (targetHeading + clockVariation) * Math.PI / 180;
    
    const intruderX = Math.sin(relativeAngle) * distance;
    const intruderY = Math.cos(relativeAngle) * distance;
    
    // Opposite direction: 175-185° (more forgiving range)
    const oppositeHeading = targetHeading + 180;
    let intruderHeading = oppositeHeading + this.rndFloat(-5, 5);
    if (intruderHeading >= 360) intruderHeading -= 360;
    if (intruderHeading < 0) intruderHeading += 360;
    
    // Select compatible aircraft types and realistic altitudes
    const { targetType, intruderType, targetIsVFR, intruderIsVFR } = this.selectCompatibleAircraft();
    const { targetAltitude, intruderAltitude } = this.generateRealisticAltitudes(targetType, intruderType, targetIsVFR, intruderIsVFR);
    
    const targetSpeed = this.rnd(targetType.speed.min, targetType.speed.max);
    const intruderSpeed = this.rnd(intruderType.speed.min, intruderType.speed.max);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, 'target'); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, 'intruder');
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    // For opposite direction, intersection should be halfway (stricter requirement)
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 1.5) return null; // Stricter for opposite direction as per notes
    
    return this.buildExercise(target, intruder, 'opposite direction', clock);
  }

  private generateOvertaking(): Exercise | null {
    // Clock 5,6,7, Distance 2-6NM, Same direction with faster intruder
    const targetHeading = this.rnd(0, 359);
    const distance = this.rndFloat(2, 6);
    const clockOptions = [5, 6, 7];
    const clock = clockOptions[this.rnd(0, clockOptions.length - 1)];
    
    const relativeAngle = (targetHeading + (clock === 12 ? 0 : clock * 30)) * Math.PI / 180;
    
    const intruderX = Math.sin(relativeAngle) * distance;
    const intruderY = Math.cos(relativeAngle) * distance;
    
    // Same direction with increased variation for better intersection chances
    let intruderHeading = targetHeading + this.rndFloat(-25, 25); // Increased variation
    if (intruderHeading < 0) intruderHeading += 360;
    if (intruderHeading >= 360) intruderHeading -= 360;
    
    // Select compatible aircraft types and realistic altitudes
    const { targetType, intruderType, targetIsVFR, intruderIsVFR } = this.selectCompatibleAircraft();
    const { targetAltitude, intruderAltitude } = this.generateRealisticAltitudes(targetType, intruderType, targetIsVFR, intruderIsVFR);
    
    // More flexible speed selection for overtaking
    const targetSpeed = this.rnd(Math.max(60, targetType.speed.min), Math.min(targetType.speed.max, 250)); // Lower cap for target
    // Ensure intruder is faster for overtaking with smaller minimum difference
    const minIntruderSpeed = targetSpeed + 10; // Reduced minimum speed difference
    const maxIntruderSpeed = Math.min(intruderType.speed.max, 450); // Higher cap for intruder
    
    if (minIntruderSpeed > maxIntruderSpeed) {
      return null; // Can't make intruder faster, try again
    }
    
    const intruderSpeed = this.rnd(minIntruderSpeed, maxIntruderSpeed);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, 'target'); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, 'intruder');
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 1.5 || intersectionDistance > 6.5) return null; // More lenient range
    
    // More lenient asymmetry check for overtaking
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 3) return null; // Increased tolerance for overtaking scenarios
    
    return this.buildExercise(target, intruder, 'overtaking', clock);
  }

  private buildExercise(target: Ac, intruder: Ac, direction: string, clock: number): Exercise {
    // Assign level changes based on new requirements
    this.assignLevelChange(target, intruder);
    
    // Calculate actual current distance between aircraft
    const dx = intruder.position.x - target.position.x;
    const dy = intruder.position.y - target.position.y;
    const actualDistance = Math.sqrt(dx * dx + dy * dy);
    const roundedActualDistance = Math.round(actualDistance);
    
    const levelDiff = intruder.level - target.level;
    let levelText = '';
    
    // Check if intruder is climbing or descending through target's level
    if (intruder.levelChange) {
      const isClimbingThrough = intruder.levelChange.dir === '↑' && 
                               intruder.level < target.level && 
                               intruder.levelChange.to >= target.level;
      const isDescendingThrough = intruder.levelChange.dir === '↓' && 
                                 intruder.level >= target.level && 
                                 intruder.levelChange.to < target.level;
      
      if (isClimbingThrough) {
        levelText = `${Math.abs(levelDiff)} feet below, climbing through your level`;
      } else if (isDescendingThrough) {
        // If currently at target level and descending, should be "1000 feet below"
        if (intruder.level === target.level) {
          levelText = `1000 feet below, descending through your level`;
        } else {
          levelText = `${Math.abs(levelDiff)} feet above, descending through your level`;
        }
      } else {
        // Standard level change text
        levelText = levelDiff === 0 ? 'same level' : 
                   levelDiff > 0 ? `${Math.abs(levelDiff)} feet above` : 
                   `${Math.abs(levelDiff)} feet below`;
      }
    } else {
      // No level change
      levelText = levelDiff === 0 ? 'same level' : 
                 levelDiff > 0 ? `${Math.abs(levelDiff)} feet above` : 
                 `${Math.abs(levelDiff)} feet below`;
    }
    
    const wtcText = intruder.wtc === 'H' ? ', heavy' : '';
    
    const solution = `${target.callsign}, traffic, ${clock} o'clock, ${roundedActualDistance} miles, ${direction}, ${levelText}, ${intruder.type.type}${wtcText}`;
    
    return {
      target,
      intruder,
      situation: {
        clock,
        distance: roundedActualDistance,
        direction,
        level: levelText
      },
      solution
    };
  }

  public generateExercise(): Exercise {
    const direction = this.selectDirection();
    return this.generateScenarioByDirection(direction);
  }
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

export function generateExercise(): Exercise {
  const generator = AviationTrafficGenerator.getInstance();
  return generator.generateExercise();
}
