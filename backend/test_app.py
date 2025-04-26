import json, unittest, app
from unittest.mock import patch

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.app.test_client()

    def test_health(self):
        r = self.client.get("/health")
        self.assertEqual(r.status_code, 200)

    @patch("claude_client.USE_STUB", True)  # force stub regardless of env
    def test_survey_stub(self):
        payload = {
            "acquiringCompany": "OpenAI",
            "targetCompany": "WINDSURF",
            "surveyType": "enterprise",
            "productCategories": ["IDE"]
        }
        r = self.client.post("/api/surveys",
                             data=json.dumps(payload),
                             content_type="application/json")
        self.assertEqual(r.status_code, 201)
        self.assertIn("sections", r.get_json())

    def test_multiselect_parser(self):
        blob = """
        1. Which integrations do you use? (Select all that apply)
           Question type: multiple select
           Answer options: GitHub, GitLab, Bitbucket
        """
        from utils import parse_questions_from_claude_response
        q = parse_questions_from_claude_response(blob)[0]
        self.assertEqual(q["type"], "multiple_select")
        self.assertEqual(q["options"], ["GitHub", "GitLab", "Bitbucket"])


if __name__ == "__main__":
    unittest.main()
