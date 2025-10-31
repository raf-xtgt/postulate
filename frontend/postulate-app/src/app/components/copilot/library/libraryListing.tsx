"use client";

import { useState, useEffect } from 'react';
import { FaFileImport } from 'react-icons/fa';
import { LibraryModel } from '@/app/models/library';
import AddLibraryDoc from './addLibraryDoc';

export default function LibraryListing() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [libraryDocs, setLibraryDocs] = useState<LibraryModel[]>([]);
    const [selectedLibraryDoc, setSelectedLibraryDoc] = useState<LibraryModel>();
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load LibraryDocs on component mount
    useEffect(() => {
      const libraryDocs: LibraryModel[] = [
        {
          guid: "1a2b3c",
          file_guid: "First LibraryDoc",
          file_name: "file_name_1.pdf",
          created_date: "2025-10-31T09:00:00Z",
          last_update: "2025-10-31T10:00:00Z",
        },
        {
          guid: "4d5e6f",
          file_guid: "Second LibraryDoc",
          file_name: "file_name_2.pdf",
          created_date: "2025-10-30T14:30:00Z",
          last_update: "2025-10-30T15:00:00Z",
        },
        {
          guid: "7g8h9i",
          file_guid: "Third LibraryDoc",
          file_name: "file_name_3.pdf",
          created_date: "2025-10-29T08:00:00Z",
          last_update: "2025-10-29T09:30:00Z",
        },
      ];
      setLibraryDocs(libraryDocs)
    }, []);

    const handleAddLibraryDoc = async (files: File[]) => {
    try {
        setLoading(true);
        console.log('Uploading files:', files);

        const newDocs: LibraryModel[] = files.map((file, index) => ({
            guid: `new-${libraryDocs.length + index}-${Date.now()}`,
            file_guid: `file-guid-${libraryDocs.length + index}`,
            file_name: file.name,
            created_date: new Date().toISOString(),
            last_update: new Date().toISOString(),
        }));

        setLibraryDocs(prevDocs => [...prevDocs, ...newDocs]);
        setError(null);
    } catch (err) {
        setError('Failed to upload files');
        console.error(err);
    } finally {
        setLoading(false);
    }
    };
  

    const handleStartLibraryDoc = async (sessionGuid: string) => {
      console.log("session start", sessionGuid);
    
    };

    const filteredLibraryDocs = libraryDocs.filter((session) =>
      session.file_name.toLowerCase().includes(search.toLowerCase())
    );
      return (
        <div>
          <div className="h-full flex flex-col">
            {/* Channels Section (LibraryDocs Dropdown) */}
            <div className="border-b">
              <h2 className="font-semibold mb-2 flex justify-between items-center">
                LibraryDocs
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  aria-label="Add customer">
                  <FaFileImport />
                </button>
              </h2>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search LibraryDocs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />

              <ul className="max-h-48 overflow-y-auto">
                {filteredLibraryDocs.map((session, index) => (
                  <li
                    key={index} // 🔹 incremental numeric key
                    className={`p-2 rounded cursor-pointer flex justify-between items-center relative hover:bg-gray-100`}
                    onClick={() => {
                      setSelectedLibraryDoc(session); // 🔹 store selected LibraryDoc
                    }}
                  >
                    <span>{session.file_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
            <AddLibraryDoc
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleAddLibraryDoc}
            />       
          </div>
        
      );
  }