"use client";

import { motion } from "framer-motion";

interface Score {
  score: number;
}

interface ScoreSet {
  clarity_and_conciseness: Score;
  objection_handling: Score;
  persuasiveness: Score;
  rapport_building: Score;
}

interface ClientAgentInternalScore {
  justification: string;
  msg_index: number;
  outcome: string;
  scores: ScoreSet;
}

export default function ClientAgentInternalScoreCard({ scores }: { scores: ClientAgentInternalScore[] }) {
  if (!scores || scores.length === 0) {
    return (
      <div className="text-gray-400 text-center py-10">
        No scoring data available.
      </div>
    );
  }

  // Sort in descending order (latest message first)
  const sortedScores = [...scores].sort((a, b) => b.msg_index - a.msg_index);

  return (
    <div className="relative flex flex-col items-center w-full h-[500px] overflow-y-scroll scrollbar-hide p-4">
      <div className="absolute w-1 bg-gray-600 left-1/2 transform -translate-x-1/2 top-0 bottom-0 z-0" />

      {sortedScores.map((item, index) => (
        <motion.div
          key={item.msg_index}
          className="relative bg-gray-800 text-gray-100 rounded-2xl shadow-md w-80 p-4 mb-10 z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          {/* Connecting Line */}
          {index !== sortedScores.length - 1 && (
            <div className="absolute left-1/2 top-full h-10 w-[2px] bg-red-500 transform -translate-x-1/2 z-0" />
          )}
          
          <div className="text-sm leading-relaxed space-y-1">
            <p>🧠 Clarity & Conciseness: {item.scores.clarity_and_conciseness.score}/10</p>
            <p>🎯 Objection Handling: {item.scores.objection_handling.score}/10</p>
            <p>💬 Persuasiveness: {item.scores.persuasiveness.score}/10</p>
            <p>🤝 Rapport Building: {item.scores.rapport_building.score}/10</p>
          </div>

          <div className="border-t border-gray-600 mt-3 pt-2 text-xs italic text-gray-300">
            <strong>Client Justification:</strong> {item.justification}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
