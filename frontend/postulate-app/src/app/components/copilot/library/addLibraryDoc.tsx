"use client";
import { useState } from 'react';
import { FaUpload, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';

interface AddLibraryDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (files: File[]) => void;
}

export default function AddLibraryDoc({ isOpen, onClose, onSave }: AddLibraryDocModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // Filter only PDF files
      const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length !== selectedFiles.length) {
        setUploadError('Only PDF files are allowed');
        setTimeout(() => setUploadError(null), 3000);
      }
      
      setFiles(pdfFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setUploadError('Please select at least one PDF file');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setSuccessMessage(null);

      // Step 1: Upload files to GCS
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch('http://localhost:8000/ps/file-upload/upload/multi', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files');
      }

      const uploadedFiles = await uploadResponse.json();
      
      // Step 2: Extract GUIDs and construct knowledge graph
      const fileGuids = uploadedFiles.map((file: any) => file.guid);
      
      const kgResponse = await fetch('http://localhost:8000/ps/kg/construct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_guids: fileGuids }),
      });

      if (!kgResponse.ok) {
        throw new Error('Failed to construct knowledge graph');
      }

      const kgResult = await kgResponse.json();
      
      // Show success message
      setSuccessMessage(kgResult.message || 'Files uploaded and added to knowledge graph successfully!');
      
      // Call onSave callback
      onSave(files);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setFiles([]);
        setSuccessMessage(null);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setUploadError(null);
      setSuccessMessage(null);
      onClose();
    }
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
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <FaCheck />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {uploadError}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF files (only PDF format allowed)
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
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={files.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaCheck /> Add file to Knowledge Graph
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}