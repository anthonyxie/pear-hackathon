import { Node } from "@/utils/types";
const EditableDetails = ({ selectedNodes }: { selectedNodes: Node[] }) => {
  const node = selectedNodes[0];
  const { label, description, questions } = node.data;
  return (
    <div>
      <h1 className="text-2xl font-bold">Title: {label}</h1>
      <p className="text-sm text-muted-foreground">
        Description: {description}
      </p>
      <div className="flex flex-col gap-2">
        {questions?.map((question) => (
          <p key={question.id}>{question.text}</p>
        ))}
      </div>
    </div>
  );
};

export default EditableDetails;
