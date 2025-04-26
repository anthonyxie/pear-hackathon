import FlowContent from "@/components/page/Flow";
import { getLayoutedElements } from "@/utils/utils";
import { ReactFlowProvider, useEdgesState, useNodesState } from "@xyflow/react";
import { useState } from "react";
import { Node } from "@/utils/types";
import EditableDetails from "@/components/page/EditableDetails";

const PLACEHOLDER_NODES = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "Screener" },
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
          <EditableDetails selectedNodes={selectedNodes} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
