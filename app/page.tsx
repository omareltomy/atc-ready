"use client";

import { useState } from "react";
import { generateExercise, Exercise } from "../lib/generator";
import TrafficInfo from "../components/TrafficInfo";

export default function HomePage() {
  const [ex, setEx] = useState<Exercise>(() => generateExercise());
  const [show, setShow] = useState(false);

  function next() {
    setEx(generateExercise());
    setShow(false);
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
        <div style={{ fontWeight: 600, margin: "1rem 0" }}>{ex.solution}</div>
      )}

      <button onClick={() => setShow(true)} style={btn.primary}>
        Show Answer
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
