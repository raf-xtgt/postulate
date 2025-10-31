"use client";

import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { SessionModel } from '@/app/models/session';
import AddSession from './addSession';

export default function SessionListing() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sessions, setSessions] = useState<SessionModel[]>([]);
    const [selectedSession, setSelectedSession] = useState<SessionModel>();
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load Sessions on component mount
    useEffect(() => {
      const sessions: SessionModel[] = [
        {
          guid: "1a2b3c",
          title: "First Session",
          description: "First description",
          created_date: "2025-10-31T09:00:00Z",
          last_update: "2025-10-31T10:00:00Z",
        },
        {
          guid: "4d5e6f",
          title: "Second Session",
          description: "Second description",
          created_date: "2025-10-30T14:30:00Z",
          last_update: "2025-10-30T15:00:00Z",
        },
        {
          guid: "7g8h9i",
          title: "Third Session",
          description: "Third description",
          created_date: "2025-10-29T08:00:00Z",
          last_update: "2025-10-29T09:30:00Z",
        },
      ];
      setSessions(sessions)
    }, []);

    const handleAddSession = async (newCustomer: any) => {
        try {
        setLoading(true);
        // const createdCustomer = await CustomerService.createCustomer(newCustomer);
        
        // Update local state with the new cp
        // setSessions(prev => [...prev, createdCustomer]);
        
        // console.log('Customer created successfully:', createdCustomer);
        } catch (err) {
        setError('Failed to create cp');
        console.error(err);
        } finally {
        setLoading(false);
        }
    };
  

    const handleStartSession = async (sessionGuid: string) => {
      console.log("session start", sessionGuid);
    
    };

    const filteredSessions = sessions.filter((session) =>
      session.title.toLowerCase().includes(search.toLowerCase())
    );
      return (
        <div>
          <div className="h-full flex flex-col">
            {/* Channels Section (Sessions Dropdown) */}
            <div className="p-4 border-b">
              <h2 className="font-semibold mb-2 flex justify-between items-center">
                Sessions
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  aria-label="Add customer">
                  <FaPlus />
                </button>
              </h2>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search Sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />

              <ul className="max-h-48 overflow-y-auto">
                {filteredSessions.map((session, index) => (
                  <li
                    key={index} // 🔹 incremental numeric key
                    className={`p-2 rounded cursor-pointer flex justify-between items-center relative hover:bg-gray-100`}
                    onClick={() => {
                      setSelectedSession(session); // 🔹 store selected Session
                    }}
                  >
                    <span>{session.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selected Session Card */}
            {selectedSession && (
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{selectedSession.title}</h3>
                  <button
                    onClick={() => handleStartSession(selectedSession.guid)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Continue session
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{selectedSession.title}</p>
              </div>
            )}

            {/* Chats Section */}
            <div className="p-4 flex-1 overflow-y-auto">
              Library
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