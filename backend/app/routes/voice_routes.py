from flask import Blueprint, request, jsonify
from flask_socketio import emit, join_room, leave_room
from app import socketio
from app.clients.cohere_client import cohere_client
from app.clients.elevenlabs_client import elevenlabs_client
from app.services.conversation_service import conversation_service
import uuid
import base64

bp = Blueprint('voice', __name__)

@bp.route('/api/start-voice-session', methods=['POST'])
def start_voice_session():
    """Initialize a voice conversation session"""
    try:
        print("📞 Starting voice session...")
        data = request.json
        session_id = str(uuid.uuid4())
        
        # Create conversation with persona
        persona_data = {
            'name': data.get('name', 'Alex Johnson'),
            'role': data.get('role', 'VP of Sales'),
            'company': data.get('company', 'TechCorp'),
            'difficulty': data.get('difficulty', 'professional'),
            'background': data.get('background', 'Experienced professional.')
        }
        
        conversation_service.create_conversation(session_id, persona_data)
        
        print(f"✅ Session created: {session_id}")
        return jsonify({
            'session_id': session_id,
            'persona': persona_data
        }), 200
    
    except Exception as e:
        print(f"❌ Error starting session: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print('🔌 Client connected to WebSocket')
    emit('connection_response', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    print('🔌 Client disconnected from WebSocket')

@socketio.on('join_voice_session')
def handle_join_session(data):
    """Client joins a voice session room"""
    session_id = data.get('session_id')
    join_room(session_id)
    print(f'✅ Client joined session: {session_id}')
    emit('joined_session', {'session_id': session_id}, room=session_id)

@socketio.on('user_audio')
def handle_user_audio(data):
    """Handle incoming user audio (transcribed text)"""
    session_id = data.get('session_id')
    user_text = data.get('text')
    
    print(f"🎤 User said: {user_text}")
    
    if not user_text or not session_id:
        return
    
    try:
        # Add user message to conversation
        conversation_service.add_turn(session_id, 'USER', user_text)
        
        # Emit transcript update
        emit('transcript_update', {
            'speaker': 'user',
            'text': user_text
        }, room=session_id)
        
        # Get AI response from Cohere
        persona_prompt = conversation_service.get_persona_prompt(session_id)
        chat_history = conversation_service.get_history(session_id)
        
        print("🤖 Generating AI response...")
        ai_response = cohere_client.generate_response(
            user_message=user_text,
            persona_prompt=persona_prompt,
            chat_history=chat_history
        )
        
        print(f"🤖 AI responded: {ai_response}")
        
        # Add AI response to conversation
        conversation_service.add_turn(session_id, 'ASSISTANT', ai_response)
        
        # Emit transcript update
        emit('transcript_update', {
            'speaker': 'ai',
            'text': ai_response
        }, room=session_id)
        
        # Convert AI response to speech
        print("🔊 Converting to speech...")
        audio_data = elevenlabs_client.text_to_speech(ai_response)
        
        if audio_data:
            # Send audio back to client (base64 encoded)
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            emit('ai_audio', {
                'audio': audio_base64,
                'text': ai_response
            }, room=session_id)
            print("✅ Audio sent to client")
        else:
            print("❌ No audio data generated")
    
    except Exception as e:
        print(f'❌ Error handling user audio: {e}')
        import traceback
        traceback.print_exc()
        emit('error', {'message': str(e)}, room=session_id)

@socketio.on('end_voice_session')
def handle_end_session(data):
    """End the voice session"""
    session_id = data.get('session_id')
    
    print(f"🛑 Ending session: {session_id}")
    
    # Get final transcript
    transcript = conversation_service.get_transcript(session_id)
    
    # End conversation
    conversation_service.end_conversation(session_id)
    
    # Send transcript back
    emit('session_ended', {'transcript': transcript}, room=session_id)
    
    leave_room(session_id)
    print(f'✅ Session ended: {session_id}')