"use client";
import SessionListing from "../components/copilot/session/sessionListing";

export default function CopilotWorkflow() {

  return (
    <div className="p-4 h-full">
      <h1 className="text-2xl font-bold mb-4">Co-Pilot Workflow</h1>
      <div className="flex gap-4 h-[calc(100%-3rem)]">
        {/* Open Chats Sidebar - reduced width */}
        <div className="w-full md:w-1/5 bg-white rounded-lg shadow">
          <SessionListing></SessionListing>  
        </div>
        
        {/* Main Chat Content Area - adjusted width */}
        <div className="hidden md:block md:w-3/5 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Writing Editor</h1>
          
        </div>

        
        <div className="hidden md:block md:w-1/5 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">AI</h1>
        </div>
        
      </div>
    </div>
  );
}