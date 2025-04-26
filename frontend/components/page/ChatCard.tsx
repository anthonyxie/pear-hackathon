"use client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Survey } from "@/utils/types";
import axios from "axios";

export default function ChatPage({
  setPage,
  setSurvey,
}: {
  setPage: (page: number) => void;
  setSurvey: (survey: Survey) => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const getSurvey = async () => {
    const response = await axios.post("http://localhost:5000/api/surveys", {
      acquiringCompany: "OpenAI",
      targetCompany: "Windsurf",
      surveyType: "consumer",
      productCategories: ["IDE", "Code Completion", "Documentation Tools"],
    });
    const data = response.data;
    if (data.error) {
      console.error(data.error);
    } else {
      setSurvey(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //simulate 5 second loading
    setLoading(true);
    await getSurvey();
    setLoading(false);
    setPage(1);
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
