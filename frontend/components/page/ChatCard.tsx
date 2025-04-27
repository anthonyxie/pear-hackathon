"use client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { Survey } from "@/utils/types";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";

const STUB_SURVEY = {
  createdAt: "2025-04-26T23:49:01.757050",
  description: "Survey for OpenAI → WINDSURF",
  disqualifiers: [],
  id: "6f0efb6b-ef95-4451-8456-cd9ee53b55e9",
  sections: [
    {
      description: "Initial eligibility questions",
      id: "c4419429-3ae4-4150-aa5b-9c4c0229ffd8",
      isActive: true,
      name: "Screener",
      order: 1,
      questions: [
        {
          id: "b73d7ece-ebc9-4504-8af0-bd23b4ba7b01",
          options: [
            "Engineering manager / technical lead",
            "Director or VP of Engineering",
            "Software developer / individual contributor",
            "I do not work in a technical role",
          ],
          order: 1,
          required: true,
          termination_option: "I do not work in a technical role",
          text: "Which of the following best describes your current role?",
          type: "multiple_choice",
        },
        {
          id: "ac97348d-a622-43da-9bf4-3539d338bba3",
          options: [
            "Engineering Manager",
            "Technical Team Lead",
            "Director of Engineering",
            "VP of Engineering",
            "CTO",
            "Other technical leadership role",
            "None of the above",
          ],
          order: 2,
          required: true,
          text: "Which of the following best describes your current role?",
          type: "multiple_select",
        },
        {
          id: "66316ef5-e6b7-4858-bfca-3df1d7d0f7be",
          options: [
            "1",
            "2",
            "3",
            "4",
            "5 (1 = Not at all familiar",
            "5 = Extremely familiar)",
          ],
          order: 3,
          required: true,
          text: "How familiar are you with WINDSURF's products or services?",
          type: "multiple_choice",
        },
        {
          id: "5cba617d-fa56-4b8f-bd3d-24d5151f825f",
          options: ["Yes", "No"],
          order: 4,
          required: true,
          text: "Have you interacted professionally with WINDSURF's technology in the past 2 years?",
          type: "multiple_choice",
        },
        {
          id: "bdfd2138-f14c-42f4-9608-0feb2780f295",
          options: [
            "Evaluated their technology for potential use",
            "Implemented their solutions in my organization",
            "Worked directly with their engineering team",
            "Competed with their products/services",
            "Attended their technical demonstrations or webinars",
            "Followed their technical developments",
            "No direct experience",
          ],
          order: 5,
          required: true,
          text: "Which of the following most accurately describes your experience with WINDSURF? Select all that apply.",
          type: "multiple_select",
        },
        {
          id: "cd4ba509-9e3f-4782-84fa-91f3a171be42",
          options: [
            "Primary decision maker",
            "Strong influence on decisions",
            "Provide technical input to decisions",
            "Limited influence",
            "No influence",
          ],
          order: 6,
          required: true,
          text: "In your current role, what level of influence do you have in technology adoption or partnership decisions?",
          type: "multiple_choice",
        },
      ],
    },
    {
      description: "Measures baseline familiarity",
      id: "d5246d11-cc37-44e5-8660-5c380761e1ec",
      isActive: true,
      name: "Awareness",
      order: 2,
      questions: [
        {
          id: "f6d4dd7e-4cec-4af4-8b01-94faf286fc6e",
          options: [
            "Extremely familiar – daily user",
            "Somewhat familiar – occasional user",
            "Heard of it but never used it",
            "I've never heard of WINDSURF",
          ],
          order: 1,
          required: true,
          termination_option: "I've never heard of WINDSURF",
          text: "How familiar are you with WINDSURF's technology or services?",
          type: "multiple_choice",
        },
        {
          id: "aec68ac8-db32-4035-80c3-2165fde2dcbb",
          options: [
            "Code completion",
            "Code chat/Q&A",
            "Automated documentation",
            "Repository search",
            "GitHub integration",
            "Code transformations",
            "Debugging assistance",
            "We don't currently use Windsurf",
            "Not sure",
          ],
          order: 2,
          required: true,
          text: "What features of Windsurf (formerly Codeium) do your engineering teams currently use? Select all that apply.",
          type: "multiple_select",
        },
        {
          id: "fb8dff4a-8a61-4e95-af54-fd540786ec9a",
          options: [
            "Less than 6 months",
            "6-12 months",
            "1-2 years (including when it was Codeium)",
            "More than 2 years",
            "We evaluated but didn't adopt",
            "We've never used it",
          ],
          order: 3,
          required: true,
          text: "How long has your team been using Windsurf's products?",
          type: "multiple_choice",
        },
        {
          id: "00ca9db5-7dc4-49b0-b0a6-8aa7d21b09b7",
          options: [
            "Multiple times per hour",
            "A few times per day",
            "A few times per week",
            "Occasionally (less than weekly)",
            "Never/Not applicable",
          ],
          order: 4,
          required: true,
          text: "On average, how frequently do your developers interact with Windsurf's AI coding assistant during their workflow?",
          type: "multiple_choice",
        },
        {
          id: "cd1120ba-c994-4205-a0b4-da8a5d8f8524",
          options: [
            "Free tier",
            "Professional plan",
            "Team plan",
            "Enterprise plan",
            "Custom solution",
            "Previously used but discontinued",
            "Not currently using",
            "Not sure",
          ],
          order: 5,
          required: true,
          text: "Which Windsurf plan or tier is your organization currently using?",
          type: "multiple_select",
        },
        {
          id: "879e7b48-918a-4364-ad09-e4ecb978db5e",
          options: [
            "Code quality",
            "Accuracy of suggestions",
            "Speed/performance",
            "Language/framework support",
            "Privacy/security features",
            "IDE integration options",
            "UI/UX",
            "Customization capabilities",
            "Cost-effectiveness",
            "Haven't compared to others",
            "Don't use Windsurf",
          ],
          order: 6,
          required: true,
          text: "When comparing Windsurf to other AI coding assistants (like GitHub Copilot or Cursor), what aspects of Windsurf do you find most valuable? Select up to 3.",
          type: "multiple_select",
        },
        {
          id: "3119fb98-3007-4782-aa15-e34e7edea4de",
          options: [
            "VS Code",
            "JetBrains IDEs (IntelliJ",
            "PyCharm",
            "etc.)",
            "Visual Studio",
            "Vim/Neovim",
            "Web-based IDEs",
            "Emacs",
            "Command line tool",
            "Other",
            "None - we don't use Windsurf",
          ],
          order: 7,
          required: true,
          text: "Which IDEs or code editors has your team integrated Windsurf with? Select all that apply.",
          type: "multiple_select",
        },
        {
          id: "157dce69-16ea-49e8-899d-0c221f42f197",
          options: [
            "1",
            "2",
            "3",
            "4",
            "5 (1 = No positive impact",
            "5 = Transformative impact)",
          ],
          order: 8,
          required: true,
          text: "If you were to describe the impact Windsurf has had on your team's development process, how would you rate it?",
          type: "multiple_choice",
        },
      ],
    },
    {
      description: "Explores depth & frequency of product use",
      id: "8269016a-8821-4ec6-8260-25e2f4f62aae",
      isActive: true,
      name: "Usage",
      order: 3,
      questions: [
        {
          id: "f87bbcdd-f146-4816-af07-eaf77f1934eb",
          options: [
            "More than 2 years",
            "1-2 years",
            "Less than 1 year",
            "We have never used WINDSURF",
          ],
          order: 1,
          required: true,
          termination_option: "We have never used WINDSURF",
          text: "How long has your organisation actively used WINDSURF tools?",
          type: "multiple_choice",
        },
        {
          id: "028dbeea-5e73-4b90-91a5-7d37e0f835a0",
          options: ["1-5", "6-15", "16-30", "31-50", "51-100", "100+", "None"],
          order: 2,
          required: true,
          text: "How many developers on your team actively use Windsurf's AI coding tools?",
          type: "multiple_select",
        },
        {
          id: "28f35df1-c313-454c-8768-3e8c379c6507",
          options: [
            "Less than 25%",
            "25-50%",
            "51-75%",
            "76-100%",
            "Not implemented",
          ],
          order: 3,
          required: true,
          text: "What percentage of your development team has adopted Windsurf as part of their regular workflow?",
          type: "multiple_choice",
        },
        {
          id: "ff26f206-ed16-4fc7-8793-9d0e2ab7d8bb",
          options: [
            "Code completion",
            "Code chat/Q&A",
            "Automated documentation",
            "Repository search",
            "Code transformations",
            "Debugging assistance",
            "IDE integrations",
            "Security features",
            "Enterprise administration tools",
          ],
          order: 4,
          required: true,
          text: "Which Windsurf features do your engineering teams find most valuable? Select up to 3.",
          type: "multiple_select",
        },
        {
          id: "7c98c885-f3d9-4bde-9ea6-da46f9dddfee",
          options: [
            "Significant improvement (>30% faster)",
            "Moderate improvement (10-30% faster)",
            "Slight improvement (<10% faster)",
            "No noticeable change",
            "Reduced velocity",
          ],
          order: 5,
          required: true,
          text: "How has the adoption of Windsurf impacted your team's development velocity?",
          type: "multiple_choice",
        },
        {
          id: "87f7a939-8e04-4e21-8556-a3a979c0bf0f",
          options: [
            "GitHub Copilot",
            "Cursor",
            "Amazon CodeWhisperer",
            "Tabnine",
            "IntelliCode",
            "None",
            "Other",
          ],
          order: 6,
          required: true,
          text: "What other AI coding assistant tools does your team currently use alongside or instead of Windsurf? Select all that apply.",
          type: "multiple_select",
        },
        {
          id: "68f8a1ae-9960-4add-8893-7ce70c6553c5",
          options: [
            "JavaScript/TypeScript",
            "Python",
            "Java",
            "C/C++",
            "C#",
            "Go",
            "Rust",
            "PHP",
            "Ruby",
            "SQL",
            "Infrastructure-as-Code",
            "Other",
          ],
          order: 7,
          required: true,
          text: "For which programming languages or frameworks does your team most frequently use Windsurf? Select up to 3.",
          type: "multiple_select",
        },
        {
          id: "9a4cb7dd-847f-4793-9237-d0d95d5fee50",
          options: [
            "Cost concerns",
            "Security/privacy concerns",
            "Performance issues",
            "Limited integration options",
            "Accuracy of suggestions",
            "Lack of enterprise features",
            "Learning curve",
            "Developer resistance",
            "None - full adoption",
          ],
          order: 8,
          required: true,
          text: "What barriers, if any, have limited wider adoption of Windsurf within your engineering organization? Select all that apply.",
          type: "multiple_select",
        },
      ],
    },
    {
      description: "Captures satisfaction & pain points",
      id: "0763b8ab-d6f3-41a7-a525-6678ec8874a7",
      isActive: true,
      name: "Voice of Customer",
      order: 4,
      questions: [
        {
          id: "3f68d6a5-ab0a-4424-a739-96ae5bd912cc",
          options: [
            "1",
            "2",
            "3",
            "4",
            "5 (1 = Very dissatisfied",
            "5 = Very satisfied)",
          ],
          order: 1,
          required: true,
          text: "How would you rate your team's overall satisfaction with Windsurf's AI coding assistant?",
          type: "multiple_choice",
        },
        {
          id: "f8bba1f9-0eb2-4995-bced-6b16711ac687",
          options: [
            "Inaccurate code suggestions",
            "Performance/speed issues",
            "IDE integration problems",
            "Language support limitations",
            "Security/privacy concerns",
            "Cost/licensing issues",
            "Lack of customization options",
            "Complex implementation",
            "Poor technical support",
            "Insufficient documentation",
            "Limited enterprise features",
            "None - works well for us",
          ],
          order: 2,
          required: true,
          text: "What are the top pain points your engineering team experiences when using Windsurf? Select up to 3.",
          type: "multiple_select",
        },
        {
          id: "100534da-e0f7-435d-846a-3b87669050c4",
          options: [
            "Extremely satisfied",
            "Somewhat satisfied",
            "Neither satisfied nor dissatisfied",
            "Somewhat dissatisfied",
            "Extremely dissatisfied",
            "We haven't used their support",
          ],
          order: 3,
          required: true,
          text: "How satisfied are you with the technical support provided by the Windsurf team?",
          type: "multiple_choice",
        },
        {
          id: "e5c0819c-e834-44c5-8e07-a11fab981ca4",
          options: [
            "Better code suggestion accuracy",
            "Improved performance/speed",
            "Enhanced security features",
            "More language/framework support",
            "Advanced enterprise management",
            "Better IDE integrations",
            "Expanded documentation capabilities",
            "Simplified deployment",
            "More customization options",
            "Lower pricing",
            "Better onboarding/training resources",
          ],
          order: 4,
          required: true,
          text: "Which improvements to Windsurf would most benefit your engineering organization? Select up to 3.",
          type: "multiple_select",
        },
        {
          id: "bd136beb-9b1c-425d-9a2b-013069d47fa2",
          options: [
            "Significantly improved",
            "Somewhat improved",
            "No noticeable change",
            "Somewhat decreased",
            "Significantly decreased",
          ],
          order: 5,
          required: true,
          text: "How has Windsurf impacted your team's code quality?",
          type: "multiple_choice",
        },
        {
          id: "4848c87a-c2b8-4f12-8151-e801695bf45f",
          options: [
            "Very responsive - issues addressed quickly",
            "Somewhat responsive - most issues addressed",
            "Neutral - mixed experience",
            "Somewhat unresponsive - slow to address issues",
            "Very unresponsive - issues rarely addressed",
            "We haven't submitted requests",
          ],
          order: 6,
          required: true,
          text: "What is your team's experience with Windsurf's response to feature requests or bug reports?",
          type: "multiple_choice",
        },
        {
          id: "22ce6e66-191b-422b-a31b-a46e73a5ff45",
          options: null,
          order: 7,
          required: true,
          text: "What would be the most valuable enhancement Windsurf could make to better support your enterprise needs?",
          type: "text",
        },
      ],
    },
    {
      description: "Net Promoter / referral intent",
      id: "904065cf-306f-4939-8b7f-d9e66d106ba0",
      isActive: true,
      name: "Advocacy",
      order: 5,
      questions: [
        {
          id: "88c5c502-08ab-4f5c-8007-49a00bb0f461",
          options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
          order: 1,
          required: true,
          text: "On a scale from 0-10, how likely are you to recommend Windsurf to other engineering managers or technical leaders?",
          type: "multiple_select",
        },
        {
          id: "a02b46a0-ccf6-47a6-a598-c5d8d95dffff",
          options: null,
          order: 2,
          required: true,
          text: "What is the primary reason for your likelihood to recommend (or not recommend) Windsurf?",
          type: "text",
        },
        {
          id: "65f19eb6-c23b-459f-8468-34f281b1e90f",
          options: [
            "Much better than alternatives",
            "Somewhat better than alternatives",
            "About the same as alternatives",
            "Somewhat worse than alternatives",
            "Much worse than alternatives",
            "Haven't used alternatives",
          ],
          order: 3,
          required: true,
          text: "Compared to other AI coding assistants your team has used, how would you rate Windsurf's overall value?",
          type: "multiple_choice",
        },
        {
          id: "3806a1b0-f5c6-4118-9dc9-32a0918189e7",
          options: [
            "Code suggestion quality",
            "Performance/speed",
            "Privacy/security features",
            "Enterprise management capabilities",
            "Integration options",
            "Cost-effectiveness",
            "Developer experience/UI",
            "Customization options",
            "Technical support",
            "Nothing significantly differentiates it",
          ],
          order: 4,
          required: true,
          text: "Which aspects of Windsurf do you believe most differentiate it from competitors like GitHub Copilot or Cursor? Select up to 3.",
          type: "multiple_select",
        },
        {
          id: "721b6906-671d-4557-a3fb-f9dff07d2396",
          options: ["Yes", "No"],
          order: 5,
          required: true,
          text: "Have you already recommended Windsurf to colleagues outside your organization?",
          type: "multiple_choice",
        },
        {
          id: "3e08d947-a84d-45c3-a9a0-fce5b10972ac",
          options: ["Yes", "No"],
          order: 6,
          required: true,
          text: "Would you be willing to serve as a reference for Windsurf (e.g., case study, testimonial, or speaking with potential customers)?",
          type: "multiple_choice",
        },
        {
          id: "3671a45f-ad3f-42e6-897f-5c7aca4081d3",
          options: [
            "Better code accuracy",
            "Improved performance",
            "Enhanced enterprise features",
            "Better IDE integrations",
            "More advanced customization",
            "More competitive pricing",
            "Better developer onboarding",
            "Enhanced security features",
            "Improved documentation capabilities",
            "None - already highly recommendable",
          ],
          order: 7,
          required: true,
          text: "What features or improvements would make you more likely to recommend Windsurf to other engineering leaders?",
          type: "multiple_select",
        },
      ],
    },
    {
      description: "Key purchase drivers & criteria",
      id: "79eb2ac7-2c5f-4d5a-b3f3-3112b96c1ec3",
      isActive: true,
      name: "KPC",
      order: 6,
      questions: [
        {
          id: "c44307fe-4c24-4838-b7ad-0da3de8b7f5b",
          options: [
            "Developer productivity improvements",
            "Cost-effectiveness",
            "Quality of AI code suggestions",
            "Security/privacy features",
            "Integration with existing toolchain",
            "Enterprise management capabilities",
            "Team adoption ease",
            "Technical support quality",
            "Previous experience with Codeium",
          ],
          order: 1,
          required: true,
          text: "What were the most important factors that influenced your decision to adopt Windsurf for your engineering team? Select up to 3.",
          type: "multiple_select",
        },
        {
          id: "4416ffd5-1b7f-4e70-9b00-c53ba0c5f709",
          options: [
            "Developer productivity is most important",
            "Code quality/accuracy is most important",
            "Security/privacy features are most important",
            "Cost-effectiveness is most important",
            "Integration capabilities are most important",
          ],
          order: 2,
          required: true,
          text: "How would you rank the following factors in terms of their importance when evaluating AI coding assistants like Windsurf?",
          type: "multiple_choice",
        },
        {
          id: "e2cb1e0a-54ae-4d30-b034-f7ddcd646166",
          options: ["1", "2", "3", "4", "5"],
          order: 3,
          required: true,
          text: "On a scale of 1-5, how important is each of the following features in your continued use of Windsurf?",
          type: "multiple_choice",
        },
        {
          id: "16f36b0f-e87b-43d1-91e1-6cbe372d78e8",
          options: [
            "Reduced development time",
            "Fewer bugs/defects",
            "Faster onboarding of new developers",
            "Improved code consistency",
            "Better documentation",
            "Enhanced developer satisfaction",
            "Cost savings",
            "No measurable improvements yet",
          ],
          order: 4,
          required: true,
          text: "What measurable improvements has your team experienced since implementing Windsurf? Select all that apply.",
          type: "multiple_select",
        },
        {
          id: "eef11413-299e-4efa-bdd7-a81b88823ec8",
          options: [
            "VS Code support",
            "JetBrains IDE support",
            "GitHub/version control integration",
            "CI/CD pipeline integration",
            "Enterprise SSO",
            "Custom LLM support",
            "API access",
            "Security tools integration",
            "None were critical",
          ],
          order: 5,
          required: true,
          text: "What technical integrations were most critical in your decision to adopt Windsurf?",
          type: "multiple_select",
        },
        {
          id: "287ac588-f745-4a92-9d7d-22abc083dcad",
          options: [
            "Accelerate development velocity",
            "Reduce development costs",
            "Improve code quality",
            "Address developer shortages",
            "Standardize coding practices",
            "Stay competitive with industry trends",
            "Developer satisfaction/retention",
          ],
          order: 6,
          required: true,
          text: "What is your organization's primary motivation for using AI coding assistants like Windsurf?",
          type: "multiple_select",
        },
        {
          id: "b2390379-38ef-49b7-8de9-9d363ff038ab",
          options: null,
          order: 7,
          required: true,
          text: "If you were to allocate 100 points across the following factors based on their importance in your decision to use Windsurf, how would you distribute them?",
          type: "text",
        },
      ],
    },
    {
      description: "Discovery & buying channels",
      id: "3bbca759-3e92-4f30-b92c-368040861d76",
      isActive: true,
      name: "Channel",
      order: 7,
      questions: [
        {
          id: "788a9e34-e6eb-4788-954c-9bf512864854",
          options: [
            "Developer recommendation",
            "Industry conference/event",
            "Online search/research",
            "Vendor outreach/sales",
            "Social media",
            "Tech publication/review",
            "Word of mouth from peer",
            "Other",
          ],
          order: 1,
          required: true,
          text: "How did your organization initially discover Windsurf (formerly Codeium)?",
          type: "multiple_select",
        },
        {
          id: "93b17ec2-271f-4622-a18a-0af0c1b02aa4",
          options: [
            "Engineering managers",
            "Individual developers",
            "CTO/CIO",
            "VP of Engineering",
            "Procurement/purchasing department",
            "Security/compliance team",
            "DevOps team",
            "External consultants",
          ],
          order: 2,
          required: true,
          text: "Who were the key influencers or decision-makers in your organization's evaluation of Windsurf? Select all that apply.",
          type: "multiple_select",
        },
        {
          id: "acd66228-c4cb-4188-9298-4cbafd9bd313",
          options: [
            "Free trial/POC",
            "Technical evaluation",
            "Security assessment",
            "Competitive analysis with alternatives",
            "Cost-benefit analysis",
            "Contract negotiation",
            "Legal review",
            "Executive approval",
            "Procurement department approval",
            "Gradual rollout",
          ],
          order: 3,
          required: true,
          text: "What was your organization's procurement process for adopting Windsurf? Select all steps that applied.",
          type: "multiple_select",
        },
        {
          id: "640c5c71-8589-4b50-af32-43bc6a04337c",
          options: [
            "Less than 1 month",
            "1-3 months",
            "4-6 months",
            "7-12 months",
            "More than 12 months",
            "Still in evaluation",
          ],
          order: 4,
          required: true,
          text: "How long was the sales cycle from initial discovery to signed contract for Windsurf in your organization?",
          type: "multiple_choice",
        },
        {
          id: "a6ffb482-df43-40d1-a10a-591872f5a497",
          options: [
            "Monthly subscription",
            "Annual contract",
            "Multi-year contract",
            "Enterprise agreement with custom terms",
            "Free tier only",
            "No formal contract",
          ],
          order: 5,
          required: true,
          text: "What type of contract does your organization currently have with Windsurf?",
          type: "multiple_choice",
        },
        {
          id: "bedb2a28-4590-4b85-aa0a-dac20cc83420",
          options: [
            "Product demos/trials",
            "Technical documentation",
            "ROI analysis",
            "Competitive differentiation",
            "Responsive sales team",
            "Flexible contract terms",
            "Enterprise security features",
            "Implementation support",
            "Pricing structure",
            "Developer feedback",
          ],
          order: 6,
          required: true,
          text: "Which aspects of Windsurf's sales process were most effective in your procurement decision? Select up to 3.",
          type: "multiple_select",
        },
        {
          id: "cf3a1cc4-ae11-45ab-8c67-17df7ab5b3dd",
          options: [
            "Budget constraints",
            "Security/compliance concerns",
            "Integration limitations",
            "Internal resistance to adoption",
            "Lengthy approval process",
            "Difficulty proving ROI",
            "Contract/licensing complexities",
            "Competitive alternatives",
            "None - process was smooth",
          ],
          order: 7,
          required: true,
          text: "What challenges or obstacles did you encounter during the procurement process for Windsurf? Select all that apply.",
          type: "multiple_select",
        },
      ],
    },
    {
      description: "Perceptions & personality of the company",
      id: "34f7e26c-c44e-4afc-8660-d7e4c249f157",
      isActive: true,
      name: "Brand",
      order: 8,
      questions: [
        {
          id: "618b87f1-c99f-4861-8b37-511ab037018f",
          options: [
            "Highly frustrating",
            "Somewhat frustrating",
            "Neutral",
            "Somewhat satisfying",
            "Highly satisfying",
          ],
          order: 1,
          required: true,
          text: "How would you describe your team's overall experience with Windsurf's AI coding assistant?",
          type: "multiple_choice",
        },
        {
          id: "5d133ff3-f802-47a6-9774-c557c347d2db",
          options: [
            "Relief",
            "Frustration",
            "Excitement",
            "Surprise",
            "Trust",
            "Skepticism",
            "Confidence",
            "Anxiety",
            "Indifference",
            "Satisfaction",
            "Confusion",
          ],
          order: 2,
          required: true,
          text: "What emotions do your developers most commonly express when using Windsurf in their daily workflow? Select up to 3.",
          type: "multiple_select",
        },
        {
          id: "99219584-c213-4f0d-8e08-e2c1eba8101a",
          options: [
            "Consistently poor",
            "Occasionally helpful",
            "Adequately reliable",
            "Mostly excellent",
            "Exceptionally accurate",
          ],
          order: 3,
          required: true,
          text: "How would you characterize the quality of code suggestions provided by Windsurf?",
          type: "multiple_choice",
        },
        {
          id: "75a1d57c-eff1-40f5-b7c7-ce5c3555bd40",
          options: [
            "Disruptive interruption",
            "Minor distraction",
            "Neutral presence",
            "Helpful assistant",
            "Essential productivity tool",
          ],
          order: 4,
          required: true,
          text: "Which of the following best describes the impact Windsurf has had on your developers' workflow?",
          type: "multiple_choice",
        },
        {
          id: "00e926f5-e168-4cdd-bd32-e49b96361708",
          options: [
            "Clunky and intrusive",
            "Somewhat awkward",
            "Adequately functional",
            "Smooth and intuitive",
            "Seamless and invisible",
          ],
          order: 5,
          required: true,
          text: "How would you describe Windsurf's user interface and integration with your development environment?",
          type: "multiple_choice",
        },
        {
          id: "ef4ceca8-d9c6-4daa-b0ff-3f62df417c3e",
          options: null,
          order: 6,
          required: true,
          text: "Which three words would you use to describe Windsurf based on your team's experience with the product?",
          type: "text",
        },
        {
          id: "ad49475a-7e42-467a-8f14-db0ef3d2e594",
          options: [
            "Strongly negative",
            "Somewhat negative",
            "Neutral/mixed",
            "Somewhat positive",
            "Strongly positive",
          ],
          order: 7,
          required: true,
          text: "When your developers discuss Windsurf among themselves, what sentiment is most commonly expressed?",
          type: "multiple_choice",
        },
      ],
    },
  ],
  title: "WINDSURF Due Diligence Survey",
  type: "enterprise",
  updatedAt: "2025-04-26T23:49:01.757050",
  getRootCss: () => "w-full",
};

const STUBBING = true;

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
    console.log(STUB_SURVEY);
    if (STUBBING) {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSurvey(STUB_SURVEY);
      setLoading(false);
    } else {
      const response = await axios.post("http://localhost:5000/api/surveys", {
        acquiringCompany,
        targetCompany,
        surveyType,
        productCategories: [],
        targetAudience,
      });
      const data = response.data;
      if (data.error) {
        console.error(data.error);
      } else {
        setSurvey(data);
      }
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
      <form
        className="flex-col flex flex-1 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
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

        <Button type="submit" className={`w-full mt-4`} disabled={isDisabled}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Generate Survey
        </Button>
      </form>
    </Card>
  );
}
