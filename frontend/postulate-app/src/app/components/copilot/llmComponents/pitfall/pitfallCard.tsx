"use client";

import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaStar, FaChartBar, FaProjectDiagram, FaExclamationTriangle } from "react-icons/fa";
import { PitfallModel } from "@/app/models/pitfall";

interface Props {
  pitfall: PitfallModel;
  index: number;
}

export default function PitfallCard({ pitfall }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Helper function to determine score color
  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 8) return 'text-green-600';
    if (numScore >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Helper function to determine alignment color
  const getAlignmentColor = (alignment: string) => {
    if (alignment.toLowerCase() === 'high' || alignment.toLowerCase() === 'excellent') return 'text-green-600';
    if (alignment.toLowerCase() === 'moderate') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <button
        aria-expanded={expanded}
        onClick={() => setExpanded((s) => !s)}
        className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FaExclamationTriangle className="text-indigo-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">Analysis #{pitfall.guid}</h3>
            <p className="text-sm text-gray-600">Created: {new Date(pitfall.created_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center">
          {expanded ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="p-5 bg-gray-50 border-t border-gray-200">
          <div className="space-y-5">
            {/* Novelty Section */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FaStar className="text-amber-500" />
                <h4 className="font-bold text-gray-800">Novelty</h4>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${getScoreColor(pitfall.novelty_score)}`}>
                  {pitfall.novelty_score}/10
                </span>
                <p className="text-gray-700 text-sm flex-1">{pitfall.novelty_reason}</p>
              </div>
            </div>

            {/* Significance Section */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FaChartBar className="text-blue-500" />
                <h4 className="font-bold text-gray-800">Significance</h4>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${getScoreColor(pitfall.significance_meter)}`}>
                  {pitfall.significance_meter}/10
                </span>
                <p className="text-gray-700 text-sm flex-1">{pitfall.significance_reason}</p>
              </div>
            </div>

            {/* Methodology Section */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FaProjectDiagram className="text-purple-500" />
                <h4 className="font-bold text-gray-800">Methodology</h4>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${getAlignmentColor(pitfall.methodology_alignment)}`}>
                  {pitfall.methodology_alignment}
                </span>
                <p className="text-gray-700 text-sm flex-1">{pitfall.methodology_reason}</p>
              </div>
            </div>

            {/* Contradictions Section */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FaExclamationTriangle className="text-red-500" />
                <h4 className="font-bold text-gray-800">Contradictions</h4>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${
                  pitfall.contradictions.toLowerCase() === 'none' 
                    ? 'text-green-600' 
                    : pitfall.contradictions.toLowerCase() === 'minor' 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                }`}>
                  {pitfall.contradictions}
                </span>
                <p className="text-gray-700 text-sm flex-1">{pitfall.contradiction_reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
