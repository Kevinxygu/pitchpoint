import json
import os
import re
import textwrap
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from google import genai


class SportsPartnerResearchAgent:
    """
    Gemini-powered research agent that produces a structured profile for either
    a sports team or a potential partner brand.
    """

    def __init__(
        self,
        model_name: str = "gemini-2.5-flash",
    ) -> None:
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is required to use the research agent.")

        self.client = genai.Client()

    def _profile_schema(self) -> Dict[str, Any]:
        """Schema used to enforce consistent JSON outputs."""
        return {
            "entity_name": "",
            "entity_type": "sports_team",  # or "brand"
            "overview": "",
            "founded_year": None,
            "headquarters": "",
            "industry_or_league": "",
            "key_personnel": [
                {"name": "", "title": ""},
            ],
            "financial_highlights": {
                "revenue": "",
                "valuation_or_market_cap": "",
                "recent_growth_notes": "",
            },
            "audience": {
                "demographics": [
                    {"group": "", "percentage": "", "notes": ""},
                ],
                "top_regions": [],
                "social_following": [
                    {"platform": "", "followers": "", "engagement_notes": ""},
                ],
            },
            "partnership_opportunities": {
                "ideal_assets": [],
                "potential_initiatives": [],
                "past_partnerships": [],
            },
            "risks": [
                {"type": "", "detail": "", "mitigation": ""},
            ],
            "data_confidence": {"overall": "medium", "reasoning": ""},
            "sources": [],
        }

    def _build_prompt(self, subject: str) -> str:
        schema_json = json.dumps(self._profile_schema(), indent=2)
        return textwrap.dedent(
            f"""
            You are a senior strategist building a partnership dossier for sports teams.
            Input subject: "{subject}".

            - Decide whether the subject is a "sports_team" or "brand" (choose only one).
            - Research recent, verifiable information (use data up to 2024).
            - Populate every field with concise facts; use null or empty strings when unknown.
            - For lists, include 3-5 strong, non-generic items.
            - Return ONLY valid JSON in the exact structure below, no markdown fences or prose.

            JSON schema to follow:
            {schema_json}
            """
        ).strip()

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract and parse JSON from the model response."""
        if not text:
            raise ValueError("Model returned an empty response.")

        fenced_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.S)
        if fenced_match:
            text = fenced_match.group(1)

        brace_match = re.search(r"(\{.*\})", text, re.S)
        candidate = brace_match.group(1) if brace_match else text

        try:
            return json.loads(candidate)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Failed to parse model JSON: {exc}") from exc

    def research(self, subject: str) -> Dict[str, Any]:
        """
        Run Gemini research on the subject (sports team or brand) and
        return a structured profile as a Python dict.
        """
        if not subject or not subject.strip():
            raise ValueError("Subject must be a non-empty string.")

        prompt = self._build_prompt(subject.strip())
        response = self.client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )
        text = getattr(response, "text", None) or ""

        return self._extract_json(text)
