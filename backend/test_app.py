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

if __name__ == "__main__":
    unittest.main()
