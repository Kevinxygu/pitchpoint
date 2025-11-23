import os
import cohere
from typing import List, Dict

class CohereClient:
    def __init__(self):
        self.api_key = os.getenv('COHERE_API_KEY')
        print(f"🔑 COHERE_API_KEY: {self.api_key[:10] if self.api_key else 'NOT FOUND'}...")
        
        if not self.api_key:
            raise ValueError("COHERE_API_KEY not found in environment variables")
        
        try:
            # Try ClientV2 first (newer API)
            self.client = cohere.ClientV2(self.api_key)
            self.use_v2 = True
            print(f"✅ Cohere ClientV2 initialized")
        except Exception as e:
            print(f"⚠️ ClientV2 failed, trying Client v1: {e}")
            try:
                # Fallback to v1 API
                self.client = cohere.Client(self.api_key)
                self.use_v2 = False
                print(f"✅ Cohere Client (v1) initialized")
            except Exception as e2:
                print(f"❌ Both Cohere clients failed: {e2}")
                raise
    
    def generate_response(
        self, 
        user_message: str, 
        persona_prompt: str,
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """Generate AI response using Cohere"""
        
        print("\n" + "="*60)
        print(f"🤖 COHERE GENERATE_RESPONSE CALLED")
        print(f"📝 User message: '{user_message}'")
        print(f"📋 Persona prompt: {persona_prompt[:100]}...")
        print(f"📚 Chat history length: {len(chat_history) if chat_history else 0}")
        print("="*60 + "\n")
        
        try:
            if self.use_v2:
                return self._generate_v2(user_message, persona_prompt, chat_history)
            else:
                return self._generate_v1(user_message, persona_prompt, chat_history)
        
        except Exception as e:
            print("\n" + "!"*60)
            print(f"❌ CRITICAL ERROR in generate_response:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print("!"*60 + "\n")
            
            import traceback
            traceback.print_exc()
            
            return "I'm sorry, could you repeat that?"
    
    def _generate_v2(self, user_message: str, persona_prompt: str, chat_history: List[Dict[str, str]]):
        """Generate using Cohere v2 API"""
        print("📡 Using Cohere API v2...")
        
        messages = []
        messages.append({"role": "system", "content": persona_prompt})
        
        if chat_history:
            for turn in chat_history[-5:]:
                role = "user" if turn["role"] == "USER" else "assistant"
                messages.append({"role": role, "content": turn["message"]})
        
        messages.append({"role": "user", "content": user_message})
        
        print(f"📨 Sending {len(messages)} messages to Cohere v2")
        
        response = self.client.chat(
            model="command-r-plus",
            messages=messages,
            temperature=0.7,
            max_tokens=150
        )
        
        ai_text = response.message.content[0].text.strip()
        print(f"✅ Cohere v2 response: '{ai_text}'")
        return ai_text
    
    def _generate_v1(self, user_message: str, persona_prompt: str, chat_history: List[Dict[str, str]]):
        """Generate using Cohere v1 API (fallback)"""
        print("📡 Using Cohere API v1 (fallback)...")
        
        # Build chat history for v1 chat API
        # Add persona as a SYSTEM message at the start
        chat_history_v1 = [{"role": "SYSTEM", "message": persona_prompt}]
        
        if chat_history:
            for turn in chat_history[-5:]:
                role = "USER" if turn["role"] == "USER" else "CHATBOT"
                chat_history_v1.append({"role": role, "message": turn["message"]})
        
        print(f"📨 Sending chat request to Cohere v1 with {len(chat_history_v1)} history items")
        
        response = self.client.chat(
            message=user_message,
            chat_history=chat_history_v1,
            model='command-a-03-2025',
            temperature=0.7,
            max_tokens=150
        )
        
        ai_text = response.text.strip()
        print(f"✅ Cohere v1 response: '{ai_text}'")
        return ai_text

# Singleton instance
print("🔄 Initializing Cohere client singleton...")
try:
    cohere_client = CohereClient()
    print("✅ Cohere client singleton created successfully")
except Exception as e:
    print(f"❌ Failed to create Cohere client: {e}")
    raise