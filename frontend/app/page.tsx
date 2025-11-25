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
            {/* <a href="#pricing" className="landing-nav-link">Pricing</a>
            <a href="#support" className="landing-nav-link">Support</a> */}
          </div>

          <div className="landing-nav-actions">
            <button
              className="landing-btn landing-btn-secondary"
              onClick={handleSignIn}
            >
              Sign In
            </button>
            <button
              className="landing-btn landing-btn-secondary"
              onClick={handleCreateAccount}
            >
              Join Us Today!
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="landing-hero-content pt-16">
          <h1 className="landing-hero-title">
            Score your dream deal with PitchPoint AI Sales Coach
          </h1>

          <p className="landing-hero-subtitle text-xs">
            PitchPoint helps sports partnership teams practice selling with AI-powered mock calls trained on your actual deals,
            so your reps stop leaving money on the table, pitch the right products every time, and
            close partnerships with confidence.
          </p>

          <div className="landing-hero-actions">
            <button
              className="landing-btn landing-btn-primary landing-btn-large"
              onClick={handleCreateAccount}
            >
              Try For Free*
            </button>
            {/* <button
              className="landing-btn landing-btn-secondary landing-btn-large"
              onClick={handleSignIn}
            >
              Sign In
            </button> */}
            {/* <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdsExDvTUdw4FFoDybJBJoMUPOUmOlAZ07qKWfBC4FDicibsg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-btn landing-btn-secondary landing-btn-large"
            >
              Join Waitlist
            </a> */}
          </div>
          <p className="landing-hero-subtitle text-xs">
            <i>*Limited time offer</i>
          </p>
        </div>
      </main>

      {/* Core Functionality Section */}
      <section className="landing-section mt-24">
        <div className="landing-section-content pl-24">
          <div className="landing-section-text">
            <h2 className="landing-section-title">
              Practice Every Pitch.<br />
              Score Every Deal.
            </h2>

            <div className="landing-feature">
              <h3 className="landing-feature-title">Master Your Pitch Before Game Day</h3>
              <p className="landing-feature-text">
                We simulate sales calls with tailored AI buyer personas powered by your CRM data, past sales calls, and industry research, so you can practice risk-free.
              </p>
            </div>

            <div className="landing-feature">
              <h3 className="landing-feature-title">Every Personality. Every Scenario.</h3>
              <p className="landing-feature-text">
                Practice against 6+ personality modes + randomized real-world scenarios for you to succeed every time.
              </p>
            </div>

            <div className="landing-feature">
              <h3 className="landing-feature-title">Right Product, Every Time</h3>
              <p className="landing-feature-text">
                Upload your product catalogue and our tailored evaluation rubric finds the best products for every customer, so no deal gets left behind.
              </p>
            </div>

            <button
              className="landing-btn landing-btn-primary landing-btn-large"
              onClick={handleCreateAccount}
            >
              Try a Free Demo
            </button>
          </div>

          <div className="landing-section-image">
            <Image
              src="/images/laptop-demo.png"
              alt="PitchPoint Demo"
              width={800}
              height={600}
              className="laptop-demo-image"
            />
          </div>
        </div>
      </section>

      {/* Ready to Get Started Section */}
      <section className="landing-section landing-section-cta">
        <div className="landing-section-content pl-24">
          <div className="landing-section-text">
            <h2 className="landing-section-title">
              Ready to Get Started?
            </h2>

            <p className="landing-cta-text">
              Contact us <a href="mailto:pitchpointdigital@gmail.com" className="landing-email-link">pitchpointdigital@gmail.com</a> and we'll find a plan that fits your team.
            </p>

            <button
              className="landing-btn landing-btn-primary landing-btn-large"
              onClick={handleCreateAccount}
            >
              Join Us Today
            </button>
          </div>

          <div className="landing-section-image">
            <Image
              src="/images/call-demo.png"
              alt="Call Demo"
              width={600}
              height={700}
              className="call-demo-image pr-24"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
