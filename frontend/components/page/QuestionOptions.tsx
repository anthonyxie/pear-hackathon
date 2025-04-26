import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, TrashIcon, CheckIcon, XIcon, PencilIcon } from "lucide-react";

interface QuestionOptionsProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
}

export default function QuestionOptions({ options, onOptionsChange }: QuestionOptionsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleAddOption = () => {
    onOptionsChange([...options, "New option"]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onOptionsChange(newOptions);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditText(options[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      const newOptions = [...options];
      newOptions[editingIndex] = editText;
      onOptionsChange(newOptions);
      setEditingIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  return (
    <div className="space-y-2 mt-4">
      <div className="text-sm font-medium mb-2">Options:</div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            {editingIndex === index ? (
              <>
                <Input 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={saveEdit}>
                    <CheckIcon className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    <XIcon className="w-3 h-3" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 px-3 py-2 border rounded-md text-sm">{option}</div>
                <Button size="sm" variant="ghost" onClick={() => startEditing(index)}>
                  <PencilIcon className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleRemoveOption(index)}>
                  <TrashIcon className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleAddOption} 
        className="mt-2"
      >
        <PlusIcon className="w-4 h-4 mr-1" />
        Add Option
      </Button>
    </div>
  );
}