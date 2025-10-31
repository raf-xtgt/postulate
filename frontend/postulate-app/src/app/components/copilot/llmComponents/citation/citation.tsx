"use client";

import { useStateController } from '@/app/context/stateController';
import CitationCard from './citationCard';
import { FaQuoteLeft } from 'react-icons/fa';

export default function Citation() {
    const { citations } = useStateController();

    return (
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
            {citations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
                    <FaQuoteLeft className="text-4xl text-indigo-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No citations yet</h3>
                    <p className="text-sm">Highlight text in the editor to add one.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {citations?.map((citation, idx) => (
                        <CitationCard
                            key={`citation-${idx}`}
                            citation={citation}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
