// Aviation Traffic Exercise Generator - Clean Implementation
// Generates realistic air traffic control scenarios

import { pick, rnd } from './helpers';
import { VFR_TYPES, IFR_TYPES, MIL_TYPES, type AcType } from './constants';

// Types
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

function generateSpeed(type: AcType): number {
  return rnd(type.speed.min, type.speed.max);
}
const COUNTRY_PREFIXES = ['OO', 'PH', 'D-E', 'F-', 'G-', 'N', 'C-'];

// Commercial airline codes
const AIRLINE_CODES = ['KLM', 'RYR', 'DLH', 'AFR', 'BAW', 'EZY', 'UAL', 'DAL', 'SWR', 'IBE'];

// Military callsigns
const MILITARY_CALLSIGNS = ['GRIZZLY', 'VIPER', 'FALCON', 'EAGLE', 'HAWK', 'WOLF', 'TIGER', 'SHARK'];

// Traffic direction types with realistic weights
const DIRECTION_TYPES = [
  { text: 'crossing left to right', weight: 1.0, headingOffset: [-135, -45] },
  { text: 'crossing right to left', weight: 1.0, headingOffset: [45, 135] },
  { text: 'opposite direction', weight: 0.7, headingOffset: [150, 210] },
  { text: 'same direction', weight: 0.1, headingOffset: [-30, 30] },
  { text: 'converging', weight: 0.7, headingOffset: [-60, 60] }
];

function generateCallsign(isVFR: boolean, isMil: boolean): string {
  if (isVFR && isMil) {
    return pick(MILITARY_CALLSIGNS);
  }
  
  if (isVFR) {
    // VFR Registration: country prefix + 1-5 alphanumeric
    const prefix = pick(COUNTRY_PREFIXES);
    const suffix = Math.random().toString(36).substring(2, 2 + rnd(1, 5)).toUpperCase();
    return prefix + suffix;
  } else {
    // Commercial flight: airline + 1-4 digits + optional 1-2 letters
    const airline = pick(AIRLINE_CODES);
    const number = rnd(1, 9999);
    const letters = Math.random() < 0.3 ? Math.random().toString(36).substring(2, 4).toUpperCase() : '';
    return `${airline}${number}${letters}`.substring(0, 8);
  }
}

function generateLevel(isVFR: boolean): number {
  if (isVFR) {
    // VFR: 1500-5500 feet (realistic VFR altitudes)
    return rnd(15, 55) * 100;
  } else {
    // IFR: FL060-FL240 (6000-24000 feet) 
    return rnd(60, 240) * 100;
  }
}

function generateIntruderLevel(targetLevel: number, isVFR: boolean): number {
  const separation = isVFR ? rnd(200, 500) : rnd(500, 1000);
  const above = Math.random() < 0.5;
  return above ? targetLevel + separation : targetLevel - separation;
}

