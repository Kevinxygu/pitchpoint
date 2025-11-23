import os
from typing import Optional

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from research_agent import SportsPartnerResearchAgent

# Load environment (expects GEMINI_API_KEY and optional HOST/PORT)
load_dotenv()

app = Flask(__name__)
CORS(app)

_agent: Optional[SportsPartnerResearchAgent] = None


def get_agent() -> SportsPartnerResearchAgent:
    """Lazy-init the research agent so we fail fast on missing API key."""
    global _agent
    if _agent is None:
        _agent = SportsPartnerResearchAgent()
    return _agent


@app.route("/research", methods=["POST"])
def research():
    """
    POST /research
    Body: { "subject": "Golden State Warriors" }
    Returns: { "subject": "...", "profile": { ...schema... } }
    """
    payload = request.get_json(silent=True) or {}
    subject = (payload.get("subject") or "").strip()

    if not subject:
        return jsonify({"error": "subject is required"}), 400

    try:
        profile = get_agent().research(subject)
        return jsonify({"subject": subject, "profile": profile})
    except Exception as exc:  # pragma: no cover - error path
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5001"))
    app.run(host=host, port=port, debug=True)
