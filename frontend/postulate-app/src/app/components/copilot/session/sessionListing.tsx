"use client";

import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFolderOpen, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { SessionModel } from '@/app/models/session';
import { SessionService } from '@/app/services/sessionService';
import { useUser } from '@/app/context/userContext';
import { useStateController } from '@/app/context/stateController';
import AddSession from './addSession';
import LibraryListing from '../library/libraryListing';

export default function SessionListing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionModel[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionModel>();
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { user } = useUser();
  const { setCurrentSessionGuid } = useStateController();

  // Load Sessions on component mount
  useEffect(() => {
    const loadSessions = async () => {
      if (user?.guid) {
        try {
          setLoading(true);
          const response = await SessionService.getSessionsByUser(user.guid);

          if (response.error) {
            setError(response.error);
          } else {
            setSessions(response);
          }
        } catch (err) {
          setError('Failed to load sessions');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSessions();
  }, [user?.guid]);

  const handleAddSession = async (session: SessionModel) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const payload = {
        title: session.title,
        description: session.description,
        user_guid: user?.guid
      };
      const createdSession = await SessionService.sessionCreate(payload);

      if (createdSession.error) {
        setError(createdSession.error);
      } else {
        setSessions(prev => [...prev, createdSession]);
        setCurrentSessionGuid(createdSession.guid);
        setSuccessMessage('Session created successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to create session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleStartSession = async (sessionGuid: string) => {
    console.log("session start", sessionGuid);
    setCurrentSessionGuid(sessionGuid);

  };

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="bg-gray-50 rounded-xl p-4 h-full flex flex-col">
      <div className="h-full flex flex-col">
        {/* Loading Message */}
        {loading && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
            <span>Retrieving Sessions...</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <FaCheckCircle />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Channels Section (Sessions Dropdown) */}
        <div className="pb-4 border-b border-gray-200">
          <h2 className="font-bold text-lg mb-3 flex justify-between items-center text-gray-800">
            <span className="flex items-center gap-2">
              <FaFolderOpen className="text-indigo-600" /> Research Sessions
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              aria-label="Add session">
              <FaPlus />
            </button>
          </h2>

          {/* Search input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <ul className="mt-3 max-h-60 overflow-y-auto space-y-2">
            {filteredSessions.map((session, index) => (
              <li
                key={index} // 🔹 incremental numeric key
                className={`p-3 rounded-lg cursor-pointer flex justify-between items-center relative transition-colors ${selectedSession?.guid === session.guid
                    ? 'bg-indigo-100 border border-indigo-300'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                onClick={() => {
                  setSelectedSession(session); // 🔹 store selected Session
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{session.title}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FaClock /> {new Date(session.created_date).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected Session Card */}
        {selectedSession && (
          <div className="py-4 border-b border-gray-200 bg-white rounded-lg p-4 my-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{selectedSession.title}</h3>
                <p className="text-sm text-gray-600 mt-1 truncate">{selectedSession.description}</p>
              </div>
              <button
                onClick={() => handleStartSession(selectedSession.guid)}
                className="ml-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Continue Session
              </button>
            </div>
          </div>
        )}

        {/* Chats Section */}
        <div className="flex-1 overflow-y-auto mt-3">
          <LibraryListing></LibraryListing>
        </div>

      </div>
      <AddSession
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddSession}
      />
    </div>

  );
}