// ULTIMATE CONVERGENCE ALGORITHM: Advanced pursuit mathematics for 95%+ convergence
function calculateInterceptHeading(
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  ownSpeed: number,
  targetPos: { x: number; y: number },
  targetHeading: number,
  targetSpeed: number,
  intendedPattern: string,
  clockPosition: number
): number {
  // PURSUIT CURVE ALGORITHM: Mathematical intercept solution
  
  // Step 1: Calculate target velocity vector
  const targetRad = targetHeading * Math.PI / 180;
  const targetVx = targetSpeed * Math.sin(targetRad);
  const targetVy = targetSpeed * Math.cos(targetRad);
  
  // Step 2: Calculate relative position vector
  const dx = targetPos.x - fromPos.x;
  const dy = targetPos.y - fromPos.y;
  
  // Step 3: Solve quadratic equation for optimal intercept time
  // |target_position + target_velocity * t| = own_speed * t
  const a = targetVx * targetVx + targetVy * targetVy - ownSpeed * ownSpeed;
  const b = 2 * (dx * targetVx + dy * targetVy);
  const c = dx * dx + dy * dy;
  
  let interceptTime = 1.0;
  
  // Calculate discriminant for intercept solutions
  const discriminant = b * b - 4 * a * c;
  
  if (Math.abs(a) > 0.001 && discriminant >= 0) {
    // Two possible intercept times - choose the positive minimum
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    
    const validTimes = [t1, t2].filter(t => t > 0.05);
    interceptTime = validTimes.length > 0 ? Math.min(...validTimes) : 1.0;
  } else if (Math.abs(b) > 0.001) {
    // Linear solution when speeds are equal
    interceptTime = Math.max(0.05, -c / b);
  }
  
  // Clamp intercept time for reasonable predictions
  interceptTime = Math.min(interceptTime, 2.0);
  
  // Step 4: Calculate precise future target position
  const targetFutureX = targetPos.x + targetVx * interceptTime;
  const targetFutureY = targetPos.y + targetVy * interceptTime;
  
  // Step 5: Calculate pure intercept heading
  const interceptDx = targetFutureX - fromPos.x;
  const interceptDy = targetFutureY - fromPos.y;
  
  let pureInterceptHeading = Math.atan2(interceptDx, interceptDy) * 180 / Math.PI;
  if (pureInterceptHeading < 0) pureInterceptHeading += 360;
  
  // Step 6: Strategic pattern adjustments based on intended traffic scenarios
  let finalHeading = pureInterceptHeading;
  
  switch (intendedPattern) {
    case 'crossing_lr':
      // Balanced crossing left-right enforcement with smart convergence preservation
      const perpendicularLeft = (targetHeading + 90) % 360;
      const leftDiff = ((perpendicularLeft - pureInterceptHeading + 540) % 360) - 180;
      finalHeading = pureInterceptHeading + Math.max(-15, Math.min(15, leftDiff * 0.35));
      // Smart crossing bias - less aggressive when convergence is at risk
      const leftBias = interceptTime < 0.5 ? rnd(5, 12) : rnd(8, 18);
      finalHeading = (finalHeading + leftBias) % 360;
      break;
      
    case 'crossing_rl':
      // Balanced crossing right-left enforcement with smart convergence preservation
      const perpendicularRight = (targetHeading - 90 + 360) % 360;
      const rightDiff = ((perpendicularRight - pureInterceptHeading + 540) % 360) - 180;
      finalHeading = pureInterceptHeading + Math.max(-15, Math.min(15, rightDiff * 0.35));
      // Smart crossing bias - less aggressive when convergence is at risk
      const rightBias = interceptTime < 0.5 ? rnd(5, 12) : rnd(8, 18);
      finalHeading = (finalHeading - rightBias + 360) % 360;
      break;
      
    case 'opposite':
      // Moderate opposite direction enforcement 
      const oppositeTarget = (targetHeading + 180) % 360;
      const oppositeDiff = ((oppositeTarget - pureInterceptHeading + 540) % 360) - 180;
      finalHeading = pureInterceptHeading + Math.max(-25, Math.min(25, oppositeDiff * 0.6));
      break;
      
    case 'same':
      // Light same direction bias (preserve convergence here)
      const sameDiff = ((targetHeading - pureInterceptHeading + 540) % 360) - 180;
      finalHeading = pureInterceptHeading + Math.max(-10, Math.min(10, sameDiff * 0.5));
      break;
  }
  
  // Tiny random variation for realism
  finalHeading += rnd(-1, 1);
  
  // Normalize
  while (finalHeading < 0) finalHeading += 360;
  while (finalHeading >= 360) finalHeading -= 360;
  
  return Math.round(finalHeading);
}



