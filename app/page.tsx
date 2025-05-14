"use client";

import { useState, useEffect } from "react";
import wordsData from "../data/words.json";

type Word = { id: number; text: string; score: number };

export default function Home() {
  const GRID_SIZE = 3; // ← change to whatever N you need
  const gridWords = wordsData.slice(0, GRID_SIZE * GRID_SIZE);

  // Which marker is active
  const [activeMarker, setActiveMarker] = useState<"green" | "red" | null>(null);
  // Are we currently dragging?
  const [isDrawing, setIsDrawing] = useState(false);
  // Map of word-ID → "green" | "red"
  const [selected, setSelected] = useState<Record<number, "green" | "red">>({});
  const [score, setScore] = useState<number | null>(null);

  // Stop drawing on mouseup anywhere
  useEffect(() => {
    const stop = () => setIsDrawing(false);
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  function markCell(id: number) {
    if (!activeMarker) return;
    setSelected((s) => ({ ...s, [id]: activeMarker }));
  }

  async function handleSubmit() {
    const ids = Object.keys(selected).map(Number);
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, marker: activeMarker }),
    });
    const { score: newScore } = await res.json();
    // clear & show
    setSelected({});
    setActiveMarker(null);
    setScore(newScore);
  }

  return (
    <div className="p-8 space-y-4">
      {/* Marker buttons */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded ${
            activeMarker === "green" ? "bg-green-600 text-white" : "border"
          }`}
          onClick={() =>
            setActiveMarker((m) => (m === "green" ? null : "green"))
          }
        >
          Green Marker
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeMarker === "red" ? "bg-red-600 text-white" : "border"
          }`}
          onClick={() =>
            setActiveMarker((m) => (m === "red" ? null : "red"))
          }
        >
          Red Marker
        </button>
      </div>

      {/* The responsive, scrollable grid */}
      <div
        className="grid-container"
        style={{ "--grid-size": GRID_SIZE } as React.CSSProperties}
        onMouseLeave={() => setIsDrawing(false)}
      >
        {gridWords.map((w) => (
          <div
            key={w.id}
            className={`grid-cell ${
              selected[w.id] === "green"
                ? "marker-green"
                : selected[w.id] === "red"
                ? "marker-red"
                : ""
            }`}
            onMouseDown={() => {
              setIsDrawing(true);
              markCell(w.id);
            }}
            onMouseEnter={() => isDrawing && markCell(w.id)}
          >
            {w.text}
          </div>
        ))}
      </div>

      {/* Submit & score display */}
      {Object.keys(selected).length > 0 && (
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
          onClick={handleSubmit}
        >
          Submit
        </button>
      )}

      {score !== null && (
        <div className="mt-2 text-lg">
          Your score: <strong>{score}</strong>
        </div>
      )}
    </div>
  );
}
