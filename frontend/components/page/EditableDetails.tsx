import { Node } from "@/utils/types";
const EditableDetails = ({ selectedNodes }: { selectedNodes: Node[] }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold">
        Title: {selectedNodes[0]?.data.label ?? ""}
      </h1>
    </div>
  );
};

export default EditableDetails;
