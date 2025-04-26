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

interface Section {
  name: string;
  description: string;
  id: string;
  isActive: boolean;
  questions: Question[];
  order: number;
}

interface Question {
  id: string;
  text: string;
  type: "text" | "multiple choice" | "single choice" | "scale";
  options: string[] | null;
  order: number;
}

interface Node {
  id: string;
  data: {
    label: string;
    description?: string;
    questions?: Question[];
    type?: "section" | "question";
    options?: string[];
    order?: number;
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
