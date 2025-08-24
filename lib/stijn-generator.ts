/**
 * Stijn Aviation Traffic Generator
 * Advanced ATC training scenario generator with precise geometric calculations
 */

import { VFR_TYPES, IFR_TYPES, MIL_TYPES, type AcType } from './constants';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface Ac {
  callsign: string;
  wtc: 'L' | 'M' | 'H';
  type: { name: string };
  isVFR: boolean;
  heading: number;
  level: number;
  levelChange?: { to: number; dir: '↑' | '↓' };
  speed: number;
  position: { x: number; y: number };
  history: { x: number; y: number }[];
}

export interface Exercise {
  target: Ac;
  intruder: Ac;
  solution: string;
  situation: {
    clock: number;
    distance: number;
    direction: string;
    levelDiff: number;
    type: string;
  };
}

// =============================================================================
// STIJN AVIATION TRAFFIC GENERATOR CLASS
// =============================================================================

export class StijnAviationTrafficGenerator {
  // Static constants
  private static readonly PREFIXES = ['OO', 'PH', 'D-E', 'F-', 'G-', 'N', 'C-'];
  private static readonly AIRLINES = ['KLM', 'RYR', 'DLH', 'AFR', 'BAW', 'EZY', 'UAL', 'DAL', 'IBE'];
  private static readonly MILITARY = ['GRIZZLY', 'VIPER', 'FALCON', 'EAGLE', 'HAWK', 'WOLF', 'REACH', 'CONVOY'];

  // Radar constants
  private static readonly RADAR_CENTER = 200; // Assuming 400px radar with center at 200
  private static readonly NM_TO_PIXELS = 50 / 3; // 3NM = 50px based on reference
  private static readonly MAX_ATTEMPTS = 100;

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  private rnd(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private randBetween(a: number, b: number): number {
    return a + Math.random() * (b - a);
  }

  // =============================================================================
  // MATH & GEOMETRY HELPER FUNCTIONS
  // =============================================================================

  private deg2rad = Math.PI / 180;
  private rad2deg = 180 / Math.PI;

  /**
   * Convert aviation heading to unit vector
   * Aviation: 0°=north(up), 90°=east(right)
   */
  private headingToVector(headingDeg: number): { x: number; y: number } {
    const θ = headingDeg * this.deg2rad;
    return { x: Math.sin(θ), y: -Math.cos(θ) };
  }

  /**
   * Convert vector to aviation heading (1-360)
   */
  private vectorToHeading(vx: number, vy: number): number {
    const angleDeg = Math.atan2(vx, -vy) * this.rad2deg;
    return this.wrapDeg360(angleDeg);
  }

  /**
   * Keep angle in 1-360 range
   */
  private wrapDeg360(angle: number): number {
    const wrapped = ((angle % 360) + 360) % 360;
    return wrapped === 0 ? 360 : wrapped;
  }

  /**
   * Convert clock position to relative bearing
   */
  private clockToRelativeBearing(clock: number): number {
    return (clock % 12) * 30;
  }

  /**
   * Calculate angle between three points (in degrees)
   */
  private calculateAngle(A: { x: number; y: number }, B: { x: number; y: number }, C: { x: number; y: number }): number {
    const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
    const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
    
    if (AB === 0 || BC === 0) return 0;
    
    const cosAngle = (BC * BC + AB * AB - AC * AC) / (2 * BC * AB);
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * this.rad2deg;
  }

  /**
   * Calculate distance between two points in nautical miles
   */
  private calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const pixelDistance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    return pixelDistance / StijnAviationTrafficGenerator.NM_TO_PIXELS;
  }

  // =============================================================================
  // AIRCRAFT GENERATION FUNCTIONS
  // =============================================================================

  private generateCallsign(isVFR: boolean, isMil: boolean): string {
    if (isVFR && isMil) {
      return this.pick(StijnAviationTrafficGenerator.MILITARY) + this.rnd(1, 99).toString().padStart(2, '0');
    }
    if (isVFR) {
      return this.pick(StijnAviationTrafficGenerator.PREFIXES) + 
             Math.random().toString(36).substring(2, 7).toUpperCase();
    }
    return this.pick(StijnAviationTrafficGenerator.AIRLINES) + this.rnd(1, 9999);
  }

