"use client";

import { useStateController } from '@/app/context/stateController';
import CitationCard from './citationCard';
import { FaQuoteLeft } from 'react-icons/fa';
import { CitationResultModel } from '@/app/models/citationResult';

export default function Citation() {
    const { citationResults, citationResultsLoading } = useStateController();

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gray-50">
            {citationResultsLoading && (
                <div className="flex flex-col justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-gray-600">Searching for citations...</p>
                </div>
            )}

            {!citationResultsLoading && citationResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
                    <FaQuoteLeft className="text-4xl text-indigo-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No citations yet</h3>
                    <p className="text-sm">Highlight text in the editor and click "Search Citations".</p>
                </div>
            ) : !citationResultsLoading && (
                <div className="space-y-4">
                    {citationResults?.map((citation: CitationResultModel, idx) => (
                        <CitationCard
                            key={citation.guid}
                            citation={citation}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
