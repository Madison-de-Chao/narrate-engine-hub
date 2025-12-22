export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          default_template_id: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          plan_id: string | null
          requests_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          default_template_id?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          plan_id?: string | null
          requests_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          default_template_id?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          plan_id?: string | null
          requests_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_default_template_id_fkey"
            columns: ["default_template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "api_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      api_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean | null
          monthly_quota: number | null
          name: string
          price_per_request: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          monthly_quota?: number | null
          name: string
          price_per_request?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          monthly_quota?: number | null
          name?: string
          price_per_request?: number | null
        }
        Relationships: []
      }
      api_request_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: string | null
          request_body: Json | null
          response_status: number | null
          response_time_ms: number | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: string | null
          request_body?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          request_body?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      bazi_calculations: {
        Row: {
          birth_date: string
          birth_time: string
          created_at: string | null
          day_branch: string
          day_nayin: string | null
          day_stem: string
          gender: string
          hidden_stems: Json | null
          hour_branch: string
          hour_nayin: string | null
          hour_stem: string
          id: string
          legion_analysis: Json | null
          legion_stories: Json | null
          location: string | null
          month_branch: string
          month_nayin: string | null
          month_stem: string
          name: string
          shensha: Json | null
          ten_gods: Json | null
          updated_at: string | null
          use_solar_time: boolean | null
          user_id: string | null
          wuxing_scores: Json | null
          year_branch: string
          year_nayin: string | null
          year_stem: string
          yinyang_ratio: Json | null
        }
        Insert: {
          birth_date: string
          birth_time: string
          created_at?: string | null
          day_branch: string
          day_nayin?: string | null
          day_stem: string
          gender: string
          hidden_stems?: Json | null
          hour_branch: string
          hour_nayin?: string | null
          hour_stem: string
          id?: string
          legion_analysis?: Json | null
          legion_stories?: Json | null
          location?: string | null
          month_branch: string
          month_nayin?: string | null
          month_stem: string
          name: string
          shensha?: Json | null
          ten_gods?: Json | null
          updated_at?: string | null
          use_solar_time?: boolean | null
          user_id?: string | null
          wuxing_scores?: Json | null
          year_branch: string
          year_nayin?: string | null
          year_stem: string
          yinyang_ratio?: Json | null
        }
        Update: {
          birth_date?: string
          birth_time?: string
          created_at?: string | null
          day_branch?: string
          day_nayin?: string | null
          day_stem?: string
          gender?: string
          hidden_stems?: Json | null
          hour_branch?: string
          hour_nayin?: string | null
          hour_stem?: string
          id?: string
          legion_analysis?: Json | null
          legion_stories?: Json | null
          location?: string | null
          month_branch?: string
          month_nayin?: string | null
          month_stem?: string
          name?: string
          shensha?: Json | null
          ten_gods?: Json | null
          updated_at?: string | null
          use_solar_time?: boolean | null
          user_id?: string | null
          wuxing_scores?: Json | null
          year_branch?: string
          year_nayin?: string | null
          year_stem?: string
          yinyang_ratio?: Json | null
        }
        Relationships: []
      }
      legion_stories: {
        Row: {
          calculation_id: string
          created_at: string
          id: string
          legion_type: string
          story: string
        }
        Insert: {
          calculation_id: string
          created_at?: string
          id?: string
          legion_type: string
          story: string
        }
        Update: {
          calculation_id?: string
          created_at?: string
          id?: string
          legion_type?: string
          story?: string
        }
        Relationships: [
          {
            foreignKeyName: "legion_stories_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "bazi_calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          name: string
          system_prompt: string
          template_type: Database["public"]["Enums"]["template_type"]
          updated_at: string | null
          user_id: string | null
          user_prompt_template: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name: string
          system_prompt: string
          template_type: Database["public"]["Enums"]["template_type"]
          updated_at?: string | null
          user_id?: string | null
          user_prompt_template?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name?: string
          system_prompt?: string
          template_type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string | null
          user_id?: string | null
          user_prompt_template?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      solar_terms: {
        Row: {
          created_at: string | null
          id: string
          solar_longitude: number
          term_date: string
          term_name: string
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          solar_longitude: number
          term_date: string
          term_name: string
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          solar_longitude?: number
          term_date?: string
          term_name?: string
          year?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          payment_provider: string | null
          payment_reference: string | null
          plan: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          plan?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          plan?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_premium: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      template_type:
        | "legion_story"
        | "fortune_consult"
        | "personality"
        | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      template_type: [
        "legion_story",
        "fortune_consult",
        "personality",
        "custom",
      ],
    },
  },
} as const
