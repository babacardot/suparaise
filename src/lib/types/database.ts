export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      common_responses: {
        Row: {
          answer: string | null
          created_at: string | null
          id: string
          question: string
          startup_id: string
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string
          question: string
          startup_id: string
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string
          question?: string
          startup_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "common_responses_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
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
            foreignKeyName: "feedback_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
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
          role: Database["public"]["Enums"]["founder_role"] | null
          startup_id: string
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
          role?: Database["public"]["Enums"]["founder_role"] | null
          startup_id: string
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
          role?: Database["public"]["Enums"]["founder_role"] | null
          startup_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founders_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_subscribed: boolean | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_current_period_end: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_subscribed?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_subscribed?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      startups: {
        Row: {
          arr: number | null
          competitors: string | null
          created_at: string | null
          current_runway: number | null
          description_long: string | null
          description_medium: string | null
          description_short: string | null
          employee_count: number | null
          founded_year: number | null
          funding_amount_sought: number | null
          funding_round: Database["public"]["Enums"]["investment_stage"] | null
          id: string
          incorporation_city: string | null
          incorporation_country: string | null
          industry: Database["public"]["Enums"]["industry_type"] | null
          intro_video_url: string | null
          investment_instrument:
            | Database["public"]["Enums"]["investment_instrument"]
            | null
          is_incorporated: boolean | null
          key_customers: string | null
          legal_structure: Database["public"]["Enums"]["legal_structure"] | null
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
            | Database["public"]["Enums"]["revenue_model_type"]
            | null
          traction_summary: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          arr?: number | null
          competitors?: string | null
          created_at?: string | null
          current_runway?: number | null
          description_long?: string | null
          description_medium?: string | null
          description_short?: string | null
          employee_count?: number | null
          founded_year?: number | null
          funding_amount_sought?: number | null
          funding_round?: Database["public"]["Enums"]["investment_stage"] | null
          id?: string
          incorporation_city?: string | null
          incorporation_country?: string | null
          industry?: Database["public"]["Enums"]["industry_type"] | null
          intro_video_url?: string | null
          investment_instrument?:
            | Database["public"]["Enums"]["investment_instrument"]
            | null
          is_incorporated?: boolean | null
          key_customers?: string | null
          legal_structure?:
            | Database["public"]["Enums"]["legal_structure"]
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
            | Database["public"]["Enums"]["revenue_model_type"]
            | null
          traction_summary?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          arr?: number | null
          competitors?: string | null
          created_at?: string | null
          current_runway?: number | null
          description_long?: string | null
          description_medium?: string | null
          description_short?: string | null
          employee_count?: number | null
          founded_year?: number | null
          funding_amount_sought?: number | null
          funding_round?: Database["public"]["Enums"]["investment_stage"] | null
          id?: string
          incorporation_city?: string | null
          incorporation_country?: string | null
          industry?: Database["public"]["Enums"]["industry_type"] | null
          intro_video_url?: string | null
          investment_instrument?:
            | Database["public"]["Enums"]["investment_instrument"]
            | null
          is_incorporated?: boolean | null
          key_customers?: string | null
          legal_structure?:
            | Database["public"]["Enums"]["legal_structure"]
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
            | Database["public"]["Enums"]["revenue_model_type"]
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
          id: string
          startup_id: string
          status: Database["public"]["Enums"]["submission_status"] | null
          submission_date: string | null
          target_id: string
        }
        Insert: {
          agent_notes?: string | null
          created_at?: string | null
          id?: string
          startup_id: string
          status?: Database["public"]["Enums"]["submission_status"] | null
          submission_date?: string | null
          target_id: string
        }
        Update: {
          agent_notes?: string | null
          created_at?: string | null
          id?: string
          startup_id?: string
          status?: Database["public"]["Enums"]["submission_status"] | null
          submission_date?: string | null
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "targets"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "support_requests_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      targets: {
        Row: {
          application_email: string | null
          application_url: string
          created_at: string | null
          form_complexity: Database["public"]["Enums"]["form_complexity"] | null
          id: string
          industry_focus: Database["public"]["Enums"]["industry_type"][] | null
          name: string
          notes: string | null
          question_count_range:
            | Database["public"]["Enums"]["question_count_range"]
            | null
          region_focus: Database["public"]["Enums"]["region_type"][] | null
          required_documents:
            | Database["public"]["Enums"]["required_document_type"][]
            | null
          stage_focus: Database["public"]["Enums"]["investment_stage"][] | null
          submission_type: Database["public"]["Enums"]["submission_type"] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          application_email?: string | null
          application_url: string
          created_at?: string | null
          form_complexity?:
            | Database["public"]["Enums"]["form_complexity"]
            | null
          id?: string
          industry_focus?: Database["public"]["Enums"]["industry_type"][] | null
          name: string
          notes?: string | null
          question_count_range?:
            | Database["public"]["Enums"]["question_count_range"]
            | null
          region_focus?: Database["public"]["Enums"]["region_type"][] | null
          required_documents?:
            | Database["public"]["Enums"]["required_document_type"][]
            | null
          stage_focus?: Database["public"]["Enums"]["investment_stage"][] | null
          submission_type?:
            | Database["public"]["Enums"]["submission_type"]
            | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          application_email?: string | null
          application_url?: string
          created_at?: string | null
          form_complexity?:
            | Database["public"]["Enums"]["form_complexity"]
            | null
          id?: string
          industry_focus?: Database["public"]["Enums"]["industry_type"][] | null
          name?: string
          notes?: string | null
          question_count_range?:
            | Database["public"]["Enums"]["question_count_range"]
            | null
          region_focus?: Database["public"]["Enums"]["region_type"][] | null
          required_documents?:
            | Database["public"]["Enums"]["required_document_type"][]
            | null
          stage_focus?: Database["public"]["Enums"]["investment_stage"][] | null
          submission_type?:
            | Database["public"]["Enums"]["submission_type"]
            | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_subscription: {
        Args: { p_stripe_customer_id: string }
        Returns: Json
      }
      check_user_onboarding_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      create_feedback: {
        Args: {
          p_user_id: string
          p_sentiment: string
          p_message: string
          p_startup_id?: string
        }
        Returns: string
      }
      create_startup: {
        Args: { p_startup_data: Json }
        Returns: Json
      }
      create_startup_and_founders: {
        Args: { p_data: Json }
        Returns: Json
      }
      create_support_request: {
        Args: {
          p_user_id: string
          p_startup_id: string
          p_category: string
          p_subject: string
          p_message: string
          p_image_url?: string
        }
        Returns: string
      }
      filter_targets: {
        Args: {
          p_stages?: string[]
          p_industries?: string[]
          p_regions?: string[]
        }
        Returns: Json
      }
      get_all_targets: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_or_create_stripe_customer: {
        Args: {
          p_user_id: string
          p_email: string
          p_full_name?: string
          p_stripe_customer_id?: string
        }
        Returns: Json
      }
      get_profile_by_id: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_startup_by_id: {
        Args: { p_startup_id: string; p_user_id: string }
        Returns: Json
      }
      get_startup_data_by_user_id: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_subscription_data: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_target_by_id: {
        Args: { p_target_id: string }
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
      get_user_startups_with_status: {
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
      search_targets: {
        Args: { p_query: string }
        Returns: Json
      }
      update_profile: {
        Args: { p_user_id: string; p_full_name?: string }
        Returns: Json
      }
      update_startup: {
        Args: { p_startup_id: string; p_updates: Json }
        Returns: Json
      }
      update_subscription_status: {
        Args: {
          p_stripe_customer_id: string
          p_subscription_id: string
          p_status: string
          p_current_period_end?: string
          p_is_subscribed?: boolean
        }
        Returns: Json
      }
      update_user_founder_profile: {
        Args: { p_user_id: string; p_startup_id: string; p_data: Json }
        Returns: Json
      }
      update_user_startup_data: {
        Args: { p_user_id: string; p_startup_id: string; p_data: Json }
        Returns: Json
      }
    }
    Enums: {
      form_complexity: "simple" | "standard" | "comprehensive"
      founder_role:
        | "Founder"
        | "Co-founder"
        | "CEO"
        | "CTO"
        | "COO"
        | "CPO"
        | "CMO"
        | "Engineer"
        | "Product"
        | "Designer"
        | "Advisor"
        | "Legal Counsel"
        | "Other"
      industry_type:
        | "B2B SaaS"
        | "Fintech"
        | "Healthtech"
        | "AI/ML"
        | "Deep tech"
        | "Climate tech"
        | "Consumer"
        | "E-commerce"
        | "Marketplace"
        | "Gaming"
        | "Web3"
        | "Developer tools"
        | "Cybersecurity"
        | "Logistics"
        | "AdTech"
        | "PropTech"
        | "InsurTech"
        | "Agriculture"
        | "Automotive"
        | "Biotechnology"
        | "Construction"
        | "Consulting"
        | "Consumer Goods"
        | "Education"
        | "Energy"
        | "Entertainment"
        | "Environmental Services"
        | "Fashion"
        | "Food & Beverage"
        | "Government"
        | "Healthcare Services"
        | "Hospitality"
        | "Human Resources"
        | "Insurance"
        | "Legal"
        | "Manufacturing"
        | "Media"
        | "Non-profit"
        | "Pharmaceuticals"
        | "Real Estate"
        | "Retail"
        | "Telecommunications"
        | "Transportation"
        | "Utilities"
        | "Other"
      investment_instrument:
        | "Equity"
        | "Debt"
        | "Convertible Note"
        | "SAFE"
        | "Other"
      investment_stage:
        | "Pre-seed"
        | "Seed"
        | "Series A"
        | "Series B"
        | "Series C"
        | "Growth"
        | "All stages"
      legal_structure:
        | "Not yet incorporated"
        | "Delaware C-Corp"
        | "Canadian company"
        | "B-Corp"
        | "Public Benefit Corporation (PBC)"
        | "LLC"
        | "S-Corp"
        | "Non-profit"
        | "Other"
      question_count_range: "1-5" | "6-10" | "11-20" | "21+"
      region_type:
        | "Global"
        | "North America"
        | "South America"
        | "LATAM"
        | "Europe"
        | "Western Europe"
        | "Eastern Europe"
        | "Continental Europe"
        | "Middle East"
        | "Africa"
        | "Asia"
        | "East Asia"
        | "South Asia"
        | "South East Asia"
        | "Oceania"
        | "EMEA"
        | "Emerging Markets"
      required_document_type:
        | "pitch_deck"
        | "video"
        | "financial_projections"
        | "business_plan"
        | "traction_data"
        | "legal_documents"
      revenue_model_type:
        | "Subscription"
        | "One-time purchase"
        | "Commission/Transaction fees"
        | "Advertising"
        | "Freemium"
        | "Usage-based"
        | "Licensing"
        | "Consulting"
        | "Affiliate"
        | "Marketplace fees"
        | "Data monetization"
        | "Hardware sales"
        | "Hybrid"
        | "Other"
      submission_status: "pending" | "in_progress" | "completed" | "failed"
      submission_type: "form" | "email" | "other"
      subscription_status:
        | "active"
        | "inactive"
        | "past_due"
        | "canceled"
        | "unpaid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      form_complexity: ["simple", "standard", "comprehensive"],
      founder_role: [
        "Founder",
        "Co-founder",
        "CEO",
        "CTO",
        "COO",
        "CPO",
        "CMO",
        "Engineer",
        "Product",
        "Designer",
        "Advisor",
        "Legal Counsel",
        "Other",
      ],
      industry_type: [
        "B2B SaaS",
        "Fintech",
        "Healthtech",
        "AI/ML",
        "Deep tech",
        "Climate tech",
        "Consumer",
        "E-commerce",
        "Marketplace",
        "Gaming",
        "Web3",
        "Developer tools",
        "Cybersecurity",
        "Logistics",
        "AdTech",
        "PropTech",
        "InsurTech",
        "Agriculture",
        "Automotive",
        "Biotechnology",
        "Construction",
        "Consulting",
        "Consumer Goods",
        "Education",
        "Energy",
        "Entertainment",
        "Environmental Services",
        "Fashion",
        "Food & Beverage",
        "Government",
        "Healthcare Services",
        "Hospitality",
        "Human Resources",
        "Insurance",
        "Legal",
        "Manufacturing",
        "Media",
        "Non-profit",
        "Pharmaceuticals",
        "Real Estate",
        "Retail",
        "Telecommunications",
        "Transportation",
        "Utilities",
        "Other",
      ],
      investment_instrument: [
        "Equity",
        "Debt",
        "Convertible Note",
        "SAFE",
        "Other",
      ],
      investment_stage: [
        "Pre-seed",
        "Seed",
        "Series A",
        "Series B",
        "Series C",
        "Growth",
        "All stages",
      ],
      legal_structure: [
        "Not yet incorporated",
        "Delaware C-Corp",
        "Canadian company",
        "B-Corp",
        "Public Benefit Corporation (PBC)",
        "LLC",
        "S-Corp",
        "Non-profit",
        "Other",
      ],
      question_count_range: ["1-5", "6-10", "11-20", "21+"],
      region_type: [
        "Global",
        "North America",
        "South America",
        "LATAM",
        "Europe",
        "Western Europe",
        "Eastern Europe",
        "Continental Europe",
        "Middle East",
        "Africa",
        "Asia",
        "East Asia",
        "South Asia",
        "South East Asia",
        "Oceania",
        "EMEA",
        "Emerging Markets",
      ],
      required_document_type: [
        "pitch_deck",
        "video",
        "financial_projections",
        "business_plan",
        "traction_data",
        "legal_documents",
      ],
      revenue_model_type: [
        "Subscription",
        "One-time purchase",
        "Commission/Transaction fees",
        "Advertising",
        "Freemium",
        "Usage-based",
        "Licensing",
        "Consulting",
        "Affiliate",
        "Marketplace fees",
        "Data monetization",
        "Hardware sales",
        "Hybrid",
        "Other",
      ],
      submission_status: ["pending", "in_progress", "completed", "failed"],
      submission_type: ["form", "email", "other"],
      subscription_status: [
        "active",
        "inactive",
        "past_due",
        "canceled",
        "unpaid",
      ],
    },
  },
} as const
