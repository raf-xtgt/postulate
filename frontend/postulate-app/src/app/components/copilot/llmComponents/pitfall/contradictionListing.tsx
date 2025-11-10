"use client";

import React, { useState } from "react";
import { FaExclamationTriangle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ContradictionListResponse } from "@/app/models/pitfall";

interface Props {
  contradictionAlerts: ContradictionListResponse | null;
}

export default function ContradictionListing({ contradictionAlerts }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  if (!contradictionAlerts || contradictionAlerts.contradictions.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <FaExclamationTriangle className="text-green-500" />
          <h4 className="font-bold text-gray-800">Contradictions</h4>
        </div>
        <p className="text-green-600 font-medium">No contradictions found</p>
      </div>
    );
  }

  const contradictions = contradictionAlerts.contradictions;
  const totalPages = Math.ceil(contradictions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContradictions = contradictions.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" />
          <h4 className="font-bold text-gray-800">Contradictions</h4>
          <span className="text-sm text-gray-500">({contradictions.length} found)</span>
        </div>
      </div>

      <div className="space-y-3">
        {currentContradictions.map((contradiction, idx) => (
          <div key={startIndex + idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-gray-700 mb-2">{contradiction.feedback}</p>
            {contradiction.draft_finding && (
              <div className="text-xs text-gray-600 mb-1">
                <strong>Your finding:</strong> {contradiction.draft_finding}
              </div>
            )}
            {contradiction.corpus_finding && (
              <div className="text-xs text-gray-600">
                <strong>Contradicts ({contradiction.corpus_paper_id}):</strong> {contradiction.corpus_finding}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft className="text-xs" />
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}