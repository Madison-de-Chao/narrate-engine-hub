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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
