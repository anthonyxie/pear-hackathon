"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import "survey-core/survey-core.css";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";

export default function SurveyComponent() {
  // Create state for the survey JSON and the survey model
  const [surveyJson, setSurveyJson] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [surveyResults, setSurveyResults] = useState("");
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);

  // Load the survey JSON from a file
  useEffect(() => {
    // Function to fetch the survey JSON
    const loadSurveyJson = async () => {
      try {
        // You can change this path to load different survey JSONs
        const response = await fetch("/survey_js_format_v2.json");
        if (!response.ok) {
          throw new Error(`Failed to load survey: ${response.status}`);
        }
        const json = await response.json();
        setSurveyJson(json);

        // Create a new survey model with the loaded JSON
        const newSurvey = new Model(json);
        newSurvey.onComplete.add((sender) => {
          setSurveyResults(JSON.stringify(sender.data, null, 4));
          setIsSurveyCompleted(true);
        });
        setSurvey(newSurvey);
      } catch (error) {
        console.error("Error loading survey:", error);
      }
    };

    loadSurveyJson();
  }, []);

  // Don't render until we have the survey
  if (!survey) {
    return <div>Loading survey...</div>;
  }
  console.log(survey);
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
