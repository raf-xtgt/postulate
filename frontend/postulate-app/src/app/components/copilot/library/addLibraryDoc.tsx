"use client";
import { useState } from 'react';
import { FaUpload, FaTimes, FaCheck } from 'react-icons/fa';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaUpload className="text-indigo-600" /> Upload PDF Files
            </h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF files
              </label>
              <div className="mt-1">
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          name="files"
                          multiple
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
              </div>
              {files.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Selected files:</h3>
                  <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <FaCheck className="text-green-500" />
                        <span className="text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={files.length === 0}
              >
                <FaCheck /> Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}