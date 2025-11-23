'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Video, VideoOff, Mic, MicOff, Phone, Loader2, AlertCircle } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { Message, Persona } from '@/lib/types'

export default function CallPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State
    const [isConnected, setIsConnected] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [callDuration, setCallDuration] = useState(0)
    const [messages, setMessages] = useState<Message[]>([])
    const [persona, setPersona] = useState<Persona | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...')

    // Refs
    const socketRef = useRef<Socket | null>(null)
    const recognitionRef = useRef<any>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)

    // Initialize session
    useEffect(() => {
        const initSession = async () => {
            try {
                setConnectionStatus('Loading persona...')
                console.log('🚀 Initializing session...')

                // Get persona from URL params or sessionStorage
                const personaStr = searchParams?.get('persona') || sessionStorage.getItem('persona')
                if (!personaStr) {
                    setError('No persona data found')
                    setConnectionStatus('Error: No persona')
                    return
                }

                const parsedPersona = JSON.parse(personaStr)
                setPersona(parsedPersona)
                console.log('✅ Persona loaded:', parsedPersona)

                // Create voice session
                setConnectionStatus('Creating session...')
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
                console.log('🔗 Connecting to backend:', backendUrl)

                const response = await fetch(`${backendUrl}/api/start-voice-session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsedPersona)
                })

                if (!response.ok) {
                    throw new Error(`Backend returned ${response.status}`)
                }

                const data = await response.json()
                setSessionId(data.session_id)
                console.log('✅ Session created:', data.session_id)

                // Connect WebSocket
                setConnectionStatus('Connecting WebSocket...')
                connectWebSocket(data.session_id)

            } catch (error) {
                console.error('❌ Error initializing session:', error)
                setError(error instanceof Error ? error.message : 'Failed to initialize')
                setConnectionStatus('Error')
            }
        }

        initSession()

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [searchParams])

    // Initialize camera
    useEffect(() => {
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: true
                })

                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            } catch (error) {
                console.error('❌ Camera error:', error)
            }
        }

        initCamera()

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // Call timer
    useEffect(() => {
        if (!isConnected) return

        const interval = setInterval(() => {
            setCallDuration(prev => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [isConnected])

    // Connect WebSocket
    const connectWebSocket = (session_id: string) => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
        console.log('🔌 Attempting WebSocket connection to:', backendUrl)

        const socket = io(backendUrl, {
            transports: ['websocket', 'polling'], // Try both transports
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        })

        socket.on('connect', () => {
            console.log('✅ WebSocket connected!')
            setIsConnected(true)
            setConnectionStatus('Connected')
            setError(null)
            socket.emit('join_voice_session', { session_id })
        })

        socket.on('connection_response', (data) => {
            console.log('📡 Connection response:', data)
        })

        socket.on('joined_session', (data) => {
            console.log('✅ Joined session:', data)
        })

        socket.on('transcript_update', (data: { speaker: string; text: string }) => {
            console.log('📝 Transcript update:', data)
            setMessages(prev => [...prev, {
                speaker: data.speaker as 'user' | 'ai',
                text: data.text,
                timestamp: Date.now()
            }])
        })

        socket.on('ai_audio', async (data: { audio: string; text: string }) => {
            console.log('🔊 Received AI audio')
            await playAudio(data.audio)
        })

        socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error)
            setError(`Connection failed: ${error.message}`)
            setConnectionStatus('Connection failed')
        })

        socket.on('disconnect', (reason) => {
            console.log('🔌 WebSocket disconnected:', reason)
            setIsConnected(false)
            setConnectionStatus('Disconnected')

            if (reason === 'io server disconnect') {
                // Server disconnected, try reconnecting
                socket.connect()
            }
        })

        socket.on('error', (error) => {
            console.error('❌ Socket error:', error)
            setError(error.message || 'Socket error occurred')
        })

        socketRef.current = socket
    }

    // Play audio from base64
    const playAudio = async (audioBase64: string) => {
        try {
            // Create audio context if needed
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext()
            }

            // Decode base64 to array buffer
            const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))

            // Create audio element
            const blob = new Blob([audioData], { type: 'audio/mpeg' })
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)

            await audio.play()

            // Cleanup
            audio.onended = () => {
                URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('❌ Error playing audio:', error)
        }
    }

    // Start voice recognition
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser. Please use Chrome or Edge.')
            return
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsListening(true)
            console.log('🎤 Voice recognition started')
        }

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript
            console.log('🎤 User said:', transcript)

            // Send to backend
            if (socketRef.current && sessionId) {
                socketRef.current.emit('user_audio', {
                    session_id: sessionId,
                    text: transcript
                })
            }
        }

        recognition.onerror = (event: any) => {
            console.error('❌ Speech recognition error:', event.error)
            setError(`Speech recognition error: ${event.error}`)
        }

        recognition.onend = () => {
            if (isListening) {
                recognition.start() // Auto-restart
            }
        }

        recognition.start()
        recognitionRef.current = recognition
    }

    // Stop voice recognition
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }

    // Toggle microphone
    const toggleMic = () => {
        if (isMuted) {
            startListening()
            setIsMuted(false)
        } else {
            stopListening()
            setIsMuted(true)
        }
    }

    // End call
    const handleEndCall = () => {
        if (socketRef.current && sessionId) {
            socketRef.current.emit('end_voice_session', { session_id: sessionId })
        }

        // Stop everything
        stopListening()
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
        }

        // Save transcript and navigate
        // Format messages into a readable transcript string
        const formattedTranscript = messages
            .map(msg => `${msg.speaker === 'user' ? 'You' : persona?.name || 'AI'}: ${msg.text}`)
            .join('\n\n')

        sessionStorage.setItem('callTranscript', formattedTranscript)
        sessionStorage.setItem('callDuration', callDuration.toString())
        router.push('/feedback')
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col p-6">
            {/* Error Banner */}
            {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div>
                        <p className="text-white font-medium">Connection Error</p>
                        <p className="text-white/80 text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Video Area */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="relative flex-1 bg-blue-800/30 rounded-lg overflow-hidden min-h-[500px]">
                        {/* AI Prospect Avatar */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-48 h-48 rounded-full bg-blue-500 flex items-center justify-center text-white text-6xl font-bold shadow-lg">
                                {persona ? getInitials(persona.name) : 'AI'}
                            </div>
                            {persona && (
                                <div className="mt-6 text-center">
                                    <p className="text-2xl font-semibold text-white">
                                        {persona.name}
                                    </p>
                                    <p className="text-lg text-white/80">
                                        {persona.role} at {persona.company}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* User video (PIP) */}
                        <div className="absolute bottom-4 right-4 w-40 h-28 rounded-lg overflow-hidden border-2 border-white/20 bg-black">
                            {isVideoOn ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <VideoOff className="w-8 h-8 text-white/60" />
                                </div>
                            )}
                        </div>

                        {/* Timer */}
                        <div className="absolute top-4 left-4 px-4 py-2 bg-black/50 rounded-lg text-white font-medium">
                            {formatTime(callDuration)}
                        </div>

                        {/* Status indicators */}
                        {!isConnected && (
                            <div className="absolute top-4 right-4 px-4 py-2 bg-yellow-500/80 rounded-lg text-white text-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {connectionStatus}
                            </div>
                        )}

                        {isListening && (
                            <div className="absolute top-16 right-4 px-4 py-2 bg-green-500/80 rounded-lg text-white text-sm flex items-center gap-2">
                                <Mic className="w-4 h-4" />
                                Listening...
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Transcript */}
                <div className="flex flex-col border border-white/20 rounded-lg overflow-hidden bg-white/5">
                    <div className="p-4 border-b border-white/20">
                        <h3 className="text-lg font-semibold text-white">Live Transcript</h3>
                        <p className="text-sm text-white/60">
                            {persona?.name || 'AI Prospect'} • {persona?.company}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                            Status: {connectionStatus}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-white/40 text-sm">
                                    {isConnected ? 'Start talking...' : connectionStatus}
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className="space-y-1">
                                    <p className="text-sm font-semibold text-white">
                                        {msg.speaker === 'user' ? 'You' : persona?.name}
                                    </p>
                                    <p className="text-sm text-white/80">{msg.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-4 rounded-lg transition-colors ${isVideoOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'
                        }`}
                >
                    {isVideoOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
                </button>

                <button
                    onClick={toggleMic}
                    disabled={!isConnected}
                    className={`p-4 rounded-lg transition-colors ${!isMuted ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'
                        } disabled:opacity-50`}
                >
                    {!isMuted ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
                </button>

                <button
                    onClick={handleEndCall}
                    className="px-12 py-4 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Phone className="w-6 h-6 text-white rotate-[135deg]" />
                    <span className="text-white font-medium">End Call</span>
                </button>
            </div>

            {/* Quick start button */}
            {!isListening && isConnected && (
                <div className="text-center mt-4">
                    <button
                        onClick={startListening}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors"
                    >
                        Click to Start Talking
                    </button>
                </div>
            )}

            {/* Debug info */}
            <div className="text-center mt-2">
                <p className="text-white/40 text-xs">
                    Backend: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}
                    {' • '}
                    Session: {sessionId?.slice(0, 8) || 'None'}
                </p>
            </div>
        </div>
    )
}