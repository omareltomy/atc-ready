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

  private roundToNearest10(value: number): number {
    return Math.round(value / 10) * 10;
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

  private generateCallsign(acType: AcType, isVFR: boolean): string {
    if (MIL_TYPES.includes(acType)) {
      const base = this.militaryCallsigns[this.rnd(0, this.militaryCallsigns.length - 1)];
      return base + this.rnd(1, 99);
    } else if (isVFR) {
      const prefix = this.gaCallsigns[this.rnd(0, this.gaCallsigns.length - 1)];
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      return prefix + suffix;
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
      'KC-135': 'KC135'
    };
    
    return typeMap[acType.name] || acType.name;
  }

  private generateAircraft(acType: AcType, isVFR: boolean, position: { x: number; y: number }, heading: number, speed: number): Ac {
    const level = this.roundToNearest10(this.rnd(acType.altitude.min, acType.altitude.max));
    const callsign = this.generateCallsign(acType, isVFR);
    
    let levelChange: { to: number; dir: '↑'|'↓' } | undefined;
    if (!isVFR && Math.random() < 0.3) {
      const currentFL = Math.round(level / 100);
      const direction = Math.random() < 0.5 ? '↑' : '↓';
      const change = direction === '↑' ? this.rnd(1, 3) : this.rnd(-3, -1);
      const newFL = Math.max(10, Math.min(410, currentFL + change * 10));
      levelChange = { 
        to: this.roundToNearest10(newFL * 100), 
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
      history: []
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
    const maxAttempts = 100;
    
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
    
    // Generate aircraft
    const allTypes = [...VFR_TYPES, ...IFR_TYPES, ...MIL_TYPES];
    const targetType = allTypes[this.rnd(0, allTypes.length - 1)];
    const intruderType = allTypes[this.rnd(0, allTypes.length - 1)];
    
    const targetIsVFR = VFR_TYPES.includes(targetType);
    const intruderIsVFR = VFR_TYPES.includes(intruderType);
    
    const targetSpeed = this.rnd(targetType.speed.min, targetType.speed.max);
    const intruderSpeed = this.rnd(intruderType.speed.min, intruderType.speed.max);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed);
    
    // Validate intersection
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null;
    
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
    
    const allTypes = [...VFR_TYPES, ...IFR_TYPES, ...MIL_TYPES];
    const targetType = allTypes[this.rnd(0, allTypes.length - 1)];
    const intruderType = allTypes[this.rnd(0, allTypes.length - 1)];
    
    const targetIsVFR = VFR_TYPES.includes(targetType);
    const intruderIsVFR = VFR_TYPES.includes(intruderType);
    
    const targetSpeed = this.rnd(targetType.speed.min, targetType.speed.max);
    const intruderSpeed = this.rnd(intruderType.speed.min, intruderType.speed.max);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed);
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null;
    
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
    
    const allTypes = [...VFR_TYPES, ...IFR_TYPES, ...MIL_TYPES];
    const targetType = allTypes[this.rnd(0, allTypes.length - 1)];
    const intruderType = allTypes[this.rnd(0, allTypes.length - 1)];
    
    const targetIsVFR = VFR_TYPES.includes(targetType);
    const intruderIsVFR = VFR_TYPES.includes(intruderType);
    
    const targetSpeed = this.rnd(targetType.speed.min, targetType.speed.max);
    const intruderSpeed = this.rnd(intruderType.speed.min, intruderType.speed.max);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed);
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null;
    
    return this.buildExercise(target, intruder, 'converging', clock, Math.round(distance));
  }

  private generateOppositeDirection(): Exercise | null {
    // Clock 12, Distance 4-9NM, Angle ≥170°, Symmetric intersection
    const targetHeading = this.rnd(0, 359);
    const distance = this.rndFloat(4, 9);
    const clock = 12;
    
    // Allow ±10° variation for clock 12 while keeping it clearly at 12
    const clockVariation = this.rndFloat(-10, 10);
    const relativeAngle = (targetHeading + clockVariation) * Math.PI / 180;
    
    const intruderX = Math.sin(relativeAngle) * distance;
    const intruderY = Math.cos(relativeAngle) * distance;
    
    // Opposite direction: 170-180°
    const convergenceAngle = this.rndFloat(170, 180);
    
    let intruderHeading = targetHeading + 180 + this.rndFloat(-10, 10);
    if (intruderHeading >= 360) intruderHeading -= 360;
    
    const allTypes = [...VFR_TYPES, ...IFR_TYPES, ...MIL_TYPES];
    const targetType = allTypes[this.rnd(0, allTypes.length - 1)];
    const intruderType = allTypes[this.rnd(0, allTypes.length - 1)];
    
    const targetIsVFR = VFR_TYPES.includes(targetType);
    const intruderIsVFR = VFR_TYPES.includes(intruderType);
    
    const targetSpeed = this.rnd(targetType.speed.min, targetType.speed.max);
    const intruderSpeed = this.rnd(intruderType.speed.min, intruderType.speed.max);
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed);
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    // For opposite direction, intersection should be halfway (strict requirement)
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 0.5) return null; // Stricter for opposite direction
    
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
    
    // Same direction with small variation
    let intruderHeading = targetHeading + this.rndFloat(-15, 15);
    if (intruderHeading < 0) intruderHeading += 360;
    if (intruderHeading >= 360) intruderHeading -= 360;
    
    const allTypes = [...VFR_TYPES, ...IFR_TYPES, ...MIL_TYPES];
    const targetType = allTypes[this.rnd(0, allTypes.length - 1)];
    const intruderType = allTypes[this.rnd(0, allTypes.length - 1)];
    
    const targetIsVFR = VFR_TYPES.includes(targetType);
    const intruderIsVFR = VFR_TYPES.includes(intruderType);
    
    const targetSpeed = this.rnd(targetType.speed.min, targetType.speed.max);
    // Ensure intruder is faster for overtaking
    const intruderSpeed = this.rnd(targetSpeed + 10, Math.max(targetSpeed + 20, intruderType.speed.max));
    
    const target = this.generateAircraft(targetType, targetIsVFR, { x: 0, y: 0 }, targetHeading, targetSpeed);
    const intruder = this.generateAircraft(intruderType, intruderIsVFR, { x: intruderX, y: intruderY }, intruderHeading, intruderSpeed);
    
    const intersection = this.calculateIntersectionPoint(target, intruder);
    if (!intersection) return null;
    
    const intersectionDistance = Math.sqrt(intersection.x * intersection.x + intersection.y * intersection.y);
    if (intersectionDistance < 2 || intersectionDistance > 6) return null;
    
    const asymmetry = Math.abs(intersection.targetDist - intersection.intruderDist);
    if (asymmetry > 2) return null;
    
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
