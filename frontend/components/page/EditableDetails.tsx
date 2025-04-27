import { Node, Question } from "@/utils/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QuestionOptions from "./QuestionOptions";

const EditableDetails = ({
  selectedNode,
  handleUpdateQuestion,
  handleAddQuestion,
  handleDeleteQuestion,
}: {
  selectedNode?: Node;
  handleUpdateQuestion: (question: Question) => void;
  handleAddQuestion: (nodeId: string, question: Question) => void;
  handleDeleteQuestion: (id: string) => void;
}) => {
  if (!selectedNode) {
    return null;
  }
  const { data } = selectedNode;
  const { label, section } = data;
  if (!section) {
    return null;
  }
  const { id: sectionId, description, questions } = section;

  const generateNewQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      text: "Question Title",
      type: "text",
      options: null,
      required: false,
      order: -1,
    };
    handleAddQuestion(sectionId, newQuestion);
  };

  const handleAddQuestionClick = () => {
    generateNewQuestion();
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{label}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium mb-4">
            Questions ({questions?.length})
          </h3>

          <ScrollArea className="rounded-md border p-4">
            <div className="space-y-4 max-h-[60vh]">
              {questions?.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  handleUpdateQuestion={handleUpdateQuestion}
                  handleDeleteQuestion={handleDeleteQuestion}
                />
              ))}
              <div className="flex justify-center w-full">
                <Button variant="outline" onClick={handleAddQuestionClick}>
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

function QuestionCard({
  question,
  handleUpdateQuestion,
  handleDeleteQuestion,
}: {
  question: Question;
  handleUpdateQuestion: (question: Question) => void;
  handleDeleteQuestion: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(question.text);

  const handleEditFinish = () => {
    handleUpdateQuestion({ ...question, text });
    setIsEditing(false);
  };

  const handleEditQuestionType = (type: string) => {
    const typeValue = type as
      | "text"
      | "multiple choice"
      | "single choice"
      | "scale";
    const newOptions =
      (typeValue === "multiple choice" || typeValue === "single choice") &&
      !question.options
        ? ["Option 1"]
        : question.options;

    handleUpdateQuestion({
      ...question,
      type: typeValue,
      options: newOptions,
    });
  };

  const handleEditRequired = (required: boolean) => {
    handleUpdateQuestion({
      ...question,
      required,
    });
  };

  const handleOptionsChange = (newOptions: string[]) => {
    handleUpdateQuestion({
      ...question,
      options: newOptions,
    });
  };

  return (
    <Card className="py-4 max-w-full">
      <div className="flex justify-between items-center px-4 ">
        <div className="text-base font-medium flex items-center">
          <span>{question?.order}. </span>
          {isEditing ? (
            <Textarea
              style={{ fontSize: "1rem" }}
              className="min-h-[24px] w-full bg-transparent shadow-none border-b border-dashed border-gray-300  focus:outline-none resize-none focus:outline-none px-2 text-base font-medium"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <span className="cursor-pointer px-2 py-2 ">{question?.text}</span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge variant="outline">{question?.type}</Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleEditQuestionType("text")}>
                Text
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditQuestionType("multiple choice")}
              >
                Multiple Choice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditQuestionType("single choice")}
              >
                Single Choice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditQuestionType("scale")}>
                Scale
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Badge
            variant={question.required ? "destructive" : "default"}
            onClick={() => handleEditRequired(!question.required)}
          >
            {question.required ? "Required" : "Optional"}
          </Badge>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="ml-2"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-0.5">
              <Button variant="ghost" onClick={handleEditFinish}>
                <CheckIcon className="w-3 h-3" />
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                <XIcon className="w-3 h-3" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteQuestion(question.id)}
          >
            <TrashIcon className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {(question?.type === "multiple choice" ||
        question?.type === "single choice") &&
        question.options && (
          <CardContent className="-mt-4">
            <QuestionOptions
              title={"Options"}
              options={question.options}
              onOptionsChange={handleOptionsChange}
            />
          </CardContent>
        )}
    </Card>
  );
}

export default EditableDetails;
