import FlowContent from "@/components/page/Flow";
import {
  getEdgesFromSurvey,
  getLayoutedElements,
  getNodesFromSurvey,
} from "@/utils/utils";
import { ReactFlowProvider, useEdgesState, useNodesState } from "@xyflow/react";
import { useEffect, useState } from "react";
import { Edge, Node, Question, Survey } from "@/utils/types";
import EditableDetails from "@/components/page/EditableDetails";
import { Model, Survey as SurveyJSType } from "survey-react-ui";
import { useRouter } from "next/navigation";
import convertToSurveyJS from "@/utils/convert";

export default function SecondaryPage({
  survey,
  setPage,
  setSurveyModel,
}: {
  survey: Survey | null;
  setPage: (page: number) => void;
  setSurveyModel: (surveyModel: SurveyJSType) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  const selectedNode = nodes.find((node) => selectedNodes.includes(node.id));
  console.log(selectedNode);
  console.log(selectedNodes);
  const router = useRouter();

  const handleTestSurvey = async () => {
    if (survey) {
      const newSurvey = {
        ...survey,
        sections: nodes.map((node) => node.data.section),
      };
      const surveyJson = convertToSurveyJS(newSurvey);
      const surveyModel = new Model(surveyJson);
      setSurveyModel(surveyModel);
      setPage(2);
    }
  };

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

  const handleUpdateQuestion = (question: Question) => {
    const updatedNodes = nodes.map((node) => {
      if (node.data.section?.questions.find((q) => q.id === question.id)) {
        return {
          ...node,
          data: {
            ...node.data,
            section: {
              ...node.data.section,
              questions: node.data.section?.questions.map((q) =>
                q.id === question.id ? question : q
              ),
            },
          },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const handleAddQuestion = (nodeId: string, question: Question) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        const newQuestion = {
          ...question,
          order: (node.data.section?.questions.length || 0) + 1,
        };
        return {
          ...node,
          data: {
            ...node.data,
            ...(node.data.section && {
              section: {
                ...node.data.section,
                questions: [
                  ...(node.data.section?.questions || []),
                  newQuestion,
                ],
              },
            }),
          },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  const handleDeleteQuestion = (id: string) => {
    const updatedNodes = nodes.map((node) => {
      const newQuestions = node.data.section?.questions.filter(
        (q) => q.id !== id
      );
      if (node.data.section?.questions.find((q) => q.id === id)) {
        return {
          ...node,
          data: {
            ...node.data,
            section: {
              ...node.data.section,
              questions:
                newQuestions?.map((q, index) => ({
                  ...q,
                  order: index + 1,
                })) ?? [],
            },
          },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  console.log(nodes);

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
            <EditableDetails
              selectedNode={selectedNode}
              handleUpdateQuestion={handleUpdateQuestion}
              handleAddQuestion={handleAddQuestion}
              handleDeleteQuestion={handleDeleteQuestion}
            />
          ) : null}
        </div>
      </div>
      <div className="absolute bottom-5 right-16 flex gap-2">
        <button onClick={handleTestSurvey}>Test Survey</button>
      </div>
    </ReactFlowProvider>
  );
}