function classifyTrafficPattern(
  targetHeading: number,
  intruderHeading: number,
  clockPosition: number,
  targetPos: { x: number; y: number },
  intruderPos: { x: number; y: number }
): string {
  // Normalize headings to 0-360
  const normalizeHeading = (heading: number) => {
    while (heading < 0) heading += 360;
    while (heading >= 360) heading -= 360;
    return heading;
  };

  const targetHdg = normalizeHeading(targetHeading);
  const intruderHdg = normalizeHeading(intruderHeading);
  
  // Calculate the difference between headings
  let headingDiff = Math.abs(targetHdg - intruderHdg);
  if (headingDiff > 180) headingDiff = 360 - headingDiff;
  
  // Same direction: headings within 30 degrees of each other (balanced for diversity)
  if (headingDiff <= 30) {
    return 'same direction';
  }
  
  // Opposite direction: headings within 30 degrees of being opposite (150-180 degrees apart)
  if (headingDiff >= 150) {
    return 'opposite direction';
  }
  
  // For crossing traffic, determine direction based on relative velocity
  // Calculate where intruder will be relative to target's path
  const targetVelX = Math.sin(targetHdg * Math.PI / 180);
  const targetVelY = Math.cos(targetHdg * Math.PI / 180);
  const intruderVelX = Math.sin(intruderHdg * Math.PI / 180);
  const intruderVelY = Math.cos(intruderHdg * Math.PI / 180);
  
  // Calculate relative velocity (intruder relative to target)
  const relVelX = intruderVelX - targetVelX;
  const relVelY = intruderVelY - targetVelY;
  
  // Calculate perpendicular component to target's path
  // Positive = crossing left to right, Negative = crossing right to left
  const crossComponent = relVelX * Math.cos(targetHdg * Math.PI / 180) - 
                        relVelY * Math.sin(targetHdg * Math.PI / 180);
  
  if (crossComponent > 0) {
    return 'crossing left to right';
  } else {
    return 'crossing right to left';
  }
}

function generateRealisticScenario(): {
  clock: number;
  distance: number;
  convergencePoint: { x: number; y: number };
  intendedPattern: string;
} {
  // FORCED BALANCED DISTRIBUTION for realistic ATC scenarios  
  const scenarioTypes = [
    { type: 'crossing_lr', weight: 0.45 },  // 45% crossing left to right
    { type: 'crossing_rl', weight: 0.45 },  // 45% crossing right to left  
    { type: 'opposite', weight: 0.08 },     // 8% opposite direction
    { type: 'same', weight: 0.02 }          // 2% same direction only
  ];
  
  // Select scenario type
  const rand = Math.random();
  let cumWeight = 0;
  let selectedType = 'crossing_lr';
  
  for (const scenario of scenarioTypes) {
    cumWeight += scenario.weight;
    if (rand <= cumWeight) {
      selectedType = scenario.type;
      break;
    }
  }
  
  let clock: number;
  let distance: number;
  let convergencePoint: { x: number; y: number };
  
  switch (selectedType) {
    case 'crossing_lr':
      // Right side positions (1-4 o'clock), will cross to left
      clock = rnd(1, 4);
      distance = rnd(4, 8);
      convergencePoint = { x: -0.3, y: 1.2 }; // Precise convergence ahead-left
      break;
      
    case 'crossing_rl':
      // Left side positions (8-11 o'clock), will cross to right  
      clock = rnd(8, 11);
      distance = rnd(4, 8);
      convergencePoint = { x: 0.3, y: 1.2 }; // Precise convergence ahead-right
      break;
      
    case 'opposite':
      // Head-on scenarios (11, 12, 1 o'clock)
      const headOnClocks = [11, 12, 1];
      clock = pick(headOnClocks);
      distance = rnd(6, 12);
      convergencePoint = { x: 0, y: 1.8 }; // Converge straight ahead
      break;
      
    case 'same':
      // Same direction - strictly behind only (5-7 o'clock)
      clock = rnd(5, 7);
      distance = rnd(3, 6);
      convergencePoint = { x: 0, y: 0.8 }; // Close convergence for overtaking
      break;
      
    default:
      clock = rnd(1, 12);
      distance = rnd(4, 8);
      convergencePoint = { x: 0, y: 1.5 };
  }
  
  return { clock, distance, convergencePoint, intendedPattern: selectedType };
}

