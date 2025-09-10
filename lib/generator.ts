/**
 * Aviation Traffic Exercise Generator - Rewritten to match notes.txt requirements
 * 
 * Direction Distribution:
 * - Crossing left to right: 28%
 * - Crossing right to left: 28% 
 * - Converging: 28%
 * - Opposite direction: 11%
 * - Overtaking: 5%
 * 
 * Requirements by Direction:
 * - Crossing L2R: Clock 10-11, Distance 3-8NM, Angle 55-125°
 * - Crossing R2L: Clock 1-2, Distance 3-8NM, Angle 55-125°
 * - Converging: Clock 2,3,9,10, Distance 2-5NM, Angle <40°
 * - Opposite: Clock 12, Distance 4-9NM, Angle ≥170°, Symmetric intersection
 * - Overtaking: Clock 5,6,7, Distance 2-6NM, Same direction with faster intruder
 * 
 * Intersection Requirements:
 * - Intersection point: 2-6NM from center
 * - Symmetry: ±2NM distance difference from each aircraft
 * - For opposite direction: Intersection exactly halfway
 */

import { VFR_TYPES, IFR_TYPES, MIL_TYPES, type AcType } from './constants';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface Ac {
  callsign: string;
  wtc: 'L'|'M'|'H';
  type: { name: string; type: string };
  isVFR: boolean;
  flightRule: 'VFR' | 'IFR';
  isMil?: boolean; // Military flag for intruders when target is VFR
  heading: number;
  level: number;
  levelChange?: { to: number; dir: '↑'|'↓' };
  speed: number;
  position: { x: number; y: number };
  history: { x: number; y: number }[];
}

export interface Situation {
  clock: number;
  distance: number;
  direction: string;
  level: string;
}

export interface Exercise {
  target: Ac;
  intruder: Ac;
  situation: Situation;
  solution: string;
}

// =============================================================================
// GENERATOR CLASS
// =============================================================================

export class AviationTrafficGenerator {
  private static instance: AviationTrafficGenerator;
  private directionWeights = [
    { direction: 'crossing left to right', weight: 28 },
    { direction: 'crossing right to left', weight: 28 },
    { direction: 'converging', weight: 28 },
    { direction: 'opposite direction', weight: 11 },
    { direction: 'overtaking', weight: 5 }
  ];

  private militaryCallsigns = [
    "REDARROW", "ANGE", "LHOB", "MILAN", "REF", "BENGA", "VOLPE", "FIAMM", 
    "HKY", "RRR", "HR", "VVAJ", "BAF", "RCH", "CFC", "SPARTA", "BRK", "ROF", 
    "OR", "COBRA", "SRA", "RNGR", "BOMR", "WOLF", "TRITN", "RESQ"
  ];

