"use client";

import { useState, useRef } from 'react';
import { useStateController } from '@/app/context/stateController';
import { CitationModel } from '@/app/models/citation';
import { InferenceService } from '@/app/services/inferenceService';
import { FaBold, FaSearchengin, FaHighlighter, FaSearch, FaSave } from 'react-icons/fa';

export default function Editor() {
    const { addCitation, currentSessionGuid, addPitfall, setPitfallsLoading } = useStateController();
    const editorRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<{ top: number, left: number, visible: boolean }>({ top: 0, left: 0, visible: false });
    const [selectedText, setSelectedText] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim() !== "") {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectedText(selection.toString());
            setTooltip({
                top: rect.top - 40, // Position tooltip above selection
                left: rect.left + (rect.width / 2) - 50, // Center tooltip
                visible: true
            });
        } else {
            setTooltip({ ...tooltip, visible: false });
        }
    };

    const handleSearchCitations = () => {
        const newCitation: CitationModel = {
            guid: `cit-${Date.now()}`,
            title: selectedText,
            source: 'From Editor',
            created_date: new Date().toISOString()
        };
        addCitation(newCitation);
        setTooltip({ ...tooltip, visible: false });
    };

    const handleValueCapture = () => {
        console.log("handleValueCapture")
    };

    const handleSaveDraft = async () => {
        if (!currentSessionGuid) {
            setSaveError("Please select a session first");
            setTimeout(() => setSaveError(null), 3000);
            return;
        }

        const draftText = editorRef.current?.innerText || "";
        if (!draftText.trim()) {
            setSaveError("Draft is empty");
            setTimeout(() => setSaveError(null), 3000);
            return;
        }

        try {
            setSaving(true);
            setSaveError(null);
            setSaveSuccess(false);
            setPitfallsLoading(true);

            const pitfallData = await InferenceService.triggerPitfall({
                draft_paper: draftText,
                session_guid: currentSessionGuid,
            });

            addPitfall(pitfallData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving draft:", error);
            setSaveError("Failed to analyze draft");
            setTimeout(() => setSaveError(null), 3000);
        } finally {
            setSaving(false);
            setPitfallsLoading(false);
        }
    };

    const formatDoc = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    return (
        <div className="p-4 h-full flex flex-col bg-gray-50 rounded-xl">
            <div className="mb-3 flex justify-between items-center ">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Writing Editor</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSaveDraft()}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Save Draft">
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <FaSave /> Save Draft
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleValueCapture()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        aria-label="Capture Impact Points">
                        <FaSearchengin /> Capture Impact Points
                    </button>
                </div>
            </div>
            
            {/* Success/Error Messages */}
            {saveSuccess && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    Draft analyzed successfully!
                </div>
            )}
            {saveError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {saveError}
                </div>
            )}
            <div className="bg-white rounded-xl shadow-lg flex-grow flex flex-col border border-gray-200">
                <div className="border-b border-gray-200 p-3 flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => formatDoc('bold')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                        aria-label="Bold"
                        title="Bold"
                    >
                        <FaBold className="text-gray-700" />
                    </button>
                    <button
                        onClick={() => formatDoc('formatBlock', '<h1>')}
                        className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-bold text-sm"
                        title="Heading 1"
                    >
                        H1
                    </button>
                    <button
                        onClick={() => formatDoc('formatBlock', '<h2>')}
                        className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-bold text-sm"
                        title="Heading 2"
                    >
                        H2
                    </button>
                    <button
                        onClick={() => formatDoc('formatBlock', '<h3>')}
                        className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-bold text-sm"
                        title="Heading 3"
                    >
                        H3
                    </button>
                    <button
                        onClick={() => formatDoc('backColor', 'yellow')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                        aria-label="Highlight"
                        title="Highlight"
                    >
                        <FaHighlighter className="text-yellow-500" />
                    </button>
                </div>
                <div
                    ref={editorRef}
                    contentEditable={true}
                    onMouseUp={handleMouseUp}
                    className="flex-grow p-4 focus:outline-none min-h-[300px] text-gray-700 leading-relaxed"
                    suppressContentEditableWarning={true}
                >

                </div>
                {tooltip.visible && (
                    <div
                        className="fixed bg-indigo-600 text-white text-sm rounded-lg py-2 px-3 z-50 shadow-lg flex items-center gap-2 transition-all duration-200"
                        style={{ top: tooltip.top, left: tooltip.left }}
                    >
                        <FaSearch className="text-white" />
                        <button
                            onClick={handleSearchCitations}
                            className="font-medium hover:underline"
                        >
                            Search Citations
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
