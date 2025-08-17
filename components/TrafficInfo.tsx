"use client";

import Radar from "./Radar";
import { Exercise } from "@/lib/generator";

export default function TrafficInfo({ exercise }: { exercise: Exercise }) {
  return <Radar exercise={exercise} />;
}
