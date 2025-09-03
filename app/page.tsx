"use client";

import { useState } from "react";
import { generateExercise, Exercise } from "../lib/generator";
import TrafficInfo from "../components/TrafficInfo";

export default function HomePage() {
  const [ex, setEx] = useState<Exercise>(() => generateExercise());
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  function next() {
    setEx(generateExercise());
    setShow(false);
    setShowDetails(false);
  }

  function toggleAnswer() {
    if (!show) {
      setShow(true);
    } else {
      setShowDetails(!showDetails);
    }
  }

  return (
    <main className="p-4 text-center">
      <h3 className="mb-4">Give traffic information to {ex.target.callsign}</h3>

      {/* 1:1 container for the radar */}
      <div className="w-full max-w-[420px] aspect-square mx-auto">
        <TrafficInfo exercise={ex} />
      </div>

      {show && (
        <div className="font-semibold my-4">
          <div className="mb-2">{ex.solution}</div>
          
          {showDetails && (
            <div className="text-sm font-normal text-gray-600 text-left max-w-[420px] mx-auto p-4 bg-gray-100 rounded-lg">
              <div><strong>Scenario Details:</strong></div>
              <div>• Target: {ex.target.callsign} ({ex.target.flightRule}) - {ex.target.type.name}</div>
              <div>• Level: {ex.target.level}ft, Speed: {ex.target.speed}kts, Heading: {ex.target.heading}°</div>
              <div>• Intruder: {ex.intruder.callsign} ({ex.intruder.flightRule}) - {ex.intruder.type.name}</div>
              <div>• Level: {ex.intruder.level}ft{ex.intruder.levelChange ? ` → ${ex.intruder.levelChange.dir}${ex.intruder.levelChange.to}ft` : ''}</div>
              <div>• Speed: {ex.intruder.speed}kts, Heading: {ex.intruder.heading}°</div>
              <div>• Direction: {ex.situation.direction}</div>
              <div>• Clock/Distance: {ex.situation.clock} o'clock, {ex.situation.distance} miles</div>
              {ex.intruder.isMil && <div>• Military aircraft (10% chance when target VFR)</div>}
            </div>
          )}
        </div>
      )}

      <button 
        onClick={toggleAnswer} 
        className="block w-[90%] max-w-[420px] mx-auto my-2 px-5 py-[0.9rem] bg-black text-white border-0 rounded-[10px] font-semibold cursor-pointer"
      >
        {!show ? "Show Answer" : showDetails ? "Hide Details" : "Show Details"}
      </button>
      <button 
        onClick={next} 
        className="block w-[90%] max-w-[420px] mx-auto my-2 px-5 py-[0.9rem] bg-white text-black border border-black rounded-[10px] font-semibold cursor-pointer"
      >
        Next Scenario
      </button>
    </main>
  );
}
