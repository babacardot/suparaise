import { Tables } from './database'

export type Target = Tables<'targets'>
export type Profile = Tables<'profiles'>

export interface UserProfileWithStartupResponse {
  profile: Profile | null
  startup: {
    name: string
    id?: string
  } | null
  error?: string
}

// New interface for the lightweight onboarding check
export interface OnboardingStatusResponse {
  needsOnboarding: boolean
  profileName: string
  hasStartup: boolean
}

// The Founder object is custom-built by the 'get_startup_data_by_user_id'
// function. We define its shape here, using the underlying table column
// types from 'database.ts' for accuracy and maintainability.
export type Founder = {
  firstName: Tables<'founders'>['first_name']
  lastName: Tables<'founders'>['last_name']
  email: Tables<'founders'>['email']
  linkedin: Tables<'founders'>['linkedin']
  bio: Tables<'founders'>['bio']
  github_url: Tables<'founders'>['github_url']
  personal_website_url: Tables<'founders'>['personal_website_url']
}

// The Startup object is the primary Data Transfer Object (DTO) returned by the
// 'get_startup_data_by_user_id' RPC call. It combines data from multiple tables.
// We define its shape here so that TypeScript understands the object we get
// back from Supabase, preventing runtime errors.
export type Startup = {
  id: Tables<'startups'>['id']
  name: Tables<'startups'>['name']
  website: Tables<'startups'>['website']
  industry: Tables<'startups'>['industry']
  location: Tables<'startups'>['location']
  is_incorporated: Tables<'startups'>['is_incorporated']
  incorporation_city: Tables<'startups'>['incorporation_city']
  incorporation_country: Tables<'startups'>['incorporation_country']
  operating_countries: Tables<'startups'>['operating_countries']
  legal_structure: Tables<'startups'>['legal_structure']
  investment_instrument: Tables<'startups'>['investment_instrument']
  funding_round: Tables<'startups'>['funding_round']
  funding_amount_sought: Tables<'startups'>['funding_amount_sought']
  pre_money_valuation: Tables<'startups'>['pre_money_valuation']
  oneLiner: Tables<'startups'>['description_short']
  description: Tables<'startups'>['description_long']
  traction_summary: Tables<'startups'>['traction_summary']
  market_summary: Tables<'startups'>['market_summary']
  mrr: Tables<'startups'>['mrr']
  arr: Tables<'startups'>['arr']
  employee_count: Tables<'startups'>['employee_count']
  logo_url: Tables<'startups'>['logo_url']
  pitch_deck_url: Tables<'startups'>['pitch_deck_url']
  intro_video_url: Tables<'startups'>['intro_video_url']
  founders: Founder[]
  commonResponses: {
    [question: string]: string
  }
}
