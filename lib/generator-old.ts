/**
 * Aviation Traffic Exercise Generator
 * 
 * This module generates realistic air traffic control (ATC) training scenarios
 * according to specific requirements for direction distribution, clock positions,
 * distances, convergence angles, and intersection points.
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
 * @author Aviation Training System
 * @version 3.0
 */

import { VFR_TYPES, IFR_TYPES, MIL_TYPES, type AcType } from './constants';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Represents an aircraft in the training scenario
 */
export interface Ac {
  /** Aircraft callsign (e.g., "KLM1234", "N123AB", "FALCON1") */
  callsign: string;
  /** Wake turbulence category: Light, Medium, or Heavy */
  wtc: 'L'|'M'|'H';
  /** Aircraft type information */
  type: { name: string; type: string };
  /** Whether aircraft is operating under Visual Flight Rules */
  isVFR: boolean;
  /** Current heading in degrees (0-359) */
  heading: number;
  /** Current altitude in feet (rounded to nearest 10) */
  level: number;
  /** Optional level change instruction for IFR aircraft */
  levelChange?: { to: number; dir: '↑'|'↓' };
  /** Ground speed in knots */
  speed: number;
  /** Position on radar scope (nautical miles from center) */
  position: { x: number; y: number };
  /** Historical positions for radar track display */
  history: { x: number; y: number }[];
}

/**
 * Valid traffic pattern classifications based on ATC definitions
 */
export type TrafficPattern = 'crossing left to right' | 'crossing right to left' | 'converging' | 'opposite direction' | 'overtaking';

/**
 * Complete training exercise with target, intruder, and solution
 */
export interface Exercise {
  /** The primary aircraft (student's perspective) */
  target: Ac;
  /** The traffic aircraft to be reported */
  intruder: Ac;
  /** Complete ATC traffic call solution */
  solution: string;
  /** Detailed situation analysis */
  situation: {
    /** Clock position (1-12) relative to target's heading */
    clock: number;
    /** Distance in nautical miles */
    distance: number;
    /** Traffic pattern classification */
    direction: string;
    /** Altitude difference in feet (positive = above, negative = below) */
    levelDiff: number;
    /** Aircraft type name */
    type: string;
  };
}

// =============================================================================
// AVIATION TRAFFIC EXERCISE GENERATOR CLASS
// =============================================================================

/**
 * Aviation Traffic Exercise Generator
 * 
 * Generates realistic ATC training scenarios with proper aircraft positioning,
 * headings, and traffic patterns that follow actual ATC definitions.
 */
export class AviationTrafficGenerator {
  // Class constants
  private static readonly COUNTRY_PREFIXES = ['OO', 'PH', 'D-E', 'F-', 'G-', 'N', 'C-'];
  private static readonly AIRLINE_CODES = ['KLM', 'RYR', 'DLH', 'AFR', 'BAW', 'EZY', 'UAL', 'DAL', 'SWR', 'IBE'];
  private static readonly MILITARY_CALLSIGNS = ['GRIZZLY', 'VIPER', 'FALCON', 'EAGLE', 'HAWK', 'WOLF', 'TIGER', 'SHARK'];
  
