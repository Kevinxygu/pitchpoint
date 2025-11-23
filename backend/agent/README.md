## Sports/Brand Research Agent

Use `SportsPartnerResearchAgent` to generate a structured JSON profile for either a sports team or a brand a team may want to partner with.

### Setup
- Ensure `GEMINI_API_KEY` is set (see `backend/agent/cases/.env` for format).
- Install deps from `backend/requirements.txt` (includes `google-generativeai`).

### Quick start
```bash
cd backend
python -m agent.research_agent  # uses SAMPLE_SUBJECT or defaults to Golden State Warriors
```

### Programmatic use
```python
from agent.research_agent import SportsPartnerResearchAgent

agent = SportsPartnerResearchAgent()
profile = agent.research("Nike")
print(profile)  # dict matching the documented schema
```
