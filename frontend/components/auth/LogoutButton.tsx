'use client'

import { useAuth0 } from '@auth0/auth0-react'

export default function LogoutButton() {
  const { logout, isLoading } = useAuth0()

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return (
    <button
      className="button logout"
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
    >
      Log out
    </button>
  )
}