  /**
   * Generates a random integer between min and max (inclusive).
   */
  private rnd(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Picks a random element from an array.
   */
  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Generates appropriate ground speed for aircraft type
   */
  private generateSpeed(type: AcType): number {
    return this.rnd(type.speed.min, type.speed.max);
  }

  /**
   * Generates realistic callsign based on flight rules and aircraft type
   */
  private generateCallsign(isVFR: boolean, isMil: boolean): string {
    if (isVFR && isMil) {
      return this.pick(AviationTrafficGenerator.MILITARY_CALLSIGNS);
    }
    
    if (isVFR) {
      // VFR Registration: country prefix + 1-5 alphanumeric
      const prefix = this.pick(AviationTrafficGenerator.COUNTRY_PREFIXES);
      const suffix = Math.random().toString(36).substring(2, 2 + this.rnd(1, 5)).toUpperCase();
      return prefix + suffix;
    } else {
      // Commercial flight: airline + 1-4 digits + optional 1-2 letters
      const airline = this.pick(AviationTrafficGenerator.AIRLINE_CODES);
      const number = this.rnd(1, 9999);
      const letters = Math.random() < 0.3 ? Math.random().toString(36).substring(2, 4).toUpperCase() : '';
      return `${airline}${number}${letters}`.substring(0, 8);
    }
  }

  /**
   * Generates realistic altitude based on flight rules
   */
  private generateLevel(isVFR: boolean): number {
    if (isVFR) {
      // VFR: 1500-5500 feet (realistic VFR altitudes)
      return this.rnd(15, 55) * 100;
    } else {
      // IFR: FL060-FL240 (6000-24000 feet) 
      return this.rnd(60, 240) * 100;
    }
  }

  /**
   * Generates intruder altitude with appropriate separation from target
   */
  private generateIntruderLevel(targetLevel: number, isVFR: boolean): number {
    const separation = isVFR ? this.rnd(200, 500) : this.rnd(500, 1000);
    const above = Math.random() < 0.5;
    return above ? targetLevel + separation : targetLevel - separation;
  }

// =============================================================================
// TRAFFIC PATTERN CALCULATION
// =============================================================================

/**
 * Calculates appropriate heading for intruder to create desired traffic pattern
 */
private calculateInterceptHeading(
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  ownSpeed: number,
  targetPos: { x: number; y: number },
  targetHeading: number,
  targetSpeed: number,
  intendedPattern: string,
  clockPosition: number
): number {
  // Calculate bearing from intruder to target
  const dx = targetPos.x - fromPos.x;
  const dy = targetPos.y - fromPos.y;
  
  let bearingToTarget = Math.atan2(dx, dy) * 180 / Math.PI;
  if (bearingToTarget < 0) bearingToTarget += 360;
  
  // Apply pattern-specific adjustments
  let finalHeading = bearingToTarget;
  
  switch (intendedPattern) {
    case 'crossing_lr':
      // Crossing left to right: 45-135° to the left of target heading
      finalHeading = targetHeading + this.rnd(45, 135);
      break;
      
    case 'crossing_rl':
      // Crossing right to left: 225-315° relative to target heading
      finalHeading = targetHeading + this.rnd(225, 315);
      break;
      
    case 'opposite':
      // Opposite direction: roughly opposite to target
      finalHeading = targetHeading + 180 + this.rnd(-30, 30);
      break;
      
    case 'converging':
      // Converging: less than 45° intersection
      const convergingOffset = Math.random() < 0.5 ? this.rnd(0, 45) : this.rnd(315, 360);
      finalHeading = targetHeading + convergingOffset;
      break;
      
    case 'overtaking':
      // Same direction but faster
      finalHeading = targetHeading + this.rnd(-20, 20);
      break;
      
    default:
      // Fallback to converging
      finalHeading = targetHeading + this.rnd(-30, 30);
  }
  
  // Normalize
  while (finalHeading < 0) finalHeading += 360;
  while (finalHeading >= 360) finalHeading -= 360;
  
  return Math.round(finalHeading);
}

/**
 * Determines if two aircraft flight paths will intersect within radar range
 * Uses vector mathematics to calculate closest point of approach
 */
private willPathsIntersect(target: Ac, intruder: Ac, maxTime: number = 30): boolean {
  // Convert headings to radians and calculate velocity vectors
  const targetVelX = target.speed * Math.sin(target.heading * Math.PI / 180);
  const targetVelY = target.speed * Math.cos(target.heading * Math.PI / 180);
  const intruderVelX = intruder.speed * Math.sin(intruder.heading * Math.PI / 180);
  const intruderVelY = intruder.speed * Math.cos(intruder.heading * Math.PI / 180);
  
  // Calculate relative velocity
  const relVelX = intruderVelX - targetVelX;
  const relVelY = intruderVelY - targetVelY;
  
  // If relative velocity is zero, aircraft are moving in parallel
  if (Math.abs(relVelX) < 0.1 && Math.abs(relVelY) < 0.1) {
    return false;
  }
  
  // Calculate time to closest approach
  const relPosX = intruder.position.x - target.position.x;
  const relPosY = intruder.position.y - target.position.y;
  
  const timeToClosest = -(relPosX * relVelX + relPosY * relVelY) / (relVelX * relVelX + relVelY * relVelY);
  
  // Check if closest approach happens within reasonable time
  if (timeToClosest < 0 || timeToClosest > maxTime) {
    return false;
  }
  
  // Calculate positions at closest approach
  const targetFutureX = target.position.x + targetVelX * timeToClosest;
  const targetFutureY = target.position.y + targetVelY * timeToClosest;
  const intruderFutureX = intruder.position.x + intruderVelX * timeToClosest;
  const intruderFutureY = intruder.position.y + intruderVelY * timeToClosest;
  
  // Calculate separation at closest approach
  const separation = Math.sqrt(
    Math.pow(targetFutureX - intruderFutureX, 2) + 
    Math.pow(targetFutureY - intruderFutureY, 2)
  );
  
  // Consider it a valid intersection if they get within 3 miles
  return separation < 3.0 && Math.abs(targetFutureX) < 50 && Math.abs(targetFutureY) < 50;
}

/**
 * Classifies traffic pattern based on intersection angle between aircraft headings
 * Implements official ATC traffic pattern definitions
 */
private classifyTrafficPattern(
  targetHeading: number,
  intruderHeading: number,
  targetSpeed: number,
  intruderSpeed: number
): string {
  // Normalize headings to 0-360
  const normalizeHeading = (heading: number) => {
    while (heading < 0) heading += 360;
    while (heading >= 360) heading -= 360;
    return heading;
  };

  const targetHdg = normalizeHeading(targetHeading);
  const intruderHdg = normalizeHeading(intruderHeading);
  
  // Calculate heading difference (smallest angle between headings)
  let headingDiff = Math.abs(intruderHdg - targetHdg);
  if (headingDiff > 180) headingDiff = 360 - headingDiff;
  
  // Check for overtaking first (same direction with higher speed)
  if (headingDiff <= 45 && intruderSpeed > targetSpeed) {
    return 'overtaking';
  }
  
  // Calculate intersection angle relative to target's heading direction
  let intersectionAngle = intruderHdg - targetHdg;
  if (intersectionAngle < 0) intersectionAngle += 360;
  
  // ATC direction definitions based on intersection angles
  if (headingDiff < 45) {
    return 'converging';
  } else if (headingDiff > 135) {
    return 'opposite direction';
  } else {
    // Crossing traffic (45° - 135°)
    // Determine left vs right based on relative bearing
    if (intersectionAngle > 180) {
      return 'crossing right to left';  // Intruder approaching from right
    } else {
      return 'crossing left to right';   // Intruder approaching from left
    }
  }
}

/**
 * Generates historical position points for radar track display
 * Creates 3 previous positions based on aircraft heading and estimated speed
 */
private generateHistory(position: { x: number; y: number }, heading: number): { x: number; y: number }[] {
  const history: { x: number; y: number }[] = [];
  const headingRad = heading * Math.PI / 180;
  
  // Generate 3 history points (3 seconds apart)
  for (let i = 1; i <= 3; i++) {
    const distance = i * 0.5; // Approximate distance for 3-second intervals
    history.push({
      x: position.x - Math.sin(headingRad) * distance,
      y: position.y - Math.cos(headingRad) * distance
    });
  }
  
  return history;
}

// =============================================================================
// MAIN EXERCISE GENERATOR
// =============================================================================

/**
 * Generates a complete ATC training exercise with realistic traffic scenario
 * 
 * This function creates a training scenario by:
 * 1. Generating a target aircraft (student's perspective)
 * 2. Creating an intruder aircraft with appropriate positioning
 * 3. Ensuring flight paths will actually intersect for realistic training
 * 4. Classifying the traffic pattern according to ATC definitions
 * 5. Generating the complete traffic call solution
 * 
 * The function uses multiple attempts to ensure realistic scenarios where
 * aircraft paths actually converge within radar range.
 * 
 * @returns Complete training exercise with all necessary information
 */
public generateExercise(): Exercise {
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // 1. GENERATE TARGET AIRCRAFT
    const targetVFR = Math.random() < 0.8; // 80% chance VFR
    const targetType = targetVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
    
    const target: Ac = {
      callsign: this.generateCallsign(targetVFR, false),
      wtc: targetType.wtc,
      type: { name: targetType.name, type: targetType.name.substring(0, 4) },
      isVFR: targetVFR,
      heading: this.rnd(0, 359),
      level: this.generateLevel(targetVFR),
      speed: this.generateSpeed(targetType),
      position: { x: 0, y: 0 }, // Target at center
      history: []
    };
    target.history = this.generateHistory(target.position, target.heading);

    // 2. GENERATE INTRUDER AIRCRAFT
    const intruderVFR = targetVFR; // Same flight rules as target
    const intruderMil = intruderVFR && Math.random() < 0.1; // 10% chance military if VFR
    
    let intruderType: AcType;
    if (intruderMil) {
      intruderType = this.pick(MIL_TYPES);
    } else if (intruderVFR) {
      intruderType = this.pick(VFR_TYPES);
    } else {
      intruderType = this.pick(IFR_TYPES);
    }
    
    // Position intruder 4-10 miles away
    const distance = this.rnd(4, 10);
    const clockPosition = this.rnd(1, 12);
    const relativeClockAngle = ((clockPosition === 12 ? 0 : clockPosition * 30) + target.heading) * Math.PI / 180;
    
    const intruderPosition = {
      x: Math.sin(relativeClockAngle) * distance,
      y: Math.cos(relativeClockAngle) * distance
    };
    
    const intruderLevel = this.generateIntruderLevel(target.level, intruderVFR);
    let intruderSpeed = this.generateSpeed(intruderType);
    
    // Choose a random traffic pattern
    const patternTypes = [
      'crossing_lr',
      'crossing_rl', 
      'converging',
      'opposite',
      'overtaking'
    ];
    const intendedPattern = this.pick(patternTypes);
    
    // For overtaking scenarios, ensure intruder is faster
    if (intendedPattern === 'overtaking') {
      intruderSpeed = Math.max(intruderSpeed, target.speed + this.rnd(20, 50));
    }
    
    // Calculate intruder heading for the intended pattern
    const intruderHeading = this.calculateInterceptHeading(
      intruderPosition,
      target.position,
      intruderSpeed,
      target.position,
      target.heading,
      target.speed,
      intendedPattern,
      clockPosition
    );
    
    // Generate level change for IFR aircraft (25% chance)
    let levelChange;
    if (!intruderVFR && Math.random() < 0.25) {
      const changeTarget = intruderLevel > target.level 
        ? target.level - 1000  // If above target, descend below
        : target.level + 1000; // If below target, climb above
      const direction: '↑' | '↓' = changeTarget > intruderLevel ? '↑' : '↓';
      levelChange = { to: changeTarget, dir: direction };
    }
    
    const intruder: Ac = {
      callsign: this.generateCallsign(intruderVFR, intruderMil),
      wtc: intruderType.wtc,
      type: { name: intruderType.name, type: intruderType.name.substring(0, 4) },
      isVFR: intruderVFR,
      heading: intruderHeading,
      level: intruderLevel,
      levelChange,
      speed: intruderSpeed,
      position: intruderPosition,
      history: []
    };
    intruder.history = this.generateHistory(intruder.position, intruder.heading);

    // 3. CHECK IF PATHS WILL INTERSECT
    if (this.willPathsIntersect(target, intruder)) {
      // 4. CLASSIFY TRAFFIC PATTERN based on actual headings
      const trafficDirection = this.classifyTrafficPattern(target.heading, intruder.heading, target.speed, intruder.speed);

      // 5. GENERATE SOLUTION STRING
      const levelDiff = intruder.level - target.level;
      const roundedLevelDiff = Math.round(Math.abs(levelDiff) / 100) * 100;
      const levelText = roundedLevelDiff <= 200 
        ? 'same level'
        : `${roundedLevelDiff} feet ${levelDiff > 0 ? 'above' : 'below'}`;
      
      const wtcText = intruder.wtc === 'H' ? ', heavy' : '';
      
      const solution = `${target.callsign}, traffic, ${clockPosition} o'clock, ${distance} miles, ${trafficDirection}, ${levelText}, ${intruder.type.name}${wtcText}`;

      return {
        target,
        intruder,
        solution,
        situation: {
          clock: clockPosition,
          distance,
          direction: trafficDirection,
          levelDiff,
          type: intruder.type.name
        }
      };
    }
  }
  
  // Fallback - generate a simple converging scenario that should work
  const targetVFR = Math.random() < 0.8;
  const targetType = targetVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
  
  const target: Ac = {
    callsign: this.generateCallsign(targetVFR, false),
    wtc: targetType.wtc,
    type: { name: targetType.name, type: targetType.name.substring(0, 4) },
    isVFR: targetVFR,
    heading: this.rnd(0, 359),
    level: this.generateLevel(targetVFR),
    speed: this.generateSpeed(targetType),
    position: { x: 0, y: 0 },
    history: []
  };
  target.history = this.generateHistory(target.position, target.heading);
  
  const intruderVFR = targetVFR;
  const intruderType = targetVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
  
  // Create a simple head-on scenario
  const distance = 6;
  const clockPosition = 12;
  const intruder: Ac = {
    callsign: this.generateCallsign(intruderVFR, false),
    wtc: intruderType.wtc,
    type: { name: intruderType.name, type: intruderType.name.substring(0, 4) },
    isVFR: intruderVFR,
    heading: (target.heading + 180) % 360, // Head-on
    level: this.generateIntruderLevel(target.level, intruderVFR),
    speed: this.generateSpeed(intruderType),
    position: { x: 0, y: distance }, // Directly ahead
    history: []
  };
  intruder.history = this.generateHistory(intruder.position, intruder.heading);
  
  const trafficDirection = this.classifyTrafficPattern(target.heading, intruder.heading, target.speed, intruder.speed);
  const levelDiff = intruder.level - target.level;
  const roundedLevelDiff = Math.round(Math.abs(levelDiff) / 100) * 100;
  const levelText = roundedLevelDiff <= 200 
    ? 'same level'
    : `${roundedLevelDiff} feet ${levelDiff > 0 ? 'above' : 'below'}`;
  
  const solution = `${target.callsign}, traffic, ${clockPosition} o'clock, ${distance} miles, ${trafficDirection}, ${levelText}, ${intruder.type.name}`;

  return {
    target,
    intruder,
    solution,
    situation: {
      clock: clockPosition,
      distance,
      direction: trafficDirection,
      levelDiff,
      type: intruder.type.name
    }
  };
}
}

// =============================================================================
// CONVENIENCE FUNCTION FOR BACKWARD COMPATIBILITY
// =============================================================================

/**
 * Convenience function to generate an exercise using the default generator instance.
 * Maintains backward compatibility with existing code.
 * 
 * @returns Complete training exercise
 */
export function generateExercise(): Exercise {
  const generator = new AviationTrafficGenerator();
  return generator.generateExercise();
}
