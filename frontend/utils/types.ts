interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Node {
  id: string;
  data: {
    label: string;
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

export type { Message, Node, Edge };
