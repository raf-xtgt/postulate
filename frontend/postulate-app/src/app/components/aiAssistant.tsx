// src/app/components/aiAssistant.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaRobot } from "react-icons/fa";
import { useStateController } from "../context/stateController";
import { CheckpointService } from "../services/checkpointService";
import CheckpointCard from "./checkpoint/checkPointCard";

interface AiAssistantProps {
  chatId?: string;
  channel?: string;
  onBack: () => void;
}

export default function AiAssistant({ chatId, channel, onBack }: AiAssistantProps) {
  const { sharedData } = useStateController();
  const processedRef = useRef<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState<any[] | null>(null);

  const fetchCheckpointListBySessionId = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await CheckpointService.getCheckpointListBySessionId(sessionId);
      console.log("checkpoint data", data);  
      let checkpointArray: any[] = [];
  
      if (Array.isArray(data)) {
        checkpointArray = data;
      } else if (data?.checkpoints && Array.isArray(data.checkpoints)) {
        checkpointArray = data.checkpoints;
      } else if (data) {
        checkpointArray = [data];
      }
  
      // Filter out checkpoints with null/undefined/empty user_msg
      const filteredCheckpoints = checkpointArray.filter(
        (cp) => cp?.user_msg && cp.user_msg.trim() !== ""
      );
  
      setCheckpoints(filteredCheckpoints);
    } catch (err: any) {
      console.error("Failed to fetch checkpoints:", err);
      setError(err?.message ?? "Failed to fetch checkpoints");
      setCheckpoints(null);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (!sharedData) return;

    // sharedData might already be an object or a JSON string
    let parsed: any = null;
    try {
      parsed = typeof sharedData === "string" ? JSON.parse(sharedData) : sharedData;
    } catch (e) {
      console.warn("AiAssistant: sharedData is not valid JSON:", sharedData);
      return;
    }

    const key = JSON.stringify(parsed);
    if (processedRef.current.has(key)) return;
    processedRef.current.add(key);

    const sessionId = parsed?.session_id ?? parsed?.sessionId ?? parsed?.session?.id;
    if (sessionId) {
      fetchCheckpointListBySessionId(sessionId);
    }
  }, [sharedData]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center">
        <button onClick={onBack} className="mr-2 md:hidden">
          <FaArrowLeft />
        </button>
        <div className="flex items-center">
          <FaRobot className="text-blue-600 mr-2" />
          <h2 className="font-semibold text-lg">Coach Agent</h2>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4">
        {loading && <div className="text-sm text-gray-500">Loading checkpoints…</div>}
        {error && <div className="text-sm text-red-600">Error: {error}</div>}

        {!loading && !error && !checkpoints?.length && (
          <div className="text-sm text-gray-500">
            Select profile and start session for key checkpoints.
          </div>
        )}

        <div className="space-y-4">
          {checkpoints?.map((cp, idx) => (
            <CheckpointCard
              key={`cp-${idx}`}
              checkpoint={cp}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
