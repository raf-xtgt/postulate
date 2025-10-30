"use client";

import React from "react";
import { motion, useDragControls } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface OutcomeModalProps {
  onClose: () => void;
  session_outcome: any;
  session_guid: any;
}

export default function OutcomeModal({ onClose, session_outcome, session_guid }: OutcomeModalProps) {
  const dragControls = useDragControls();
  const router = useRouter();
  const isSuccess = session_outcome === "Success" || session_outcome === "SUCCESS";

  const handleDashboardRedirect = () => {
    router.push("/");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[9999] backdrop-blur-sm">
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative p-8 rounded-2xl w-[90%] max-w-md shadow-2xl text-white flex flex-col items-center space-y-6"
        style={{
          background: isSuccess
            ? "linear-gradient(135deg, #22c55e, #16a34a)"
            : "linear-gradient(135deg, #ef4444, #b91c1c)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-semibold tracking-wide">
            {isSuccess ? "Congratulations!" : "Session Ended"}
          </h2>
          <button
            onClick={onClose}
            className="text-white text-2xl leading-none hover:text-gray-200 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Icon */}
        <div className="flex flex-col items-center">
          {isSuccess ? (
            <FaCheckCircle className="text-6xl text-white mb-4" />
          ) : (
            <FaTimesCircle className="text-6xl text-white mb-4" />
          )}
          <p className="text-center text-lg font-medium">
            {isSuccess
              ? "The conversation was successful! 🎉"
              : "The session has ended with a failed outcome. Please try again or review your responses."}
          </p>
          <p className="text-sm mt-2 opacity-80">Session ID: {session_guid}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-white text-black font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDashboardRedirect}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
