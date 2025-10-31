"use client";

import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { PitfallModel } from "@/app/models/pitfall";
import { FaRobot } from "react-icons/fa";

interface Props {
  pitfall: PitfallModel;
  index: number;

}

export default function PitfallCard({ pitfall }: Props) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);


  return (
    <div>
        <div className="border rounded-lg p-4 bg-gray-50 relative">
        
        <button
          aria-expanded={expanded}
          onClick={() => setExpanded((s) => !s)}
          className="ml-4 p-2 rounded hover:bg-gray-100"
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>

            {expanded && (
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div>
                            <div className="font-semibold">Novelty</div>
                            <div className="text-sm font-medium mb-2"  > Score: {pitfall.novelty_score}</div>
                            <div className="text-sm font-medium mb-2"> Reason: {pitfall.novelty_reason}</div>
                        </div>
            
                        <div>
                            <div className="font-semibold">Significance</div>
                            <div className="text-sm font-medium mb-2"> Score: {pitfall.significance_meter}</div>
                            <div className="text-sm font-medium mb-2"> Reason: {pitfall.significance_reason}</div>
                        </div>
            
                        <div>
                            <div className="font-semibold">Methodology</div>
                            <div className="text-sm font-medium mb-2"> Alignment: {pitfall.methodology_alignment}</div>
                            <div className="text-sm font-medium mb-2"> Reason: {pitfall.methodology_reason}</div>
                        </div>
            
                        <div>
                            <div className="font-semibold">Contradictions</div>
                            <div className="text-sm font-medium mb-2"> Score: {pitfall.novelty_score}</div>
                            <div className="text-sm font-medium mb-2"> Reason: {pitfall.novelty_reason}</div>
                        </div>
        
            
                    </div>
            
                 </div>       
            )}
        </div>
    </div>
  );
}
