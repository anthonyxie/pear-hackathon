"use client";
import { Node } from "@/utils/types";
import {
  Background,
  Controls,
  Edge,
  OnEdgesChange,
  OnNodesChange,
  ReactFlow,
  useOnSelectionChange,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

function FlowContent({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  selectedNodes,
  setSelectedNodes,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  selectedNodes: Node[];
  setSelectedNodes: (nodes: Node[]) => void;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { fitView } = useReactFlow();

  // Prevent hydration mismatch by only rendering after mounted on client
  useEffect(() => {
    setMounted(true);
    fitView();
  }, [fitView]);

  // const onLayout = useCallback(
  //   (direction: string) => {
  //     const layouted = getLayoutedElements(nodes, edges, { direction });

  //     setNodes([...layouted.nodes]);
  //     setEdges([...layouted.edges]);

  //     window.requestAnimationFrame(() => {
  //       fitView();
  //     });
  //   },
  //   [nodes, edges, fitView, setNodes, setEdges]
  // );

  const onChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      setSelectedNodes(nodes);
    },
    [setSelectedNodes]
  );

  useOnSelectionChange({
    onChange,
  });

  console.log(selectedNodes);
  if (!mounted) {
    return null;
  }

  return (
    <ReactFlow
      colorMode={resolvedTheme === "dark" ? "dark" : "light"}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      draggable={false}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}

// This is the wrapper component that provides the ReactFlow context

export default FlowContent;
