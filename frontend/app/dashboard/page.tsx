'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import ProfileCard from '@/components/auth/ProfileCard'
import LogoutButton from '@/components/auth/LogoutButton'

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth0()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="auth-shell">
        <div className="card glass loading-card">
          <div className="pulse-dot" />
          <p className="subtle-text">Preparing your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="auth-shell">
      <div className="card glass dashboard-card">
        <div className="pill">Signed in</div>
        <h1 className="hero-title">Dashboard</h1>
        <p className="hero-subtitle">
          You are authenticated via Auth0. Your profile is ready below.
        </p>
        <ProfileCard />
        <div className="cta-row">
          <LogoutButton />
        </div>
      </div>
    </main>
  )
}
