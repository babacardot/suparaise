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
            foreignKeyName: 'common_responses_startup_id_fkey'
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
          full_name: string
          github_url: string | null
          id: string
          linkedin: string | null
          personal_website_url: string | null
          role: Database['public']['Enums']['founder_role'] | null
          startup_id: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          github_url?: string | null
          id?: string
          linkedin?: string | null
          personal_website_url?: string | null
          role?: Database['public']['Enums']['founder_role'] | null
          startup_id: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin?: string | null
          personal_website_url?: string | null
          role?: Database['public']['Enums']['founder_role'] | null
          startup_id?: string
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
      profiles: {
        Row: {
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      startups: {
        Row: {
          arr: number | null
          created_at: string | null
          description_long: string | null
          description_medium: string | null
          description_short: string | null
          employee_count: number | null
          id: string
          industry: Database['public']['Enums']['industry_type'] | null
          intro_video_url: string | null
          location: string | null
          logo_url: string | null
          market_summary: string | null
          mrr: number | null
          name: string
          pitch_deck_url: string | null
          traction_summary: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          arr?: number | null
          created_at?: string | null
          description_long?: string | null
          description_medium?: string | null
          description_short?: string | null
          employee_count?: number | null
          id?: string
          industry?: Database['public']['Enums']['industry_type'] | null
          intro_video_url?: string | null
          location?: string | null
          logo_url?: string | null
          market_summary?: string | null
          mrr?: number | null
          name: string
          pitch_deck_url?: string | null
          traction_summary?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          arr?: number | null
          created_at?: string | null
          description_long?: string | null
          description_medium?: string | null
          description_short?: string | null
          employee_count?: number | null
          id?: string
          industry?: Database['public']['Enums']['industry_type'] | null
          intro_video_url?: string | null
          location?: string | null
          logo_url?: string | null
          market_summary?: string | null
          mrr?: number | null
          name?: string
          pitch_deck_url?: string | null
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
          status: Database['public']['Enums']['submission_status'] | null
          submission_date: string | null
          target_id: string
        }
        Insert: {
          agent_notes?: string | null
          created_at?: string | null
          id?: string
          startup_id: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          target_id: string
        }
        Update: {
          agent_notes?: string | null
          created_at?: string | null
          id?: string
          startup_id?: string
          status?: Database['public']['Enums']['submission_status'] | null
          submission_date?: string | null
          target_id?: string
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
          region_focus: string[] | null
          required_documents: string[] | null
          requires_video: boolean | null
          stage_focus: Database['public']['Enums']['investment_stage'][] | null
          submission_type: Database['public']['Enums']['submission_type'] | null
          updated_at: string | null
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
          region_focus?: string[] | null
          required_documents?: string[] | null
          requires_video?: boolean | null
          stage_focus?: Database['public']['Enums']['investment_stage'][] | null
          submission_type?:
            | Database['public']['Enums']['submission_type']
            | null
          updated_at?: string | null
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
          region_focus?: string[] | null
          required_documents?: string[] | null
          requires_video?: boolean | null
          stage_focus?: Database['public']['Enums']['investment_stage'][] | null
          submission_type?:
            | Database['public']['Enums']['submission_type']
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
      get_startup_data_by_user_id: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      form_complexity: 'simple' | 'standard' | 'comprehensive'
      founder_role:
        | 'Founder'
        | 'Co-founder'
        | 'CEO'
        | 'CTO'
        | 'COO'
        | 'CPO'
        | 'CMO'
        | 'Lead Engineer'
        | 'Product Manager'
        | 'Designer'
        | 'Sales Lead'
        | 'Marketing Lead'
        | 'Advisor'
        | 'Legal Counsel'
        | 'Other'
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
        | 'Edtech'
        | 'Gaming'
        | 'Web3'
        | 'Developer tools'
        | 'Cybersecurity'
        | 'Logistics'
        | 'Agritech'
        | 'Other'
      investment_stage:
        | 'Pre-seed'
        | 'Seed'
        | 'Series A'
        | 'Series B'
        | 'Series C'
        | 'Growth'
        | 'All stages'
      question_count_range: '1-5' | '6-10' | '11-20' | '21+'
      submission_status: 'pending' | 'in_progress' | 'completed' | 'failed'
      submission_type: 'form' | 'email' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      form_complexity: ['simple', 'standard', 'comprehensive'],
      founder_role: [
        'Founder',
        'Co-founder',
        'CEO',
        'CTO',
        'COO',
        'CPO',
        'CMO',
        'Lead Engineer',
        'Product Manager',
        'Designer',
        'Sales Lead',
        'Marketing Lead',
        'Advisor',
        'Legal Counsel',
        'Other',
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
        'Edtech',
        'Gaming',
        'Web3',
        'Developer tools',
        'Cybersecurity',
        'Logistics',
        'Agritech',
        'Other',
      ],
      investment_stage: [
        'Pre-seed',
        'Seed',
        'Series A',
        'Series B',
        'Series C',
        'Growth',
        'All stages',
      ],
      question_count_range: ['1-5', '6-10', '11-20', '21+'],
      submission_status: ['pending', 'in_progress', 'completed', 'failed'],
      submission_type: ['form', 'email', 'other'],
    },
  },
} as const
