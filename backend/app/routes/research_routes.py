from flask import Blueprint, request, jsonify
from agent.research_agent import SportsPartnerResearchAgent
from typing import Optional

bp = Blueprint('research', __name__)

_agent: Optional[SportsPartnerResearchAgent] = None

def get_agent() -> SportsPartnerResearchAgent:
    """Lazy-init the research agent so we fail fast on missing API key."""
    global _agent
    if _agent is None:
        _agent = SportsPartnerResearchAgent()
    return _agent

@bp.route('/research', methods=['POST'])
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
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
