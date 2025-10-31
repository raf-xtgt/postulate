"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaRobot } from "react-icons/fa";
import { useStateController } from "@/app/context/stateController";
import Pitfall from "./pitfall/pitfall";
import Citation from "./citation/citation";


export default function LlmMain() {
  const { docText } = useStateController();


  return (
    <div className="h-full flex flex-col bg-white">
      
      <div className="border-b">
        <div className="p-4 flex items-center">
            <FaRobot className="text-blue-600 mr-2" />
            <h2 className="font-semibold text-lg">Pitfalls</h2>
        </div>
        <Pitfall></Pitfall>
      </div>

      <div className="border-b">
        <div className="p-4 flex items-center">
          <FaRobot className="text-blue-600 mr-2" />
          <h2 className="font-semibold text-lg">Citations</h2>
        </div>
        <Citation />
      </div>
    </div>
  );
}
