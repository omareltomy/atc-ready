"use client";

import Radar from "./Radar";
import { Exercise } from "@/lib/types";

export default function TrafficInfo({ exercise }: { exercise: Exercise }) {
  return <Radar exercise={exercise} />;
}
