import { CitationModel } from "@/app/models/citation";

interface CitationCardProps {
    citation: CitationModel;
}

export default function CitationCard({ citation }: CitationCardProps) {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
            <div className="font-bold text-lg mb-2 text-blue-600">Citation</div>
            <p className="text-gray-700 mb-2">{citation.title}</p>
            {citation.source && (
                <div className="text-sm text-gray-500 italic">
                    Source: {citation.source}
                </div>
            )}
            <div className="text-xs text-gray-400 mt-2">
                Added: {new Date(citation.created_date).toLocaleString()}
            </div>
        </div>
    );
}