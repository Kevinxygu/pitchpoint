'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import Image from 'next/image'

export default function Home() {
  const { isAuthenticated, isLoading, loginWithRedirect, error } = useAuth0()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleCreateAccount = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/dashboard`,
        screen_hint: 'signup',
      },
    })
  }

  const handleSignIn = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/dashboard`,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="login-shell">
        <div className="card glass loading-card">
          <p className="subtle-text">Checking your session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="login-shell">
        <div className="card glass error-card">
          <div className="error-badge">Auth error</div>
          <p className="error-text">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <div className="landing-logo">
            <Image
              src="/images/white-logo.png"
              alt="PitchPoint Logo"
              width={150}
              height={40}
              priority
            />
          </div>

          <div className="landing-nav-links">
            <a href="#pricing" className="landing-nav-link">Pricing</a>
            <a href="#support" className="landing-nav-link">Support</a>
          </div>

          <div className="landing-nav-actions">
            <button
              className="landing-btn landing-btn-secondary"
              onClick={handleSignIn}
            >
              Sign In
            </button>
            <button
              className="landing-btn landing-btn-primary"
              onClick={handleCreateAccount}
            >
              Try It Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            Discover how you can score your dream deal with PitchPoint AI Sales Coach
          </h1>

          <p className="landing-hero-subtitle">
            Your go-to AI mock sales call tool for sports partnership teams
          </p>

          <div className="landing-hero-actions">
            <button
              className="landing-btn landing-btn-primary landing-btn-large"
              onClick={handleCreateAccount}
            >
              Try It Now
            </button>
            <button
              className="landing-btn landing-btn-secondary landing-btn-large"
              onClick={handleSignIn}
            >
              Sign In
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
