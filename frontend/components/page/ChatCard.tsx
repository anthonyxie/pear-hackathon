"use client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
export default function ChatPage({
  setPage,
}: {
  setPage: (page: string) => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //simulate 5 second loading
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setLoading(false);
    setPage("secondary");
  };

  return (
    <Card className="w-8/10 min-w-100 h-100 flex flex-col p-4 shadow-lg">
      <form
        onSubmit={handleSubmit}
        className="flex-col flex-3 flex gap-4 items-center"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="h-full"
        />
        <Button
          type="submit"
          className="w-full"
          disabled={loading || input.length === 0}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
        </Button>
      </form>
    </Card>
  );
}
