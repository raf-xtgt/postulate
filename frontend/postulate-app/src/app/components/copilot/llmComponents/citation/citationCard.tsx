import { CitationModel } from "@/app/models/citation";
import { FaQuoteLeft, FaLink } from 'react-icons/fa';

interface CitationCardProps {
    citation: CitationModel;
}

export default function CitationCard({ citation }: CitationCardProps) {
    return (
        <div className="bg-white shadow-lg rounded-xl p-5 border border-gray-200 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-start gap-3">
                <div className="mt-1 text-indigo-500">
                    <FaQuoteLeft />
                </div>
                <div className="flex-1">
                    <div className="font-bold text-lg mb-2 text-gray-800 flex items-center gap-2">
                        <span>Citation</span>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            {citation.guid.substring(0, 8)}
                        </span>
                    </div>
                    <p className="text-gray-700 mb-3 text-base">{citation.title}</p>
                    {citation.source && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <FaLink className="text-indigo-500" />
                            <span className="italic">
                                Source: <span className="font-medium">{citation.source}</span>
                            </span>
                        </div>
                    )}
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Added: {new Date(citation.created_date).toLocaleDateString()}
                        <span className="ml-2">
                            {new Date(citation.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}