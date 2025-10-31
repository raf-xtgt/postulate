"use client";

import { useState, useEffect } from 'react';

export default function Editor() {
    const [docText, setDocText] = useState("");

    // Load Sessions on component mount
    useEffect(() => {
    }, []);

      return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Writing Editor</h1>

       </div>
        
      );
  }