// src/app/components/checkpoints/CheckpointAltConvCard.tsx
"use client";

import React from "react";
import type { ConversationFlowItem } from "../../models/checkpoint";
import { useStateController } from "../../context/stateController";
import { SessionService } from "@/app/services/sessionService";
import { ChatMessage } from "@/app/models/chatMsg";
import { sendMessage } from "@/app/services/chatService";

interface Props {
  path: any;
  conversation_flow: ConversationFlowItem[];
  sessionId?: string | null;
  pathIndex: number;
  expectedOutcome?: string;
  rationale?: string;
  checkpointGuid: string | null;
}

export default function CheckpointAltConvCard({ path, conversation_flow, sessionId, pathIndex, expectedOutcome, rationale, checkpointGuid }: Props) {
  const { setSharedData, addChatMessage } = useStateController();

  const handleUseConversation = async () => {
    console.log("path", path)
    let payload = {
      selected_path: path,
      checkpoint_guid: checkpointGuid,
      path_type: "Alternate"
    }
    try {
      const useAltPathResp = await SessionService.useAlternatePath(payload);
      console.log("useAltPathResp", useAltPathResp)
      const sessionGuid = useAltPathResp.response.session_guid
      let userMsg = useAltPathResp.response.used_path.conversation_flow[0].message
      console.log("sessionGuid", sessionGuid)
      console.log("userMsg", userMsg)
      const newMessage: ChatMessage = {
        id: Date.now(),
        content: userMsg,
        role: "salesman",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      addChatMessage(newMessage);
      let clientInferPayload = {
        session_id: sessionGuid,
        user_response: userMsg,
      };

      const result = await sendMessage(clientInferPayload);
      console.log("send msg result", result);
      setSharedData(JSON.stringify(result));

    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  return (
    <div className="border rounded p-3 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Expected Alternate Conversation</div>
      </div>

      <div className="space-y-2">
        {conversation_flow.length === 0 && <div className="text-xs text-gray-500">No conversation flow available.</div>}
        {conversation_flow.map((m, i) => {
          const isSales = (m.speaker ?? "").toLowerCase().includes("sales") || (m.speaker ?? "").toLowerCase().includes("you");
          return (
            <div key={i} className={`flex ${isSales ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] px-3 py-2 rounded-lg ${isSales ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                <div className="text-xs text-gray-200 mb-1">{m.speaker}</div>
                <div className="text-sm">{m.message}</div>
              </div>
            </div>
          );
        })}
      </div>

      {expectedOutcome || rationale ? (
        <div className="mt-3 text-sm text-gray-600">
          {rationale ? (
            <>
              <div className="font-semibold">Rationale</div>
              <div className="mb-2">{rationale}</div>
            </>
          ) : null}
          {expectedOutcome ? (
            <>
              <div className="font-semibold">Expected Outcome</div>
              <div>{expectedOutcome}</div>
            </>
          ) : null}
        </div>
      ) : null}
      <button
        onClick={handleUseConversation}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mt-4 w-full"
      >
        Use Alternate Path
      </button>
    </div>
  );
}
