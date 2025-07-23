import { Database, Constants } from '@/lib/types/database'

export type FounderRole = Database['public']['Enums']['founder_role']
export type IndustryType = Database['public']['Enums']['industry_type']
export type LegalStructure = Database['public']['Enums']['legal_structure']
export type InvestmentStage = Database['public']['Enums']['investment_stage']
export type InvestmentInstrument =
  Database['public']['Enums']['investment_instrument']
export type RevenueModelType = Database['public']['Enums']['revenue_model_type']

// AI Enhancement types
export type AIFieldType =
  | 'bio'
  | 'description-short'
  | 'description-medium'
  | 'description-long'
  | 'traction'
  | 'market'
  | 'customers'
  | 'competitors'

export interface AIContext {
  companyName?: string
  industry?: string
  founderName?: string
  role?: string
}

export interface FounderData {
  firstName: string
  lastName: string
  role: FounderRole
  bio: string
  email: string
  phone: string
  linkedin: string
  githubUrl: string
  personalWebsiteUrl: string
  twitterUrl: string
}

export interface StartupData {
  name: string
  website: string
  industry: IndustryType | null
  location: string
  isIncorporated: boolean
  incorporationCity: string
  incorporationCountry: string
  operatingCountries: string[]
  legalStructure: LegalStructure | null
  investmentInstrument: InvestmentInstrument | null
  fundingRound: InvestmentStage | null
  fundingAmountSought: number
  preMoneyValuation: number
  descriptionShort: string
  descriptionMedium: string
  descriptionLong: string
  tractionSummary: string
  marketSummary: string
  mrr: number
  arr: number
  employeeCount: number
  foundedYear: number
  revenueModel: RevenueModelType | null
  currentRunway: number
  keyCustomers: string
  competitors: string
  competitorsList: string[]
  googleDriveUrl: string
  logoFile: File | null
  pitchDeckFile: File | null
  introVideoFile: File | null
}

export interface OnboardingDialogProps {
  isOpen: boolean
  userId: string
  onComplete: () => void
  isFirstStartup?: boolean
  onCancel?: () => void
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FieldErrors {
  [key: string]: string | undefined
}

export interface FounderFieldErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  linkedin?: string
  githubUrl?: string
  personalWebsiteUrl?: string
  twitterUrl?: string
}

export interface StartupFieldErrors {
  name?: string
  website?: string
  industry?: string
  location?: string
  descriptionShort?: string
  descriptionMedium?: string
  descriptionLong?: string
  foundedYear?: string
  revenueModel?: string
  currentRunway?: string
  keyCustomers?: string
  competitors?: string
  googleDriveUrl?: string
}

export type FileUploadProps = {
  type: 'logo' | 'pitchDeck'
  file: File | null
  uploadStatus: 'idle' | 'uploading' | 'completed' | 'failed'
  uploadProgress: number
  onUpload: (type: 'logo' | 'pitchDeck', file: File) => void
  onRemove: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

// Safe constants with fallbacks to prevent runtime errors
export const FOUNDER_ROLES = Constants?.public?.Enums?.founder_role || [
  'Founder',
  'Co-founder',
  'CEO',
  'CTO',
  'COO',
  'CPO',
  'CMO',
  'Engineer',
  'Product',
  'Designer',
  'Advisor',
  'Legal Counsel',
  'Other',
]

export const INDUSTRIES = Constants?.public?.Enums?.industry_type || [
  'B2B SaaS',
  'Fintech',
  'Healthtech',
  'AI/ML',
  'Deep tech',
  'Climate tech',
  'Consumer',
  'E-commerce',
  'Marketplace',
  'Gaming',
  'Web3',
  'Developer tools',
  'Cybersecurity',
  'Logistics',
  'AdTech',
  'PropTech',
  'InsurTech',
  'Agriculture',
  'Automotive',
  'Biotechnology',
  'Construction',
  'Consulting',
  'Consumer Goods',
  'Education',
  'Energy',
  'Entertainment',
  'Environmental Services',
  'Fashion',
  'Food & Beverage',
  'Government',
  'Healthcare Services',
  'Hospitality',
  'Human Resources',
  'Insurance',
  'Legal',
  'Manufacturing',
  'Media',
  'Non-profit',
  'Pharmaceuticals',
  'Real Estate',
  'Retail',
  'Telecommunications',
  'Transportation',
  'Utilities',
  'Other',
]

export const LEGAL_STRUCTURES = Constants?.public?.Enums?.legal_structure || [
  'Not yet incorporated',
  'Delaware C-Corp',
  'Canadian company',
  'B-Corp',
  'Public Benefit Corporation (PBC)',
  'LLC',
  'S-Corp',
  'Non-profit',
  'Other',
]

export const FUNDING_ROUNDS = (
  Constants?.public?.Enums?.investment_stage || [
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C',
    'Growth',
    'All',
  ]
).filter((r) => r !== 'All')

export const INVESTMENT_INSTRUMENTS = Constants?.public?.Enums
  ?.investment_instrument || [
  'Equity',
  'Debt',
  'Convertible Note',
  'SAFE',
  'Other',
]

export const REVENUE_MODELS = Constants?.public?.Enums?.revenue_model_type || [
  'Subscription',
  'One-time purchase',
  'Commission/Transaction fees',
  'Advertising',
  'Freemium',
  'Usage-based',
  'Licensing',
  'Consulting',
  'Affiliate',
  'Marketplace fees',
  'Data monetization',
  'Hardware sales',
  'Hybrid',
  'Other',
]
