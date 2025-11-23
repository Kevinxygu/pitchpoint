'use client'

import { useAuth0 } from '@auth0/auth0-react'

export default function ProfileCard() {
  const { user, isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <div className="subtle-text">Loading profile...</div>
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="profile-card">
      <div className="avatar-frame">
        <img
          src={
            user.picture ||
            `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 110 110'%3E%3Ccircle cx='55' cy='55' r='55' fill='%23ff6b00'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E`
          }
          alt={user.name || 'User avatar'}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement
            target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 110 110'%3E%3Ccircle cx='55' cy='55' r='55' fill='%23ff6b00'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E`
          }}
        />
      </div>
      <div className="profile-meta">
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
      </div>
    </div>
  )
}
