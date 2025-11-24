'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import { Phone, Sparkles, LogOut } from 'lucide-react'

const personalityOptions = [
  { value: 'enthusiastic', label: 'Enthusiastic Hype' },
  { value: 'analytical', label: 'Analytical Strategist' },
  { value: 'concise', label: 'Concise Closer' },
  { value: 'friendly', label: 'Friendly Partner' },
]

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth0()
  const router = useRouter()

  const [company, setCompany] = useState('')
  const [personality, setPersonality] = useState(personalityOptions[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  const buildPersonaFromProfile = (companyName: string, profile: any, personalityValue: string) => {
    const primaryContact = profile?.key_personnel?.[0] || {}

    return {
      name: primaryContact.name || companyName,
      role: primaryContact.title || 'Decision Maker',
      company: profile?.entity_name || companyName,
      difficulty: 'medium',
      background: profile?.overview || '',
      personality: personalityValue,
    }
  }

  const get_company_info = async (companyName: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: companyName,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch company info')
    }

    return response.json()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    try {
      setIsSubmitting(true)
      setError('')

      const companyData = await get_company_info(company)
      const personaPayload = buildPersonaFromProfile(company, companyData?.profile, personality)
      const personaString = JSON.stringify(personaPayload)

      sessionStorage.setItem('persona', personaString)
      router.push(`/call?persona=${encodeURIComponent(personaString)}`)
    } catch (err) {
      console.error(err)
      setError('Unable to start call. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F001E] flex items-center justify-center p-6">
        <div className="bg-[#0F001E] border border-[#DE0037]/30 rounded-lg p-8 flex items-center gap-4">
          <div className="w-3 h-3 bg-[#DE0037] rounded-full animate-pulse" />
          <p className="text-white/60">Preparing your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0F001E] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DE0037]/20 border border-[#DE0037]/30 rounded-full mb-3">
              <Sparkles className="w-4 h-4 text-[#DE0037]" />
              <span className="text-[#DE0037] text-sm font-medium">Signed In</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/60">Welcome back, {user?.name || 'User'}!</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Profile Card */}
        {user && (
          <div className="mb-8 bg-[#0F001E] border border-[#DE0037]/30 rounded-lg p-6">
            <div className="flex items-center gap-4">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-16 h-16 rounded-full border-2 border-[#DE0037]"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#DE0037] flex items-center justify-center text-white text-xl font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                <p className="text-white/60">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Call Settings Card */}
        <div className="bg-[#0F001E] border border-[#DE0037] rounded-lg p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DE0037]/20 border border-[#DE0037]/30 rounded-full mb-3">
              <Phone className="w-4 h-4 text-[#DE0037]" />
              <span className="text-[#DE0037] text-sm font-medium">Call Settings</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Prepare the Outreach</h2>
            <p className="text-white/60">
              Enter the company you&apos;re targeting and choose the persona to deliver the pitch.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Acme Sportswear"
                className="w-full px-4 py-3 bg-[#0F001E] border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#DE0037] transition-colors"
                required
              />
            </div>

            {/* Personality Select */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Personality
              </label>
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="w-full px-4 py-3 bg-[#0F001E] border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#DE0037] transition-colors"
              >
                {personalityOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#0F001E]">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[#DE0037]/20 border border-[#DE0037] rounded-lg">
                <p className="text-[#DE0037] text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !company}
              className="w-full px-6 py-4 bg-[#DE0037] hover:bg-[#DE0037]/90 disabled:bg-[#DE0037]/50 rounded-lg text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Starting Call...</span>
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  <span>Start Call</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
