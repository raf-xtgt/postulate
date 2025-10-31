"use client";
import { useState } from 'react';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

  

export default function AddLibraryDoc({ isOpen, onClose, onSave }: AddSessionModalProps) {
  const [formData, setFormData] = useState<any>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData( (prev:any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    onClose(); // Close modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Upload Files</h2>
          <form onSubmit={handleSubmit}>
            
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