"use client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Survey } from "@/utils/types";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
export default function ChatPage({
  setPage,
  setSurvey,
}: {
  setPage: (page: number) => void;
  setSurvey: (survey: Survey) => void;
}) {
  const [acquiringCompany, setAcquiringCompany] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [surveyType, setSurveyType] = useState("consumer");
  const [targetAudience, setTargetAudience] = useState("");
  const [loading, setLoading] = useState(false);

  const getSurvey = async () => {
    const response = await axios.post("http://localhost:5000/api/surveys", {
      acquiringCompany,
      targetCompany,
      surveyType,
      targetAudience,
      productCategories,
    });
    const data = response.data;
    if (data.error) {
      console.error(data.error);
    } else {
      setSurvey(data);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await getSurvey();
    setLoading(false);
    setPage(1);
  };

  const isDisabled =
    loading ||
    !acquiringCompany ||
    !targetCompany ||
    !surveyType ||
    !targetAudience;

  return (
    <Card className="w-8/10 min-w-100 flex flex-col p-6 shadow-lg">
      <form className="flex-col flex flex-1 gap-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="acquiringCompany"
              className="block text-sm font-medium mb-1"
            >
              Acquiring Company
            </label>
            <Input
              id="acquiringCompany"
              value={acquiringCompany}
              onChange={(e) => setAcquiringCompany(e.target.value)}
              placeholder="Enter acquiring company name"
              className="w-full"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="targetCompany"
              className="block text-sm font-medium mb-1"
            >
              Target Company
            </label>
            <Input
              id="targetCompany"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="Enter target company name"
              className="w-full"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="surveyType"
              className="block text-sm font-medium mb-1"
            >
              Survey Type
            </label>
            <select
              id="surveyType"
              value={surveyType}
              onChange={(e) => setSurveyType(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="consumer">Consumer</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="targetAudience"
              className="block text-sm font-medium mb-1"
            >
              Target Audience
            </label>
            <Textarea
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Enter target audience"
              className="w-full resize-none"
              required
              draggable={false}
            />
          </div>
        </div>

        <Button
          type="submit"
          onClick={handleSubmit}
          className={`w-full mt-4`}
          disabled={isDisabled}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Generate Survey
        </Button>
      </form>
    </Card>
  );
}
