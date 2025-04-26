import FlowContent from "@/components/page/Flow";
import { getLayoutedElements } from "@/utils/utils";
import { ReactFlowProvider, useEdgesState, useNodesState } from "@xyflow/react";
import { useState } from "react";
import { Node } from "@/utils/types";

const PLACEHOLDER_NODES = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "Screener" },
    selected: true,
  },
  {
    id: "2",
    position: { x: 0, y: 0 },
    data: { label: "Awareness" },
  },
  {
    id: "2a",
    position: { x: 0, y: 0 },
    data: { label: "BIG" },
  },
  {
    id: "3",
    position: { x: 0, y: 0 },
    data: { label: "Usage" },
  },
  {
    id: "4",
    position: { x: 0, y: 0 },
    data: { label: "Customer Voice" },
  },
];

const PLACEHOLDER_EDGES = [
  { id: "e1", source: "1", target: "2" },
  { id: "e2", source: "2", target: "2a" },
  { id: "e3", source: "1", target: "3" },
  { id: "e4", source: "3", target: "4" },
];

// This is the inner component that uses the ReactFlow hooks

const { nodes: INITIAL_NODES, edges: INITIAL_EDGES } = getLayoutedElements(
  PLACEHOLDER_NODES,
  PLACEHOLDER_EDGES,
  { direction: "TB" }
);

const PLACEHOLDER_CONTENT: Record<string, string> = {
  "1": "Description of 1",
  "2": "Description of 2",
  "2a": "Description of 2a",
  "3": "Description of 3",
  "4": "Description of 4",
};

export default function SecondaryPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  return (
    <ReactFlowProvider>
      <div className="w-full h-full grid grid-cols-5">
        <div className="col-span-2 h-full rounded-r-lg border-2 border-border bg-card overflow-hidden">
          <div className="h-[calc(100%+14px)] w-full">
            <FlowContent
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              selectedNodes={selectedNodes}
              setSelectedNodes={setSelectedNodes}
            />
          </div>
        </div>
        <div className="col-span-3 h-full bg-background p-4">
          <h1 className="text-2xl font-bold">
            Title: {selectedNodes[0]?.data.label ?? ""}
          </h1>
          <p className="mt-2">
            {PLACEHOLDER_CONTENT?.[selectedNodes[0]?.id] ?? ""}
          </p>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
