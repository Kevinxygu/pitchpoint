'use client'

import { useAuth0 } from '@auth0/auth0-react'

type LoginButtonProps = {
  redirectTo?: string
}

export default function LoginButton({
  redirectTo = '/dashboard',
}: LoginButtonProps) {
  const { loginWithRedirect, isLoading } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}${redirectTo}`,
      },
    })
  }

  return (
    <button
      className="button login"
      type="button"
      onClick={handleLogin}
      disabled={isLoading}
    >
      Log in
    </button>
  )
}
