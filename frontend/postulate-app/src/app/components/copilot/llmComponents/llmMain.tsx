"use client";

import { useEffect } from 'react';
import Citation from './citation/citation';

export default function LlmMain() {
   
    useEffect(() => {
    }, []);

      return (
        <div>
            <h1 className="text-2xl font-bold mb-4">llm Main</h1>
            <Citation></Citation>

       </div>
        
      );
  }