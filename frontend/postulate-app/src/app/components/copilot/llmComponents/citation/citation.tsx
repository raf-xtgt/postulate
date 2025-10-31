"use client";

import { useStateController } from '@/app/context/stateController';
import CitationCard from './citationCard';

export default function Citation() {
    const { citations } = useStateController();

    return (
        <div className="flex-1 overflow-auto p-4">
            {citations.length === 0 && <div className="text-sm text-gray-500">No citations yet. Highlight text in the editor to add one.</div>}
            <div className="space-y-4">
              {citations?.map((citation, idx) => (
                <CitationCard
                  key={`citation-${idx}`}
                  citation={citation}
                />
              ))}
            </div>
       </div>
    );
}
