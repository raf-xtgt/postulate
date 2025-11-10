"use client";

import React from "react";
import { SignificanceAnalysisModel } from "@/app/models/significanceAnalysis";
import PaperSignificanceCard from "./paperSignificanceCard";
import { useStateController } from "@/app/context/stateController";


export default function PaperSignificance() {
    const { significanceAnalyses, significanceAnalysesLoading } = useStateController();

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gray-50">
        {significanceAnalysesLoading && (
            <div className="flex flex-col justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-600">Analyzing significance and impact...</p>
            </div>
        )}

        {!significanceAnalysesLoading && significanceAnalyses.length > 0 ? (
            <div className="space-y-4">
                {significanceAnalyses?.map((analysis: SignificanceAnalysisModel, idx) => (
                    <PaperSignificanceCard
                        key={analysis.guid}
                        analysis={analysis}
                        index={idx}
                    />
                ))}
            </div>
        ) : !significanceAnalysesLoading && (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No significance analysis available yet.</p>
                <p className="text-sm">Click "Capture Impact Points" in the editor to analyze your research contribution.</p>
            </div>
        )}
      </div>
  );
}
