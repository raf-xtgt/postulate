"use client";
import { useState } from 'react';
import { SessionModel } from '@/app/models/session';
import { FaPlus, FaTimes, FaCheck } from 'react-icons/fa';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SessionModel) => void;
}
const initialFormData: SessionModel = {
    guid:'',
    title: '',
    description: '',
    created_date: '',
    last_update: ''
  };
  

export default function AddSession({ isOpen, onClose, onSave }: AddSessionModalProps) {
  const [formData, setFormData] = useState<SessionModel>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    setFormData(initialFormData); // Reset form data
    onClose(); // Close modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaPlus className="text-indigo-600" /> New Session
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
            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter session title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-[120px]"
                  placeholder="Enter a detailed description..."
                  required
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FaCheck /> Create Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}