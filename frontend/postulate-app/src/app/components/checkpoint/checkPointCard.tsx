"use client";

import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import CheckpointReport from "./checkpointReport";
import CheckpointAltPathCard from "./checkpointAltPathCard";
import ReplayPopUp from "../replay/replayPopUp";
import CheckpointAltConvCard from "./checkpointAltConvCard";

interface Props {
  checkpoint: any;
  index: number;
}

export default function CheckpointCard({ checkpoint, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const altPaths = checkpoint.alternator_agent_inference?.alternative_paths ?? [];
  const [selectedPath, setSelectedPath] = useState<number | null>(altPaths.length > 0 ? 0 : null);

  const rawTitle = checkpoint.user_msg ? checkpoint.user_msg : `Checkpoint ${index + 1}`;
  const title = rawTitle.length > 30 ? `${rawTitle.substring(0, 30)}…` : rawTitle;

  const handleReplayChange = async () => {
    setShowReplay(true);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-500">Checkpoint {index + 1}</div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-gray-400 mt-1">{checkpoint.session_id ?? ""}</div>
          <button
            onClick={handleReplayChange}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mt-2"
          >
            Replay Checkpoint
          </button>
        </div>

        <button
          aria-expanded={expanded}
          onClick={() => setExpanded((s) => !s)}
          className="ml-4 p-2 rounded hover:bg-gray-100"
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <CheckpointReport
            coachAgentResponse={checkpoint.coach_agent_response}
            coachAgentReport={checkpoint.coach_agent_report}
          />

          <div className="space-y-3">
            {altPaths.length === 0 && (
              <div className="text-sm text-gray-500">No alternative paths provided.</div>
            )}

            {altPaths.length > 0 && (
              <>
                <h3 className="text-base font-semibold">
                  Alternate Conversation Pathways
                </h3>

                <div className="flex items-center justify-between gap-2">
                  {altPaths.map((p: any, i: any) => (
                    <CheckpointAltPathCard
                      key={`path-${i}`}
                      path={p}
                      pathIndex={i}
                      isSelected={selectedPath === i}
                      onClick={() => setSelectedPath(i)}
                    />
                  ))}
                </div>

                {selectedPath !== null && altPaths[selectedPath] && (
                  <div className="mt-3">
                    <CheckpointAltConvCard
                      path={altPaths[selectedPath]}
                      conversation_flow={altPaths[selectedPath].conversation_flow ?? []}
                      sessionId={checkpoint.session_id}
                      pathIndex={selectedPath}
                      expectedOutcome={altPaths[selectedPath].expected_outcome}
                      rationale={altPaths[selectedPath].rationale}
                      checkpointGuid={checkpoint.guid}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Replay Popup */}
      {showReplay && (
        <ReplayPopUp
          checkpoint={checkpoint}
          onClose={() => setShowReplay(false)}
        />
      )}
    </div>
  );
}
