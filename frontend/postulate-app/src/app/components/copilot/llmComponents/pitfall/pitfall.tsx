"use client";

import React from "react";
import { PitfallModel } from "@/app/models/pitfall";
import PitfallCard from "./pitfallCard";
import { useStateController } from "@/app/context/stateController";


export default function Pitfall() {
    const { pitfalls, pitfallsLoading } = useStateController();

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gray-50">
        {pitfallsLoading && (
            <div className="flex flex-col justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-600">Analyzing your draft for pitfalls...</p>
            </div>
        )}

        {!pitfallsLoading && pitfalls.length > 0 ? (
            <div className="space-y-4">
                {pitfalls?.map((cp: PitfallModel, idx) => (
                    <PitfallCard
                        key={cp.guid}
                        pitfall={cp}
                        index={idx}
                    />
                ))}
            </div>
        ) : !pitfallsLoading && (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No pitfall analysis available yet.</p>
                <p className="text-sm">Click "Save Draft" in the editor to analyze your research paper.</p>
            </div>
        )}
      </div>
  );
}
