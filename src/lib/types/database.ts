export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)'
  }
  public: {
    Tables: {
      accelerator_submissions: {
        Row: {
          accelerator_id: string
          agent_notes: string | null
          created_at: string | null
          id: string
          startup_id: string
          status: Database['public']['Enums']['submission_status'] | null
          submission_date: string | null
          updated_at: string | null
        }
        Insert: {
          accelerator_id: string
          agent_notes?: string | null
          created_at?: string | null
          id?: string
          startup_id: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          updated_at?: string | null
        }
        Update: {
          accelerator_id?: string
          agent_notes?: string | null
          created_at?: string | null
          id?: string
          startup_id?: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'accelerator_submissions_accelerator_id_fkey'
            columns: ['accelerator_id']
            isOneToOne: false
            referencedRelation: 'accelerators'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'accelerator_submissions_startup_id_fkey'
            columns: ['startup_id']
            isOneToOne: false
            referencedRelation: 'startups'
            referencedColumns: ['id']
          },
        ]
      }
      accelerator_submissions_archive: {
        Row: {
          accelerator_id: string
          agent_notes: string | null
          archived_at: string
          archived_reason: string
          created_at: string | null
          id: string
          original_id: string
          original_startup_id: string
          startup_id: string
          status: Database['public']['Enums']['submission_status'] | null
          submission_date: string | null
        }
        Insert: {
          accelerator_id: string
          agent_notes?: string | null
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          id?: string
          original_id: string
          original_startup_id: string
          startup_id: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
        }
        Update: {
          accelerator_id?: string
          agent_notes?: string | null
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          id?: string
          original_id?: string
          original_startup_id?: string
          startup_id?: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
        }
        Relationships: []
      }
      accelerators: {
        Row: {
          acceptance_rate: Database['public']['Enums']['acceptance_rate'] | null
          application_email: string | null
          application_url: string | null
          batch_size: Database['public']['Enums']['batch_size'] | null
          batches_per_year: number | null
          created_at: string | null
          equity_taken: Database['public']['Enums']['equity_range'] | null
          form_complexity: Database['public']['Enums']['form_complexity'] | null
          funding_provided: Database['public']['Enums']['funding_range'] | null
          id: string
          industry_focus: Database['public']['Enums']['industry_type'][] | null
          is_active: boolean | null
          is_remote_friendly: boolean | null
          location: string | null
          name: string
          next_application_deadline: string | null
          notes: string | null
          program_duration:
            | Database['public']['Enums']['program_duration']
            | null
          program_fee: number | null
          program_type: Database['public']['Enums']['program_type'] | null
          region_focus: Database['public']['Enums']['region_type'][] | null
          required_documents:
            | Database['public']['Enums']['required_document_type'][]
            | null
          stage_focus: Database['public']['Enums']['investment_stage'][] | null
          submission_type: Database['public']['Enums']['submission_type'] | null
          tags: string[] | null
          updated_at: string | null
          visibility_level: Database['public']['Enums']['permission_level']
          website: string | null
        }
        Insert: {
          acceptance_rate?:
            | Database['public']['Enums']['acceptance_rate']
            | null
          application_email?: string | null
          application_url?: string | null
          batch_size?: Database['public']['Enums']['batch_size'] | null
          batches_per_year?: number | null
          created_at?: string | null
          equity_taken?: Database['public']['Enums']['equity_range'] | null
          form_complexity?:
            | Database['public']['Enums']['form_complexity']
            | null
          funding_provided?: Database['public']['Enums']['funding_range'] | null
          id?: string
          industry_focus?: Database['public']['Enums']['industry_type'][] | null
          is_active?: boolean | null
          is_remote_friendly?: boolean | null
          location?: string | null
          name: string
          next_application_deadline?: string | null
          notes?: string | null
          program_duration?:
            | Database['public']['Enums']['program_duration']
            | null
          program_fee?: number | null
          program_type?: Database['public']['Enums']['program_type'] | null
          region_focus?: Database['public']['Enums']['region_type'][] | null
          required_documents?:
            | Database['public']['Enums']['required_document_type'][]
            | null
          stage_focus?: Database['public']['Enums']['investment_stage'][] | null
          submission_type?:
            | Database['public']['Enums']['submission_type']
            | null
          tags?: string[] | null
          updated_at?: string | null
          visibility_level?: Database['public']['Enums']['permission_level']
          website?: string | null
        }
        Update: {
          acceptance_rate?:
            | Database['public']['Enums']['acceptance_rate']
            | null
          application_email?: string | null
          application_url?: string | null
          batch_size?: Database['public']['Enums']['batch_size'] | null
          batches_per_year?: number | null
          created_at?: string | null
          equity_taken?: Database['public']['Enums']['equity_range'] | null
          form_complexity?:
            | Database['public']['Enums']['form_complexity']
            | null
          funding_provided?: Database['public']['Enums']['funding_range'] | null
          id?: string
          industry_focus?: Database['public']['Enums']['industry_type'][] | null
          is_active?: boolean | null
          is_remote_friendly?: boolean | null
          location?: string | null
          name?: string
          next_application_deadline?: string | null
          notes?: string | null
          program_duration?:
            | Database['public']['Enums']['program_duration']
            | null
          program_fee?: number | null
          program_type?: Database['public']['Enums']['program_type'] | null
          region_focus?: Database['public']['Enums']['region_type'][] | null
          required_documents?:
            | Database['public']['Enums']['required_document_type'][]
            | null
          stage_focus?: Database['public']['Enums']['investment_stage'][] | null
          submission_type?:
            | Database['public']['Enums']['submission_type']
            | null
          tags?: string[] | null
          updated_at?: string | null
          visibility_level?: Database['public']['Enums']['permission_level']
          website?: string | null
        }
        Relationships: []
      }
      agent_settings: {
        Row: {
          created_at: string | null
          custom_instructions: string | null
          debug_mode: boolean
          id: string
          max_parallel_submissions: Database['public']['Enums']['agent_parallel_submissions']
          max_queue_size: number
          preferred_tone: Database['public']['Enums']['agent_tone']
          startup_id: string
          stealth: boolean
          submission_delay: Database['public']['Enums']['agent_submission_delay']
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_instructions?: string | null
          debug_mode?: boolean
          id?: string
          max_parallel_submissions?: Database['public']['Enums']['agent_parallel_submissions']
          max_queue_size?: number
          preferred_tone?: Database['public']['Enums']['agent_tone']
          startup_id: string
          stealth?: boolean
          submission_delay?: Database['public']['Enums']['agent_submission_delay']
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_instructions?: string | null
          debug_mode?: boolean
          id?: string
          max_parallel_submissions?: Database['public']['Enums']['agent_parallel_submissions']
          max_queue_size?: number
          preferred_tone?: Database['public']['Enums']['agent_tone']
          startup_id?: string
          stealth?: boolean
          submission_delay?: Database['public']['Enums']['agent_submission_delay']
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'agent_settings_startup_id_fkey'
            columns: ['startup_id']
            isOneToOne: true
            referencedRelation: 'startups'
            referencedColumns: ['id']
          },
        ]
      }
      agent_settings_archive: {
        Row: {
          archived_at: string
          archived_reason: string
          created_at: string | null
          custom_instructions: string | null
          debug_mode: boolean
          id: string
          max_parallel_submissions: Database['public']['Enums']['agent_parallel_submissions']
          original_id: string
          original_startup_id: string
          original_user_id: string
          preferred_tone: Database['public']['Enums']['agent_tone']
          startup_id: string
          stealth: boolean
          submission_delay: Database['public']['Enums']['agent_submission_delay']
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          custom_instructions?: string | null
          debug_mode?: boolean
          id?: string
          max_parallel_submissions?: Database['public']['Enums']['agent_parallel_submissions']
          original_id: string
          original_startup_id: string
          original_user_id: string
          preferred_tone?: Database['public']['Enums']['agent_tone']
          startup_id: string
          stealth?: boolean
          submission_delay?: Database['public']['Enums']['agent_submission_delay']
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          custom_instructions?: string | null
          debug_mode?: boolean
          id?: string
          max_parallel_submissions?: Database['public']['Enums']['agent_parallel_submissions']
          original_id?: string
          original_startup_id?: string
          original_user_id?: string
          preferred_tone?: Database['public']['Enums']['agent_tone']
          startup_id?: string
          stealth?: boolean
          submission_delay?: Database['public']['Enums']['agent_submission_delay']
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      angel_submissions: {
        Row: {
          agent_notes: string | null
          angel_id: string
          created_at: string | null
          id: string
          startup_id: string
          status: Database['public']['Enums']['submission_status'] | null
          submission_date: string | null
          updated_at: string | null
        }
        Insert: {
          agent_notes?: string | null
          angel_id: string
          created_at?: string | null
          id?: string
          startup_id: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_notes?: string | null
          angel_id?: string
          created_at?: string | null
          id?: string
          startup_id?: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'angel_submissions_angel_id_fkey'
            columns: ['angel_id']
            isOneToOne: false
            referencedRelation: 'angels'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'angel_submissions_startup_id_fkey'
            columns: ['startup_id']
            isOneToOne: false
            referencedRelation: 'startups'
            referencedColumns: ['id']
          },
        ]
      }
      angel_submissions_archive: {
        Row: {
          agent_notes: string | null
          angel_id: string
          archived_at: string
          archived_reason: string
          created_at: string | null
          id: string
          original_id: string
          original_startup_id: string
          startup_id: string
          status: Database['public']['Enums']['submission_status'] | null
          submission_date: string | null
        }
        Insert: {
          agent_notes?: string | null
          angel_id: string
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          id?: string
          original_id: string
          original_startup_id: string
          startup_id: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
        }
        Update: {
          agent_notes?: string | null
          angel_id?: string
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          id?: string
          original_id?: string
          original_startup_id?: string
          startup_id?: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
        }
        Relationships: []
      }
      angels: {
        Row: {
          application_email: string | null
          application_url: string | null
          bio: string | null
          check_size: Database['public']['Enums']['check_size_range'] | null
          created_at: string | null
          domain_expertise: string[] | null
          email: string | null
          first_name: string
          form_complexity: Database['public']['Enums']['form_complexity'] | null
          id: string
          industry_focus: Database['public']['Enums']['industry_type'][] | null
          investment_approach:
            | Database['public']['Enums']['investment_approach']
            | null
          is_active: boolean | null
          last_name: string
          linkedin: string | null
          location: string | null
          notable_investments: string[] | null
          notes: string | null
          personal_website: string | null
          previous_exits: string[] | null
          region_focus: Database['public']['Enums']['region_type'][] | null
          required_documents:
            | Database['public']['Enums']['required_document_type'][]
            | null
          response_time: Database['public']['Enums']['response_time'] | null
          stage_focus: Database['public']['Enums']['investment_stage'][] | null
          submission_type: Database['public']['Enums']['submission_type'] | null
          tags: string[] | null
          twitter: string | null
          updated_at: string | null
          visibility_level: Database['public']['Enums']['permission_level']
        }
        Insert: {
          application_email?: string | null
          application_url?: string | null
          bio?: string | null
          check_size?: Database['public']['Enums']['check_size_range'] | null
          created_at?: string | null
          domain_expertise?: string[] | null
          email?: string | null
          first_name: string
          form_complexity?:
            | Database['public']['Enums']['form_complexity']
            | null
          id?: string
          industry_focus?: Database['public']['Enums']['industry_type'][] | null
          investment_approach?:
            | Database['public']['Enums']['investment_approach']
            | null
          is_active?: boolean | null
          last_name: string
          linkedin?: string | null
          location?: string | null
          notable_investments?: string[] | null
          notes?: string | null
          personal_website?: string | null
          previous_exits?: string[] | null
          region_focus?: Database['public']['Enums']['region_type'][] | null
          required_documents?:
            | Database['public']['Enums']['required_document_type'][]
            | null
          response_time?: Database['public']['Enums']['response_time'] | null
          stage_focus?: Database['public']['Enums']['investment_stage'][] | null
          submission_type?:
            | Database['public']['Enums']['submission_type']
            | null
          tags?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          visibility_level?: Database['public']['Enums']['permission_level']
        }
        Update: {
          application_email?: string | null
          application_url?: string | null
          bio?: string | null
          check_size?: Database['public']['Enums']['check_size_range'] | null
          created_at?: string | null
          domain_expertise?: string[] | null
          email?: string | null
          first_name?: string
          form_complexity?:
            | Database['public']['Enums']['form_complexity']
            | null
          id?: string
          industry_focus?: Database['public']['Enums']['industry_type'][] | null
          investment_approach?:
            | Database['public']['Enums']['investment_approach']
            | null
          is_active?: boolean | null
          last_name?: string
          linkedin?: string | null
          location?: string | null
          notable_investments?: string[] | null
          notes?: string | null
          personal_website?: string | null
          previous_exits?: string[] | null
          region_focus?: Database['public']['Enums']['region_type'][] | null
          required_documents?:
            | Database['public']['Enums']['required_document_type'][]
            | null
          response_time?: Database['public']['Enums']['response_time'] | null
          stage_focus?: Database['public']['Enums']['investment_stage'][] | null
          submission_type?:
            | Database['public']['Enums']['submission_type']
            | null
          tags?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          visibility_level?: Database['public']['Enums']['permission_level']
        }
        Relationships: []
      }
      common_responses: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          question: string
          startup_id: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          question: string
          startup_id: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          question?: string
          startup_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'common_responses_startup_id_fkey'
            columns: ['startup_id']
            isOneToOne: false
            referencedRelation: 'startups'
            referencedColumns: ['id']
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          sentiment: string | null
          startup_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sentiment?: string | null
          startup_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sentiment?: string | null
          startup_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'feedback_startup_id_fkey'
            columns: ['startup_id']
            isOneToOne: false
            referencedRelation: 'startups'
            referencedColumns: ['id']
          },
        ]
      }
      founders: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          first_name: string
          github_url: string | null
          id: string
          last_name: string
          linkedin: string | null
          personal_website_url: string | null
          phone: string | null
          role: Database['public']['Enums']['founder_role'] | null
          startup_id: string
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          github_url?: string | null
          id?: string
          last_name: string
          linkedin?: string | null
          personal_website_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['founder_role'] | null
          startup_id: string
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          github_url?: string | null
          id?: string
          last_name?: string
          linkedin?: string | null
          personal_website_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['founder_role'] | null
          startup_id?: string
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'founders_startup_id_fkey'
            columns: ['startup_id']
            isOneToOne: false
            referencedRelation: 'startups'
            referencedColumns: ['id']
          },
        ]
      }
      founders_archive: {
        Row: {
          archived_at: string
          archived_reason: string
          bio: string | null
          created_at: string | null
          email: string | null
          first_name: string
          github_url: string | null
          id: string
          last_name: string
          linkedin: string | null
          original_id: string
          original_startup_id: string
          personal_website_url: string | null
          phone: string | null
          role: Database['public']['Enums']['founder_role'] | null
          startup_id: string
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string
          archived_reason?: string
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          github_url?: string | null
          id?: string
          last_name: string
          linkedin?: string | null
          original_id: string
          original_startup_id: string
          personal_website_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['founder_role'] | null
          startup_id: string
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string
          archived_reason?: string
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          github_url?: string | null
          id?: string
          last_name?: string
          linkedin?: string | null
          original_id?: string
          original_startup_id?: string
          personal_website_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['founder_role'] | null
          startup_id?: string
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_subscribed: boolean | null
          monthly_submissions_limit: number
          monthly_submissions_used: number
          permission_level: Database['public']['Enums']['permission_level']
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_current_period_end: string | null
          subscription_status:
            | Database['public']['Enums']['subscription_status']
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_subscribed?: boolean | null
          monthly_submissions_limit?: number
          monthly_submissions_used?: number
          permission_level?: Database['public']['Enums']['permission_level']
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?:
            | Database['public']['Enums']['subscription_status']
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_subscribed?: boolean | null
          monthly_submissions_limit?: number
          monthly_submissions_used?: number
          permission_level?: Database['public']['Enums']['permission_level']
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?:
            | Database['public']['Enums']['subscription_status']
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles_archive: {
        Row: {
          archived_at: string
          archived_reason: string
          created_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_subscribed: boolean | null
          monthly_submissions_limit: number
          monthly_submissions_used: number
          original_id: string
          permission_level: Database['public']['Enums']['permission_level']
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_current_period_end: string | null
          subscription_status:
            | Database['public']['Enums']['subscription_status']
            | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_subscribed?: boolean | null
          monthly_submissions_limit?: number
          monthly_submissions_used?: number
          original_id: string
          permission_level?: Database['public']['Enums']['permission_level']
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?:
            | Database['public']['Enums']['subscription_status']
            | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_subscribed?: boolean | null
          monthly_submissions_limit?: number
          monthly_submissions_used?: number
          original_id?: string
          permission_level?: Database['public']['Enums']['permission_level']
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?:
            | Database['public']['Enums']['subscription_status']
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      startups: {
        Row: {
          arr: number | null
          business_plan_url: string | null
          competitors: string | null
          created_at: string | null
          current_runway: number | null
          deleted_at: string | null
          description_long: string | null
          description_medium: string | null
          description_short: string | null
          employee_count: number | null
          financial_projections_url: string | null
          founded_year: number | null
          funding_amount_sought: number | null
          funding_round: Database['public']['Enums']['investment_stage'] | null
          google_drive_url: string | null
          hyperbrowser_session_id: string | null
          id: string
          incorporation_city: string | null
          incorporation_country: string | null
          industry: Database['public']['Enums']['industry_type'] | null
          intro_video_url: string | null
          investment_instrument:
            | Database['public']['Enums']['investment_instrument']
            | null
          is_active: boolean
          is_incorporated: boolean | null
          key_customers: string | null
          legal_structure: Database['public']['Enums']['legal_structure'] | null
          location: string | null
          logo_url: string | null
          market_summary: string | null
          mrr: number | null
          name: string
          onboarded: boolean
          operating_countries: string[] | null
          pitch_deck_url: string | null
          pre_money_valuation: number | null
          revenue_model:
            | Database['public']['Enums']['revenue_model_type']
            | null
          traction_summary: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          arr?: number | null
          business_plan_url?: string | null
          competitors?: string | null
          created_at?: string | null
          current_runway?: number | null
          deleted_at?: string | null
          description_long?: string | null
          description_medium?: string | null
          description_short?: string | null
          employee_count?: number | null
          financial_projections_url?: string | null
          founded_year?: number | null
          funding_amount_sought?: number | null
          funding_round?: Database['public']['Enums']['investment_stage'] | null
          google_drive_url?: string | null
          hyperbrowser_session_id?: string | null
          id?: string
          incorporation_city?: string | null
          incorporation_country?: string | null
          industry?: Database['public']['Enums']['industry_type'] | null
          intro_video_url?: string | null
          investment_instrument?:
            | Database['public']['Enums']['investment_instrument']
            | null
          is_active?: boolean
          is_incorporated?: boolean | null
          key_customers?: string | null
          legal_structure?:
            | Database['public']['Enums']['legal_structure']
            | null
          location?: string | null
          logo_url?: string | null
          market_summary?: string | null
          mrr?: number | null
          name: string
          onboarded?: boolean
          operating_countries?: string[] | null
          pitch_deck_url?: string | null
          pre_money_valuation?: number | null
          revenue_model?:
            | Database['public']['Enums']['revenue_model_type']
            | null
          traction_summary?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          arr?: number | null
          business_plan_url?: string | null
          competitors?: string | null
          created_at?: string | null
          current_runway?: number | null
          deleted_at?: string | null
          description_long?: string | null
          description_medium?: string | null
          description_short?: string | null
          employee_count?: number | null
          financial_projections_url?: string | null
          founded_year?: number | null
          funding_amount_sought?: number | null
          funding_round?: Database['public']['Enums']['investment_stage'] | null
          google_drive_url?: string | null
          hyperbrowser_session_id?: string | null
          id?: string
          incorporation_city?: string | null
          incorporation_country?: string | null
          industry?: Database['public']['Enums']['industry_type'] | null
          intro_video_url?: string | null
          investment_instrument?:
            | Database['public']['Enums']['investment_instrument']
            | null
          is_active?: boolean
          is_incorporated?: boolean | null
          key_customers?: string | null
          legal_structure?:
            | Database['public']['Enums']['legal_structure']
            | null
          location?: string | null
          logo_url?: string | null
          market_summary?: string | null
          mrr?: number | null
          name?: string
          onboarded?: boolean
          operating_countries?: string[] | null
          pitch_deck_url?: string | null
          pre_money_valuation?: number | null
          revenue_model?:
            | Database['public']['Enums']['revenue_model_type']
            | null
          traction_summary?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      startups_archive: {
        Row: {
          archived_at: string
          archived_reason: string
          arr: number | null
          business_plan_url: string | null
          competitors: string | null
          created_at: string | null
          current_runway: number | null
          deleted_at: string | null
          description_long: string | null
          description_medium: string | null
          description_short: string | null
          employee_count: number | null
          financial_projections_url: string | null
          founded_year: number | null
          funding_amount_sought: number | null
          funding_round: Database['public']['Enums']['investment_stage'] | null
          google_drive_url: string | null
          id: string
          incorporation_city: string | null
          incorporation_country: string | null
          industry: Database['public']['Enums']['industry_type'] | null
          intro_video_url: string | null
          investment_instrument:
            | Database['public']['Enums']['investment_instrument']
            | null
          is_active: boolean
          is_incorporated: boolean | null
          key_customers: string | null
          legal_structure: Database['public']['Enums']['legal_structure'] | null
          location: string | null
          logo_url: string | null
          market_summary: string | null
          mrr: number | null
          name: string
          onboarded: boolean
          operating_countries: string[] | null
          original_id: string
          original_user_id: string
          pitch_deck_url: string | null
          pre_money_valuation: number | null
          revenue_model:
            | Database['public']['Enums']['revenue_model_type']
            | null
          traction_summary: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          archived_at?: string
          archived_reason?: string
          arr?: number | null
          business_plan_url?: string | null
          competitors?: string | null
          created_at?: string | null
          current_runway?: number | null
          deleted_at?: string | null
          description_long?: string | null
          description_medium?: string | null
          description_short?: string | null
          employee_count?: number | null
          financial_projections_url?: string | null
          founded_year?: number | null
          funding_amount_sought?: number | null
          funding_round?: Database['public']['Enums']['investment_stage'] | null
          google_drive_url?: string | null
          id?: string
          incorporation_city?: string | null
          incorporation_country?: string | null
          industry?: Database['public']['Enums']['industry_type'] | null
          intro_video_url?: string | null
          investment_instrument?:
            | Database['public']['Enums']['investment_instrument']
            | null
          is_active?: boolean
          is_incorporated?: boolean | null
          key_customers?: string | null
          legal_structure?:
            | Database['public']['Enums']['legal_structure']
            | null
          location?: string | null
          logo_url?: string | null
          market_summary?: string | null
          mrr?: number | null
          name: string
          onboarded?: boolean
          operating_countries?: string[] | null
          original_id: string
          original_user_id: string
          pitch_deck_url?: string | null
          pre_money_valuation?: number | null
          revenue_model?:
            | Database['public']['Enums']['revenue_model_type']
            | null
          traction_summary?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          archived_at?: string
          archived_reason?: string
          arr?: number | null
          business_plan_url?: string | null
          competitors?: string | null
          created_at?: string | null
          current_runway?: number | null
          deleted_at?: string | null
          description_long?: string | null
          description_medium?: string | null
          description_short?: string | null
          employee_count?: number | null
          financial_projections_url?: string | null
          founded_year?: number | null
          funding_amount_sought?: number | null
          funding_round?: Database['public']['Enums']['investment_stage'] | null
          google_drive_url?: string | null
          id?: string
          incorporation_city?: string | null
          incorporation_country?: string | null
          industry?: Database['public']['Enums']['industry_type'] | null
          intro_video_url?: string | null
          investment_instrument?:
            | Database['public']['Enums']['investment_instrument']
            | null
          is_active?: boolean
          is_incorporated?: boolean | null
          key_customers?: string | null
          legal_structure?:
            | Database['public']['Enums']['legal_structure']
            | null
          location?: string | null
          logo_url?: string | null
          market_summary?: string | null
          mrr?: number | null
          name?: string
          onboarded?: boolean
          operating_countries?: string[] | null
          original_id?: string
          original_user_id?: string
          pitch_deck_url?: string | null
          pre_money_valuation?: number | null
          revenue_model?:
            | Database['public']['Enums']['revenue_model_type']
            | null
          traction_summary?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          agent_notes: string | null
          created_at: string | null
          hyperbrowser_job_id: string | null
          id: string
          queue_position: number | null
          queued_at: string | null
          started_at: string | null
          startup_id: string
          status: Database['public']['Enums']['submission_status'] | null
          submission_date: string | null
          target_id: string
          updated_at: string | null
        }
        Insert: {
          agent_notes?: string | null
          created_at?: string | null
          hyperbrowser_job_id?: string | null
          id?: string
          queue_position?: number | null
          queued_at?: string | null
          started_at?: string | null
          startup_id: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          target_id: string
          updated_at?: string | null
        }
        Update: {
          agent_notes?: string | null
          created_at?: string | null
          hyperbrowser_job_id?: string | null
          id?: string
          queue_position?: number | null
          queued_at?: string | null
          started_at?: string | null
          startup_id?: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          target_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'submissions_startup_id_fkey'
            columns: ['startup_id']
            isOneToOne: false
            referencedRelation: 'startups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'submissions_target_id_fkey'
            columns: ['target_id']
            isOneToOne: false
            referencedRelation: 'targets'
            referencedColumns: ['id']
          },
        ]
      }
      submissions_archive: {
        Row: {
          agent_notes: string | null
          archived_at: string
          archived_reason: string
          created_at: string | null
          id: string
          original_id: string
          original_startup_id: string
          startup_id: string
          status: Database['public']['Enums']['submission_status'] | null
          submission_date: string | null
          target_id: string
        }
        Insert: {
          agent_notes?: string | null
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          id?: string
          original_id: string
          original_startup_id: string
          startup_id: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          target_id: string
        }
        Update: {
          agent_notes?: string | null
          archived_at?: string
          archived_reason?: string
          created_at?: string | null
          id?: string
          original_id?: string
          original_startup_id?: string
          startup_id?: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          target_id?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          category: string
          created_at: string
          id: string
          image_url: string | null
          message: string
          priority: string
          startup_id: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          priority?: string
          startup_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          priority?: string
          startup_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'support_requests_startup_id_fkey'
            columns: ['startup_id']
            isOneToOne: false
            referencedRelation: 'startups'
            referencedColumns: ['id']
          },
        ]
      }
      targets: {
        Row: {
          application_email: string | null
          application_url: string
          created_at: string | null
          form_complexity: Database['public']['Enums']['form_complexity'] | null
          id: string
          industry_focus: Database['public']['Enums']['industry_type'][] | null
          name: string
          notes: string | null
          question_count_range:
            | Database['public']['Enums']['question_count_range']
            | null
          region_focus: Database['public']['Enums']['region_type'][] | null
          required_documents:
            | Database['public']['Enums']['required_document_type'][]
            | null
          stage_focus: Database['public']['Enums']['investment_stage'][] | null
          submission_type: Database['public']['Enums']['submission_type'] | null
          tags: string[] | null
          updated_at: string | null
          visibility_level: Database['public']['Enums']['permission_level']
          website: string | null
        }
        Insert: {
          application_email?: string | null
          application_url: string
          created_at?: string | null
          form_complexity?:
            | Database['public']['Enums']['form_complexity']
            | null
          id?: string
          industry_focus?: Database['public']['Enums']['industry_type'][] | null
          name: string
          notes?: string | null
          question_count_range?:
            | Database['public']['Enums']['question_count_range']
            | null
          region_focus?: Database['public']['Enums']['region_type'][] | null
          required_documents?:
            | Database['public']['Enums']['required_document_type'][]
            | null
          stage_focus?: Database['public']['Enums']['investment_stage'][] | null
          submission_type?:
            | Database['public']['Enums']['submission_type']
            | null
          tags?: string[] | null
          updated_at?: string | null
          visibility_level?: Database['public']['Enums']['permission_level']
          website?: string | null
        }
        Update: {
          application_email?: string | null
          application_url?: string
          created_at?: string | null
          form_complexity?:
            | Database['public']['Enums']['form_complexity']
            | null
          id?: string
          industry_focus?: Database['public']['Enums']['industry_type'][] | null
          name?: string
          notes?: string | null
          question_count_range?:
            | Database['public']['Enums']['question_count_range']
            | null
          region_focus?: Database['public']['Enums']['region_type'][] | null
          required_documents?:
            | Database['public']['Enums']['required_document_type'][]
            | null
          stage_focus?: Database['public']['Enums']['investment_stage'][] | null
          submission_type?:
            | Database['public']['Enums']['submission_type']
            | null
          tags?: string[] | null
          updated_at?: string | null
          visibility_level?: Database['public']['Enums']['permission_level']
          website?: string | null
        }
        Relationships: []
      }
      user_recommendations: {
        Row: {
          created_at: string | null
          dismissed_at: string | null
          id: string
          is_active: boolean | null
          is_dismissed: boolean | null
          priority: number
          recommendation_key: string
          startup_id: string
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_active?: boolean | null
          is_dismissed?: boolean | null
          priority: number
          recommendation_key: string
          startup_id: string
          text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_active?: boolean | null
          is_dismissed?: boolean | null
          priority?: number
          recommendation_key?: string
          startup_id?: string
          text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_recommendations_startup_id_fkey'
            columns: ['startup_id']
            isOneToOne: false
            referencedRelation: 'startups'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      subscription_usage_summary: {
        Row: {
          avg_submissions_limit: number | null
          avg_submissions_used: number | null
          permission_level:
            | Database['public']['Enums']['permission_level']
            | null
          subscribed_users: number | null
          user_count: number | null
          users_at_limit: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_startup_founder: {
        Args: { p_startup_id: string; p_user_id: string; p_data: Json }
        Returns: Json
      }
      can_email_be_used_for_signup: {
        Args: { p_email: string }
        Returns: Json
      }
      cancel_subscription: {
        Args: { p_stripe_customer_id: string }
        Returns: Json
      }
      check_and_reset_free_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_and_reset_paid_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_size_sort_order: {
        Args: {
          check_size_val: Database['public']['Enums']['check_size_range']
        }
        Returns: number
      }
      check_submission_limit: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_user_onboarding_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      create_feedback: {
        Args: {
          p_message: string
          p_user_id: string
          p_sentiment: string
          p_startup_id?: string
        }
        Returns: string
      }
      create_minimal_startup_for_skip: {
        Args: { p_company_name: string; p_user_id: string }
        Returns: Json
      }
      create_startup_and_founders: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_support_request: {
        Args: {
          p_subject: string
          p_category: string
          p_startup_id: string
          p_user_id: string
          p_image_url?: string
          p_message: string
        }
        Returns: string
      }
      dismiss_startup_recommendation: {
        Args: { p_recommendation_key: string; p_startup_id: string }
        Returns: Json
      }
      fetch_daily_run_grid_data: {
        Args: { p_startup_id: string; p_days?: number }
        Returns: {
          date: string
          run_count: number
        }[]
      }
      fetch_recent_submissions: {
        Args: { p_limit?: number; p_startup_id: string }
        Returns: Json
      }
      fetch_recent_submissions_detailed: {
        Args: { p_startup_id: string; p_limit?: number }
        Returns: Json
      }
      get_accelerators_simple: {
        Args: {
          p_required_documents?: string[]
          p_limit?: number
          p_offset?: number
          p_sort_by?: string
          p_sort_direction?: string
          p_search?: string
          p_submission_types?: string[]
          p_stage_focus?: string[]
          p_industry_focus?: string[]
          p_region_focus?: string[]
          p_program_types?: string[]
          p_equity_ranges?: string[]
          p_funding_ranges?: string[]
          p_tags?: string[]
          p_startup_id?: string
          p_submission_filter?: string
        }
        Returns: Json
      }
      get_all_submissions_detailed: {
        Args:
          | {
              p_date_from?: string
              p_date_to?: string
              p_startup_id: string
              p_limit?: number
              p_offset?: number
              p_sort_by?: string
              p_sort_direction?: string
              p_status_filter?: string[]
              p_type_filter?: string[]
            }
          | {
              p_limit?: number
              p_date_to?: string
              p_date_from?: string
              p_type_filter?: string[]
              p_status_filter?: string[]
              p_search?: string
              p_sort_direction?: string
              p_sort_by?: string
              p_offset?: number
              p_startup_id: string
            }
        Returns: Json
      }
      get_angels_simple: {
        Args: {
          p_industry_focus?: string[]
          p_stage_focus?: string[]
          p_region_focus?: string[]
          p_submission_filter?: string
          p_startup_id?: string
          p_investment_approaches?: string[]
          p_check_sizes?: string[]
          p_limit?: number
          p_offset?: number
          p_sort_by?: string
          p_sort_direction?: string
          p_search?: string
          p_submission_types?: string[]
        }
        Returns: Json
      }
      get_applications_advanced: {
        Args: {
          p_sort_by?: string
          p_sort_direction?: string
          p_search?: string
          p_status_filter?: string[]
          p_type_filter?: string[]
          p_date_from?: string
          p_date_to?: string
          p_offset?: number
          p_limit?: number
          p_startup_id: string
        }
        Returns: Json
      }
      get_archived_user_data: {
        Args: { p_original_user_id: string }
        Returns: Json
      }
      get_cached_user_session_data: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_common_responses: {
        Args: { p_startup_id: string }
        Returns: Json
      }
      get_dashboard_data: {
        Args: { p_startup_id: string }
        Returns: Json
      }
      get_dashboard_data_batch: {
        Args: { p_user_id: string; p_startup_id?: string }
        Returns: Json
      }
      get_or_create_stripe_customer: {
        Args: { p_stripe_customer_id?: string; p_user_id: string }
        Returns: Json
      }
      get_profile_submission_info: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_queue_status: {
        Args: { p_user_id: string; p_startup_id?: string }
        Returns: Json
      }
      get_startup_by_id: {
        Args: { p_user_id: string; p_startup_id: string }
        Returns: Json
      }
      get_startup_founders: {
        Args: { p_user_id: string; p_startup_id?: string }
        Returns: Json
      }
      get_startup_metadata: {
        Args: { p_startup_id: string }
        Returns: Json
      }
      get_startup_recommendations: {
        Args: { p_startup_id: string }
        Returns: Json
      }
      get_submission_details: {
        Args: { p_submission_id: string }
        Returns: Json
      }
      get_submission_statistics: {
        Args: { p_startup_id: string }
        Returns: Json
      }
      get_submissions_with_queue: {
        Args: { p_user_id: string; p_startup_id?: string }
        Returns: Json
      }
      get_subscription_data: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_target_by_id: {
        Args: { p_target_id: string }
        Returns: {
          application_email: string | null
          application_url: string
          created_at: string | null
          form_complexity: Database['public']['Enums']['form_complexity'] | null
          id: string
          industry_focus: Database['public']['Enums']['industry_type'][] | null
          name: string
          notes: string | null
          question_count_range:
            | Database['public']['Enums']['question_count_range']
            | null
          region_focus: Database['public']['Enums']['region_type'][] | null
          required_documents:
            | Database['public']['Enums']['required_document_type'][]
            | null
          stage_focus: Database['public']['Enums']['investment_stage'][] | null
          submission_type: Database['public']['Enums']['submission_type'] | null
          tags: string[] | null
          updated_at: string | null
          visibility_level: Database['public']['Enums']['permission_level']
          website: string | null
        }
      }
      get_targets_paginated: {
        Args: {
          p_order_by?: string
          p_offset?: number
          p_order_direction?: string
          p_limit?: number
        }
        Returns: Json
      }
      get_targets_simple: {
        Args: {
          p_submission_filter?: string
          p_search?: string
          p_submission_types?: string[]
          p_stage_focus?: string[]
          p_industry_focus?: string[]
          p_region_focus?: string[]
          p_required_documents?: string[]
          p_tags?: string[]
          p_startup_id?: string
          p_sort_by?: string
          p_offset?: number
          p_limit?: number
          p_sort_direction?: string
        }
        Returns: Json
      }
      get_total_angel_applications_count: {
        Args: { p_startup_id: string }
        Returns: Json
      }
      get_total_applications_count: {
        Args: { p_startup_id: string }
        Returns: Json
      }
      get_user_agent_settings: {
        Args: { p_startup_id?: string; p_user_id: string }
        Returns: Json
      }
      get_user_founder_profile: {
        Args: { p_user_id: string; p_startup_id?: string }
        Returns: Json
      }
      get_user_profile_with_startup: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_startup_data: {
        Args: { p_user_id: string; p_startup_id?: string }
        Returns: Json
      }
      get_user_startups: {
        Args: { p_user_id: string }
        Returns: Json
      }
      handle_payment_failure: {
        Args: { p_stripe_customer_id: string }
        Returns: Json
      }
      handle_payment_success: {
        Args: { p_stripe_customer_id: string }
        Returns: Json
      }
      increment_submission_count: {
        Args: { p_user_id: string }
        Returns: Json
      }
      process_next_queued_submission: {
        Args: { p_startup_id: string }
        Returns: Json
      }
      queue_submission: {
        Args:
          | {
              p_startup_id: string
              p_hyperbrowser_job_id?: string
              p_user_id: string
              p_target_id: string
            }
          | { p_user_id: string; p_target_id: string; p_startup_id: string }
        Returns: Json
      }
      reactivate_user_account: {
        Args: { p_user_id: string }
        Returns: Json
      }
      remove_startup_founder: {
        Args: { p_user_id: string; p_founder_id: string }
        Returns: Json
      }
      retry_submission: {
        Args: {
          p_submission_id: string
          p_user_id: string
          p_startup_id: string
          p_submission_type: string
        }
        Returns: Json
      }
      run_automatic_subscription_resets: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      soft_delete_startup: {
        Args: { p_startup_id: string; p_user_id: string }
        Returns: Json
      }
      soft_delete_user_account: {
        Args: { p_user_id: string }
        Returns: Json
      }
      update_accelerator_submission_status: {
        Args: {
          p_new_status: Database['public']['Enums']['submission_status']
          p_submission_id: string
          p_agent_notes: string
        }
        Returns: Json
      }
      update_angel_submission_status: {
        Args: {
          p_submission_id: string
          p_agent_notes: string
          p_new_status: Database['public']['Enums']['submission_status']
        }
        Returns: Json
      }
      update_founder_profile: {
        Args: { p_founder_id: string; p_user_id: string; p_data: Json }
        Returns: Json
      }
      update_submission_status: {
        Args: {
          p_new_status: Database['public']['Enums']['submission_status']
          p_submission_id: string
          p_agent_notes: string
        }
        Returns: Json
      }
      update_subscription_status: {
        Args: {
          p_stripe_customer_id: string
          p_plan_name?: string
          p_status: Database['public']['Enums']['subscription_status']
          p_subscription_id: string
          p_is_subscribed?: boolean
          p_current_period_end?: string
        }
        Returns: Json
      }
      update_user_agent_settings: {
        Args: { p_startup_id: string; p_data: Json; p_user_id: string }
        Returns: Json
      }
      update_user_founder_profile: {
        Args: { p_user_id: string; p_data: Json; p_startup_id: string }
        Returns: Json
      }
      update_user_startup_data: {
        Args: { p_user_id: string; p_startup_id: string; p_data: Json }
        Returns: Json
      }
    }
    Enums: {
      acceptance_rate: '<1%' | '1-5%' | '6-10%' | '11-20%' | '20%+'
      agent_parallel_submissions: '1' | '3' | '5' | '15' | '25' | '35'
      agent_submission_delay: '0' | '15' | '30'
      agent_tone: 'professional' | 'enthusiastic' | 'concise' | 'detailed'
      batch_size: '1-10' | '11-20' | '21-50' | '51-100' | '100+'
      check_size_range:
        | '1K-10K'
        | '10K-25K'
        | '25K-50K'
        | '50K-100K'
        | '100K-250K'
        | '250K-500K'
        | '500K-1M'
        | '1M+'
      equity_range: '0%' | '1-3%' | '4-6%' | '7-10%' | '10%+' | 'variable'
      form_complexity: 'simple' | 'standard' | 'comprehensive'
      founder_role:
        | 'Founder'
        | 'Co-founder'
        | 'CEO'
        | 'CTO'
        | 'COO'
        | 'CPO'
        | 'CMO'
        | 'Engineer'
        | 'Product'
        | 'Designer'
        | 'Advisor'
        | 'Legal Counsel'
        | 'Other'
      funding_range:
        | '0-25K'
        | '25K-50K'
        | '50K-100K'
        | '100K-250K'
        | '250K-500K'
        | '500K+'
      industry_type:
        | 'B2B SaaS'
        | 'Fintech'
        | 'Healthtech'
        | 'AI/ML'
        | 'Deep tech'
        | 'Climate tech'
        | 'Consumer'
        | 'E-commerce'
        | 'Marketplace'
        | 'Gaming'
        | 'Web3'
        | 'Developer tools'
        | 'Cybersecurity'
        | 'Logistics'
        | 'AdTech'
        | 'PropTech'
        | 'InsurTech'
        | 'Agriculture'
        | 'Automotive'
        | 'Biotechnology'
        | 'Construction'
        | 'Consulting'
        | 'Consumer Goods'
        | 'Education'
        | 'Energy'
        | 'Entertainment'
        | 'Environmental Services'
        | 'Fashion'
        | 'Food & Beverage'
        | 'Government'
        | 'Healthcare Services'
        | 'Hospitality'
        | 'Human Resources'
        | 'Insurance'
        | 'Legal'
        | 'Manufacturing'
        | 'Media'
        | 'Non-profit'
        | 'Pharmaceuticals'
        | 'Real Estate'
        | 'Retail'
        | 'Telecommunications'
        | 'Transportation'
        | 'Utilities'
        | 'Other'
      investment_approach:
        | 'hands-on'
        | 'passive'
        | 'advisory'
        | 'network-focused'
      investment_instrument:
        | 'Equity'
        | 'Debt'
        | 'Convertible Note'
        | 'SAFE'
        | 'Other'
      investment_stage:
        | 'Pre-seed'
        | 'Seed'
        | 'Series A'
        | 'Series B'
        | 'Series C'
        | 'Growth'
        | 'All'
      legal_structure:
        | 'Not yet incorporated'
        | 'Delaware C-Corp'
        | 'Canadian company'
        | 'B-Corp'
        | 'Public Benefit Corporation (PBC)'
        | 'LLC'
        | 'S-Corp'
        | 'Non-profit'
        | 'Other'
      permission_level: 'FREE' | 'PRO' | 'MAX'
      program_duration:
        | '3 months'
        | '6 months'
        | '12 months'
        | 'ongoing'
        | 'variable'
      program_type: 'in-person' | 'remote' | 'hybrid'
      question_count_range: '1-5' | '6-10' | '11-20' | '21+'
      region_type:
        | 'Global'
        | 'North America'
        | 'South America'
        | 'LATAM'
        | 'Europe'
        | 'Western Europe'
        | 'Eastern Europe'
        | 'Continental Europe'
        | 'Middle East'
        | 'Africa'
        | 'Asia'
        | 'East Asia'
        | 'South Asia'
        | 'South East Asia'
        | 'Oceania'
        | 'EMEA'
        | 'Emerging Markets'
      required_document_type:
        | 'pitch_deck'
        | 'video'
        | 'financial_projections'
        | 'business_plan'
        | 'traction_data'
      response_time: '1-3 days' | '1 week' | '2 weeks' | '1 month' | '2+ months'
      revenue_model_type:
        | 'Subscription'
        | 'One-time purchase'
        | 'Commission/Transaction fees'
        | 'Advertising'
        | 'Freemium'
        | 'Usage-based'
        | 'Licensing'
        | 'Consulting'
        | 'Affiliate'
        | 'Marketplace fees'
        | 'Data monetization'
        | 'Hardware sales'
        | 'Hybrid'
        | 'Other'
      submission_status: 'pending' | 'in_progress' | 'completed' | 'failed'
      submission_type: 'form' | 'email' | 'other'
      subscription_status:
        | 'active'
        | 'inactive'
        | 'past_due'
        | 'canceled'
        | 'unpaid'
        | 'paused'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acceptance_rate: ['<1%', '1-5%', '6-10%', '11-20%', '20%+'],
      agent_parallel_submissions: ['1', '3', '5', '15', '25', '35'],
      agent_submission_delay: ['0', '15', '30'],
      agent_tone: ['professional', 'enthusiastic', 'concise', 'detailed'],
      batch_size: ['1-10', '11-20', '21-50', '51-100', '100+'],
      check_size_range: [
        '1K-10K',
        '10K-25K',
        '25K-50K',
        '50K-100K',
        '100K-250K',
        '250K-500K',
        '500K-1M',
        '1M+',
      ],
      equity_range: ['0%', '1-3%', '4-6%', '7-10%', '10%+', 'variable'],
      form_complexity: ['simple', 'standard', 'comprehensive'],
      founder_role: [
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
      ],
      funding_range: [
        '0-25K',
        '25K-50K',
        '50K-100K',
        '100K-250K',
        '250K-500K',
        '500K+',
      ],
      industry_type: [
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
      ],
      investment_approach: [
        'hands-on',
        'passive',
        'advisory',
        'network-focused',
      ],
      investment_instrument: [
        'Equity',
        'Debt',
        'Convertible Note',
        'SAFE',
        'Other',
      ],
      investment_stage: [
        'Pre-seed',
        'Seed',
        'Series A',
        'Series B',
        'Series C',
        'Growth',
        'All',
      ],
      legal_structure: [
        'Not yet incorporated',
        'Delaware C-Corp',
        'Canadian company',
        'B-Corp',
        'Public Benefit Corporation (PBC)',
        'LLC',
        'S-Corp',
        'Non-profit',
        'Other',
      ],
      permission_level: ['FREE', 'PRO', 'MAX'],
      program_duration: [
        '3 months',
        '6 months',
        '12 months',
        'ongoing',
        'variable',
      ],
      program_type: ['in-person', 'remote', 'hybrid'],
      question_count_range: ['1-5', '6-10', '11-20', '21+'],
      region_type: [
        'Global',
        'North America',
        'South America',
        'LATAM',
        'Europe',
        'Western Europe',
        'Eastern Europe',
        'Continental Europe',
        'Middle East',
        'Africa',
        'Asia',
        'East Asia',
        'South Asia',
        'South East Asia',
        'Oceania',
        'EMEA',
        'Emerging Markets',
      ],
      required_document_type: [
        'pitch_deck',
        'video',
        'financial_projections',
        'business_plan',
        'traction_data',
      ],
      response_time: ['1-3 days', '1 week', '2 weeks', '1 month', '2+ months'],
      revenue_model_type: [
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
      ],
      submission_status: ['pending', 'in_progress', 'completed', 'failed'],
      submission_type: ['form', 'email', 'other'],
      subscription_status: [
        'active',
        'inactive',
        'past_due',
        'canceled',
        'unpaid',
        'paused',
      ],
    },
  },
} as const
