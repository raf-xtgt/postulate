"use client";

import { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { sendMessage } from "../services/chatService";
import { ChatMessage } from "../models/chatMsg";
import { useStateController } from "../context/stateController";
import { SessionOutcomeEnum } from "../models/session";
import OutcomeModal from "./outcome/outcomeModal";

export default function ChatMessages() {
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0.0);
  const [sessionId, setSessionId] = useState(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [sessionOutcome, setSessionOutcome] = useState(SessionOutcomeEnum.IN_PROGRESS);
  const { sharedData, setSharedData, chatMessages, addChatMessage } = useStateController();
  const processedRef = useRef<Set<string>>(new Set());
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now(),
        content: message,
        role: "salesman",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      addChatMessage(newMessage);
      setMessage("");

      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.width = "100%";
      }

      let sentMsgResponse: any;
      try {
        const parsed = JSON.parse(sharedData);
        setSessionId(parsed.session_id)
        let payload = {
          session_id: parsed.session_id,
          user_response: message,
        };
        sentMsgResponse = await sendMessage(payload);
      } catch (error) {
        console.error("Error sending message:", error);
        setSharedData(sharedData);
      } finally {
        setSharedData(JSON.stringify(sentMsgResponse));
      }
    }
  };

  useEffect(() => {
    if (sharedData) {
      try {
        const parsed = JSON.parse(sharedData);
        const key = JSON.stringify(parsed);
        if (processedRef.current.has(key)) return;
        processedRef.current.add(key);

        setSessionOutcome(parsed.session_outcome);
        setScore(parsed.running_score);
        if ( (parsed.session_outcome == 'SUCCESS' ) || (parsed.session_outcome == 'FAILED') ){
          setShowOutcome(true)
        }

        if (parsed?.client_agent_response?.content) {
          const newMessage: ChatMessage = {
            id: Date.now(),
            content: parsed.client_agent_response.content,
            role: "client_agent",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          addChatMessage(newMessage);
        }
      } catch (e) {
        console.warn("sharedData is not valid JSON:", sharedData);
      }
    }
  }, [sharedData, addChatMessage]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Blur wrapper */}
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center">
          <div className="flex-1">
            <h2 className="font-semibold">Current Score : {score}</h2>
            <p className="text-xs text-gray-500">Session Outcome: {sessionOutcome}</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "salesman" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                      msg.role === "salesman" ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === "salesman" ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex">
            <textarea
              ref={textAreaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())
              }
              placeholder="Type a message..."
              className="flex-1 border rounded-l-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Outcome Modal */}
      {showOutcome && (
        <OutcomeModal
          session_outcome={sessionOutcome}
          session_guid={sessionId}
          onClose={() => setShowOutcome(false)}
        />
      )}

    </div>
  );
}
