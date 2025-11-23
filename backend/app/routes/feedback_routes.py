"""
Feedback Routes
API endpoints for generating and retrieving sales call feedback
"""

from flask import Blueprint, request, jsonify
from app.services.feedback_service import feedback_service
import json

bp = Blueprint('feedback', __name__)


@bp.route('/api/feedback/generate', methods=['POST'])
def generate_feedback():
    """
    Endpoint to generate feedback from a call transcript
    
    Expected payload:
    {
        "transcript": "full call transcript text",
        "session_id": "optional session identifier"
    }
    
    Returns:
    {
        "success": true,
        "session_id": "session_id",
        "feedback": {
            "categories": [...],
            "overall": {...},
            "talk_ratio": {...},
            "key_moments": [...]
        },
        "transcript_length": 1234,
        "model_used": "command-r-plus"
    }
    """
    
    try:
        data = request.get_json()
        
        if not data or 'transcript' not in data:
            return jsonify({
                "error": "Missing required field: transcript"
            }), 400
        
        transcript = data['transcript']
        session_id = data.get('session_id', 'unknown')
        
        # Generate feedback using the service
        feedback_data = feedback_service.generate_feedback(transcript)
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "feedback": feedback_data,
            "transcript_length": len(transcript),
            "model_used": "command-r-plus"
        }), 200
        
    except ValueError as e:
        # Handle validation errors (e.g., transcript too short)
        return jsonify({
            "error": str(e)
        }), 400
        
    except json.JSONDecodeError as e:
        return jsonify({
            "error": "Failed to parse AI response",
            "details": str(e)
        }), 500
        
    except Exception as e:
        print(f"❌ Error generating feedback: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": "Failed to generate feedback",
            "details": str(e)
        }), 500


@bp.route('/api/feedback/rubric', methods=['GET'])
def get_rubric():
    """
    Returns the complete rubric for reference
    
    Returns:
    {
        "success": true,
        "rubric": {
            "categories": [...],
            "overall_scoring": {...},
            "additional_insights": [...]
        }
    }
    """
    try:
        rubric = feedback_service.get_rubric()
        return jsonify({
            "success": True,
            "rubric": rubric
        }), 200
    except Exception as e:
        print(f"❌ Error fetching rubric: {e}")
        return jsonify({
            "error": "Failed to fetch rubric",
            "details": str(e)
        }), 500


@bp.route('/api/feedback/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for feedback service
    
    Returns:
    {
        "status": "healthy",
        "service": "feedback"
    }
    """
    return jsonify({
        "status": "healthy",
        "service": "feedback"
    }), 200
