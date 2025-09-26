/**
 * Aircraft type definitions and constants for the aviation traffic generator.
 * This module contains aircraft specifications used for generating realistic traffic scenarios.
 */

/**
 * Aircraft type interface defining the structure for all aircraft types.
 */
export interface AcType {
  name: string;
  wtc: "L" | "M" | "H"; // Wake Turbulence Category: Light, Medium, Heavy
  speed: { min: number; max: number }; // Speed range in knots
  altitude: { min: number; max: number }; // Altitude range in feet
}

/**
 * VFR (Visual Flight Rules) aircraft types.
 * These are typically smaller general aviation aircraft operating under visual flight rules.
 */
export const VFR_TYPES: AcType[] = [
  {
    name: "Cessna 172",
    wtc: "L",
    speed: { min: 95, max: 125 },
    altitude: { min: 1500, max: 4500 },
  },
  {
    name: "Piper PA-28",
    wtc: "L", 
    speed: { min: 90, max: 120 },
    altitude: { min: 1500, max: 4500 },
  },
  {
    name: "Robinson R44",
    wtc: "L",
    speed: { min: 85, max: 105 },
    altitude: { min: 1000, max: 2500 },
  },
  {
    name: "Cessna 152",
    wtc: "L",
    speed: { min: 80, max: 100 },
    altitude: { min: 1200, max: 3500 },
  },
  {
    name: "Diamond DA40",
    wtc: "L",
    speed: { min: 115, max: 145 },
    altitude: { min: 1500, max: 5500 },
  },
];

/**
 * IFR (Instrument Flight Rules) aircraft types.
 * These are typically commercial aircraft operating under instrument flight rules.
 */
export const IFR_TYPES: AcType[] = [
  {
    name: "Boeing 737",
    wtc: "M",
    speed: { min: 250, max: 290 },
    altitude: { min: 5000, max: 41000 },
  },
  {
    name: "Airbus A320",
    wtc: "M",
    speed: { min: 250, max: 290 },
    altitude: { min: 5000, max: 39000 },
  },
  {
    name: "Boeing 777",
    wtc: "H",
    speed: { min: 250, max: 300 },
    altitude: { min: 10000, max: 43000 },
  },
  {
    name: "Embraer 190",
    wtc: "M",
    speed: { min: 230, max: 270 },
    altitude: { min: 5000, max: 41000 },
  },
  {
    name: "Bombardier CRJ900",
    wtc: "M",
    speed: { min: 220, max: 260 },
    altitude: { min: 5000, max: 41000 },
  },
  {
    name: "ATR 72",
    wtc: "M",
    speed: { min: 180, max: 220 },
    altitude: { min: 5000, max: 25000 },
  },
];

/**
 * Military aircraft types.
 * These represent various military aircraft with extended operational envelopes.
 */
export const MIL_TYPES: AcType[] = [
  {
    name: "F-16",
    wtc: "L",
    speed: { min: 200, max: 400 },
    altitude: { min: 1000, max: 50000 },
  },
  {
    name: "C-130",
    wtc: "M",
    speed: { min: 150, max: 250 },
    altitude: { min: 1000, max: 30000 },
  },
  {
    name: "UH-60",
    wtc: "L",
    speed: { min: 80, max: 150 },
    altitude: { min: 500, max: 8000 },
  },
  {
    name: "F/A-18",
    wtc: "M",
    speed: { min: 200, max: 500 },
    altitude: { min: 1000, max: 50000 },
  },
  {
    name: "KC-135",
    wtc: "H",
    speed: { min: 200, max: 300 },
    altitude: { min: 5000, max: 41000 },
  },
];

/**
 * Direction weights for aviation traffic scenarios
 * Based on context.txt requirements for realistic ATC training
 */
export interface DirectionWeight {
  direction: string;
  weight: number;
}

export const DIRECTION_WEIGHTS: DirectionWeight[] = [
  { direction: 'crossing left to right', weight: 28 },
  { direction: 'crossing right to left', weight: 28 },
  { direction: 'converging', weight: 28 },
  { direction: 'opposite direction', weight: 11 },
  { direction: 'overtaking', weight: 5 }
];

/**
 * Military callsigns for VFR intruder aircraft
 * Used when target is VFR and intruder is military (10% chance)
 */
export const MILITARY_CALLSIGNS: string[] = [
  "REDARROW", "ANGE", "LHOB", "MILAN", "REF", "BENGA", "VOLPE", "FIAMM", 
  "HKY", "RRR", "HR", "VVAJ", "BAF", "RCH", "CFC", "SPARTA", "BRK", "ROF", 
  "OR", "COBRA", "SRA", "RNGR", "BOMR", "WOLF", "TRITN", "RESQ"
];

/**
 * VFR callsign patterns by country
 * Used for generating realistic VFR aircraft callsigns
 */
export interface VfrCallsignPattern {
  country: string;
  countryCode: string;
  presentation: string;
}

export const VFR_CALLSIGN_PATTERNS: VfrCallsignPattern[] = [
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

/**
 * Airline data for IFR callsign generation
 * Contains ICAO codes and radio callsigns for commercial airlines
 */
export interface AirlineData {
  icao: string;
  callsign: string;
}

export const AIRLINES: AirlineData[] = [
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