  private generateLevel(isVFR: boolean): number {
    return this.rnd(isVFR ? 10 : 60, isVFR ? 55 : 240) * 100;
  }

  private generateIntruderLevel(targetLevel: number, isVFR: boolean): number {
    const separation = isVFR ? this.rnd(200, 500) : this.rnd(500, 1500);
    return Math.random() < 0.5 ? targetLevel + separation : targetLevel - separation;
  }

  private generateHistory(pos: { x: number; y: number }, heading: number): { x: number; y: number }[] {
    const vector = this.headingToVector(heading);
    const stepSize = 8; // pixels per history dot
    
    return Array.from({ length: 3 }, (_, i) => ({
      x: pos.x - vector.x * stepSize * (i + 1),
      y: pos.y - vector.y * stepSize * (i + 1)
    }));
  }

  // =============================================================================
  // INTERSECTION & CONVERGENCE FUNCTIONS
  // =============================================================================

  /**
   * Get intersection point ahead of target
   */
  private getIntersectionPoint(target: Ac, distanceAhead: number): { x: number; y: number } {
    const forward = this.headingToVector(target.heading);
    const pixelDistance = distanceAhead * StijnAviationTrafficGenerator.NM_TO_PIXELS;
    
    return {
      x: target.position.x + forward.x * pixelDistance,
      y: target.position.y + forward.y * pixelDistance
    };
  }

