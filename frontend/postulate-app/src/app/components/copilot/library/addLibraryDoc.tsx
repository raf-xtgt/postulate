"use client";
import { useState } from 'react';

interface AddLibraryDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (files: File[]) => void;
}

export default function AddLibraryDoc({ isOpen, onClose, onSave }: AddLibraryDocModalProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(files);
    setFiles([]); // Reset files after saving
    onClose(); // Close modal
  };

  const handleClose = () => {
    setFiles([]); // Also reset files on cancel
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Upload PDF Files</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select PDF files
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  name="files"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {files.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium">Selected files:</h3>
                  <ul className="mt-2 list-disc list-inside max-h-60 overflow-y-auto">
                    {files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                disabled={files.length === 0}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}