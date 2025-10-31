"use client";

import React, { useState, useEffect } from "react";
import { PitfallModel } from "@/app/models/pitfall";
import PitfallCard from "./pitfallCard";


export default function Pitfall() {
    const [pitfalls, setPitfalls] = useState<PitfallModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const pitfallAnalysisList: PitfallModel[] = [
            {
              guid: "1",
              novelty_score: "8.5",
              novelty_reason: "The paper introduces a unique hybrid model for data fusion.",
              significance_meter: "7.9",
              significance_reason: "The proposed approach has potential applications in healthcare analytics.",
              methodology_alignment: "High",
              methodology_reason: "Methodology aligns well with the research objectives using robust statistical tests.",
              contradictions: "None",
              contradiction_reason: "All findings are consistent with previous studies.",
              created_date: new Date().toISOString(),
            },
            {
              guid: "2",
              novelty_score: "6.2",
              novelty_reason: "Some aspects are novel, but similar frameworks exist in related work.",
              significance_meter: "6.8",
              significance_reason: "Results show moderate real-world impact potential.",
              methodology_alignment: "Moderate",
              methodology_reason: "The experimental design lacks detailed validation metrics.",
              contradictions: "Minor",
              contradiction_reason: "A few results deviate slightly from the stated hypotheses.",
              created_date: new Date().toISOString(),
            },
            {
              guid: "3",
              novelty_score: "9.1",
              novelty_reason: "Proposes a completely new perspective on reinforcement learning interpretability.",
              significance_meter: "8.7",
              significance_reason: "High relevance for advancing explainable AI frameworks.",
              methodology_alignment: "Excellent",
              methodology_reason: "Employs both quantitative and qualitative validation methods effectively.",
              contradictions: "None",
              contradiction_reason: "No contradictions observed between methods and outcomes.",
              created_date: new Date().toISOString(),
            },
          ];
        setPitfalls(pitfallAnalysisList)
      }, []);

  return (
    <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {loading && (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )}
        {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center">
                <span>Error: {error}</span>
            </div>
        )}

        {pitfalls.length > 0 ? (
            <div className="space-y-4">
                {pitfalls?.map((cp, idx) => (
                    <PitfallCard
                        key={`cp-${idx}`}
                        pitfall={cp}
                        index={idx}
                    />
                ))}
            </div>
        ) : !loading && (
            <div className="text-center py-8 text-gray-500">
                <p>No pitfalls analysis available yet.</p>
            </div>
        )}
      </div>
  );
}
