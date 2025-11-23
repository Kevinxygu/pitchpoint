'use client'

import { ReactNode } from 'react'
import { Auth0Provider } from '@auth0/auth0-react'

type Auth0ProviderWithConfigProps = {
  children: ReactNode
}

export default function Auth0ProviderWithConfig({
  children,
}: Auth0ProviderWithConfigProps) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
  const redirectUri =
    typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard`
      : undefined

  if (!domain || !clientId) {
    throw new Error(
      'Missing Auth0 configuration. Set NEXT_PUBLIC_AUTH0_DOMAIN and NEXT_PUBLIC_AUTH0_CLIENT_ID in your .env.local file.'
    )
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
    >
      {children}
    </Auth0Provider>
  )
}
