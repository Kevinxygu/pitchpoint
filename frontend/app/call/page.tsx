'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Video, VideoOff, Mic, MicOff, Phone, Loader2, AlertCircle } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { Message, Persona } from '@/lib/types'

export default function CallPage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-[#0F001E] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-[#DE0037] animate-spin" />
                    <p className="text-[#FFFFFF]/60">Initializing call...</p>
                </div>
            </div>
        }>
            <CallContent />
        </React.Suspense>
    )
}

function CallContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State
    const [isConnected, setIsConnected] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [callDuration, setCallDuration] = useState(0)
    const [messages, setMessages] = useState<Message[]>([])
    const [persona, setPersona] = useState<Persona | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...')
    const [audioContextReady, setAudioContextReady] = useState(false)

    // Refs
    const socketRef = useRef<Socket | null>(null)
    const recognitionRef = useRef<any>(null)
    const spacePressedRef = useRef<boolean>(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)

    // ✨ NEW: Audio queue management for seamless playback
    const audioQueueRef = useRef<string[]>([])
    const isPlayingRef = useRef<boolean>(false)
    const currentAudioRef = useRef<HTMLAudioElement | null>(null)

    // Initialize session
    useEffect(() => {
        let mounted = true

        const initSession = async () => {
            if (socketRef.current?.connected) {
                console.log('⚠️ Socket already connected, skipping init')
                return
            }

            try {
                setConnectionStatus('Loading persona...')
                console.log('🚀 Initializing session...')

                // Get persona from URL params or sessionStorage
                const personaStr = searchParams?.get('persona') || sessionStorage.getItem('persona')
                if (!personaStr) {
                    if (mounted) {
                        setError('No persona data found')
                        setConnectionStatus('Error: No persona')
                    }
                    return
                }

                const parsedPersona = JSON.parse(personaStr)
                if (mounted) setPersona(parsedPersona)
                console.log('✅ Persona loaded:', parsedPersona)

                // Create voice session
                if (mounted) setConnectionStatus('Creating session...')
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
                if (mounted) {
                    setSessionId(data.session_id)
                    console.log('✅ Session created:', data.session_id)

                    // Connect WebSocket
                    setConnectionStatus('Connecting WebSocket...')
                    connectWebSocket(data.session_id)
                }

            } catch (error) {
                console.error('❌ Error initializing session:', error)
                if (mounted) {
                    setError(error instanceof Error ? error.message : 'Failed to initialize')
                    setConnectionStatus('Error')
                }
            }
        }

        initSession()

        return () => {
            mounted = false
            // ✨ UPDATED: Clean up audio queue
            audioQueueRef.current = []
            if (currentAudioRef.current) {
                currentAudioRef.current.pause()
                currentAudioRef.current = null
            }
            if (socketRef.current) {
                console.log('🧹 Cleaning up socket...')
                socketRef.current.disconnect()
                socketRef.current = null
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
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

    // ✨ NEW: Initialize AudioContext on first user interaction
    useEffect(() => {
        if (isListening && !audioContextRef.current) {
            initAudioContext()
        }
    }, [isListening])

    // Function to initialize AudioContext with user interaction
    const initAudioContext = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

                // ✨ CRITICAL: Resume immediately for HTTPS
                if (audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume()
                }

                setAudioContextReady(true)
                console.log('✅ AudioContext initialized and resumed')
            }
        } catch (error) {
            console.error('❌ Failed to initialize AudioContext:', error)
            setError('Failed to initialize audio. Please check browser permissions.')
        }
    }

    // Connect WebSocket
    const connectWebSocket = (session_id: string) => {
        if (socketRef.current?.connected) {
            console.log('⚠️ Socket already connected, joining session...')
            socketRef.current.emit('join_voice_session', { session_id })
            return
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
        console.log('🔌 Attempting WebSocket connection to:', backendUrl)

        const socket = io(backendUrl, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
            autoConnect: true,
            // ✨ NEW: Ensure transports work with HTTPS
            transports: ['websocket', 'polling']
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
            console.log('🔊 Received AI audio chunk')
            // ✨ NEW: Add to queue instead of playing immediately
            queueAudio(data.audio)
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
                socket.connect()
            }
        })

        socket.on('error', (error) => {
            console.error('❌ Socket error:', error)
            setError(error.message || 'Socket error occurred')
        })

        socketRef.current = socket
    }

    // ✨ NEW: Queue audio for sequential playback
    const queueAudio = (audioBase64: string) => {
        console.log('📥 Adding audio to queue, queue length:', audioQueueRef.current.length + 1)
        audioQueueRef.current.push(audioBase64)

        // Start playing if not already playing
        if (!isPlayingRef.current) {
            playNextInQueue()
        }
    }

    // ✨ NEW: Play next audio in queue
    const playNextInQueue = async () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false
            console.log('✅ Audio queue empty')
            return
        }

        isPlayingRef.current = true
        const audioBase64 = audioQueueRef.current.shift()!

        try {
            await playAudioChunk(audioBase64)
        } catch (error) {
            console.error('❌ Error playing audio chunk:', error)
        }

        // Play next in queue
        playNextInQueue()
    }

    // ✨ COMPLETELY REWRITTEN: Proper audio playback for ElevenLabs
    const playAudioChunk = async (audioBase64: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('🔊 Playing audio chunk...')

                // Ensure AudioContext is ready
                if (!audioContextRef.current) {
                    await initAudioContext()
                }

                // Resume if suspended
                if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume()
                }

                // ✨ CRITICAL FIX: Decode base64 properly
                const binaryString = atob(audioBase64)
                const bytes = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i)
                }

                // ✨ CRITICAL: Create blob with proper MIME type
                // ElevenLabs typically sends MP3, but check your backend
                const blob = new Blob([bytes.buffer], { type: 'audio/mpeg' })
                const url = URL.createObjectURL(blob)

                // Create audio element
                const audio = new Audio()
                currentAudioRef.current = audio

                audio.src = url
                audio.volume = 1.0
                audio.preload = 'auto'

                // ✨ CRITICAL: Handle all audio events
                audio.oncanplaythrough = async () => {
                    try {
                        await audio.play()
                        console.log('✅ Audio playing')
                    } catch (playError) {
                        console.error('❌ Play error:', playError)
                        reject(playError)
                    }
                }

                audio.onended = () => {
                    console.log('✅ Audio chunk finished')
                    URL.revokeObjectURL(url)
                    currentAudioRef.current = null
                    resolve()
                }

                audio.onerror = (e) => {
                    console.error('❌ Audio error:', e)
                    URL.revokeObjectURL(url)
                    setError('Audio playback error. Please check your connection.')
                    reject(new Error('Audio playback failed'))
                }

                // ✨ NEW: Set timeout for stuck audio
                const timeout = setTimeout(() => {
                    if (currentAudioRef.current === audio) {
                        console.warn('⚠️ Audio timeout, skipping...')
                        audio.pause()
                        URL.revokeObjectURL(url)
                        resolve()
                    }
                }, 30000) // 30 second timeout

                audio.onended = () => {
                    clearTimeout(timeout)
                    console.log('✅ Audio chunk finished')
                    URL.revokeObjectURL(url)
                    currentAudioRef.current = null
                    resolve()
                }

                // Load the audio
                audio.load()

            } catch (error) {
                console.error('❌ Error in playAudioChunk:', error)
                reject(error)
            }
        })
    }

    // Start voice recognition (push-to-talk)
    const startListening = () => {
        if (isListening) return
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser. Please use Chrome or Edge.')
            return
        }

        // Initialize AudioContext on first interaction
        if (!audioContextRef.current) {
            initAudioContext()
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsListening(true)
            setIsMuted(false)
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
            setIsListening(false)
            setIsMuted(true)
        }

        recognition.onend = () => {
            setIsListening(false)
            setIsMuted(true)
            recognitionRef.current = null
        }

        recognition.start()
        recognitionRef.current = recognition
    }

    // Stop voice recognition
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            recognitionRef.current = null
            setIsListening(false)
            setIsMuted(true)
        }
    }

    const handlePushToTalkStart = () => startListening()
    const handlePushToTalkEnd = () => stopListening()

    // Keyboard push-to-talk (Space bar)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Space' && !spacePressedRef.current && isConnected) {
                event.preventDefault()
                spacePressedRef.current = true
                handlePushToTalkStart()
            }
        }

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.code === 'Space' && spacePressedRef.current) {
                event.preventDefault()
                spacePressedRef.current = false
                handlePushToTalkEnd()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [isConnected])

    // End call
    const handleEndCall = () => {
        if (socketRef.current && sessionId) {
            socketRef.current.emit('end_voice_session', { session_id: sessionId })
        }

        // Stop everything
        stopListening()

        // ✨ NEW: Clear audio queue
        audioQueueRef.current = []
        if (currentAudioRef.current) {
            currentAudioRef.current.pause()
            currentAudioRef.current = null
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
        }

        // Save transcript and navigate
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
        <div className="min-h-screen flex flex-col p-6 bg-[#0F001E]">
            {/* Error Banner */}
            {error && (
                <div className="mb-4 p-4 bg-[#DE0037]/20 border border-[#DE0037] rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-[#DE0037]" />
                    <div>
                        <p className="text-[#FFFFFF] font-medium">Error</p>
                        <p className="text-[#FFFFFF]/80 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Audio status indicator */}
            {!audioContextReady && isConnected && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <p className="text-yellow-500 text-sm">
                        Click "Hold to Talk" to enable audio
                    </p>
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Left: Video Area with Gradient Background */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div
                        className="relative flex-1 rounded-lg overflow-hidden min-h-[500px] border-2 border-[#DE0037]"
                        style={{
                            backgroundImage: 'url(/images/call-gradient.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        {/* AI Prospect Avatar */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-48 h-48 rounded-full bg-[#DE0037] flex items-center justify-center text-[#FFFFFF] text-6xl font-bold shadow-lg">
                                {persona ? getInitials(persona.name) : 'AI'}
                            </div>
                            {persona && (
                                <div className="mt-6 text-center">
                                    <p className="text-2xl font-semibold text-[#FFFFFF]">
                                        {persona.name}
                                    </p>
                                    <p className="text-lg text-[#FFFFFF]/80">
                                        {persona.role} at {persona.company}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* User video (PIP) */}
                        <div className="absolute bottom-4 right-4 w-40 h-28 rounded-lg overflow-hidden border-2 border-[#FFFFFF]/20 bg-[#0F001E]">
                            {isVideoOn ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#0F001E]">
                                    <VideoOff className="w-8 h-8 text-[#FFFFFF]/60" />
                                </div>
                            )}
                        </div>

                        {/* Timer */}
                        <div className="absolute top-4 left-4 px-4 py-2 bg-[#0F001E]/80 rounded-lg text-[#FFFFFF] font-medium">
                            {formatTime(callDuration)}
                        </div>

                        {/* Status indicators */}
                        {!isConnected && (
                            <div className="absolute top-4 right-4 px-4 py-2 bg-yellow-500/80 rounded-lg text-[#FFFFFF] text-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {connectionStatus}
                            </div>
                        )}

                        {isListening && (
                            <div className="absolute top-16 right-4 px-4 py-2 bg-[#DE0037]/80 rounded-lg text-[#FFFFFF] text-sm flex items-center gap-2">
                                <Mic className="w-4 h-4" />
                                Listening...
                            </div>
                        )}

                        {/* ✨ NEW: Audio playing indicator */}
                        {isPlayingRef.current && (
                            <div className="absolute top-28 right-4 px-4 py-2 bg-green-500/80 rounded-lg text-[#FFFFFF] text-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#FFFFFF] rounded-full animate-pulse" />
                                AI Speaking...
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Transcript - Fixed and Scrollable */}
                <div className="flex flex-col border border-palette-red rounded-lg overflow-hidden bg-[#0F001E] h-full max-h-[calc(100vh-200px)]">
                    <div className="p-4 border-b border-palette-red flex-shrink-0">
                        <h3 className="text-lg font-semibold text-[#FFFFFF]">Live Transcript</h3>
                        <p className="text-sm text-white">
                            {persona?.name || 'AI Prospect'} • {persona?.company}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#DE0037] scrollbar-track-[#0F001E]">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-[#FFFFFF]/40 text-sm">
                                    {isConnected ? 'Start talking...' : connectionStatus}
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className="space-y-1">
                                    <p className={`text-sm font-semibold ${msg.speaker === 'user' ? 'text-[#DE0037]' : 'text-[#FFFFFF]'}`}>
                                        {msg.speaker === 'user' ? 'You' : persona?.name}
                                    </p>
                                    <p className={`text-sm ${msg.speaker === 'user' ? 'text-[#DE0037]/90' : 'text-[#FFFFFF]/80'}`}>
                                        {msg.text}
                                    </p>
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
                    className={`p-4 rounded-lg transition-colors ${isVideoOn
                        ? 'bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-[#0F001E]'
                        : 'bg-[#DE0037] hover:bg-[#DE0037]/90 text-[#FFFFFF]'
                        }`}
                >
                    {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>

                <button
                    onMouseDown={handlePushToTalkStart}
                    onMouseUp={handlePushToTalkEnd}
                    onMouseLeave={handlePushToTalkEnd}
                    onTouchStart={handlePushToTalkStart}
                    onTouchEnd={handlePushToTalkEnd}
                    onTouchCancel={handlePushToTalkEnd}
                    disabled={!isConnected}
                    className={`px-6 py-4 rounded-lg transition-colors flex items-center gap-2 ${isListening
                        ? 'bg-[#FFFFFF] hover:bg-[#FFFFFF]/90 text-[#0F001E]'
                        : 'bg-[#DE0037] hover:bg-[#DE0037]/90 text-[#FFFFFF]'
                        } disabled:opacity-50`}
                >
                    {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    <span className="font-medium">{isListening ? 'Listening...' : 'Hold to Talk'}</span>
                </button>

                <button
                    onClick={handleEndCall}
                    className="px-12 py-4 bg-[#DE0037] hover:bg-[#DE0037]/90 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Phone className="w-6 h-6 text-[#FFFFFF] rotate-[135deg]" />
                    <span className="text-[#FFFFFF] font-medium">End Call</span>
                </button>
            </div>

            {/* Debug info */}
            <div className="text-center mt-2">
                <p className="text-[#FFFFFF]/40 text-xs">
                    Backend: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}
                    {' • '}
                    Session: {sessionId?.slice(0, 8) || 'None'}
                    {' • '}
                    Audio: {audioContextReady ? '✅' : '⏳'}
                    {' • '}
                    Queue: {audioQueueRef.current.length}
                </p>
            </div>
        </div>
    )
}