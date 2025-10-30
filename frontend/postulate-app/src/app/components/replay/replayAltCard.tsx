"use client";

import React from "react";
import { useStateController } from "@/app/context/stateController";

interface Props {
  path: any;
  pathIndex: number;
  sessionId?: string | null;
  checkpointGuid: string | null;
}

export default function ReplayAltCard({ path, pathIndex, sessionId, checkpointGuid }: Props) {
  const { setReplayMessage, setReplayAltPath } = useStateController();

  let altMsg = path.conversation_flow[0].message

  const handleUseConversation = async () => {
    setReplayMessage(altMsg);
    setReplayAltPath(path)
  };

  return (
    <div className="border border-blue-400 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 
                    rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Strategy and Button Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-white">
          {path.strategy ?? "Strategy not provided"}
        </div>
        <button
          onClick={handleUseConversation}
          className="bg-blue-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium 
                     hover:bg-blue-500 transition-colors"
        >
          Use Path
        </button>
      </div>
      
      {/* Alt Response */}
      <div className="text-white">
        <div className="font-medium mb-1">Best Response:</div>
        <div>{altMsg}</div>
      </div>
    </div>
  );
}
