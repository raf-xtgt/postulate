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
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Helper function to determine status color
  const getStatusColor = (status: string | null) => {
    if (!status) return 'text-gray-600';
    const lower = status.toLowerCase();
    if (lower === 'aligned' || lower === 'clear') return 'text-green-600';
    if (lower === 'unclear' || lower === 'weak') return 'text-yellow-600';
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
            <h3 className="font-bold text-gray-800">Analysis #{pitfall.guid.substring(0, 8)}</h3>
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
            {pitfall.novelty_analysis && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaStar className="text-amber-500" />
                    <h4 className="font-bold text-gray-800">Novelty</h4>
                    <span className={`text-lg font-bold ${getScoreColor(pitfall.novelty_analysis.score)}`}>
                      {(pitfall.novelty_analysis.score * 10).toFixed(1)}/10
                    </span>
                  </div>
                  
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm">{pitfall.novelty_analysis.feedback}</p>
                  {pitfall.novelty_analysis.supporting_claim_text && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 italic">
                      "{pitfall.novelty_analysis.supporting_claim_text}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Significance Section */}
            {pitfall.significance_analysis && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaChartBar className="text-blue-500" />
                    <h4 className="font-bold text-gray-800">Significance</h4>
                    <span className={`text-lg font-bold ${getStatusColor(pitfall.significance_analysis.status)}`}>
                      {pitfall.significance_analysis.status || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm">{pitfall.significance_analysis.significance}</p>
                  {pitfall.significance_analysis.feedback && pitfall.significance_analysis.feedback.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {pitfall.significance_analysis.feedback.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Methodology Section */}
            {pitfall.methodology_analysis && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaProjectDiagram className="text-purple-500" />
                    <h4 className="font-bold text-gray-800">Methodology</h4>
                    <span className={`text-lg font-bold ${getStatusColor(pitfall.methodology_analysis.status)}`}>
                      {pitfall.methodology_analysis.status || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm">{pitfall.methodology_analysis.feedback}</p>
                  {pitfall.methodology_analysis.method_text && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <strong>Method:</strong> {pitfall.methodology_analysis.method_text}
                    </div>
                  )}
                  {pitfall.methodology_analysis.claim_text && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <strong>Claim:</strong> {pitfall.methodology_analysis.claim_text}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contradictions Section */}
            {pitfall.contradiction_alerts && pitfall.contradiction_alerts.contradictions.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <FaExclamationTriangle className="text-red-500" />
                  <h4 className="font-bold text-gray-800">Contradictions</h4>
                </div>
                <div className="space-y-3">
                  {pitfall.contradiction_alerts.contradictions.map((contradiction, idx) => (
                    <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-gray-700 mb-2">{contradiction.feedback}</p>
                      {contradiction.draft_finding && (
                        <div className="text-xs text-gray-600 mb-1">
                          <strong>Your finding:</strong> {contradiction.draft_finding}
                        </div>
                      )}
                      {contradiction.corpus_finding && (
                        <div className="text-xs text-gray-600">
                          <strong>Contradicts ({contradiction.corpus_paper_id}):</strong> {contradiction.corpus_finding}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Contradictions */}
            {(!pitfall.contradiction_alerts || pitfall.contradiction_alerts.contradictions.length === 0) && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <FaExclamationTriangle className="text-green-500" />
                  <h4 className="font-bold text-gray-800">Contradictions</h4>
                </div>
                <p className="text-green-600 font-medium">No contradictions found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
