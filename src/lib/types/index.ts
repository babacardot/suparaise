import { Tables } from './database'

// The Target type is a direct mapping of the 'targets' table.
export type Target = Tables<'targets'>

// The Founder object is custom-built by the 'get_startup_data_by_user_id'
// function. We define its shape here, using the underlying table column
// types from 'database.ts' for accuracy and maintainability.
export type Founder = {
  fullName: Tables<'founders'>['full_name']
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
