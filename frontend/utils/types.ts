interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Survey {
  createdAt: string;
  description: string;
  id: string;
  sections: Section[];
}
interface Question {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  required: boolean;
  order: number;
  termination_option?: string;
}

interface Section {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  order: number;
  questions: Question[];
}
interface Node {
  id: string;
  data: {
    label: string;
    section?: Section;
  };
  measured?: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
  selected?: boolean;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

export type { Message, Node, Edge, Survey, Section, Question };
