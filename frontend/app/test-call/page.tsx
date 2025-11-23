'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TestCallPage() {
    const router = useRouter()

    useEffect(() => {
        // Create a default persona for testing
        const defaultPersona = {
            name: "Alex Johnson",
            role: "VP of Sales",
            company: "TechCorp",
            difficulty: "medium",
            background: "Experienced sales professional interested in new solutions.",
            personality: "enthusiastic"
        }

        // Store in sessionStorage
        sessionStorage.setItem('persona', JSON.stringify(defaultPersona))

        // Redirect to call page
        router.push('/call')
    }, [router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-xl">Setting up test call...</p>
            </div>
        </div>
    )
}
