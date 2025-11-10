"use client";
import SessionListing from "../components/copilot/session/sessionListing";
import LlmMain from "../components/copilot/llmComponents/llmMain";
import Editor from "../components/copilot/editor/editor";

export default function CopilotWorkflow() {

  return (
    <div className="p-5 h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto overflow-x-hidden" >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">AI Research Co-Pilot</h1>
        <p className="text-gray-600 mt-1">Enhance your research workflow with AI-powered insights</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-5 h-[calc(100%-6rem)]">
        {/* Session Sidebar */}
        <div className="w-full lg:w-1/5 bg-white rounded-2xl shadow-lg p-1 border border-gray-200">
          <SessionListing></SessionListing>
        </div>

        {/* Main Editor Area */}
        <div className="hidden lg:block w-2/5 bg-white rounded-2xl shadow-lg p-1 border border-gray-200">
          <Editor />
        </div>

        {/* Mobile Editor Placeholder */}
        <div className="lg:hidden w-full bg-white rounded-2xl shadow-lg p-1 border border-gray-200 mb-5 h-96">
          <div className="p-4 h-full flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Editor</h3>
            <p className="text-gray-500">Available on larger screens</p>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="hidden lg:block w-2/5 bg-white rounded-2xl shadow-lg p-1 border border-gray-200">
          <div className="p-4 pb-2">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg">
                AI
              </span>
              Insights
            </h1>
          </div>
          <LlmMain></LlmMain>
        </div>

      </div>
    </div>
  );
}