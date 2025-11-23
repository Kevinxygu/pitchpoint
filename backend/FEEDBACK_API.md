# Feedback API Documentation

## Overview
The Feedback API analyzes sports partnership sales call transcripts and provides detailed, actionable feedback based on a comprehensive rubric.

## File Structure

```
backend/app/
├── constants/
│   ├── __init__.py
│   └── rubric.py                    # Sports partnership evaluation rubric
├── services/
│   ├── __init__.py
│   ├── conversation_service.py      # Existing conversation management
│   └── feedback_service.py          # NEW: Feedback generation logic
├── routes/
│   ├── __init__.py
│   ├── voice_routes.py              # Existing voice call routes
│   └── feedback_routes.py           # NEW: Feedback API endpoints
└── __init__.py                      # Updated to register feedback routes
```

## API Endpoints

### 1. Generate Feedback
**POST** `/api/feedback/generate`

Analyzes a call transcript and returns comprehensive feedback.

**Request Body:**
```json
{
  "transcript": "Full text of the sales call conversation...",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "session-123",
  "feedback": {
    "categories": [
      {
        "name": "Rapport & Relationship Building",
        "score": 85,
        "evidence": "Rep opened with personalized greeting...",
        "strengths": ["Natural conversation flow", "Good active listening"],
        "improvements": ["Could ask more about prospect's background"]
      }
      // ... 6 more categories
    ],
    "overall": {
      "weighted_score": 82.5,
      "grade": "B - Strong",
      "summary": "Solid performance with good discovery...",
      "top_3_strengths": ["Excellent discovery", "Strong value prop", "Good objection handling"],
      "top_3_priorities": ["Improve closing", "Build more rapport", "Better time management"]
    },
    "talk_ratio": {
      "rep_percentage": 45,
      "prospect_percentage": 55,
      "analysis": "Good balance - prospect spoke more, indicating strong discovery"
    },
    "key_moments": [
      {
        "timestamp": "Early in call",
        "moment": "Rep asked about prospect's marketing goals",
        "impact": "Opened up conversation and built trust"
      }
    ],
    "rubric_reference": {
      "total_categories": 7,
      "category_names": ["Rapport & Relationship Building", "Discovery & Needs Assessment", ...]
    }
  },
  "transcript_length": 2543,
  "model_used": "command-r-plus"
}
```

**Error Responses:**
- `400` - Missing transcript or transcript too short (< 50 characters)
- `500` - AI generation failed or API key not configured

---

### 2. Get Rubric
**GET** `/api/feedback/rubric`

Returns the complete evaluation rubric for reference.

**Response:**
```json
{
  "success": true,
  "rubric": {
    "categories": [
      {
        "name": "Rapport & Relationship Building",
        "weight": 0.15,
        "description": "Ability to establish trust...",
        "criteria": ["Opens with genuine connection", ...],
        "evaluation_points": {
          "excellent": "Natural rapport, personalized approach...",
          "good": "Professional connection...",
          "fair": "Generic opening...",
          "poor": "No rapport building..."
        }
      }
      // ... 6 more categories
    ],
    "overall_scoring": {
      "90-100": {
        "grade": "A - Excellent",
        "description": "Partnership Pro: This was a masterful sales call..."
      }
      // ... other grade ranges
    },
    "additional_insights": [
      {
        "insight_type": "talk_ratio",
        "description": "Sales Rep vs. Prospect Speaking Time",
        "optimal": "40/60 to 50/50...",
        "red_flag": "70/30 or worse..."
      }
      // ... other insights
    ]
  }
}
```

---

### 3. Health Check
**GET** `/api/feedback/health`

Check if the feedback service is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "feedback"
}
```

## Evaluation Categories

The rubric evaluates calls across 7 categories:

1. **Rapport & Relationship Building** (15% weight)
   - Personal connection and trust building

2. **Discovery & Needs Assessment** (25% weight) 
   - Quality of questions and understanding of prospect needs

3. **Value Proposition & Differentiation** (20% weight)
   - Clarity and relevance of partnership value

4. **Business Acumen & Strategic Thinking** (15% weight)
   - Understanding of prospect's business context

5. **Handling Objections & Challenges** (10% weight)
   - Response to concerns and hesitations

6. **Call Structure & Flow** (10% weight)
   - Organization and pacing of conversation

7. **Closing & Next Steps** (5% weight)
   - Effectiveness in advancing the deal

## Integration with Voice Calls

To integrate feedback generation after a voice call ends:

```python
# In voice_routes.py, after a call ends:

@socketio.on('end_voice_session')
def handle_end_session(data):
    session_id = data.get('session_id')
    
    # Get final transcript
    transcript = conversation_service.get_transcript(session_id)
    
    # Generate feedback (optional - could be done on-demand)
    from app.services.feedback_service import feedback_service
    try:
        feedback = feedback_service.generate_feedback(transcript)
        emit('feedback_generated', {'feedback': feedback}, room=session_id)
    except Exception as e:
        print(f"Failed to generate feedback: {e}")
    
    # End conversation
    conversation_service.end_conversation(session_id)
    emit('session_ended', {'transcript': transcript}, room=session_id)
    leave_room(session_id)
```

## Usage Example

```bash
# Generate feedback for a transcript
curl -X POST http://localhost:8080/api/feedback/generate \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Rep: Hi John, thanks for taking the time today...",
    "session_id": "call-123"
  }'

# Get the rubric
curl http://localhost:8080/api/feedback/rubric

# Health check
curl http://localhost:8080/api/feedback/health
```

## Environment Variables

Ensure `COHERE_API_KEY` is set in your `.env` file:

```bash
COHERE_API_KEY=your_cohere_api_key_here
```

## Notes

- The feedback service uses Cohere's `command-r-plus` model with temperature 0.3 for consistent evaluations
- Minimum transcript length: 50 characters
- The service automatically handles both Cohere API v1 and v2
- Weighted scores are calculated based on category weights (must sum to 1.0)
- Grades range from F (0-59) to A (90-100)
