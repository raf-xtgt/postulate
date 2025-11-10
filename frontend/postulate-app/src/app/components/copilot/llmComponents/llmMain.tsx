"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaRobot, FaExclamationTriangle, FaQuoteRight } from "react-icons/fa";
import { useStateController } from "@/app/context/stateController";
import Pitfall from "./pitfall/pitfall";
import Citation from "./citation/citation";


export default function LlmMain() {
  const { docText } = useStateController();

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-xl overflow-y-auto overflow-x-hidden">
      
      <div className="border-b border-gray-200 bg-white">
        <div className="p-4 flex items-center">
            <FaExclamationTriangle className="text-amber-500 mr-2 text-lg" />
            <h2 className="font-bold text-lg text-gray-800">Pitfalls Analysis</h2>
        </div>
        <Pitfall></Pitfall>
      </div>

      <div className="border-t border-gray-200 bg-white mt-4">
        <div className="p-4 flex items-center">
          <FaQuoteRight className="text-indigo-500 mr-2 text-lg" />
          <h2 className="font-bold text-lg text-gray-800">Citations</h2>
        </div>
        <Citation />
      </div>
    </div>
  );
}
