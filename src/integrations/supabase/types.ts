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
      ab_test_results: {
        Row: {
          ab_test_id: string
          click_count: number
          click_rate: number | null
          created_at: string
          id: string
          open_count: number
          open_rate: number | null
          sent_count: number
          unsubscribe_count: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          ab_test_id: string
          click_count?: number
          click_rate?: number | null
          created_at?: string
          id?: string
          open_count?: number
          open_rate?: number | null
          sent_count?: number
          unsubscribe_count?: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          ab_test_id?: string
          click_count?: number
          click_rate?: number | null
          created_at?: string
          id?: string
          open_count?: number
          open_rate?: number | null
          sent_count?: number
          unsubscribe_count?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_results_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_results_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          ab_test_id: string
          created_at: string
          html_content: string
          id: string
          preview_text: string | null
          subject: string
          variant_name: string
        }
        Insert: {
          ab_test_id: string
          created_at?: string
          html_content: string
          id?: string
          preview_text?: string | null
          subject: string
          variant_name: string
        }
        Update: {
          ab_test_id?: string
          created_at?: string
          html_content?: string
          id?: string
          preview_text?: string | null
          subject?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          campaign_type: string
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          name: string
          started_at: string | null
          status: string
          test_percentage: number
          winner_variant_id: string | null
        }
        Insert: {
          campaign_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          started_at?: string | null
          status?: string
          test_percentage?: number
          winner_variant_id?: string | null
        }
        Update: {
          campaign_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          started_at?: string | null
          status?: string
          test_percentage?: number
          winner_variant_id?: string | null
        }
        Relationships: []
      }
      campaign_content: {
        Row: {
          campaign_type: string
          content_key: string
          created_at: string
          html_content: string
          id: string
          is_active: boolean | null
          preview_text: string | null
          priority: number | null
          subject: string
          updated_at: string
        }
        Insert: {
          campaign_type: string
          content_key: string
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean | null
          preview_text?: string | null
          priority?: number | null
          subject: string
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          content_key?: string
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean | null
          preview_text?: string | null
          priority?: number | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          campaign_type: string
          content_key: string
          failure_count: number
          id: string
          metadata: Json | null
          recipient_count: number
          sent_at: string
          subject: string
          success_count: number
        }
        Insert: {
          campaign_type: string
          content_key: string
          failure_count?: number
          id?: string
          metadata?: Json | null
          recipient_count?: number
          sent_at?: string
          subject: string
          success_count?: number
        }
        Update: {
          campaign_type?: string
          content_key?: string
          failure_count?: number
          id?: string
          metadata?: Json | null
          recipient_count?: number
          sent_at?: string
          subject?: string
          success_count?: number
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          campaign_type: string
          created_at: string
          created_by: string | null
          description: string | null
          html_content: string
          id: string
          last_used_at: string | null
          name: string
          preview_text: string | null
          source_id: string | null
          source_type: string
          subject: string
          tags: string[] | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          campaign_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content: string
          id?: string
          last_used_at?: string | null
          name: string
          preview_text?: string | null
          source_id?: string | null
          source_type: string
          subject: string
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content?: string
          id?: string
          last_used_at?: string | null
          name?: string
          preview_text?: string | null
          source_id?: string | null
          source_type?: string
          subject?: string
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      engagement_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          subscriber_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          subscriber_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_events_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_slug: string
          course_title: string
          created_at: string
          customer_email: string
          id: string
          price: number
          stripe_session_id: string | null
        }
        Insert: {
          course_slug: string
          course_title: string
          created_at?: string
          customer_email: string
          id?: string
          price: number
          stripe_session_id?: string | null
        }
        Update: {
          course_slug?: string
          course_title?: string
          created_at?: string
          customer_email?: string
          id?: string
          price?: number
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          active: boolean | null
          email: string
          engagement_score: number | null
          id: string
          last_engagement_at: string | null
          metadata: Json | null
          name: string | null
          source: string | null
          subscribed_at: string
          tags: string[] | null
          total_clicks: number | null
          total_opens: number | null
          welcome_email_sent: boolean | null
          whatsapp: string | null
        }
        Insert: {
          active?: boolean | null
          email: string
          engagement_score?: number | null
          id?: string
          last_engagement_at?: string | null
          metadata?: Json | null
          name?: string | null
          source?: string | null
          subscribed_at?: string
          tags?: string[] | null
          total_clicks?: number | null
          total_opens?: number | null
          welcome_email_sent?: boolean | null
          whatsapp?: string | null
        }
        Update: {
          active?: boolean | null
          email?: string
          engagement_score?: number | null
          id?: string
          last_engagement_at?: string | null
          metadata?: Json | null
          name?: string | null
          source?: string | null
          subscribed_at?: string
          tags?: string[] | null
          total_clicks?: number | null
          total_opens?: number | null
          welcome_email_sent?: boolean | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      subscriber_segments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          filter_rules: Json
          id: string
          max_engagement_score: number | null
          min_engagement_score: number | null
          name: string
          subscriber_count: number | null
          tags_exclude: string[] | null
          tags_include: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_rules?: Json
          id?: string
          max_engagement_score?: number | null
          min_engagement_score?: number | null
          name: string
          subscriber_count?: number | null
          tags_exclude?: string[] | null
          tags_include?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_rules?: Json
          id?: string
          max_engagement_score?: number | null
          min_engagement_score?: number | null
          name?: string
          subscriber_count?: number | null
          tags_exclude?: string[] | null
          tags_include?: string[] | null
          updated_at?: string
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
      calculate_engagement_score: {
        Args: { subscriber_id: string }
        Returns: number
      }
      get_segment_count: { Args: { segment_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_all_engagement_scores: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
