"""
Feedback Service
Handles the business logic for evaluating sales call transcripts
"""

import os
import json
import cohere
from app.constants.rubric import SPORTS_PARTNERSHIP_RUBRIC


class FeedbackService:
    """Service for generating feedback from call transcripts"""
    
    def build_evaluation_prompt(self, transcript: str) -> str:
        """
        Constructs a detailed prompt for Cohere to evaluate the transcript
        """
        
        rubric_text = "# EVALUATION RUBRIC\n\n"
        
        for category in SPORTS_PARTNERSHIP_RUBRIC["categories"]:
            rubric_text += f"\n## {category['name']} (Weight: {category['weight'] * 100}%)\n"
            rubric_text += f"{category['description']}\n\n"
            rubric_text += "**Criteria:**\n"
            for criterion in category['criteria']:
                rubric_text += f"- {criterion}\n"
            rubric_text += "\n**Scoring Guide:**\n"
            for level, description in category['evaluation_points'].items():
                rubric_text += f"- **{level.upper()}**: {description}\n"
        
        prompt = f"""You are an expert sports partnership sales coach evaluating a sales call transcript. 

{rubric_text}

# CALL TRANSCRIPT TO EVALUATE

{transcript}

# YOUR TASK

Analyze this sports partnership sales call transcript against the rubric above. For each category:

1. Provide a score from 0-100
2. Give specific evidence from the transcript that supports your score
3. Provide 2-3 actionable recommendations for improvement
4. Highlight what was done well

Respond in the following JSON format ONLY (no additional text):

{{
    "categories": [
        {{
            "name": "Rapport & Relationship Building",
            "score": 85,
            "evidence": "Specific quotes or observations from the transcript",
            "strengths": ["What they did well with examples"],
            "improvements": ["Specific, actionable recommendations"]
        }},
        // ... repeat for all 7 categories
    ],
    "overall": {{
        "weighted_score": 82,
        "grade": "B - Strong",
        "summary": "2-3 sentence overall assessment",
        "top_3_strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "top_3_priorities": ["Priority improvement 1", "Priority 2", "Priority 3"]
    }},
    "talk_ratio": {{
        "rep_percentage": 45,
        "prospect_percentage": 55,
        "analysis": "Brief analysis of whether this ratio is optimal"
    }},
    "key_moments": [
        {{
            "timestamp": "approximate location in call",
            "moment": "Description of what happened",
            "impact": "Why this was significant (positive or negative)"
        }}
    ]
}}

Be specific, constructive, and provide actionable feedback. Reference actual quotes from the transcript when possible."""

        return prompt
    
    def calculate_weighted_score(self, category_scores: list) -> float:
        """
        Calculates overall weighted score based on rubric weights
        """
        total_score = 0
        for i, category in enumerate(SPORTS_PARTNERSHIP_RUBRIC["categories"]):
            category_score = category_scores[i]["score"]
            weight = category["weight"]
            total_score += category_score * weight
        
        return round(total_score, 1)
    
    def get_grade_from_score(self, score: float) -> dict:
        """
        Returns grade information based on overall score
        """
        for range_str, grade_info in SPORTS_PARTNERSHIP_RUBRIC["overall_scoring"].items():
            min_score, max_score = map(int, range_str.split('-'))
            if min_score <= score <= max_score:
                return grade_info
        
        return SPORTS_PARTNERSHIP_RUBRIC["overall_scoring"]["0-59"]
    
    def generate_feedback(self, transcript: str) -> dict:
        """
        Generate comprehensive feedback for a call transcript
        
        Args:
            transcript: Full text of the sales call
            
        Returns:
            Dictionary containing feedback data
            
        Raises:
            ValueError: If transcript is too short or invalid
            Exception: If AI generation fails
        """
        if len(transcript.strip()) < 50:
            raise ValueError("Transcript too short to evaluate (minimum 50 characters)")
        
        # Initialize Cohere client
        api_key = os.getenv('COHERE_API_KEY')
        if not api_key:
            raise ValueError("COHERE_API_KEY not configured")
        
        try:
            # Try ClientV2 first (newer API)
            client = cohere.ClientV2(api_key)
            use_v2 = True
        except Exception:
            # Fallback to v1 API
            client = cohere.Client(api_key)
            use_v2 = False
        
        # Build evaluation prompt
        prompt = self.build_evaluation_prompt(transcript)
        
        # Call Cohere API
        if use_v2:
            response = client.chat(
                model="command-a-03-2025",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
            )
            response_text = response.message.content[0].text.strip()
        else:
            response = client.chat(
                message=prompt,
                model="command-a-03-2025",
                temperature=0.3,
            )
            response_text = response.text.strip()
        
        # Try to extract JSON if wrapped in markdown code blocks
        if response_text.startswith("```"):
            # Remove code block markers
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        feedback_data = json.loads(response_text)
        
        # Validate and enhance response
        if "categories" not in feedback_data:
            raise ValueError("Invalid response format: missing categories")
        
        # Calculate weighted score if not present
        if "overall" not in feedback_data or "weighted_score" not in feedback_data["overall"]:
            weighted_score = self.calculate_weighted_score(feedback_data["categories"])
            grade_info = self.get_grade_from_score(weighted_score)
            
            if "overall" not in feedback_data:
                feedback_data["overall"] = {}
            
            feedback_data["overall"]["weighted_score"] = weighted_score
            feedback_data["overall"]["grade"] = grade_info["grade"]
            if "summary" not in feedback_data["overall"]:
                feedback_data["overall"]["summary"] = grade_info["description"]
        
        # Add rubric reference for frontend
        feedback_data["rubric_reference"] = {
            "total_categories": len(SPORTS_PARTNERSHIP_RUBRIC["categories"]),
            "category_names": [cat["name"] for cat in SPORTS_PARTNERSHIP_RUBRIC["categories"]]
        }
        
        return feedback_data
    
    def get_rubric(self) -> dict:
        """
        Returns the complete rubric for reference
        """
        return SPORTS_PARTNERSHIP_RUBRIC


# Create singleton instance
feedback_service = FeedbackService()
