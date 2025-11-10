import { CitationResultModel } from "@/app/models/citationResult";
import { FaQuoteLeft, FaBook, FaUsers, FaCalendar, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

interface CitationCardProps {
    citation: CitationResultModel;
}

export default function CitationCard({ citation }: CitationCardProps) {
    const getRelevanceColor = (score: number | null) => {
        if (!score) return 'text-gray-600';
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-orange-600';
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-5 border border-gray-200 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-start gap-3">
                <div className="mt-1 text-indigo-500">
                    <FaQuoteLeft />
                </div>
                <div className="flex-1">
                    {/* Header with Title and Relevance Score */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">
                                {citation.paper_title || 'Untitled Paper'}
                            </h3>
                        </div>
                        {citation.relevance_score !== null && (
                            <div className="flex items-center gap-1 ml-3">
                                <FaStar className={getRelevanceColor(citation.relevance_score)} />
                                <span className={`text-sm font-bold ${getRelevanceColor(citation.relevance_score)}`}>
                                    {(citation.relevance_score * 100).toFixed(0)}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Paper Metadata */}
                    <div className="space-y-2 mb-3">
                        {citation.paper_authors && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaUsers className="text-indigo-500 flex-shrink-0" />
                                <span className="italic">{citation.paper_authors}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            {citation.paper_year && (
                                <div className="flex items-center gap-1">
                                    <FaCalendar className="text-indigo-500" />
                                    <span>{citation.paper_year}</span>
                                </div>
                            )}
                            {citation.paper_venue && (
                                <div className="flex items-center gap-1">
                                    <FaMapMarkerAlt className="text-indigo-500" />
                                    <span className="italic">{citation.paper_venue}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Paragraph Text */}
                    {citation.paragraph_text && (
                        <div className="p-3 bg-gray-50 rounded-lg mb-3">
                            <p className="text-sm text-gray-700 italic">"{citation.paragraph_text}"</p>
                        </div>
                    )}

                    {/* Context Summary */}
                    {citation.context_summary && (
                        <div className="p-3 bg-indigo-50 rounded-lg mb-3 border border-indigo-100">
                            <p className="text-sm text-gray-700">{citation.context_summary}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide pt-2 border-t border-gray-100">
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
        </div>
    );
}