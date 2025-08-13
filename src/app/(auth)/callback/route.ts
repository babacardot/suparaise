import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        // Extract provider-specific data and update user metadata
        if (data.user.app_metadata?.provider) {
          const provider = data.user.app_metadata.provider
          type UserMetadata = {
            [key: string]: unknown
            first_name?: string
            last_name?: string
            full_name?: string
            name?: string
            picture?: string
            profile?: string
            avatar_url?: string
            profile_image_url?: string
            screen_name?: string
            twitter_username?: string
            twitter_url?: string
            linkedin_url?: string
          }
          const providerData = data.user.user_metadata as Record<
            string,
            unknown
          >
          const updatedMetadata: UserMetadata = {
            ...(providerData as UserMetadata),
          }

          const asString = (v: unknown) => (typeof v === 'string' ? v : '')

          // If first/last provided from email signup, ensure full_name is set
          if (!updatedMetadata.full_name) {
            const first = asString(updatedMetadata.first_name).trim()
            const last = asString(updatedMetadata.last_name).trim()
            const composed = `${first} ${last}`.trim()
            if (composed) {
              updatedMetadata.full_name = composed
            }
          }

          // Handle LinkedIn-specific data
          if (provider === 'linkedin_oidc') {
            // LinkedIn OIDC provides profile URL and picture
            if ((providerData as Record<string, unknown>).profile) {
              updatedMetadata.linkedin_url = asString(
                (providerData as Record<string, unknown>).profile,
              )
            }
            if (
              (providerData as Record<string, unknown>).picture &&
              !updatedMetadata.avatar_url
            ) {
              updatedMetadata.avatar_url = asString(
                (providerData as Record<string, unknown>).picture,
              )
            }
            // Store LinkedIn-specific name if available
            if (
              (providerData as Record<string, unknown>).name &&
              !updatedMetadata.full_name
            ) {
              updatedMetadata.full_name = asString(
                (providerData as Record<string, unknown>).name,
              )
            }
          }

          // Handle Twitter/X-specific data
          if (provider === 'twitter') {
            // Twitter provides profile_image_url and screen_name
            if (
              (providerData as Record<string, unknown>).profile_image_url &&
              !updatedMetadata.avatar_url
            ) {
              updatedMetadata.avatar_url = asString(
                (providerData as Record<string, unknown>).profile_image_url,
              )
            }
            if ((providerData as Record<string, unknown>).screen_name) {
              const screen = asString(
                (providerData as Record<string, unknown>).screen_name,
              )
              updatedMetadata.twitter_username = screen
              // Construct Twitter URL from username
              updatedMetadata.twitter_url = `https://twitter.com/${screen}`
            }
            // Store Twitter-specific name if available
            if (
              (providerData as Record<string, unknown>).name &&
              !updatedMetadata.full_name
            ) {
              updatedMetadata.full_name = asString(
                (providerData as Record<string, unknown>).name,
              )
            }
          }

          // Handle Github data (preserve existing logic)
          if (provider === 'github') {
            if (
              (providerData as Record<string, unknown>).avatar_url &&
              !updatedMetadata.avatar_url
            ) {
              updatedMetadata.avatar_url = asString(
                (providerData as Record<string, unknown>).avatar_url,
              )
            }
            if (
              (providerData as Record<string, unknown>).name &&
              !updatedMetadata.full_name
            ) {
              updatedMetadata.full_name = asString(
                (providerData as Record<string, unknown>).name,
              )
            }
          }

          // Handle Google data (preserve existing logic)
          if (provider === 'google') {
            if (
              (providerData as Record<string, unknown>).picture &&
              !updatedMetadata.avatar_url
            ) {
              updatedMetadata.avatar_url = asString(
                (providerData as Record<string, unknown>).picture,
              )
            }
            if (
              (providerData as Record<string, unknown>).name &&
              !updatedMetadata.full_name
            ) {
              updatedMetadata.full_name = asString(
                (providerData as Record<string, unknown>).name,
              )
            }
          }

          // Update user metadata if we have new data
          if (
            JSON.stringify(updatedMetadata) !== JSON.stringify(providerData)
          ) {
            try {
              await supabase.auth.updateUser({
                data: updatedMetadata,
              })
            } catch (updateError) {
              console.error('Error updating user metadata:', updateError)
              // Don't fail the auth flow if metadata update fails
            }
          }
        }

        // Check if this is a password recovery session
        if (type === 'recovery') {
          const redirectUrl = new URL('/reset-password', origin)
          const response = NextResponse.redirect(redirectUrl)
          response.headers.set(
            'Cache-Control',
            'no-cache, no-store, max-age=0, must-revalidate',
          )
          return response
        }

        // Successful authentication - redirect to dashboard
        const redirectUrl = new URL('/dashboard', origin)
        const response = NextResponse.redirect(redirectUrl)

        // Ensure cookies are properly set
        response.headers.set(
          'Cache-Control',
          'no-cache, no-store, max-age=0, must-revalidate',
        )

        return response
      }

      console.error('Authentication error:', error)
    } catch (err) {
      console.error('Session exchange error:', err)
    }
  }

  // Return to login with error
  const errorUrl = new URL('/login', origin)
  errorUrl.searchParams.set('error', 'Could not authenticate user')
  return NextResponse.redirect(errorUrl)
}
