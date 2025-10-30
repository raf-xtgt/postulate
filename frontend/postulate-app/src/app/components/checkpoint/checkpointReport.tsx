// src/app/components/checkpoints/CheckpointReport.tsx
"use client";

import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Props {
  coachAgentResponse: any;
  coachAgentReport: any;
}

export default function CheckpointReport({ coachAgentResponse, coachAgentReport }: Props) {
  const [open, setOpen] = useState(true);
  console.log("CheckpointReport props:", coachAgentResponse);

  const behavioralCues = coachAgentReport?.problem_analysis?.behavioral?.behavioral_cues ?? [];
  const risks = coachAgentReport?.problem_analysis?.risk?.risks ?? [];

  return (
    <div className="border rounded p-3 bg-white">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Report</div>
        <button onClick={() => setOpen(o => !o)} className="p-1">
          {open ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {open && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-2">Behavioral Cues</div>
            {behavioralCues.length === 0 && <div className="text-xs text-gray-500">No cues found.</div>}
            <ul className="list-decimal ml-5 space-y-2 text-sm">
              {behavioralCues.map((c:any, i:any) => (
                <li key={i}>
                  <div className="font-semibold">{c.cue_name ?? "Unnamed cue"}</div>
                  <div className="text-xs text-gray-500">{c.evidence_quote}</div>
                  <div className="text-xs text-gray-400">Impact: {c.impact_probability ?? "n/a"}</div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Risk</div>
            {risks.length === 0 && <div className="text-xs text-gray-500">No risks found.</div>}
            <ul className="list-decimal ml-5 space-y-2 text-sm">
              {risks.map((r:any, i:any) => (
                <li key={i}>
                  <div className="font-semibold">{r.description ?? "Unnamed risk"}</div>
                  <div className="text-xs text-gray-500">Impact: {r.impact}</div>
                  <div className="text-xs text-gray-400">Level: {r.impact_level}</div>
                </li>
              ))}
            </ul>
          </div>

          {coachAgentResponse && (
            <div className="md:col-span-2 mt-2">
              <div className="text-sm font-medium mb-1">Coach Summary</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{coachAgentResponse.summary}</div>
            </div>
          )}

          {coachAgentResponse && (
            <div className="md:col-span-2 mt-2">
              <div className="text-sm font-medium mb-1">Best Response</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{coachAgentResponse.suggested_response}</div>
            </div>
          )}

          {/* {analysis?.behavioral_insights?.length ? (
            <div className="md:col-span-2 mt-2">
              <div className="text-sm font-medium mb-1">Behavioral Insights</div>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {analysis.behavioral_insights!.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>
          ) : null} */}
        </div>
      )}
    </div>
  );
}
