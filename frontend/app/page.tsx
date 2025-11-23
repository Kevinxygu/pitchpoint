'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import { ShieldCheck, Sparkles, ArrowRight, Lock, Globe2 } from 'lucide-react'
import LoginButton from '@/components/auth/LoginButton'
import SignupButton from '@/components/auth/SignupButton'

export default function Home() {
  const { isAuthenticated, isLoading, loginWithRedirect, error } = useAuth0()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleGoogleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/dashboard`,
        screen_hint: 'signup',
        connection: 'google-oauth2',
      },
    })
  }

  if (isLoading) {
    return (
      <div className="auth-shell">
        <div className="card glass loading-card">
          <div className="pulse-dot" />
          <p className="subtle-text">Checking your session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="auth-shell">
        <div className="card glass error-card">
          <div className="error-badge">Auth error</div>
          <p className="error-text">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="auth-shell">
      <div className="auth-grid">
        <section className="card glass hero-card">
          <div className="pill">
            <Sparkles size={16} />
            <span>Auth0 powered</span>
          </div>
          <h1 className="hero-title">
            Seamless login & signup built for your next launch
          </h1>
          <p className="hero-subtitle">
            Secure authentication with email or Google, routed straight to your
            dashboard with Auth0.
          </p>
          <div className="cta-row">
            <LoginButton />
            <SignupButton label="Create account" />
          </div>
          <button
            className="button ghost"
            type="button"
            onClick={handleGoogleSignup}
          >
            Continue with Google
            <ArrowRight size={18} />
          </button>
          <div className="trust-row">
            <ShieldCheck size={18} />
            <span>Enterprise-grade security backed by Auth0</span>
          </div>
        </section>

        <section className="card glass highlight-card">
          <div className="highlight">
            <div className="icon-circle">
              <Lock size={18} />
            </div>
            <div>
              <p className="highlight-title">SSO ready</p>
              <p className="highlight-text">
                Support Google and passwordless flows out of the box.
              </p>
            </div>
          </div>
          <div className="highlight">
            <div className="icon-circle">
              <Globe2 size={18} />
            </div>
            <div>
              <p className="highlight-title">Global audience</p>
              <p className="highlight-text">
                Universal login UI with localization handled for you.
              </p>
            </div>
          </div>
          <div className="highlight">
            <div className="icon-circle">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="highlight-title">Redirect to dashboard</p>
              <p className="highlight-text">
                After authentication you&apos;ll land on your dashboard
                automatically.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
