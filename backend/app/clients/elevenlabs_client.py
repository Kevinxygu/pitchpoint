import os
from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings

class ElevenLabsClient:
    def __init__(self):
        self.api_key = os.getenv('ELEVENLABS_API_KEY')
        self.voice_id = os.getenv('ELEVENLABS_VOICE_ID', '21m00Tcm4TlvDq8ikWAM')
        self.client = ElevenLabs(api_key=self.api_key)
    
    def text_to_speech(self, text: str) -> bytes:
        """
        Convert text to speech audio
        
        Args:
            text: Text to convert
        
        Returns:
            Audio bytes (MP3)
        """
        try:
            if not self.api_key:
                print("❌ ELEVENLABS_API_KEY not set!")
                return b''
            
            print(f"🎙️ ElevenLabs TTS request:")
            print(f"   Voice ID: {self.voice_id}")
            print(f"   Text length: {len(text)} chars")
            print(f"   Text preview: {text[:100]}...")
            
            # Use the correct API method
            audio_generator = self.client.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id="eleven_turbo_v2_5",
                voice_settings=VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.75,
                    style=0.0,
                    use_speaker_boost=True
                )
            )
            
            # Collect audio chunks
            audio_data = b''
            chunk_count = 0
            for chunk in audio_generator:
                if chunk:
                    audio_data += chunk
                    chunk_count += 1
            
            print(f"✅ ElevenLabs TTS success: {len(audio_data)} bytes in {chunk_count} chunks")
            return audio_data
        
        except Exception as e:
            print(f"❌ ElevenLabs TTS error: {e}")
            import traceback
            traceback.print_exc()
            return b''

# Singleton instance
elevenlabs_client = ElevenLabsClient()