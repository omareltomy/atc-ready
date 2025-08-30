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
    <main style={{ padding: "1rem", textAlign: "center" }}>
      <h3>Give traffic information to {ex.target.callsign}</h3>

      {/* 1:1 container for the radar */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          aspectRatio: "1 / 1",
          margin: "0 auto",
        }}
      >
        <TrafficInfo exercise={ex} />
      </div>

      {show && (
        <div style={{ fontWeight: 600, margin: "1rem 0" }}>
          <div style={{ marginBottom: "0.5rem" }}>{ex.solution}</div>
          
          {showDetails && (
            <div style={{ 
              fontSize: "0.9rem", 
              fontWeight: 400, 
              color: "#666", 
              textAlign: "left",
              maxWidth: 420,
              margin: "0 auto",
              padding: "1rem",
              background: "#f5f5f5",
              borderRadius: 8
            }}>
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

      <button onClick={toggleAnswer} style={btn.primary}>
        {!show ? "Show Answer" : showDetails ? "Hide Details" : "Show Details"}
      </button>
      <button onClick={next} style={btn.outline}>
        Next Scenario
      </button>
    </main>
  );
}

const btn = {
  primary: {
    display: "block" as const,
    width: "90%",
    maxWidth: 420,
    margin: "0.5rem auto",
    padding: "0.9rem 1.2rem",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
  },
  outline: {
    display: "block" as const,
    width: "90%",
    maxWidth: 420,
    margin: "0.5rem auto",
    padding: "0.9rem 1.2rem",
    background: "#fff",
    color: "#000",
    border: "1px solid #000",
    borderRadius: 10,
    fontWeight: 600,
  },
};
