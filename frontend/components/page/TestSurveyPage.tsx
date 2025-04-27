"use client";
import { useState } from "react";
import "survey-core/survey-core.css";
import { Survey } from "survey-react-ui";

export default function SurveyComponent({ survey }: { survey: Survey | null }) {
  const [surveyResults, setSurveyResults] = useState("");
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);

  if (!survey) {
    return <div>Loading survey...</div>;
  }
  return (
    <>
      <Survey model={survey} id="surveyContainer" />
      {isSurveyCompleted && (
        <>
          <p>Result JSON:</p>
          <code style={{ whiteSpace: "pre" }}>{surveyResults}</code>
        </>
      )}
    </>
  );
}
