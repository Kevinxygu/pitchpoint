'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const personalityOptions = [
  { value: 'enthusiastic', label: 'Enthusiastic Hype' },
  { value: 'analytical', label: 'Analytical Strategist' },
  { value: 'concise', label: 'Concise Closer' },
  { value: 'nice', label: 'Nice' },
  { value: 'angry', label: 'Angry' },
  { value: 'skeptical', label: 'Skeptical' },
  { value: 'confused', label: 'Confused' },
  { value: 'random', label: 'Random' },
  { value: 'distracted', label: 'Distracted' },
  { value: 'indecisive', label: 'Indecisive' },
]

export default function CallSettings() {
  const [company, setCompany] = useState('')
  const [personality, setPersonality] = useState(personalityOptions[0].value)
  const [role, setRole] = useState('')
  const [objective, setObjective] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const buildPersonaFromProfile = (companyName, profile, personalityValue, roleValue, objectiveValue) => {
    const primaryContact = profile?.key_personnel?.[0] || {}

    return {
      name: primaryContact.name || companyName,
      role: roleValue || primaryContact.title || 'Decision Maker',
      objective: objectiveValue || 'Drive the conversation forward',
      company: profile?.entity_name || companyName,
      difficulty: 'medium',
      background: profile?.overview || '',
      personality: personalityValue,
    }
  }

  const get_company_info = async (companyName) => {
    const response = await fetch('http://localhost:5001/research', {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!company) return

    try {
      setIsSubmitting(true)
      setError('')

      const companyData = await get_company_info(company)
      const personaPayload = buildPersonaFromProfile(
        company,
        companyData?.profile,
        personality,
        role,
        objective
      )
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

  return (
    <section className="auth-shell">
      <div className="card glass" style={{ width: 'min(520px, 100%)' }}>
        <div className="pill">Call settings</div>
        <h2 className="hero-title">Prepare the outreach</h2>
        <p className="hero-subtitle">
          Enter the company you&apos;re targeting and choose the persona to deliver the pitch.
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label className="input-block">
            <span className="input-label">Company name</span>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Acme Sportswear"
              className="input"
              required
            />
          </label>

          <label className="input-block">
            <span className="input-label">Personality</span>
            <select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="input"
            >
              {personalityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="input-block">
            <span className="input-label">Role</span>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Account Executive"
              className="input"
            />
          </label>

          <label className="input-block">
            <span className="input-label">Call objective</span>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g., Secure a follow-up meeting to discuss tailored solutions"
              className="input"
              rows={3}
            />
          </label>

          {error && <p className="input-error">{error}</p>}

          <button type="submit" className="button login" style={{ marginTop: '0.5rem' }} disabled={isSubmitting}>
            Start Call
          </button>
        </form>
      </div>
    </section>
  )
}
