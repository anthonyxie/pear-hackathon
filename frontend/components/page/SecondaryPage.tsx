import FlowContent from "@/components/page/Flow";
import {
  getEdgesFromSurvey,
  getLayoutedElements,
  getNodesFromSurvey,
} from "@/utils/utils";
import { ReactFlowProvider, useEdgesState, useNodesState } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import { Edge, Node, Survey } from "@/utils/types";
import EditableDetails from "@/components/page/EditableDetails";

// const PLACEHOLDER_NODES = [
//   {
//     id: "1",
//     position: { x: 0, y: 0 },
//     data: { label: "Screener" },
//   },
//   {
//     id: "2",
//     position: { x: 0, y: 0 },
//     data: { label: "Awareness" },
//   },
//   {
//     id: "2a",
//     position: { x: 0, y: 0 },
//     data: { label: "BIG" },
//   },
//   {
//     id: "3",
//     position: { x: 0, y: 0 },
//     data: { label: "Usage" },
//   },
//   {
//     id: "4",
//     position: { x: 0, y: 0 },
//     data: { label: "Customer Voice" },
//   },
// ];

// const PLACEHOLDER_EDGES = [
//   { id: "e1", source: "1", target: "2" },
//   { id: "e2", source: "2", target: "2a" },
//   { id: "e3", source: "1", target: "3" },
//   { id: "e4", source: "3", target: "4" },
// ];

export default function SecondaryPage({ survey }: { survey: Survey | null }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  useEffect(() => {
    if (survey) {
      const { nodes, edges } = getLayoutedElements(
        getNodesFromSurvey(survey),
        getEdgesFromSurvey(survey),
        { direction: "TB" }
      );
      setNodes(nodes);
      setEdges(edges);
    }
  }, [survey, setNodes, setEdges]);

  if (!survey) {
    return null;
  }

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
          {selectedNodes.length > 0 ? (
            <EditableDetails selectedNodes={selectedNodes} />
          ) : null}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