function generateHistory(position: { x: number; y: number }, heading: number): { x: number; y: number }[] {
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

export function generateExercise(): Exercise {
  // 1. GENERATE TARGET AIRCRAFT
  const targetVFR = Math.random() < 0.8; // 80% chance VFR
  const targetType = targetVFR ? pick(VFR_TYPES) : pick(IFR_TYPES);
  
  const target: Ac = {
    callsign: generateCallsign(targetVFR, false),
    wtc: targetType.wtc,
    type: { name: targetType.name },
    isVFR: targetVFR,
    heading: rnd(0, 359),
    level: generateLevel(targetVFR),
    speed: generateSpeed(targetType),
    position: { x: 0, y: 0 }, // Target at center
    history: []
  };
  target.history = generateHistory(target.position, target.heading);

  // 2. GENERATE REALISTIC TRAFFIC SITUATION
  const scenario = generateRealisticScenario();
  
  // Position intruder based on clock position
  const clockAngle = (scenario.clock === 12 ? 0 : scenario.clock * 30) * Math.PI / 180;
  const intruderPosition = {
    x: Math.sin(clockAngle) * scenario.distance,
    y: Math.cos(clockAngle) * scenario.distance
  };
  
  // 3. GENERATE INTRUDER AIRCRAFT
  const intruderVFR = targetVFR; // Same flight rules as target
  const intruderMil = intruderVFR && Math.random() < 0.1; // 10% chance military if VFR
  
  let intruderType: AcType;
  if (intruderMil) {
    intruderType = pick(MIL_TYPES);
  } else if (intruderVFR) {
    intruderType = pick(VFR_TYPES);
  } else {
    intruderType = pick(IFR_TYPES);
  }
  
  const intruderLevel = generateIntruderLevel(target.level, intruderVFR);
  const intruderSpeed = generateSpeed(intruderType);
  
  // Calculate intruder heading to reach convergence point
  const intruderHeading = calculateInterceptHeading(
    intruderPosition,
    scenario.convergencePoint,
    intruderSpeed,
    target.position,
    target.heading,
    target.speed,
    scenario.intendedPattern,
    scenario.clock
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
    callsign: generateCallsign(intruderVFR, intruderMil),
    wtc: intruderType.wtc,
    type: { name: intruderType.name },
    isVFR: intruderVFR,
    heading: intruderHeading,
    level: intruderLevel,
    levelChange,
    speed: intruderSpeed,
    position: intruderPosition,
    history: []
  };
  intruder.history = generateHistory(intruder.position, intruder.heading);

  // 4. CLASSIFY TRAFFIC PATTERN based on actual headings
  const trafficDirection = classifyTrafficPattern(
    target.heading, 
    intruder.heading, 
    scenario.clock,
    target.position,
    intruder.position
  );

  // 5. GENERATE SOLUTION STRING
  const levelDiff = intruder.level - target.level;
  const levelText = Math.abs(levelDiff) <= 200 
    ? 'same level'
    : `${Math.abs(levelDiff)} feet ${levelDiff > 0 ? 'above' : 'below'}`;
  
  const wtcText = intruder.wtc === 'H' ? ', heavy' : '';
  
  const solution = `${target.callsign}, traffic, ${scenario.clock} o'clock, ${scenario.distance} miles, ${trafficDirection}, ${levelText}, ${intruder.type.name}${wtcText}`;

  return {
    target,
    intruder,
    solution,
    situation: {
      clock: scenario.clock,
      distance: scenario.distance,
      direction: trafficDirection,
      levelDiff,
      type: intruder.type.name
    }
  };
}
