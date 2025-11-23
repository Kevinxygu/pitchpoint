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
            for chunk in audio_generator:
                if chunk:
                    audio_data += chunk
            
            return audio_data
        
        except Exception as e:
            print(f"Error in text-to-speech: {e}")
            return b''

# Singleton instance
elevenlabs_client = ElevenLabsClient()