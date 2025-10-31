"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaRobot } from "react-icons/fa";
import { useStateController } from "@/app/context/stateController";
import Pitfall from "./pitfall/pitfall";


export default function LlmMain() {
  const { docText } = useStateController();


  return (
    <div className="h-full flex flex-col bg-white">
      
      <div className="border-b">
        <FaRobot className="text-blue-600 mr-2" />
        <h2 className="font-semibold text-lg">Pitfalls</h2>
        <Pitfall></Pitfall>
      </div>

      <div className="p-4 border-b flex items-center">
        <div className="flex items-center">
          <FaRobot className="text-blue-600 mr-2" />
          <h2 className="font-semibold text-lg">Citations</h2>
        </div>
      </div>
    </div>
  );
}
