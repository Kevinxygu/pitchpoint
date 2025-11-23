'use client'

import { useAuth0 } from '@auth0/auth0-react'

type SignupButtonProps = {
  redirectTo?: string
  connection?: string
  label?: string
}

export default function SignupButton({
  redirectTo = '/dashboard',
  connection,
  label = 'Sign up',
}: SignupButtonProps) {
  const { loginWithRedirect, isLoading } = useAuth0()

  const handleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}${redirectTo}`,
        screen_hint: 'signup',
        ...(connection ? { connection } : {}),
      },
    })
  }

  return (
    <button
      className="button signup"
      type="button"
      onClick={handleSignup}
      disabled={isLoading}
    >
      {label}
    </button>
  )
}
