"use client";

import React from "react";
import { motion, useDragControls } from "framer-motion";
import ReplayAltCard from "./replayAltCard";
import { useStateController } from "@/app/context/stateController";
import { SessionService } from "@/app/services/sessionService";
import { sendMessage } from "@/app/services/chatService";
import { ChatMessage } from "@/app/models/chatMsg";
import { SessionModel } from "@/app/models/session";
import { ConversationFlow, AlternativePath } from "@/app/models/chatMsg";

interface ReplayPopUpProps {
  onClose: () => void;
  checkpoint: any;
}

export default function ReplayPopUp({ onClose, checkpoint }: ReplayPopUpProps) {
  const altPaths = checkpoint.alternator_agent_inference?.alternative_paths ?? [];
  const dragControls = useDragControls();
  const {
    replayMessage,
    setReplayMessage,
    replayAltPath,
    chatMessages,
    pruneChatMessages,
    setSharedData,
    addChatMessage,
  } = useStateController();

  const sendReplayMsg = async () => {
    if (checkpoint && typeof checkpoint.user_msg_index === "number") {
      pruneChatMessages(checkpoint.user_msg_index-1);
    }
    console.log("sendReplayMsg checkpoint", checkpoint);
    console.log("send replay msg", replayMessage);
    console.log("send replay msg path", replayAltPath);
    let altPath: AlternativePath = {
      conversation_flow: [],
      strategy: "",
      technique_used: "",
      rationale: "",
      expected_outcome: ""
    };
    if((replayAltPath == undefined) || (replayAltPath == null)){
      const repAltConv: ConversationFlow = {
        message:replayMessage,
        speaker: "salesman"
      };
      altPath = {
        conversation_flow: [repAltConv],
        strategy: "Consultative Selling",
        technique_used: "Active Listening",
        rationale: "Builds trust and identifies client needs",
        expected_outcome: "Client agrees to a follow-up meeting"
      };
    }
    let payload = {
      selected_path: replayAltPath ? replayAltPath : altPath,
      checkpoint_guid: checkpoint.guid,
    };
    console.log("payload", payload);
    console.log("chatMessages", chatMessages)
    try{
      let sessionResp :SessionModel= await SessionService.getSessionByGuid(checkpoint.session_guid);
      console.log("sessionResp", sessionResp)
      sessionResp.client_agent_context.conversation_history = chatMessages 
      let updatePayload = {
        session_id: checkpoint.session_guid,
        session_model: sessionResp
      }
      let sessionUpdateResp = await SessionService.updateSession(updatePayload);
      console.log("sessionUpdateResp", sessionUpdateResp)

      // alternative path
      let altPathPayload = {
        selected_path: replayAltPath,
        checkpoint_guid: checkpoint.guid,
        path_type : "Replay"
      }
      const useAltPathResp = await SessionService.useAlternatePath(altPathPayload);
      console.log("useAltPathResp", useAltPathResp)

      const newMessage: ChatMessage = {
        id: Date.now(),
        content: replayMessage,
        role: "salesman",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      addChatMessage(newMessage);
      let clientInferPayload = {
        session_id: checkpoint.session_guid,
        user_response: replayMessage,
      };
      console.log("clientInferPayload", clientInferPayload)
      onClose()
      const result = await sendMessage(clientInferPayload);
      console.log("send msg result", result);
      setSharedData(JSON.stringify(result));
    }
    catch(error){
      console.log("failed")
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[9999]">
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative p-6 rounded-2xl w-[90%] max-w-5xl shadow-2xl flex flex-col space-y-4 
                   bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white"
        style={{ width: "65%", background: 'cornflowerblue' }}
      >
        {/* Header */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex justify-between items-center border-b border-blue-400 pb-2 cursor-move"
        >
          <h2 className="text-lg font-semibold tracking-wide">Replay Message</h2>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex gap-8">
          {/* Replay Message textarea */}
          <div className="flex-1 flex flex-col" style={{paddingRight:'6px'}}>
            <div className="relative">
              <textarea
                value={replayMessage}
                onChange={(e) => setReplayMessage(e.target.value)}
                className="w-full h-[28rem] bg-white border border-blue-400 rounded-xl p-4 
                           text-gray-800 placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-400 
                           focus:outline-none shadow-inner"
                placeholder="Type or edit your replay message here..."
                style={{height:'270px'}}
              ></textarea>
              {/* Send Button */}
              <button
                onClick={sendReplayMsg}
                className=" bg-blue-500 hover:bg-blue-600 text-white 
                           px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
              >
                Send
              </button>
            </div>
          </div>

          {/* Reuse of CheckpointAltPathCard */}
          <div className="flex-1 bg-blue-950 bg-opacity-50 p-4 rounded-2xl overflow-y-auto 
                          max-h-[600px] border border-blue-500 shadow-lg space-y-4">
            {altPaths.length === 0 ? (
              <div className="text-blue-200 text-sm">No alternative paths provided.</div>
            ) : (
              altPaths.map((p: any, i: number) => (
                <ReplayAltCard
                  key={`popup-path-${i}`}
                  path={p}
                  pathIndex={i}
                  sessionId={checkpoint.session_id}
                  checkpointGuid={checkpoint.guid}
                />
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}