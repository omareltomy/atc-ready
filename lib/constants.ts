export interface AcType {
  name: string;
  wtc: "L" | "M" | "H";
  speed: { min: number; max: number };
  altitude: { min: number; max: number };
}

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

export const REG_PREFIXES = ["N", "G-", "D-", "F-", "OO-", "PH-"];
export const AIRLINE_CODES = [
  "AAL",
  "DAL",
  "UAL",
  "SWA",
  "JBU",
  "BAW",
  "DLH",
  "AFR",
  "KLM",
  "RYR",
];
export const TRAINING_CALLS = [
  "TRAINER",
  "STUDENT",
  "CESSNA",
  "PIPER",
  "DIAMOND",
];
export const MIL_CALLS = [
  "REACH",
  "CONVOY",
  "SENTRY",
  "VADER",
  "HAWK",
  "EAGLE",
];
