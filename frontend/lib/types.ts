export interface Persona {
    name: string
    role: string
    company: string
    difficulty: 'easy' | 'medium' | 'hard'
    background?: string
}

export interface Message {
    speaker: 'user' | 'ai'
    text: string
    timestamp: number
}

export interface VoiceSession {
    session_id: string
    persona: Persona
}