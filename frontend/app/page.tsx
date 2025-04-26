"use client";
import InitialPage from "@/components/page/InitialPage";
import SecondaryPage from "@/components/page/SecondaryPage";
import { useState } from "react";
import { ModeToggle } from "@/components/ui/theme-button";
import TestSurveyPage from "@/components/page/TestSurveyPage";
import { Survey } from "@/utils/types";
export default function ChatPage() {
  const [page, setPage] = useState<number>(0);
  const [survey, setSurvey] = useState<Survey | null>(null);

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-400 ease-in-out ${
          page >= 1 ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <InitialPage setPage={setPage} setSurvey={setSurvey} />
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-400 ease-in-out ${
          page === 1
            ? "translate-y-0"
            : page > 1
            ? "-translate-y-full"
            : "translate-y-full"
        }`}
      >
        <SecondaryPage survey={survey} />
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-400 ease-in-out ${
          page === 2 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <TestSurveyPage />
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button onClick={() => setPage(page === 0 ? 1 : page === 1 ? 2 : 1)}>
          Toggle Page
        </button>
        <ModeToggle />
      </div>
    </div>
  );
}
