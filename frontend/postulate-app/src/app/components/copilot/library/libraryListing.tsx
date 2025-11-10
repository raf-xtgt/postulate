"use client";

import { useState, useEffect } from 'react';
import { FaFileImport, FaSearch, FaFilePdf, FaRegFolder } from 'react-icons/fa';
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
    const loadLibraryDocs = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/ps/file-upload/list');

        if (!response.ok) {
          throw new Error('Failed to fetch library documents');
        }

        const data = await response.json();
        setLibraryDocs(data);
        setError(null);
      } catch (err) {
        setError('Failed to load library documents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLibraryDocs();
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
    <div className="bg-gray-50 rounded-xl p-4 h-full">
      <div className="h-full flex flex-col">
        {/* Channels Section (LibraryDocs Dropdown) */}
        <div className="pb-4 border-b border-gray-200">
          <h2 className="font-bold text-lg mb-3 flex justify-between items-center text-gray-800">
            <span className="flex items-center gap-2">
              <FaRegFolder className="text-indigo-600" /> Documents in Research Knowledge Graph
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              aria-label="Add library document">
              <FaFileImport />
            </button>
          </h2>

          {/* Search input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search library documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {loading && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
              <span>Loading documents...</span>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && filteredLibraryDocs.length === 0 && (
            <div className="mt-3 p-3 text-center text-gray-500">
              No documents found. Upload files to get started.
            </div>
          )}

          <ul className="mt-3 max-h-96 overflow-y-auto space-y-1">
            {filteredLibraryDocs.map((doc) => (
              <li
                key={doc.guid}
                className={`p-3 rounded-lg cursor-pointer flex justify-between items-center relative hover:bg-indigo-50 transition-colors ${selectedLibraryDoc?.guid === doc.guid ? 'bg-indigo-100 border border-indigo-300' : 'bg-white border border-gray-200'}`}
                onClick={() => {
                  setSelectedLibraryDoc(doc);
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FaFilePdf className="text-red-500 flex-shrink-0" />
                  <span className="font-medium text-gray-800 truncate">{doc.file_name}</span>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {new Date(doc.last_update).toLocaleDateString()}
                </span>
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