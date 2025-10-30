// components/clientAgentScoring.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { FaRobot, FaPlus } from "react-icons/fa";
import { ClientProfileService } from "../../services/clientProfileService";
import { useStateController } from "../../context/stateController";
import ClientAgentInternalScoreCard from "./clientAgentInternalScoreCard";

export default function ClientAgentScoring() {
  const { sharedData } = useStateController();
  const [scores, setScores] = useState<any[] | null>(null);
  const processedRef = useRef<Set<string>>(new Set());

  const fetchInternalScoringBySessionId = async (sessionId: string) => {
    
    try {
      const resp = await ClientProfileService.getClientAgentInternalScoring(sessionId);
      console.log("internal scoring data", resp.data)
      // Expect data to be an array of checkpoint objects
      if (Array.isArray(resp.data)) {
        // show latest first
        setScores([...resp.data]);
      } else {
        // if single object returned, wrap it
        setScores(Array.isArray(resp.data) ? resp.data : []);
      }
    } catch (err: any) {
      console.error("Failed to fetch checkpoints:", err);
    } finally {
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
        fetchInternalScoringBySessionId(sessionId);
    }
  }, [sharedData]);


  return (
    <div> 
        <div className="flex items-center">
          <FaRobot className="text-blue-600 mr-2" />
          <h2 className="font-semibold text-lg">Client Agent Score</h2>
        </div>   
        {scores && <ClientAgentInternalScoreCard scores={scores} />}
    </div>
  );
}