  private vfrCallsigns = [
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

  private airlines = [
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

  public static getInstance(): AviationTrafficGenerator {
    if (!AviationTrafficGenerator.instance) {
      AviationTrafficGenerator.instance = new AviationTrafficGenerator();
    }
    return AviationTrafficGenerator.instance;
  }

  private rnd(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private rndFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private roundToNearestFL(value: number): number {
    // Round to nearest flight level (nearest 1000 feet, then to hundreds for display)
    const fl = Math.round(value / 1000) * 1000;
    return Math.round(fl / 100) * 100; // Ensure it's in hundreds
  }

  private generateHistory(position: { x: number; y: number }, heading: number, speed: number): { x: number; y: number }[] {
    const history: { x: number; y: number }[] = [];
    
    // Always generate exactly 3 history dots with tighter spacing
    const numDots = 3;
    const spacing = 0.4; // Fixed spacing of 0.4 NM between dots
    
    // Calculate reverse heading (where aircraft came from)
    const reverseHeading = (heading + 180) % 360;
    const radians = reverseHeading * Math.PI / 180;
    const dx = Math.sin(radians);
    const dy = Math.cos(radians);
    
    // Generate dots going backwards from current position
    for (let i = 1; i <= numDots; i++) {
      const distance = spacing * i;
      history.push({
        x: position.x + dx * distance,
        y: position.y + dy * distance
      });
    }
    
    return history;
  }

  private selectDirection(): string {
    const totalWeight = this.directionWeights.reduce((sum, item) => sum + item.weight, 0);
    const random = Math.random() * totalWeight;
    let currentWeight = 0;
    
    for (const item of this.directionWeights) {
      currentWeight += item.weight;
      if (random <= currentWeight) {
        return item.direction;
      }
    }
    
    return 'crossing left to right'; // fallback
  }

  private selectCompatibleAircraft(): { targetType: AcType; intruderType: AcType; targetIsVFR: boolean; intruderIsVFR: boolean } {
    // Flight rule distribution (based on requirements)
    const flightRuleWeights = [
      { selection: 'VFR', weight: 30 },
      { selection: 'IFR', weight: 70 }
    ];
    
    const targetFlightRule = this.getWeightedSelection(flightRuleWeights);
    const targetIsVFR = targetFlightRule === 'VFR';
    
    // Select target aircraft type based on flight rule (NEVER military)
    let targetType: AcType;
    if (targetIsVFR) {
      targetType = VFR_TYPES[this.rnd(0, VFR_TYPES.length - 1)];
    } else {
      targetType = IFR_TYPES[this.rnd(0, IFR_TYPES.length - 1)];
    }
    
    // Select intruder flight rule
    const intruderFlightRule = this.getWeightedSelection(flightRuleWeights);
    const intruderIsVFR = intruderFlightRule === 'VFR';
    
    // Select intruder aircraft type
    let intruderType: AcType;
    
    // If INTRUDER is VFR, then it has 10% chance to be military
    if (intruderIsVFR && Math.random() <= 0.10) {
      // Military intruder (VFR military)
      intruderType = MIL_TYPES[this.rnd(0, MIL_TYPES.length - 1)];
    } else {
      // Civilian intruder
      if (intruderIsVFR) {
        intruderType = VFR_TYPES[this.rnd(0, VFR_TYPES.length - 1)];
      } else {
        intruderType = IFR_TYPES[this.rnd(0, IFR_TYPES.length - 1)];
      }
    }

    return {
      targetType,
      intruderType,
      targetIsVFR,
      intruderIsVFR
    };
  }

  private generateRealisticAltitudes(targetType: AcType, intruderType: AcType, targetIsVFR: boolean, intruderIsVFR: boolean): { targetAltitude: number; intruderAltitude: number } {
    // Find the overlapping altitude range for both aircraft
    const minAltitude = Math.max(targetType.altitude.min, intruderType.altitude.min);
    const maxAltitude = Math.min(targetType.altitude.max, intruderType.altitude.max);
    
    // If no overlap, use individual ranges but keep them closer
    if (minAltitude > maxAltitude) {
      // Use each aircraft's optimal altitude range
      const targetAltitude = this.roundToNearestFL(this.rnd(targetType.altitude.min, targetType.altitude.max));
      const intruderAltitude = this.roundToNearestFL(this.rnd(intruderType.altitude.min, intruderType.altitude.max));
      return { targetAltitude, intruderAltitude };
    }
    
    // Generate altitudes within the overlapping range, with some separation for realism
    const baseAltitude = this.roundToNearestFL(this.rnd(minAltitude, maxAltitude));
    
    // Add some vertical separation (max 1000 feet per new requirements)
    const separations = [-1000, -500, 0, 500, 1000];
    const separation = separations[this.rnd(0, separations.length - 1)];
    
    let targetAltitude = baseAltitude;
    let intruderAltitude = this.roundToNearestFL(baseAltitude + separation);
    
    // Ensure both altitudes are within their respective aircraft limits
    targetAltitude = Math.max(targetType.altitude.min, Math.min(targetType.altitude.max, targetAltitude));
    intruderAltitude = Math.max(intruderType.altitude.min, Math.min(intruderType.altitude.max, intruderAltitude));
    
    return { 
      targetAltitude: this.roundToNearestFL(targetAltitude), 
      intruderAltitude: this.roundToNearestFL(intruderAltitude) 
    };
  }

  private getWeightedSelection(weights: { selection: any; weight: number }[]): any {
    const cumulativeWeights: number[] = [];
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

  private looksLikeMilitaryCallsign(callsign: string): boolean {
    // Military pattern: 4-8 letters followed by 1-2 numbers
    return /^[A-Z]{4,8}\d{1,2}$/.test(callsign);
  }

  private generateCallsign(isVFR: boolean, role: 'target' | 'intruder' = 'target', isMil: boolean = false): string {
    // Military VFR callsign: INTRUDER is VFR && INTRUDER is MIL
    if (role === 'intruder' && isVFR && isMil) {
      const base = this.militaryCallsigns[this.rnd(0, this.militaryCallsigns.length - 1)];
      // Add two random numbers from 0 to 9 as a suffix
      const suffix = (Math.floor(Math.random() * 10)).toString() + (Math.floor(Math.random() * 10)).toString();
      return base + suffix;
    } 
    else if (isVFR) {
      // VFR callsigns: INTRUDER IS VFR (non-military)
      const vfrData = this.vfrCallsigns[this.rnd(0, this.vfrCallsigns.length - 1)];
      
      if (vfrData.countryCode === "N") {
        // Special US handling - as mentioned in the file
        // "There is a different procedure for United States callsigns as they are the only ones actually containing numbers"
        const weights = [
          { selection: 1, weight: 100 }, // 1 number
          { selection: 2, weight: 200 }, // 2 numbers  
          { selection: 3, weight: 150 }  // 3 numbers
        ];
        const numCount = this.getWeightedSelection(weights);
        let callsign = vfrData.countryCode;
        
        // Add numbers
        for (let i = 0; i < numCount; i++) {
          callsign += Math.floor(Math.random() * 10).toString();
        }
        
        // Add letters
        const letterCount = Math.random() > 0.5 ? 2 : 3;
        for (let i = 0; i < letterCount; i++) {
          callsign += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
        
        return callsign;
      } else {
        // Other countries - use presentation pattern
        // "Use the country code as prefix. Generate a suffix depending on the presentation."
        let callsign = vfrData.countryCode;
        const presentation = vfrData.presentation;
        
        for (let char of presentation) {
          if (char === 'Z') {
            // "any letter"
            callsign += String.fromCharCode(65 + Math.floor(Math.random() * 26));
          } else if (char === 'P') {
            // "PZZ" means it can only contain 3 letters: the first one going from A to P
            callsign += String.fromCharCode(65 + Math.floor(Math.random() * 16)); // A-P
          } else if (char === 'W') {
            // "WZZ" - W means A-W
            callsign += String.fromCharCode(65 + Math.floor(Math.random() * 23)); // A-W
          } else if (char === 'K') {
            // "KZZ" means first letter K-Z
            callsign += String.fromCharCode(75 + Math.floor(Math.random() * 11)); // K-Z
          }
        }
        
        return callsign;
      }
    } 
    else {
      // IFR callsigns: INTRUDER IS IFR
      const airline = this.airlines[this.rnd(0, this.airlines.length - 1)];
      const weights = [
        { selection: 3, weight: 150 },
        { selection: 4, weight: 45 },
        { selection: 2, weight: 20 },
        { selection: 1, weight: 10 }
      ];
      const suffixLength = this.getWeightedSelection(weights);
      
      let suffix = "";
      for (let i = 0; i < suffixLength; i++) {
        // From the file: if (str[str.length - 1].match(/[A-Z]/) || Math.random() > (target.isVFR ? 0.1 : 0.75))
        if (suffix[suffix.length - 1] && suffix[suffix.length - 1].match(/[A-Z]/) || Math.random() > 0.75) {
          suffix += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        } else {
          suffix += (Math.floor(Math.random() * 10)).toString();
        }
      }
      
      return airline.icao + suffix;
    }
  }

  private getAbbreviatedType(acType: AcType): string {
    const typeMap: { [key: string]: string } = {
      'Boeing 737': 'B737',
      'Airbus A320': 'A320',
      'Boeing 777': 'B777',
      'Embraer 190': 'E190',
      'Bombardier CRJ900': 'CRJ9',
      'ATR 72': 'AT72',
      'Cessna 172': 'C172',
      'Piper PA-28': 'PA28',
      'Robinson R44': 'R44',
      'Cessna 152': 'C152',
      'Diamond DA40': 'DA40',
      'F-16': 'F16',
      'C-130': 'C130',
      'UH-60': 'UH60',
      'F/A-18': 'F18',
      'KC-135': 'KC13'
    };
    
    return typeMap[acType.name] || acType.name.substring(0, 4);
  }

  private assignLevelChange(target: Ac, intruder: Ac): void {
    // Level change logic based on new requirements:
    // 1. Only when aircraft are at different levels
    // 2. Only for intruders (target levels are static)
    // 3. Intruder should be crossing target's level
    
    if (target.level === intruder.level) {
      // Same level, no level change needed
      return;
    }
    
    if (intruder.isVFR) {
      // VFR aircraft don't typically have level changes in controlled scenarios
      return;
    }
    
    // 30% chance for level change when conditions are met
    if (Math.random() < 0.3) {
      const targetLevel = target.level;
      const intruderLevel = intruder.level;
      
      // Determine if intruder should climb or descend toward target level
      const isAboveTarget = intruderLevel > targetLevel;
      const direction: '↑'|'↓' = isAboveTarget ? '↓' : '↑';
      
      // Calculate new level (crossing through target's level)
      let newLevel: number;
      if (isAboveTarget) {
        // Descending: go to target level or slightly below
        newLevel = this.roundToNearestFL(targetLevel - this.rnd(0, 1000));
      } else {
        // Climbing: go to target level or slightly above  
        newLevel = this.roundToNearestFL(targetLevel + this.rnd(0, 1000));
      }
      
      // Ensure reasonable bounds
      newLevel = Math.max(1000, Math.min(41000, newLevel));
      
      if (newLevel !== intruderLevel) {
        intruder.levelChange = {
          to: newLevel,
          dir: direction
        };
      }
    }
  }

  private generateAircraft(acType: AcType, isVFR: boolean, position: { x: number; y: number }, heading: number, speed: number, altitude?: number, allowLevelChange: boolean = true, role: 'target' | 'intruder' = 'target', targetIsVFR: boolean = false): Ac {
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
      history: this.generateHistory(position, heading, speed)
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
      } catch (error) {
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
    const clockAngle = (clock === 12 ? 0 : clock * 30) * Math.PI / 180;
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
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, false, 'target', targetIsVFR); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, true, 'intruder', targetIsVFR);
    
    // Validate intersection
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null; // As per notes: ±2 miles margin for realism
    
    return this.buildExercise(target, intruder, 'crossing left to right', clock, Math.round(distance));
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
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, false, 'target', targetIsVFR); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, true, 'intruder', targetIsVFR);
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null; // As per notes: ±2 miles margin for realism
    
    return this.buildExercise(target, intruder, 'crossing right to left', clock, Math.round(distance));
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
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, false, 'target', targetIsVFR); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, true, 'intruder', targetIsVFR);
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null; // As per notes: ±2 miles margin for realism
    
