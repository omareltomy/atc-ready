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

  private airlines = [
    'KLM', 'BAW', 'DLH', 'AFR', 'UAL', 'DAL', 'AAL', 'SWR', 'IBE', 'EZY', 'RYR'
  ];

  private militaryCallsigns = [
    'FALCON', 'EAGLE', 'VIPER', 'TIGER', 'HAWK', 'RAVEN', 'GHOST', 'SHADOW'
  ];

  private gaCallsigns = [
    'N', 'G-', 'D-E', 'PH', 'OO', 'F-', 'C-'
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
    
    // Generate history dots based on speed (from notes: linked to min 60 and max 350 speed)
    // More history dots for faster aircraft, fewer for slower
    const minSpeed = 60;
    const maxSpeed = 350;
    const normalizedSpeed = Math.max(0, Math.min(1, (speed - minSpeed) / (maxSpeed - minSpeed)));
    
    // Number of history dots: 2-6 based on speed
    const numDots = Math.floor(2 + normalizedSpeed * 4);
    
    // Distance between dots: faster aircraft have dots further apart
    const minSpacing = 0.3; // NM
    const maxSpacing = 1.0; // NM  
    const spacing = minSpacing + normalizedSpeed * (maxSpacing - minSpacing);
    
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
    // Define aircraft categories with realistic pairing
    const lowAltitude = [...VFR_TYPES]; // VFR aircraft (1,000-5,500 feet)
    const mediumAltitude = [...IFR_TYPES.filter(ac => ac.altitude.max <= 30000)]; // Regional/smaller commercial (5,000-30,000 feet)
    const highAltitude = [...IFR_TYPES.filter(ac => ac.altitude.max > 30000)]; // Large commercial (10,000-43,000 feet)
    const militaryLow = [MIL_TYPES[2]]; // UH-60 helicopter (500-8,000 feet)
    const militaryMed = [MIL_TYPES[1]]; // C-130 (1,000-30,000 feet)
    const militaryHigh = [MIL_TYPES[0], MIL_TYPES[3], MIL_TYPES[4]]; // F-16, F/A-18, KC-135 (high altitude capable)

    // Define compatible pairing groups
    const compatibleGroups = [
      { name: 'VFR_Traffic', aircraft: lowAltitude, isVFR: true },
      { name: 'Regional_IFR', aircraft: mediumAltitude, isVFR: false },
      { name: 'Commercial_IFR', aircraft: highAltitude, isVFR: false },
      { name: 'Military_Low', aircraft: militaryLow, isVFR: false },
      { name: 'Military_Med', aircraft: militaryMed, isVFR: false },
      { name: 'Military_High', aircraft: militaryHigh, isVFR: false }
    ];

    // Allow some cross-group pairing for realism (but within reasonable altitude ranges)
    const compatiblePairings = [
      // Same category pairings (most common)
      ['VFR_Traffic', 'VFR_Traffic'],
      ['Regional_IFR', 'Regional_IFR'],
      ['Commercial_IFR', 'Commercial_IFR'],
      ['Military_Low', 'Military_Low'],
      ['Military_Med', 'Military_Med'],
      ['Military_High', 'Military_High'],
      
      // Cross-category pairings (less common but realistic)
      ['Regional_IFR', 'Commercial_IFR'], // Regional and commercial mix
      ['Military_Med', 'Regional_IFR'], // Military transport with civilian
      ['Military_High', 'Commercial_IFR'], // High altitude military with commercial
    ];

    // Select a random compatible pairing
    const selectedPairing = compatiblePairings[this.rnd(0, compatiblePairings.length - 1)];
    const targetGroup = compatibleGroups.find(g => g.name === selectedPairing[0])!;
    const intruderGroup = compatibleGroups.find(g => g.name === selectedPairing[1])!;

    const targetType = targetGroup.aircraft[this.rnd(0, targetGroup.aircraft.length - 1)];
    const intruderType = intruderGroup.aircraft[this.rnd(0, intruderGroup.aircraft.length - 1)];

    return {
      targetType,
      intruderType,
      targetIsVFR: targetGroup.isVFR,
      intruderIsVFR: intruderGroup.isVFR
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
    
    // Add some vertical separation (typically 1000-3000 feet in controlled airspace)
    const separations = [-3000, -2000, -1000, 0, 1000, 2000, 3000];
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

  private generateCallsign(acType: AcType, isVFR: boolean): string {
    if (MIL_TYPES.includes(acType)) {
      const base = this.militaryCallsigns[this.rnd(0, this.militaryCallsigns.length - 1)];
      return base + this.rnd(1, 99);
    } else if (isVFR) {
      const prefixes = ['N', 'G-', 'D-E', 'PH', 'OO', 'F-', 'C-'];
      const prefix = prefixes[this.rnd(0, prefixes.length - 1)];
      if (prefix === 'N') {
        return 'N' + this.rnd(100, 999) + String.fromCharCode(65 + this.rnd(0, 25)) + String.fromCharCode(65 + this.rnd(0, 25));
      } else {
        const numbers = String(this.rnd(100, 999));
        return prefix + numbers;
      }
    } else {
      const airline = this.airlines[this.rnd(0, this.airlines.length - 1)];
      const number = this.rnd(100, 9999);
      return airline + number;
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

  private generateAircraft(acType: AcType, isVFR: boolean, position: { x: number; y: number }, heading: number, speed: number, altitude?: number): Ac {
    const level = altitude ? this.roundToNearestFL(altitude) : this.roundToNearestFL(this.rnd(acType.altitude.min, acType.altitude.max));
    const callsign = this.generateCallsign(acType, isVFR);
    
    let levelChange: { to: number; dir: '↑'|'↓' } | undefined;
    if (!isVFR && Math.random() < 0.3) {
      const currentFL = Math.round(level / 100);
      const direction = Math.random() < 0.5 ? '↑' : '↓';
      const change = direction === '↑' ? this.rnd(1, 3) : this.rnd(-3, -1);
      const newFL = Math.max(10, Math.min(410, currentFL + change * 10));
      levelChange = { 
        to: this.roundToNearestFL(newFL * 100), 
        dir: direction 
      };
    }

    return {
      callsign,
      wtc: acType.wtc,
      type: { 
        name: acType.name, 
        type: this.getAbbreviatedType(acType) 
      },
      isVFR,
      heading,
      level,
      levelChange,
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
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude);
    
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
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude);
    
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
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude);
    
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
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude);
    
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
    
    // Same direction with small variation for overtaking
    let intruderHeading = targetHeading + this.rndFloat(-15, 15); // Allow more variation for intersection
    if (intruderHeading < 0) intruderHeading += 360;
    if (intruderHeading >= 360) intruderHeading -= 360;
    
    // Select compatible aircraft types and realistic altitudes
    const { targetType, intruderType, targetIsVFR, intruderIsVFR } = this.selectCompatibleAircraft();
    const { targetAltitude, intruderAltitude } = this.generateRealisticAltitudes(targetType, intruderType, targetIsVFR, intruderIsVFR);
    
    // Use more flexible speed selection for overtaking
    const targetSpeed = this.rnd(Math.max(60, targetType.speed.min), Math.min(targetType.speed.max, 280)); // Cap target speed lower
    // Ensure intruder is faster for overtaking with reasonable minimum difference
    const minIntruderSpeed = targetSpeed + 15; // Reasonable speed difference
    const maxIntruderSpeed = Math.min(intruderType.speed.max, 400); // Allow higher speeds
    
    if (minIntruderSpeed > maxIntruderSpeed) {
      return null; // Can't make intruder faster, try again
    }
    
    const intruderSpeed = this.rnd(minIntruderSpeed, maxIntruderSpeed);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed, targetAltitude);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed, intruderAltitude);
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    // More lenient asymmetry check for overtaking
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null; // As per notes: ±2 miles margin for realism
    
    return this.buildExercise(target, intruder, 'overtaking', clock, Math.round(distance));
  }

  private buildExercise(target: Ac, intruder: Ac, direction: string, clock: number, distance: number): Exercise {
    const levelDiff = intruder.level - target.level;
    const levelText = levelDiff === 0 ? 'same level' : 
                     levelDiff > 0 ? `${Math.abs(levelDiff)} feet above` : 
                     `${Math.abs(levelDiff)} feet below`;
    
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