  /**
   * Calculate heading from one point to another
   */
  private headingTowardPoint(from: { x: number; y: number }, to: { x: number; y: number }): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return this.vectorToHeading(dx, dy);
  }

  /**
   * Place intruder at clock position with proper angle validation
   */
  private placeIntruderAtClock(
    target: Ac, 
    clock: number, 
    range: number, 
    intersection: { x: number; y: number }
  ): { position: { x: number; y: number }; heading: number } {
    
    const relBearing = this.clockToRelativeBearing(clock);
    const absBearing = this.wrapDeg360(target.heading + relBearing);
    const direction = this.headingToVector(absBearing);
    const pixelRange = range * StijnAviationTrafficGenerator.NM_TO_PIXELS;
    
    let intruderPos = {
      x: target.position.x + direction.x * pixelRange,
      y: target.position.y + direction.y * pixelRange
    };
    
    // Adjust position if it's outside radar scope
    const maxRadius = StijnAviationTrafficGenerator.RADAR_CENTER * 0.9;
    const distFromCenter = Math.sqrt(
      Math.pow(intruderPos.x - StijnAviationTrafficGenerator.RADAR_CENTER, 2) + 
      Math.pow(intruderPos.y - StijnAviationTrafficGenerator.RADAR_CENTER, 2)
    );
    
    if (distFromCenter > maxRadius) {
      const scale = maxRadius / distFromCenter;
      intruderPos.x = StijnAviationTrafficGenerator.RADAR_CENTER + 
                     (intruderPos.x - StijnAviationTrafficGenerator.RADAR_CENTER) * scale;
      intruderPos.y = StijnAviationTrafficGenerator.RADAR_CENTER + 
                     (intruderPos.y - StijnAviationTrafficGenerator.RADAR_CENTER) * scale;
    }
    
    const headingToIntersection = this.headingTowardPoint(intruderPos, intersection);
    
    return {
      position: intruderPos,
      heading: headingToIntersection
    };
  }

  /**
   * Validate that aircraft paths will actually intersect
   */
  private willPathsIntersect(target: Ac, intruder: Ac, maxTimeMinutes: number = 30): boolean {
    // Convert to velocity vectors (NM per minute)
    const tVel = this.headingToVector(target.heading);
    const iVel = this.headingToVector(intruder.heading);
    
    tVel.x *= target.speed / 60;
    tVel.y *= target.speed / 60;
    iVel.x *= intruder.speed / 60;
    iVel.y *= intruder.speed / 60;
    
    // Relative velocity and position
    const relVel = { x: iVel.x - tVel.x, y: iVel.y - tVel.y };
    const relPos = { 
      x: (intruder.position.x - target.position.x) / StijnAviationTrafficGenerator.NM_TO_PIXELS, 
      y: (intruder.position.y - target.position.y) / StijnAviationTrafficGenerator.NM_TO_PIXELS 
    };
    
    // Check if aircraft are converging
    const relSpeed = Math.sqrt(relVel.x * relVel.x + relVel.y * relVel.y);
    if (relSpeed < 0.1) return false; // Parallel tracks
    
    // Time to closest approach
    const timeToClosest = -(relPos.x * relVel.x + relPos.y * relVel.y) / 
                         (relVel.x * relVel.x + relVel.y * relVel.y);
    
    if (timeToClosest < 0 || timeToClosest > maxTimeMinutes) return false;
    
    // Calculate closest approach distance
    const tFuture = {
      x: (target.position.x / StijnAviationTrafficGenerator.NM_TO_PIXELS) + tVel.x * timeToClosest,
      y: (target.position.y / StijnAviationTrafficGenerator.NM_TO_PIXELS) + tVel.y * timeToClosest
    };
    
    const iFuture = {
      x: (intruder.position.x / StijnAviationTrafficGenerator.NM_TO_PIXELS) + iVel.x * timeToClosest,
      y: (intruder.position.y / StijnAviationTrafficGenerator.NM_TO_PIXELS) + iVel.y * timeToClosest
    };
    
    const separation = Math.sqrt(
      Math.pow(tFuture.x - iFuture.x, 2) + Math.pow(tFuture.y - iFuture.y, 2)
    );
    
    return separation < 2.0; // Within 2 NM
  }

  // =============================================================================
  // TRAFFIC PATTERN GENERATION FUNCTIONS
  // =============================================================================

  /**
   * Generate crossing left to right scenario
   */
  private generateCrossingLeftToRight(target: Ac): { intruder: Ac; clock: number; distance: number } | null {
    for (let attempt = 0; attempt < 20; attempt++) {
      const clock = this.rnd(8, 11); // Left side positions
      const distance = this.rnd(3, 8);
      const intersectionDistance = this.randBetween(2, 6);
      
      const intersection = this.getIntersectionPoint(target, intersectionDistance);
      const intruderData = this.placeIntruderAtClock(target, clock, distance, intersection);
      
      // Validate crossing angle
      const angle = this.calculateAngle(intruderData.position, intersection, target.position);
      
      if (angle >= 45 && angle <= 135) {
        const intruderType = target.isVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
        
        const intruder: Ac = {
          callsign: this.generateCallsign(target.isVFR, false),
          wtc: intruderType.wtc,
          type: { name: intruderType.name },
          isVFR: target.isVFR,
          heading: intruderData.heading,
          level: this.generateIntruderLevel(target.level, target.isVFR),
          speed: this.rnd(intruderType.speed.min, intruderType.speed.max),
          position: intruderData.position,
          history: []
        };
        
        intruder.history = this.generateHistory(intruder.position, intruder.heading);
        
        if (this.willPathsIntersect(target, intruder)) {
          return { intruder, clock, distance };
        }
      }
    }
    return null;
  }

  /**
   * Generate crossing right to left scenario
   */
  private generateCrossingRightToLeft(target: Ac): { intruder: Ac; clock: number; distance: number } | null {
    for (let attempt = 0; attempt < 20; attempt++) {
      const clock = this.rnd(1, 4); // Right side positions
      const distance = this.rnd(3, 8);
      const intersectionDistance = this.randBetween(2, 6);
      
      const intersection = this.getIntersectionPoint(target, intersectionDistance);
      const intruderData = this.placeIntruderAtClock(target, clock, distance, intersection);
      
      // Validate crossing angle
      const angle = this.calculateAngle(intruderData.position, intersection, target.position);
      
      if (angle >= 45 && angle <= 135) {
        const intruderType = target.isVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
        
        const intruder: Ac = {
          callsign: this.generateCallsign(target.isVFR, false),
          wtc: intruderType.wtc,
          type: { name: intruderType.name },
          isVFR: target.isVFR,
          heading: intruderData.heading,
          level: this.generateIntruderLevel(target.level, target.isVFR),
          speed: this.rnd(intruderType.speed.min, intruderType.speed.max),
          position: intruderData.position,
          history: []
        };
        
        intruder.history = this.generateHistory(intruder.position, intruder.heading);
        
        if (this.willPathsIntersect(target, intruder)) {
          return { intruder, clock, distance };
        }
      }
    }
    return null;
  }

  /**
   * Generate converging scenario
   */
  private generateConverging(target: Ac): { intruder: Ac; clock: number; distance: number } | null {
    for (let attempt = 0; attempt < 20; attempt++) {
      const clock = this.rnd(1, 12);
      const distance = this.rnd(4, 10);
      
      // Calculate converging heading (toward target)
      const relBearing = this.clockToRelativeBearing(clock);
      const absBearing = this.wrapDeg360(target.heading + relBearing);
      const direction = this.headingToVector(absBearing);
      const pixelRange = distance * StijnAviationTrafficGenerator.NM_TO_PIXELS;
      
      const intruderPos = {
        x: target.position.x + direction.x * pixelRange,
        y: target.position.y + direction.y * pixelRange
      };
      
      // Heading toward target position
      const convergingHeading = this.headingTowardPoint(intruderPos, target.position);
      
      // Add small variation for realistic convergence
      const headingVariation = this.rnd(-20, 20);
      const finalHeading = this.wrapDeg360(convergingHeading + headingVariation);
      
      const intruderType = target.isVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
      
      const intruder: Ac = {
        callsign: this.generateCallsign(target.isVFR, false),
        wtc: intruderType.wtc,
        type: { name: intruderType.name },
        isVFR: target.isVFR,
        heading: finalHeading,
        level: this.generateIntruderLevel(target.level, target.isVFR),
        speed: this.rnd(intruderType.speed.min, intruderType.speed.max),
        position: intruderPos,
        history: []
      };
      
      intruder.history = this.generateHistory(intruder.position, intruder.heading);
      
      // Validate converging angle
      const headingDiff = Math.abs(target.heading - intruder.heading);
      const normalizedDiff = Math.min(headingDiff, 360 - headingDiff);
      
      if (normalizedDiff < 45 && this.willPathsIntersect(target, intruder)) {
        return { intruder, clock, distance };
      }
    }
    return null;
  }

  /**
   * Generate opposite direction scenario
   */
  private generateOppositeDirection(target: Ac): { intruder: Ac; clock: number; distance: number } | null {
    for (let attempt = 0; attempt < 20; attempt++) {
      const clock = this.rnd(11, 1); // Front positions (11, 12, 1)
      const adjustedClock = clock > 6 ? clock : clock + 12; // Handle wraparound
      const distance = this.rnd(5, 12);
      
      const relBearing = this.clockToRelativeBearing(clock);
      const absBearing = this.wrapDeg360(target.heading + relBearing);
      const direction = this.headingToVector(absBearing);
      const pixelRange = distance * StijnAviationTrafficGenerator.NM_TO_PIXELS;
      
      const intruderPos = {
        x: target.position.x + direction.x * pixelRange,
        y: target.position.y + direction.y * pixelRange
      };
      
      // Opposite heading with variation
      const oppositeHeading = this.wrapDeg360(target.heading + 180 + this.rnd(-30, 30));
      
      const intruderType = target.isVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
      
      const intruder: Ac = {
        callsign: this.generateCallsign(target.isVFR, false),
        wtc: intruderType.wtc,
        type: { name: intruderType.name },
        isVFR: target.isVFR,
        heading: oppositeHeading,
        level: this.generateIntruderLevel(target.level, target.isVFR),
        speed: this.rnd(intruderType.speed.min, intruderType.speed.max),
        position: intruderPos,
        history: []
      };
      
      intruder.history = this.generateHistory(intruder.position, intruder.heading);
      
      // Validate opposite direction angle
      const headingDiff = Math.abs(target.heading - intruder.heading);
      const normalizedDiff = Math.min(headingDiff, 360 - headingDiff);
      
      if (normalizedDiff > 135 && this.willPathsIntersect(target, intruder)) {
        return { intruder, clock, distance };
      }
    }
    return null;
  }

  /**
   * Generate overtaking scenario
   */
  private generateOvertaking(target: Ac): { intruder: Ac; clock: number; distance: number } | null {
    for (let attempt = 0; attempt < 20; attempt++) {
      const clock = this.rnd(4, 8); // Behind positions
      const distance = this.rnd(3, 7);
      
      const relBearing = this.clockToRelativeBearing(clock);
      const absBearing = this.wrapDeg360(target.heading + relBearing);
      const direction = this.headingToVector(absBearing);
      const pixelRange = distance * StijnAviationTrafficGenerator.NM_TO_PIXELS;
      
      const intruderPos = {
        x: target.position.x + direction.x * pixelRange,
        y: target.position.y + direction.y * pixelRange
      };
      
      // Similar heading with slight variation
      const overtakingHeading = this.wrapDeg360(target.heading + this.rnd(-15, 15));
      
      const intruderType = target.isVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
      const baseSpeed = this.rnd(intruderType.speed.min, intruderType.speed.max);
      const overtakingSpeed = Math.max(baseSpeed, target.speed + this.rnd(20, 60));
      
      const intruder: Ac = {
        callsign: this.generateCallsign(target.isVFR, false),
        wtc: intruderType.wtc,
        type: { name: intruderType.name },
        isVFR: target.isVFR,
        heading: overtakingHeading,
        level: this.generateIntruderLevel(target.level, target.isVFR),
        speed: overtakingSpeed,
        position: intruderPos,
        history: []
      };
      
      intruder.history = this.generateHistory(intruder.position, intruder.heading);
      
      // Validate overtaking conditions
      const headingDiff = Math.abs(target.heading - intruder.heading);
      const normalizedDiff = Math.min(headingDiff, 360 - headingDiff);
      
      if (normalizedDiff < 45 && intruder.speed > target.speed && this.willPathsIntersect(target, intruder)) {
        return { intruder, clock, distance };
      }
    }
    return null;
  }

  // =============================================================================
  // TRAFFIC PATTERN CLASSIFICATION
  // =============================================================================

  private classifyTrafficPattern(target: Ac, intruder: Ac): string {
    const headingDiff = Math.abs(target.heading - intruder.heading);
    const normalizedDiff = Math.min(headingDiff, 360 - headingDiff);
    
    // Overtaking: same direction + faster intruder
    if (normalizedDiff <= 45 && intruder.speed > target.speed) {
      return 'overtaking';
    }
    
    // Converging: small angle difference
    if (normalizedDiff < 45) {
      return 'converging';
    }
    
    // Opposite direction: large angle difference
    if (normalizedDiff > 135) {
      return 'opposite direction';
    }
    
    // Crossing: determine left-to-right vs right-to-left
    const targetVector = this.headingToVector(target.heading);
    const intruderVector = this.headingToVector(intruder.heading);
    
    // Cross product to determine relative direction
    const crossProduct = targetVector.x * intruderVector.y - targetVector.y * intruderVector.x;
    
    return crossProduct > 0 ? 'crossing left to right' : 'crossing right to left';
  }

  // =============================================================================
  // MAIN GENERATION FUNCTION
  // =============================================================================

  public generateExercise(): Exercise {
    // Generate target aircraft
    const targetVFR = Math.random() < 0.75;
    const targetType = targetVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
    
    const target: Ac = {
      callsign: this.generateCallsign(targetVFR, false),
      wtc: targetType.wtc,
      type: { name: targetType.name },
      isVFR: targetVFR,
      heading: this.rnd(1, 360),
      level: this.generateLevel(targetVFR),
      speed: this.rnd(targetType.speed.min, targetType.speed.max),
      position: { x: StijnAviationTrafficGenerator.RADAR_CENTER, y: StijnAviationTrafficGenerator.RADAR_CENTER },
      history: []
    };
    
    target.history = this.generateHistory(target.position, target.heading);
    
    // Define scenario generation functions with weights
    const scenarioGenerators = [
      { func: () => this.generateCrossingLeftToRight(target), weight: 25, name: 'crossing left to right' },
      { func: () => this.generateCrossingRightToLeft(target), weight: 25, name: 'crossing right to left' },
      { func: () => this.generateConverging(target), weight: 20, name: 'converging' },
      { func: () => this.generateOppositeDirection(target), weight: 20, name: 'opposite direction' },
      { func: () => this.generateOvertaking(target), weight: 10, name: 'overtaking' }
    ];
    
    // Shuffle scenarios for variety
    const shuffled = [...scenarioGenerators].sort(() => Math.random() - 0.5);
    
    // Try to generate a valid scenario
    for (const scenario of shuffled) {
      for (let attempts = 0; attempts < 5; attempts++) {
        const result = scenario.func();
        if (result) {
          const direction = this.classifyTrafficPattern(target, result.intruder);
          const levelDiff = result.intruder.level - target.level;
          const roundedDiff = Math.round(Math.abs(levelDiff) / 100) * 100;
          const levelText = roundedDiff <= 200 ? 'same level' : 
                           `${roundedDiff} feet ${levelDiff > 0 ? 'above' : 'below'}`;
          const heavy = result.intruder.wtc === 'H' ? ', heavy' : '';
          
          return {
            target,
            intruder: result.intruder,
            solution: `${target.callsign}, traffic, ${result.clock} o'clock, ${result.distance} miles, ${direction}, ${levelText}, ${result.intruder.type.name}${heavy}`,
            situation: {
              clock: result.clock,
              distance: result.distance,
              direction,
              levelDiff,
              type: result.intruder.type.name
            }
          };
        }
      }
    }
    
    // Fallback: create a simple opposite direction scenario
    const intruderType = targetVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
    const intruder: Ac = {
      callsign: this.generateCallsign(targetVFR, false),
      wtc: intruderType.wtc,
      type: { name: intruderType.name },
      isVFR: targetVFR,
      heading: this.wrapDeg360(target.heading + 180),
      level: this.generateIntruderLevel(target.level, targetVFR),
      speed: this.rnd(intruderType.speed.min, intruderType.speed.max),
      position: { 
        x: StijnAviationTrafficGenerator.RADAR_CENTER, 
        y: StijnAviationTrafficGenerator.RADAR_CENTER - 6 * StijnAviationTrafficGenerator.NM_TO_PIXELS 
      },
      history: []
    };
    
    intruder.history = this.generateHistory(intruder.position, intruder.heading);
    
    const direction = this.classifyTrafficPattern(target, intruder);
    const levelDiff = intruder.level - target.level;
    const roundedDiff = Math.round(Math.abs(levelDiff) / 100) * 100;
    const levelText = roundedDiff <= 200 ? 'same level' : 
                     `${roundedDiff} feet ${levelDiff > 0 ? 'above' : 'below'}`;
    
    return {
      target,
      intruder,
      solution: `${target.callsign}, traffic, 12 o'clock, 6 miles, ${direction}, ${levelText}, ${intruder.type.name}`,
      situation: {
        clock: 12,
        distance: 6,
        direction,
        levelDiff,
        type: intruder.type.name
      }
    };
  }
}

// =============================================================================
// EXPORT CONVENIENCE FUNCTION
// =============================================================================

export function generateExercise(): Exercise {
  return new StijnAviationTrafficGenerator().generateExercise();
}