    return this.buildExercise(target, intruder, 'converging', clock, Math.round(distance));
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
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, false, 'target', targetIsVFR); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, true, 'intruder', targetIsVFR);
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    // For opposite direction, intersection should be halfway (stricter requirement)
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 1.5) return null; // Stricter for opposite direction as per notes
    
    return this.buildExercise(target, intruder, 'opposite direction', clock, Math.round(distance));
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
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude, false, 'target', targetIsVFR); // No level changes for target
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude, true, 'intruder', targetIsVFR);
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 1.5 || intersectionDistance > 6.5) return null; // More lenient range
    
    // More lenient asymmetry check for overtaking
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 3) return null; // Increased tolerance for overtaking scenarios
    
    return this.buildExercise(target, intruder, 'overtaking', clock, Math.round(distance));
  }

  private buildExercise(target: Ac, intruder: Ac, direction: string, clock: number, distance: number): Exercise {
    // Assign level changes based on new requirements
    this.assignLevelChange(target, intruder);
    
    const levelDiff = intruder.level - target.level;
    let levelText = '';
    
    // Check if intruder is climbing or descending through target's level
    if (intruder.levelChange) {
      const isClimbingThrough = intruder.levelChange.dir === '↑' && 
                               intruder.level < target.level && 
                               intruder.levelChange.to >= target.level;
      const isDescendingThrough = intruder.levelChange.dir === '↓' && 
                                 intruder.level > target.level && 
                                 intruder.levelChange.to <= target.level;
      
      if (isClimbingThrough) {
        levelText = `${Math.abs(levelDiff)} feet below, climbing through your level`;
      } else if (isDescendingThrough) {
        levelText = `${Math.abs(levelDiff)} feet above, descending through your level`;
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
    
    const solution = `${target.callsign}, traffic, ${clock} o'clock, ${distance} miles, ${direction}, ${levelText}, ${intruder.type.type}${wtcText}`;
    
    return {
      target,
      intruder,
      situation: {
        clock,
        distance,
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
