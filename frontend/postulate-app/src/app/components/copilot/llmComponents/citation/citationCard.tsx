import { CitationResultModel } from "@/app/models/citationResult";
import { FaQuoteLeft, FaBook, FaUsers, FaCalendar, FaMapMarkerAlt, FaStar, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useState } from 'react';

interface CitationCardProps {
    citation: CitationResultModel;
}

export default function CitationCard({ citation }: CitationCardProps) {
    const [expanded, setExpanded] = useState(false);

    const getRelevanceColor = (score: number | null) => {
        if (!score) return 'text-gray-600';
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-orange-600';
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <button
                aria-expanded={expanded}
                onClick={() => setExpanded((s) => !s)}
                className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                        <FaQuoteLeft className="text-indigo-600" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 truncate">
                            {citation.paper_title || 'Untitled Paper'}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                            {citation.paper_authors && (
                                <span className="flex items-center gap-1 truncate">
                                    <FaUsers className="text-indigo-500 flex-shrink-0" />
                                    <span className="truncate">{citation.paper_authors}</span>
                                </span>
                            )}
                            {citation.paper_year && (
                                <span className="flex items-center gap-1 flex-shrink-0">
                                    <FaCalendar className="text-indigo-500" />
                                    {citation.paper_year}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {citation.relevance_score !== null && (
                        <div className="flex items-center gap-1">
                            <FaStar className={getRelevanceColor(citation.relevance_score)} />
                            <span className={`text-sm font-bold ${getRelevanceColor(citation.relevance_score)}`}>
                                {(citation.relevance_score * 100).toFixed(0)}%
                            </span>
                        </div>
                    )}
                    {expanded ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
                </div>
            </button>

            {expanded && (
                <div className="p-5 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-4">
                        {/* Venue Information */}
                        {citation.paper_venue && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaMapMarkerAlt className="text-indigo-500 flex-shrink-0" />
                                <span className="italic">{citation.paper_venue}</span>
                            </div>
                        )}

                        {/* Paragraph Text */}
                        {citation.paragraph_text && (
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Relevant Excerpt</h4>
                                <p className="text-sm text-gray-700 italic">"{citation.paragraph_text}"</p>
                            </div>
                        )}

                        {/* Context Summary */}
                        {citation.context_summary && (
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <h4 className="text-xs font-bold text-indigo-700 uppercase mb-2">Context Summary</h4>
                                <p className="text-sm text-gray-700">{citation.context_summary}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide pt-3 border-t border-gray-200">
                            <span className="flex items-center gap-1">
                                <FaBook className="text-indigo-400" />
                                Citation #{citation.guid.substring(0, 8)}
                            </span>
                            <span>
                                Added: {new Date(citation.created_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}