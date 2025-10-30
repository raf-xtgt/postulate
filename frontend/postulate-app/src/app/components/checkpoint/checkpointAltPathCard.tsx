"use client";

import React from "react";

interface Props {
  path: any;
  pathIndex: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function CheckpointAltPathCard({ path, pathIndex, isSelected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-3 cursor-pointer flex-1 text-center ${
        isSelected ? "bg-blue-100 border-blue-500" : "bg-white"
      }`}
    >
      <div className="font-semibold">
        {path.strategy ?? "Strategy not provided"}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {path.technique_used ?? ""}
      </div>
    </div>
  );
}
