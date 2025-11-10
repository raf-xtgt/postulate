"use client";

import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaLightbulb, FaCheckCircle, FaExclamationCircle, FaTimesCircle } from "react-icons/fa";
import { SignificanceAnalysisModel } from "@/app/models/significanceAnalysis";

interface Props {
  analysis: SignificanceAnalysisModel;
  index: number;
}

export default function PaperSignificanceCard({ analysis }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Helper function to determine status color and icon
  const getStatusDisplay = (status: string | null) => {
    if (!status) return { color: 'text-gray-600', icon: <FaExclamationCircle />, bg: 'bg-gray-100' };
    const lower = status.toLowerCase();
    if (lower === 'clear') return { color: 'text-green-600', icon: <FaCheckCircle />, bg: 'bg-green-100' };
    if (lower === 'weak') return { color: 'text-yellow-600', icon: <FaExclamationCircle />, bg: 'bg-yellow-100' };
    if (lower === 'missing') return { color: 'text-red-600', icon: <FaTimesCircle />, bg: 'bg-red-100' };
    return { color: 'text-gray-600', icon: <FaExclamationCircle />, bg: 'bg-gray-100' };
  };

  const statusDisplay = getStatusDisplay(analysis.status);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <button
        aria-expanded={expanded}
        onClick={() => setExpanded((s) => !s)}
        className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 ${statusDisplay.bg} rounded-lg`}>
            <FaLightbulb className={statusDisplay.color} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">Impact Analysis #{analysis.guid.substring(0, 8)}</h3>
            <p className="text-sm text-gray-600">Created: {new Date(analysis.created_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${statusDisplay.color}`}>
              {analysis.status || 'N/A'}
            </span>
          </div>
          {expanded ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="p-5 bg-gray-50 border-t border-gray-200">
          <div className="space-y-5">
            {/* Significance Statement */}
            {analysis.significance && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <FaLightbulb className="text-indigo-500" />
                  <h4 className="font-bold text-gray-800">Research Significance</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{analysis.significance}</p>
              </div>
            )}

            {/* Feedback Section */}
            {analysis.feedback && analysis.feedback.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <FaCheckCircle className="text-green-500" />
                  <h4 className="font-bold text-gray-800">Actionable Recommendations</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.feedback.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Status Summary */}
            <div className={`p-4 ${statusDisplay.bg} rounded-lg border border-gray-300`}>
              <div className="flex items-center gap-2">
                <span className={statusDisplay.color}>{statusDisplay.icon}</span>
                <span className={`font-bold ${statusDisplay.color}`}>
                  Status: {analysis.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
