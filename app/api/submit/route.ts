import { NextResponse } from "next/server";
import wordsData from "../../../data/words.json";

type Word = { id: number; text: string; score: number };

export async function POST(req: Request) {
  const { ids, marker } = await req.json() as {
    ids: number[];
    marker: "green" | "red" | null;
  };

  // filter only the selected words
  const selected: Word[] = wordsData.filter((w) => ids.includes(w.id));

  // simple example scoring logic:
  //  - green: sum of scores
  //  - red: negative sum (penalty)
  const raw = selected.reduce((sum, w) => sum + w.score, 0);
  const score = marker === "red" ? -raw : raw;

  console.log("Scoring run:", { marker, ids, score });

  return NextResponse.json({ score });
}
