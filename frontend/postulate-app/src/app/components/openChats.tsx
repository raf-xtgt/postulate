// components/OpenChats.tsx
"use client";

import { useEffect, useState } from "react";
import { FaRobot, FaPlus } from "react-icons/fa";
import { ClientProfileService } from "../services/clientProfileService";
import { SessionService } from "../services/sessionService";
import { useStateController } from "../context/stateController";
import ClientAgentScoring from "./clientScoring/clientAgentScoring";

interface ClientProfile {
  id: string;
  name: string;
  description: string;
  unread?: number;
}

interface OpenChatsProps {
  onSelectChannel: (channel: string) => void;
  onSelectChat: (chatId: string) => void;
  activeView: "chats" | "messages" | "assistant";
  setActiveView: (view: "chats" | "messages" | "assistant") => void;
  selectedChannel: string | null;
  selectedChat: string | null;
  onToggleAssistant: () => void;
}

export default function OpenChats({
  onSelectChannel,
  onSelectChat,
  activeView,
  setActiveView,
  selectedChannel,
  selectedChat,
  onToggleAssistant,
}: OpenChatsProps) {
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<ClientProfile | null>(null);
  const { setSharedData } = useStateController();

  // fetch client profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      const data = await ClientProfileService.getClientProfiles();
      if (!data.error && Array.isArray(data)) {
        setProfiles(data);
      }
    };
    fetchProfiles();
  }, []);

  const handleStartSession = async (clientProfileId: string) => {
    console.log("session start", clientProfileId);
  
    const sessionInitPayload = {
      client_profile_id: clientProfileId,
    };
  
    try {
      const sessionInitResp = await SessionService.sessionInit(sessionInitPayload);
      console.log("Session initialized:", sessionInitResp);
      setSharedData(JSON.stringify(sessionInitResp))        
      onSelectChat(sessionInitResp.session_id);
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };
  
  // Mock chats (unchanged for now)
  const chats = [
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hello there!",
      time: "10:30 AM",
      unread: 2,
      channel: "telegram",
    },
    {
      id: "2",
      name: "Acme Corp",
      lastMessage: "Your order is ready",
      time: "Yesterday",
      unread: 0,
      channel: "whatsapp",
    },
    {
      id: "3",
      name: "Sarah Smith",
      lastMessage: "Thanks for your help!",
      time: "Monday",
      unread: 0,
      channel: "instagram",
    },
  ];

  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Channels Section (Profiles Dropdown) */}
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-2 flex justify-between items-center">
          Client Profiles
          <button className="text-gray-500 hover:text-gray-700">
            <FaPlus />
          </button>
        </h2>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search profiles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />

        <ul className="max-h-48 overflow-y-auto">
          {filteredProfiles.map((profile, index) => (
            <li
              key={index} // 🔹 incremental numeric key
              className={`p-2 rounded cursor-pointer flex justify-between items-center relative ${
                activeView === "chats" && selectedChannel === profile.id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                onSelectChannel(profile.id);
                setActiveView("chats");
                setSelectedProfile(profile); // 🔹 store selected profile
              }}
            >
              <span>{profile.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Selected Profile Card */}
      {selectedProfile && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{selectedProfile.name}</h3>
            <button
              onClick={() => handleStartSession(selectedProfile.id)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start session
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{selectedProfile.description}</p>
        </div>
      )}

      {/* Chats Section */}
      <div className="p-4 flex-1 overflow-y-auto">
        <ClientAgentScoring></ClientAgentScoring>
      </div>

      {/* AI Assistant Button
      <div className="p-4 border-t">
        <button
          className="w-full flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onToggleAssistant}
        >
          <FaRobot className="mr-2" />
          AI Assistant
        </button>
      </div> */}
    </div>
  );
}
