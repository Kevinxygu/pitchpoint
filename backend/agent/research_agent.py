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
    a sports team or a traditional company/brand.
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

    def _profile_schemas(self) -> Dict[str, Dict[str, Any]]:
        """Return the type-specific schemas used to enforce consistent JSON outputs."""
        return {
            "sports_team": {
                "entity_name": "",
                "entity_type": "sports_team",
                "overview": "",
                "founded_year": None,
                "home_city_or_region": "",
                "league_or_competition": "",
                "key_personnel": [
                    {"name": "", "title": ""},
                ],
                "recent_performance": {
                    "last_season_result": "",
                    "current_form": "",
                    "star_players": [
                        {"name": "", "position": "", "note": ""},
                    ],
                },
                "home_venue": {
                    "name": "",
                    "capacity": "",
                    "attendance_trend": "",
                },
                "audience": {
                    "demographics": [
                        {"group": "", "percentage": "", "notes": ""},
                    ],
                    "top_markets": [],
                    "social_following": [
                        {"platform": "", "followers": "", "engagement_notes": ""},
                    ],
                    "brand_sentiment": "",
                },
                "commercial_profile": {
                    "primary_sponsors": [],
                    "recent_deals": [],
                    "media_rights_notes": "",
                },
                "partnership_opportunities": {
                    "ideal_categories": [],
                    "activation_ideas": [],
                    "past_partnerships": [],
                },
                "risks": [
                    {"type": "", "detail": "", "mitigation": ""},
                ],
                "data_confidence": {"overall": "medium", "reasoning": ""},
                "sources": [],
            },
            "company": {
                "entity_name": "",
                "entity_type": "company",
                "overview": "",
                "founded_year": None,
                "headquarters": "",
                "industry": "",
                "key_personnel": [
                    {"name": "", "title": ""},
                ],
                "products_or_services": [],
                "target_customers": [],
                "market_position": {
                    "market_share": "",
                    "competitive_advantages": [],
                    "notable_competitors": [],
                },
                "financial_highlights": {
                    "revenue": "",
                    "valuation_or_market_cap": "",
                    "funding_or_investors": "",
                    "recent_growth_notes": "",
                },
                "go_to_market": {
                    "sales_motion": "",
                    "marketing_channels": [],
                    "partnerships_or_sponsorships": [],
                },
                "partnership_opportunities": {
                    "ideal_assets": [],
                    "potential_initiatives": [],
                    "proof_points": [],
                },
                "risks": [
                    {"type": "", "detail": "", "mitigation": ""},
                ],
                "data_confidence": {"overall": "medium", "reasoning": ""},
                "sources": [],
            },
        }

    def _build_prompt(self, subject: str) -> str:
        schemas = self._profile_schemas()
        sports_schema_json = json.dumps(schemas["sports_team"], indent=2)
        company_schema_json = json.dumps(schemas["company"], indent=2)
        return textwrap.dedent(
            f"""
            You are a senior strategist building a partnership dossier for either a sports team or a traditional company/brand.
            Research subject: "{subject}".

            - Decide if the subject is a "sports_team" (club, franchise, collegiate program) or a "company" (brand/business).
            - Use the matching schema below and set `entity_type` accordingly. Return only ONE JSON object for the chosen schema.
            - Research recent, verifiable information (use data up to 2024).
            - Populate every field with concise facts; use null or empty strings when unknown.
            - For lists, include 3-5 strong, non-generic items.
            - Return ONLY valid JSON, no markdown fences or prose.

            Sports Team schema:
            {sports_schema_json}

            Company/Brand schema:
            {company_schema_json}
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
