"use client";

import { useState, useEffect } from 'react';
import { SessionService } from '@/app/services/sessionService';
import SessionFlow from './sessionFlow';

export default function SessionListing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionGuid, setSelectedSessionGuid] = useState<any>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConversationFlow, setShowConversationFlow] = useState(false);


  // Load sessions on component mount
  useEffect(() => {
    const fetchClientProfiles = async () => {
      try {
        setLoading(true);
        const sessionListing = await SessionService.getSessionListing();
        console.log("sessionListing", sessionListing);
        setSessions(sessionListing);
      } catch (err) {
        setError('Failed to load session listing');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfiles();
  }, []);

  const handleConversationFlow = (sessionId: string) => {
    console.log("View conversation flow for session:", sessionId);
    setSelectedSessionGuid(sessionId)
    setShowConversationFlow(true)
    // You can navigate to another page or open a modal here
    // Example: router.push(`/conversation/${sessionId}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sales Training Sessions</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          aria-label="Add client profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {loading && <div className="text-gray-500">Loading sessions...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <div className="overflow-x-auto mt-2">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Running Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outcome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((sn, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sn.running_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sn.outcome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sn.running_score}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleConversationFlow(sn.guid)}
                    className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Conversation Flow
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing data 1 to {sessions.length} of {sessions.length} entries
      </div>

      {showConversationFlow && (
        <SessionFlow
          sessionGuid={selectedSessionGuid}
          onClose={() => setShowConversationFlow(false)}
        />
      )}
    </div>
  );
}
