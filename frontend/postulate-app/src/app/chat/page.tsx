// app/chat/page.tsx
"use client";

import { useState } from "react";
import OpenChats from "../components/openChats";
import ChatMessages from "../components/chatMessages";
import AiAssistant from "../components/aiAssistant";

export default function Chat() {
  const [activeView, setActiveView] = useState<"chats" | "messages" | "assistant">("chats");
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState(true);

  return (
    <div className="p-4 h-full">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      
      <div className="flex gap-4 h-[calc(100%-3rem)]">
        {/* Open Chats Sidebar - reduced width */}
        <div className="w-full md:w-1/5 bg-white rounded-lg shadow">
          <OpenChats 
            onSelectChannel={setSelectedChannel}
            onSelectChat={(chatId) => {
              setSelectedChat(chatId);
              setActiveView("messages");
            }}
            activeView={activeView}
            setActiveView={setActiveView}  // Simplified this line
            selectedChannel={selectedChannel}
            selectedChat={selectedChat}
            onToggleAssistant={() => setShowAssistant(!showAssistant)}
          />
        </div>
        
        {/* Main Chat Content Area - adjusted width */}
        <div className={`${showAssistant ? 'hidden md:block md:w-2/5' : 'w-full md:w-4/5'} bg-white rounded-lg shadow`}>
          {activeView === "chats" && selectedChannel && (
            <ChatMessages 
              channel={selectedChannel}
              onBack={() => setActiveView("chats")}
            />
          )}
          
          {activeView === "messages" && selectedChat && (
            <ChatMessages 
              chatId={selectedChat}
              onBack={() => setActiveView("chats")}
            />
          )}
        </div>

        {/* AI Assistant Sidebar - only visible when toggled */}
        {showAssistant && (
          <div className="hidden md:block md:w-2/5 bg-white rounded-lg shadow">
            <AiAssistant 
              chatId={selectedChat ?? undefined}
              onBack={() => setShowAssistant(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}