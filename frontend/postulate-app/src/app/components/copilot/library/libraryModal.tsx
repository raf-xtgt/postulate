"use client";

import { FaTimes } from 'react-icons/fa';
import LibraryListing from './libraryListing';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LibraryModal({ isOpen, onClose }: LibraryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Library Documents</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <FaTimes className="text-gray-600 text-xl" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden">
          <LibraryListing />
        </div>
      </div>
    </div>
  );
}
