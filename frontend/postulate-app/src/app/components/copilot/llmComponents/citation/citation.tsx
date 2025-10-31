"use client";

import { useState, useEffect } from 'react';

export default function Citation() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load Sessions on component mount
    useEffect(() => {
    }, []);

      return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Citation</h1>

       </div>
        
      );
  }