/**
 * Aviation Traffic Exercise Generator
 * Generates realistic ATC training scenarios with proper intersection validation.
 */

import { VFR_TYPES, IFR_TYPES, MIL_TYPES, type AcType } from './constants';

export interface Ac {
  callsign: string;
  wtc: 'L'|'M'|'H';
  type: { name: string };
  isVFR: boolean;
  heading: number;
  level: number;
  levelChange?: { to: number; dir: '↑'|'↓' };
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

export class AviationTrafficGenerator {
  private static readonly PREFIXES = ['OO', 'PH', 'D-E', 'F-', 'G-', 'N', 'C-'];
  private static readonly AIRLINES = ['KLM', 'RYR', 'DLH', 'AFR', 'BAW', 'EZY', 'UAL', 'DAL'];
  private static readonly MILITARY = ['GRIZZLY', 'VIPER', 'FALCON', 'EAGLE', 'HAWK', 'WOLF'];
  
  private rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  private pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  private generateCallsign(isVFR: boolean, isMil: boolean): string {
    if (isVFR && isMil) return this.pick(AviationTrafficGenerator.MILITARY);
    if (isVFR) return this.pick(AviationTrafficGenerator.PREFIXES) + Math.random().toString(36).substring(2, 7).toUpperCase();
    return this.pick(AviationTrafficGenerator.AIRLINES) + this.rnd(1, 9999);
  }

  private generateLevel(isVFR: boolean) { return this.rnd(isVFR ? 15 : 60, isVFR ? 55 : 240) * 100; }
  private generateIntruderLevel(targetLevel: number, isVFR: boolean) {
    const sep = isVFR ? this.rnd(200, 500) : this.rnd(500, 1000);
    return Math.random() < 0.5 ? targetLevel + sep : targetLevel - sep;
  }

  private calculateHeading(targetHeading: number, pattern: string): number {
    let h = targetHeading;
    switch (pattern) {
      case 'crossing_lr': h += this.rnd(45, 135); break;
      case 'crossing_rl': h += this.rnd(225, 315); break;
      case 'opposite': h += 180 + this.rnd(-30, 30); break;
      case 'converging': h += Math.random() < 0.5 ? this.rnd(0, 45) : this.rnd(315, 360); break;
      case 'overtaking': h += this.rnd(-20, 20); break;
    }
    return ((h % 360) + 360) % 360;
  }

  private willPathsIntersect(target: Ac, intruder: Ac): boolean {
    const tVelX = target.speed * Math.sin(target.heading * Math.PI / 180);
    const tVelY = target.speed * Math.cos(target.heading * Math.PI / 180);
    const iVelX = intruder.speed * Math.sin(intruder.heading * Math.PI / 180);
    const iVelY = intruder.speed * Math.cos(intruder.heading * Math.PI / 180);
    
    const relVelX = iVelX - tVelX, relVelY = iVelY - tVelY;
    if (Math.abs(relVelX) < 0.1 && Math.abs(relVelY) < 0.1) return false;
    
    const relPosX = intruder.position.x - target.position.x;
    const relPosY = intruder.position.y - target.position.y;
    const timeToClosest = -(relPosX * relVelX + relPosY * relVelY) / (relVelX * relVelX + relVelY * relVelY);
    
    if (timeToClosest < 0 || timeToClosest > 30) return false;
    
    const tFutureX = target.position.x + tVelX * timeToClosest;
    const tFutureY = target.position.y + tVelY * timeToClosest;
    const iFutureX = intruder.position.x + iVelX * timeToClosest;
    const iFutureY = intruder.position.y + iVelY * timeToClosest;
    
    const separation = Math.sqrt((tFutureX - iFutureX) ** 2 + (tFutureY - iFutureY) ** 2);
    return separation < 3.0 && Math.abs(tFutureX) < 50 && Math.abs(tFutureY) < 50;
  }

  private classifyPattern(tHdg: number, iHdg: number, tSpd: number, iSpd: number): string {
    const diff = Math.min(Math.abs(iHdg - tHdg), 360 - Math.abs(iHdg - tHdg));
    if (diff <= 45 && iSpd > tSpd) return 'overtaking';
    if (diff < 45) return 'converging';
    if (diff > 135) return 'opposite direction';
    const angle = ((iHdg - tHdg + 360) % 360);
    return angle > 180 ? 'crossing right to left' : 'crossing left to right';
  }

  private generateHistory(pos: { x: number; y: number }, heading: number) {
    const rad = heading * Math.PI / 180;
    return Array.from({length: 3}, (_, i) => ({
      x: pos.x - Math.sin(rad) * (i + 1) * 0.5,
      y: pos.y - Math.cos(rad) * (i + 1) * 0.5
    }));
  }

