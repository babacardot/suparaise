import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BROWSER_USE_API_KEY = process.env.BROWSERUSE_API_KEY!
const BROWSER_USE_BASE_URL = 'https://api.browser-use.com/api/v1'

type BrowserProfile = {
  profile_id: string
  profile_name: string
  description?: string
  persist?: boolean
  ad_blocker?: boolean
  proxy?: boolean
  proxy_country_code?: string
  browser_viewport_width?: number
  browser_viewport_height?: number
}

type ApiResponseError = { error: string; details?: string }

const makeRequest = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<unknown> => {
  const url = `${BROWSER_USE_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${BROWSER_USE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const responseData = await response.json()

  if (!response.ok) {
    const error = responseData as ApiResponseError
    console.error(`Browser Use Profile API error (${response.status}):`, error)
    throw new Error(
      `Browser Use Profile API error (${response.status}): ${error.error}`,
    )
  }

  return responseData
}

export const createBrowserProfile = async (
  startupId: string,
  profileName: string,
): Promise<BrowserProfile> => {
  const profile = (await makeRequest('/browser-profiles', {
    method: 'POST',
    body: JSON.stringify({
      profile_name: profileName,
      description: `Profile for startup ${startupId}`,
      persist: true,
      ad_blocker: true,
      proxy: true,
      proxy_country_code: 'US',
      browser_viewport_width: 1920,
      browser_viewport_height: 1080,
    }),
  })) as BrowserProfile

  // Store the new profile ID in Supabase
  await supabaseAdmin
    .from('startups')
    .update({ browser_profile_id: profile.profile_id })
    .eq('id', startupId)

  return profile
}

export const getBrowserProfile = async (
  profileId: string,
): Promise<BrowserProfile> => {
  return (await makeRequest(`/browser-profiles/${profileId}`)) as BrowserProfile
}

export const getOrCreateBrowserProfileForStartup = async (
  startupId: string,
  startupName: string,
): Promise<BrowserProfile> => {
  const { data: startupProfile, error } = await supabaseAdmin
    .from('startups')
    .select('browser_profile_id')
    .eq('id', startupId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  if (startupProfile?.browser_profile_id) {
    try {
      return await getBrowserProfile(startupProfile.browser_profile_id)
    } catch {
      console.warn(
        `Failed to fetch existing profile ${startupProfile.browser_profile_id}, creating a new one.`,
      )
    }
  }

  // If no profile exists or fetching failed, create a new one
  return createBrowserProfile(
    startupId,
    `suparaise-${startupName.replace(/\s+/g, '-')}`,
  )
}
