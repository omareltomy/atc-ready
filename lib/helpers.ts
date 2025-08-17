import { AcType, REG_PREFIXES, AIRLINE_CODES, TRAINING_CALLS, MIL_CALLS } from './constants';

export const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const pick = <T>(arr: T[]): T => arr[rnd(0, arr.length-1)];

export const rndHeading = (): number => rnd(0, 359);

export function genCallVFR(): string {
  if (Math.random() < 0.3) {
    return pick(TRAINING_CALLS) + rnd(1,99);
  }
  const pre = pick(REG_PREFIXES);
  if (pre === 'N') {
    return 'N' + rnd(1,9) +
      Array.from({length:2},()=>String.fromCharCode(65+rnd(0,25))).join('');
  } else {
    const suffix = Math.random()<0.7
      ? Array.from({length:rnd(2,3)},()=>String.fromCharCode(65+rnd(0,25))).join('')
      : rnd(100,999).toString();
    return pre + suffix;
  }
}

export function genCallIFR(): string {
  return pick(AIRLINE_CODES) + rnd(1,9999);
}

export function genCallMil(): string {
  return pick(MIL_CALLS) + rnd(1,99);
}

export const genSpeed = (t: AcType) => rnd(t.speed.min, t.speed.max);

export function genLevelVFR(t: AcType): number {
  // VFR follows hemispheric rules: odd thousands + 500 for eastbound (090-269)
  // even thousands + 500 for westbound (270-089)
  const minLevel = Math.ceil(t.altitude.min / 1000) * 1000;
  const maxLevel = Math.floor(t.altitude.max / 1000) * 1000;
  const levels: number[] = [];
  
  for (let level = minLevel; level <= maxLevel; level += 1000) {
    levels.push(level + 500); // VFR uses +500 feet
  }
  
  return levels.length > 0 ? pick(levels) : t.altitude.min + 500;
}

export function genLevelIFR(t: AcType): number {
  // IFR follows hemispheric rules below FL180 and uses flight levels above
  const minFeet = t.altitude.min;
  const maxFeet = t.altitude.max;
  
  if (maxFeet <= 18000) {
    // Below FL180: use thousands (odd eastbound 090-269, even westbound 270-089)
    const minLevel = Math.ceil(minFeet / 1000) * 1000;
    const maxLevel = Math.floor(maxFeet / 1000) * 1000;
    const levels: number[] = [];
    
    for (let level = minLevel; level <= maxLevel; level += 1000) {
      levels.push(level);
    }
    
    return levels.length > 0 ? pick(levels) : minLevel;
  } else {
    // Above FL180: use flight levels (hundreds)
    const minFL = Math.max(180, Math.ceil(minFeet / 100)) * 100;
    const maxFL = Math.floor(maxFeet / 100) * 100;
    return rnd(minFL / 100, maxFL / 100) * 100;
  }
}

export function genHistory(
  pos: {x:number,y:number},
  hd: number,
  steps = 3
): {x:number,y:number}[] {
  const opp = (hd + 180) % 360;
  const rad = opp * Math.PI/180;
  const stepNm = 0.5;
  return Array.from({length:steps},(_,i)=>({
    x: pos.x + Math.sin(rad)*stepNm*(i+1),
    y: pos.y + Math.cos(rad)*stepNm*(i+1)
  }));
}