  public generateExercise(): Exercise {
    for (let attempt = 0; attempt < 50; attempt++) {
      const targetVFR = Math.random() < 0.8;
      const targetType = targetVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
      
      const target: Ac = {
        callsign: this.generateCallsign(targetVFR, false),
        wtc: targetType.wtc,
        type: { name: targetType.name },
        isVFR: targetVFR,
        heading: this.rnd(0, 359),
        level: this.generateLevel(targetVFR),
        speed: this.rnd(targetType.speed.min, targetType.speed.max),
        position: { x: 0, y: 0 },
        history: []
      };
      target.history = this.generateHistory(target.position, target.heading);

      const intruderMil = targetVFR && Math.random() < 0.1;
      const intruderType = intruderMil ? this.pick(MIL_TYPES) : (targetVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES));
      
      const distance = this.rnd(4, 10);
      const clock = this.rnd(1, 12);
      const angle = ((clock === 12 ? 0 : clock * 30) + target.heading) * Math.PI / 180;
      
      const patterns = ['crossing_lr', 'crossing_rl', 'converging', 'opposite', 'overtaking'];
      const pattern = this.pick(patterns);
      
      let speed = this.rnd(intruderType.speed.min, intruderType.speed.max);
      if (pattern === 'overtaking') speed = Math.max(speed, target.speed + this.rnd(20, 50));
      
      const intruder: Ac = {
        callsign: this.generateCallsign(targetVFR, intruderMil),
        wtc: intruderType.wtc,
        type: { name: intruderType.name },
        isVFR: targetVFR,
        heading: this.calculateHeading(target.heading, pattern),
        level: this.generateIntruderLevel(target.level, targetVFR),
        speed,
        position: { x: Math.sin(angle) * distance, y: Math.cos(angle) * distance },
        history: []
      };
      intruder.history = this.generateHistory(intruder.position, intruder.heading);

      if (this.willPathsIntersect(target, intruder)) {
        const direction = this.classifyPattern(target.heading, intruder.heading, target.speed, intruder.speed);
        const levelDiff = intruder.level - target.level;
        const roundedDiff = Math.round(Math.abs(levelDiff) / 100) * 100;
        const levelText = roundedDiff <= 200 ? 'same level' : `${roundedDiff} feet ${levelDiff > 0 ? 'above' : 'below'}`;
        const heavy = intruder.wtc === 'H' ? ', heavy' : '';
        
        return {
          target, intruder,
          solution: `${target.callsign}, traffic, ${clock} o'clock, ${distance} miles, ${direction}, ${levelText}, ${intruder.type.name}${heavy}`,
          situation: { clock, distance, direction, levelDiff, type: intruder.type.name }
        };
      }
    }
    
    // Fallback simple scenario
    const targetVFR = Math.random() < 0.8;
    const targetType = targetVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
    const intruderType = targetVFR ? this.pick(VFR_TYPES) : this.pick(IFR_TYPES);
    
    const target: Ac = {
      callsign: this.generateCallsign(targetVFR, false), wtc: targetType.wtc, type: { name: targetType.name },
      isVFR: targetVFR, heading: this.rnd(0, 359), level: this.generateLevel(targetVFR),
      speed: this.rnd(targetType.speed.min, targetType.speed.max), position: { x: 0, y: 0 }, history: []
    };
    target.history = this.generateHistory(target.position, target.heading);
    
    const intruder: Ac = {
      callsign: this.generateCallsign(targetVFR, false), wtc: intruderType.wtc, type: { name: intruderType.name },
      isVFR: targetVFR, heading: (target.heading + 180) % 360, level: this.generateIntruderLevel(target.level, targetVFR),
      speed: this.rnd(intruderType.speed.min, intruderType.speed.max), position: { x: 0, y: 6 }, history: []
    };
    intruder.history = this.generateHistory(intruder.position, intruder.heading);
    
    const direction = this.classifyPattern(target.heading, intruder.heading, target.speed, intruder.speed);
    const levelDiff = intruder.level - target.level;
    const roundedDiff = Math.round(Math.abs(levelDiff) / 100) * 100;
    const levelText = roundedDiff <= 200 ? 'same level' : `${roundedDiff} feet ${levelDiff > 0 ? 'above' : 'below'}`;
    
    return {
      target, intruder,
      solution: `${target.callsign}, traffic, 12 o'clock, 6 miles, ${direction}, ${levelText}, ${intruder.type.name}`,
      situation: { clock: 12, distance: 6, direction, levelDiff, type: intruder.type.name }
    };
  }
}

export function generateExercise(): Exercise {
  return new AviationTrafficGenerator().generateExercise();
}
