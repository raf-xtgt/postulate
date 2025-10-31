"use client";

import { useState, useRef } from 'react';
import { useStateController } from '@/app/context/stateController';
import { CitationModel } from '@/app/models/citation';

export default function Editor() {
    const { addCitation } = useStateController();
    const editorRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<{ top: number, left: number, visible: boolean }>({ top: 0, left: 0, visible: false });
    const [selectedText, setSelectedText] = useState("");

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

    const formatDoc = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Writing Editor</h1>
            <div className="bg-white rounded-lg shadow-md flex-grow flex flex-col">
                <div className="border-b p-2 flex items-center gap-2">
                    <button onClick={() => formatDoc('bold')} className="px-2 py-1 border rounded font-bold">B</button>
                    <button onClick={() => formatDoc('formatBlock', '<h1>')} className="px-2 py-1 border rounded">H1</button>
                    <button onClick={() => formatDoc('formatBlock', '<h2>')} className="px-2 py-1 border rounded">H2</button>
                    <button onClick={() => formatDoc('formatBlock', '<h3>')} className="px-2 py-1 border rounded">H3</button>
                    <button onClick={() => formatDoc('backColor', 'yellow')} className="px-2 py-1 border rounded bg-yellow-200">Highlight</button>
                </div>
                <div
                    ref={editorRef}
                    contentEditable={true}
                    onMouseUp={handleMouseUp}
                    className="flex-grow p-2 focus:outline-none"
                    suppressContentEditableWarning={true}
                >
                    Start writing your document here...
                </div>
                {tooltip.visible && (
                    <div
                        className="absolute bg-black text-white text-xs rounded py-1 px-2 z-10"
                        style={{ top: tooltip.top, left: tooltip.left }}
                    >
                        <button onClick={handleSearchCitations}>Search Citations</button>
                    </div>
                )}
            </div>
        </div>
    );
}
