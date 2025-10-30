"use client";

import React from "react";
import { motion, useDragControls } from "framer-motion";
import { useState, useEffect, useMemo } from 'react';
import { SessionService } from '@/app/services/sessionService';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge, ReactFlowProvider, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

interface SessionFlow {
  onClose: () => void;
  sessionGuid: any;
}

const CustomNode = ({ data }: { data: any }) => {
    const [isTooltipVisible, setTooltipVisible] = useState(false);
  
    return (
      <div
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        style={{
          background: data.color,
          color: 'black',
          borderRadius: '50%',
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
        <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
        {isTooltipVisible && (
          <div style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            zIndex: 100,
            width: '250px',
            textAlign: 'center',
            fontSize: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {data.label}
          </div>
        )}
      </div>
    );
  };

export default function WrappedFlow({ onClose, sessionGuid }: SessionFlow) {
    const [sessionConvFlow, setSessionConvFlow] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const dragControls = useDragControls();

    useEffect(() => {
        const fetchConversationFlow = async () => {
            try {
                const flowResp = await SessionService.getSessionConversationFlow(sessionGuid);
                setSessionConvFlow(flowResp);
            } catch (err) {
                setError('Failed to load session conversation flow');
                console.error(err);
            }
        };

        if (sessionGuid) {
            fetchConversationFlow();
        }
    }, [sessionGuid]);

    const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

    const { nodes, edges } = useMemo(() => {
        if (!sessionConvFlow || sessionConvFlow.length === 0) {
            return { nodes: [], edges: [] };
        }

        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];
        const nodeSpacingX = 250;
        const nodeSpacingY = 200;
        const maxWidth = 1500; // Max width before wrapping
        const branchGap = 100;

        // Sort by branch level, then by ID to ensure a consistent layout
        const sortedFlow = [...sessionConvFlow].sort((a, b) => {
            if (a.branch_level !== b.branch_level) {
                return a.branch_level - b.branch_level;
            }
            return a.id - b.id;
        });

        const branchLayouts: { [key: number]: { yStart: number, nodesInBranch: any[] } } = {};
        let currentY = 0;

        const branchLevels = [...new Set(sortedFlow.map(n => n.branch_level))].sort((a, b) => a - b);

        branchLevels.forEach(level => {
            const nodesInBranch = sortedFlow.filter(n => n.branch_level === level);
            const nodesPerRow = Math.floor(maxWidth / nodeSpacingX);
            const numRows = Math.ceil(nodesInBranch.length / nodesPerRow);

            branchLayouts[level] = {
                yStart: currentY,
                nodesInBranch: nodesInBranch
            };

            currentY += numRows * nodeSpacingY + branchGap;
        });

        sortedFlow.forEach(item => {
            const branchLayout = branchLayouts[item.branch_level];
            const indexInBranch = branchLayout.nodesInBranch.findIndex(n => n.id === item.id);
            
            const nodesPerRow = Math.floor(maxWidth / nodeSpacingX);
            const col = indexInBranch % nodesPerRow;
            const row = Math.floor(indexInBranch / nodesPerRow);

            const x = col * nodeSpacingX;
            const y = branchLayout.yStart + row * nodeSpacingY;

            initialNodes.push({
                id: item.id.toString(),
                type: 'customNode',
                position: { x, y },
                data: {
                    label: item.label,
                    color: item.role === 'salesman' ? '#2E7D32' : '#FFC107'
                },
            });

            if (item.target_ids) {
                item.target_ids.forEach((target_id: number) => {
                    initialEdges.push({
                        id: `e-${item.id}-${target_id}`,
                        source: item.id.toString(),
                        target: target_id.toString(),
                        animated: true,
                        style: { stroke: item.arrow_color || 'black' },
                    });
                });
            }
        });

        return { nodes: initialNodes, edges: initialEdges };
    }, [sessionConvFlow]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[9999]">
            <motion.div
                drag
                dragListener={false}
                dragControls={dragControls}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="relative p-6 rounded-2xl w-[90%] h-[90%] max-w-7xl shadow-2xl flex flex-col space-y-4 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white"
            >
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="flex justify-between items-center border-b border-gray-600 pb-2 cursor-move"
                >
                    <h2 className="text-lg font-semibold tracking-wide">Conversation Flow</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
                    >
                        &times;
                    </button>
                </div>

                <div className="flex-grow w-full h-full">
                    {error && <div className="text-red-500 p-4">{error}</div>}
                    <ReactFlowProvider>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            fitView
                            className="bg-gray-800"
                        >
                            <Controls />
                            <MiniMap nodeColor={(node: Node) => node.data.color} />
                            <Background gap={16} color="#4A4A4A" />
                        </ReactFlow>
                    </ReactFlowProvider>
                </div>
            </motion.div>
        </div>
    );
}
