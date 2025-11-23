from typing import List, Dict

class ConversationService:
    def __init__(self):
        self.conversations = {}  # Store active conversations by session_id
    
    def create_conversation(self, session_id: str, persona_data: Dict) -> None:
        """Initialize a new conversation session"""
        self.conversations[session_id] = {
            'persona': persona_data,
            'history': [],
            'transcript': []
        }
    
    def add_turn(self, session_id: str, role: str, message: str) -> None:
        """Add a conversation turn"""
        if session_id in self.conversations:
            self.conversations[session_id]['history'].append({
                'role': role,
                'message': message
            })
            self.conversations[session_id]['transcript'].append({
                'speaker': 'user' if role == 'USER' else 'ai',
                'text': message,
                'timestamp': len(self.conversations[session_id]['transcript'])
            })
    
    def get_history(self, session_id: str) -> List[Dict]:
        """Get conversation history"""
        if session_id in self.conversations:
            return self.conversations[session_id]['history']
        return []
    
    def get_transcript(self, session_id: str) -> List[Dict]:
        """Get formatted transcript"""
        if session_id in self.conversations:
            return self.conversations[session_id]['transcript']
        return []
    
    def get_persona_prompt(self, session_id: str) -> str:
        """Get the persona prompt for this conversation"""
        if session_id in self.conversations:
            persona = self.conversations[session_id]['persona']
            return f"""You are {persona['name']}, {persona['role']} at {persona['company']}.

Personality: {persona.get('difficulty', 'professional')}
Background: {persona.get('background', 'You are a busy professional.')}

Instructions:
- Keep responses short (1-2 sentences max in a live call)
- Ask probing questions about the product
- Raise realistic objections based on your role
- Stay in character
- Be natural and conversational"""
        return "You are a professional buyer in a sales call."
    
    def end_conversation(self, session_id: str) -> Dict:
        """End conversation and return final data"""
        if session_id in self.conversations:
            data = self.conversations[session_id]
            del self.conversations[session_id]
            return data
        return {}

# Singleton instance
conversation_service = ConversationService()