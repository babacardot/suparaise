import { Tables, Constants } from './database'

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

// Company settings form data type that aligns with the database schema
export type CompanySettingsData = {
  name: Tables<'startups'>['name']
  website: Tables<'startups'>['website']
  industry: Tables<'startups'>['industry']
  location: Tables<'startups'>['location']
  descriptionShort: Tables<'startups'>['description_short']
  descriptionMedium: Tables<'startups'>['description_medium']
  descriptionLong: Tables<'startups'>['description_long']
  fundingRound: Tables<'startups'>['funding_round']
  legalStructure: Tables<'startups'>['legal_structure']
  employeeCount: Tables<'startups'>['employee_count']
  foundedYear: Tables<'startups'>['founded_year']
  revenueModel: Tables<'startups'>['revenue_model']
  currentRunway: Tables<'startups'>['current_runway']
  keyCustomers: Tables<'startups'>['key_customers']
  competitors: Tables<'startups'>['competitors']
  logoUrl: Tables<'startups'>['logo_url']
  isIncorporated: Tables<'startups'>['is_incorporated']
  incorporationCountry: Tables<'startups'>['incorporation_country']
  incorporationCity: Tables<'startups'>['incorporation_city']
  operatingCountries: Tables<'startups'>['operating_countries']
  investmentInstrument: Tables<'startups'>['investment_instrument']
  fundingAmountSought: Tables<'startups'>['funding_amount_sought']
  preMoneyValuation: Tables<'startups'>['pre_money_valuation']
  mrr: Tables<'startups'>['mrr']
  arr: Tables<'startups'>['arr']
  tractionSummary: Tables<'startups'>['traction_summary']
  marketSummary: Tables<'startups'>['market_summary']
  pitchDeckUrl: Tables<'startups'>['pitch_deck_url']
  introVideoUrl: Tables<'startups'>['intro_video_url']
  financialProjectionsUrl: Tables<'startups'>['financials_url']
  businessPlanUrl: Tables<'startups'>['business_plan_url']
  googleDriveUrl: Tables<'startups'>['google_drive_url']
}

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

// Export database enums as constants for use in components
export const DATABASE_ENUMS = Constants.public.Enums

// Create filter-friendly versions with proper labels for UI components
export const FILTER_OPTIONS = {
  submissionTypes: [
    { value: 'form', label: 'Form' },
    { value: 'email', label: 'Email' },
    { value: 'other', label: 'Other' },
  ] as const,

  investmentStages: DATABASE_ENUMS.investment_stage.map((stage) => ({
    value: stage,
    label: stage,
  })),

  industries: DATABASE_ENUMS.industry_type.map((industry) => ({
    value: industry,
    label: industry,
  })),

  regions: DATABASE_ENUMS.region_type.map((region) => ({
    value: region,
    label: region,
  })),

  requiredDocuments: DATABASE_ENUMS.required_document_type
    .filter((doc) => !['financials', 'business_plan'].includes(doc)) // Hide these options from filters
    .map((doc) => {
      const labelMap: Record<string, string> = {
        pitch_deck: 'Deck',
        video: 'Demo',
        // financials: 'Financials', // Commented out - not relevant yet
        // business_plan: 'Business Plan', // Commented out - not relevant yet
      }
      return {
        value: doc,
        label: labelMap[doc] || doc,
      }
    }),

  programTypes: DATABASE_ENUMS.program_type.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  })),

  equityRanges: DATABASE_ENUMS.equity_range.map((range) => ({
    value: range,
    label: range === 'variable' ? 'Variable' : range.replace('-', ' — '),
  })),

  fundingRanges: DATABASE_ENUMS.funding_range.map((range) => ({
    value: range,
    label: range.replace('-', ' — '),
  })),

  checkSizes: DATABASE_ENUMS.check_size_range.map((size) => ({
    value: size,
    label: size.replace('-', ' — '),
  })),

  investmentApproaches: DATABASE_ENUMS.investment_approach.map((approach) => ({
    value: approach,
    label: approach.charAt(0).toUpperCase() + approach.slice(1),
  })),
} as const

// Export raw enum arrays for type checking and validation
export const ENUM_VALUES = {
  submissionType: DATABASE_ENUMS.submission_type,
  investmentStage: DATABASE_ENUMS.investment_stage,
  industryType: DATABASE_ENUMS.industry_type,
  regionType: DATABASE_ENUMS.region_type,
  requiredDocumentType: DATABASE_ENUMS.required_document_type,
  programType: DATABASE_ENUMS.program_type,
  equityRange: DATABASE_ENUMS.equity_range,
  fundingRange: DATABASE_ENUMS.funding_range,
  checkSizeRange: DATABASE_ENUMS.check_size_range,
  investmentApproach: DATABASE_ENUMS.investment_approach,
} as const
