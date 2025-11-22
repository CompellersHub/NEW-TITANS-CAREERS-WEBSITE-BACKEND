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
      ab_test_winner_history: {
        Row: {
          ab_test_name: string
          admin_action: string | null
          admin_user_id: string | null
          campaign_type: string
          created_at: string
          deactivated_variants: Json
          deactivated_variants_count: number
          id: string
          improvement_percent: number
          selected_by: string
          winner_click_rate: number
          winner_combined_score: number
          winner_open_rate: number
          winner_sends_count: number
          winner_template_id: string
          winner_template_name: string
          winner_variant_letter: string
        }
        Insert: {
          ab_test_name: string
          admin_action?: string | null
          admin_user_id?: string | null
          campaign_type: string
          created_at?: string
          deactivated_variants?: Json
          deactivated_variants_count: number
          id?: string
          improvement_percent: number
          selected_by?: string
          winner_click_rate: number
          winner_combined_score: number
          winner_open_rate: number
          winner_sends_count: number
          winner_template_id: string
          winner_template_name: string
          winner_variant_letter: string
        }
        Update: {
          ab_test_name?: string
          admin_action?: string | null
          admin_user_id?: string | null
          campaign_type?: string
          created_at?: string
          deactivated_variants?: Json
          deactivated_variants_count?: number
          id?: string
          improvement_percent?: number
          selected_by?: string
          winner_click_rate?: number
          winner_combined_score?: number
          winner_open_rate?: number
          winner_sends_count?: number
          winner_template_id?: string
          winner_template_name?: string
          winner_variant_letter?: string
        }
        Relationships: []
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
      admin_notification_preferences: {
        Row: {
          admin_user_id: string
          created_at: string
          daily_digest: boolean | null
          digest_time: number | null
          email: string
          id: string
          instant_alerts: boolean | null
          notify_archived_status: boolean | null
          notify_contact_form: boolean | null
          notify_feedback: boolean | null
          notify_in_progress_status: boolean | null
          notify_new_status: boolean | null
          notify_quick_contact: boolean | null
          notify_resolved_status: boolean | null
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          daily_digest?: boolean | null
          digest_time?: number | null
          email: string
          id?: string
          instant_alerts?: boolean | null
          notify_archived_status?: boolean | null
          notify_contact_form?: boolean | null
          notify_feedback?: boolean | null
          notify_in_progress_status?: boolean | null
          notify_new_status?: boolean | null
          notify_quick_contact?: boolean | null
          notify_resolved_status?: boolean | null
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          daily_digest?: boolean | null
          digest_time?: number | null
          email?: string
          id?: string
          instant_alerts?: boolean | null
          notify_archived_status?: boolean | null
          notify_contact_form?: boolean | null
          notify_feedback?: boolean | null
          notify_in_progress_status?: boolean | null
          notify_new_status?: boolean | null
          notify_quick_contact?: boolean | null
          notify_resolved_status?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_user_id: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read: boolean | null
          related_submission_id: string | null
          title: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read?: boolean | null
          related_submission_id?: string | null
          title: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read?: boolean | null
          related_submission_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_related_submission_id_fkey"
            columns: ["related_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_advisor_conversations: {
        Row: {
          auto_summary_sent: boolean | null
          auto_summary_sent_at: string | null
          created_at: string
          email: string | null
          id: string
          last_message_at: string
          lead_captured: boolean
          message_count: number
          session_id: string
          title: string | null
        }
        Insert: {
          auto_summary_sent?: boolean | null
          auto_summary_sent_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_message_at?: string
          lead_captured?: boolean
          message_count?: number
          session_id: string
          title?: string | null
        }
        Update: {
          auto_summary_sent?: boolean | null
          auto_summary_sent_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_message_at?: string
          lead_captured?: boolean
          message_count?: number
          session_id?: string
          title?: string | null
        }
        Relationships: []
      }
      ai_advisor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_advisor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_advisor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_predictions: {
        Row: {
          actual_alert_triggered: boolean | null
          channel: string
          confidence_score: number
          contributing_factors: Json | null
          created_at: string
          id: string
          predicted_alert_probability: number
          predicted_conversion_rate: number | null
          predicted_roi: number | null
          prediction_accuracy: number | null
          prediction_date: string
          prediction_period: string
          recommendations: Json | null
          validated_at: string | null
        }
        Insert: {
          actual_alert_triggered?: boolean | null
          channel: string
          confidence_score: number
          contributing_factors?: Json | null
          created_at?: string
          id?: string
          predicted_alert_probability: number
          predicted_conversion_rate?: number | null
          predicted_roi?: number | null
          prediction_accuracy?: number | null
          prediction_date?: string
          prediction_period: string
          recommendations?: Json | null
          validated_at?: string | null
        }
        Update: {
          actual_alert_triggered?: boolean | null
          channel?: string
          confidence_score?: number
          contributing_factors?: Json | null
          created_at?: string
          id?: string
          predicted_alert_probability?: number
          predicted_conversion_rate?: number | null
          predicted_roi?: number | null
          prediction_accuracy?: number | null
          prediction_date?: string
          prediction_period?: string
          recommendations?: Json | null
          validated_at?: string | null
        }
        Relationships: []
      }
      automation_config: {
        Row: {
          config_key: string
          created_at: string
          created_by: string | null
          id: string
          is_enabled: boolean
          last_run_at: string | null
          settings: Json
          updated_at: string
        }
        Insert: {
          config_key: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          settings?: Json
          updated_at?: string
        }
        Update: {
          config_key?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      bank_transfer_orders: {
        Row: {
          amount: number
          course_slug: string
          course_title: string
          created_at: string | null
          customer_email: string
          customer_name: string | null
          expires_at: string
          id: string
          instructions_sent_at: string | null
          payment_intent_id: string | null
          payment_proof_url: string | null
          payment_proof_urls: string[] | null
          payment_reference: string
          status: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          course_slug: string
          course_title: string
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          expires_at: string
          id?: string
          instructions_sent_at?: string | null
          payment_intent_id?: string | null
          payment_proof_url?: string | null
          payment_proof_urls?: string[] | null
          payment_reference: string
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          course_slug?: string
          course_title?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          expires_at?: string
          id?: string
          instructions_sent_at?: string | null
          payment_intent_id?: string | null
          payment_proof_url?: string | null
          payment_proof_urls?: string[] | null
          payment_reference?: string
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transfer_orders_payment_intent_id_fkey"
            columns: ["payment_intent_id"]
            isOneToOne: false
            referencedRelation: "payment_intents"
            referencedColumns: ["id"]
          },
        ]
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
          segment_id: string | null
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
          segment_id?: string | null
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
          segment_id?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_content_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "subscriber_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user_identifier: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_identifier: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_identifier?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_abandonment_emails: {
        Row: {
          checkout_session_id: string
          clicked: boolean | null
          converted: boolean | null
          discount_code: string | null
          email_sequence_number: number
          email_type: string
          id: string
          opened: boolean | null
          sent_at: string
        }
        Insert: {
          checkout_session_id: string
          clicked?: boolean | null
          converted?: boolean | null
          discount_code?: string | null
          email_sequence_number: number
          email_type: string
          id?: string
          opened?: boolean | null
          sent_at?: string
        }
        Update: {
          checkout_session_id?: string
          clicked?: boolean | null
          converted?: boolean | null
          discount_code?: string | null
          email_sequence_number?: number
          email_type?: string
          id?: string
          opened?: boolean | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_abandonment_emails_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_abandonment_sms: {
        Row: {
          checkout_session_id: string
          clicked: boolean | null
          converted: boolean | null
          delivered: boolean | null
          discount_code: string | null
          id: string
          sent_at: string
          sms_sequence_number: number
          sms_type: string
        }
        Insert: {
          checkout_session_id: string
          clicked?: boolean | null
          converted?: boolean | null
          delivered?: boolean | null
          discount_code?: string | null
          id?: string
          sent_at?: string
          sms_sequence_number: number
          sms_type: string
        }
        Update: {
          checkout_session_id?: string
          clicked?: boolean | null
          converted?: boolean | null
          delivered?: boolean | null
          discount_code?: string | null
          id?: string
          sent_at?: string
          sms_sequence_number?: number
          sms_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_abandonment_sms_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_abandonment_whatsapp: {
        Row: {
          checkout_session_id: string
          clicked: boolean | null
          converted: boolean | null
          delivered: boolean | null
          discount_code: string | null
          id: string
          message_id: string | null
          read: boolean | null
          sent_at: string
          whatsapp_sequence_number: number
          whatsapp_type: string
        }
        Insert: {
          checkout_session_id: string
          clicked?: boolean | null
          converted?: boolean | null
          delivered?: boolean | null
          discount_code?: string | null
          id?: string
          message_id?: string | null
          read?: boolean | null
          sent_at?: string
          whatsapp_sequence_number: number
          whatsapp_type: string
        }
        Update: {
          checkout_session_id?: string
          clicked?: boolean | null
          converted?: boolean | null
          delivered?: boolean | null
          discount_code?: string | null
          id?: string
          message_id?: string | null
          read?: boolean | null
          sent_at?: string
          whatsapp_sequence_number?: number
          whatsapp_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_abandonment_whatsapp_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_sessions: {
        Row: {
          abandoned: boolean | null
          completed_at: string | null
          course_slug: string
          course_title: string
          created_at: string
          email: string
          id: string
          metadata: Json | null
          name: string | null
          original_price: number
          phone: string | null
          session_id: string
          voucher_code: string | null
          whatsapp: string | null
        }
        Insert: {
          abandoned?: boolean | null
          completed_at?: string | null
          course_slug: string
          course_title: string
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          name?: string | null
          original_price: number
          phone?: string | null
          session_id: string
          voucher_code?: string | null
          whatsapp?: string | null
        }
        Update: {
          abandoned?: boolean | null
          completed_at?: string | null
          course_slug?: string
          course_title?: string
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          name?: string | null
          original_price?: number
          phone?: string | null
          session_id?: string
          voucher_code?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      course_certificates: {
        Row: {
          certificate_number: string
          completion_date: string
          course_slug: string
          course_title: string
          created_at: string
          id: string
          user_id: string
          user_name: string
        }
        Insert: {
          certificate_number: string
          completion_date?: string
          course_slug: string
          course_title: string
          created_at?: string
          id?: string
          user_id: string
          user_name: string
        }
        Update: {
          certificate_number?: string
          completion_date?: string
          course_slug?: string
          course_title?: string
          created_at?: string
          id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      course_inquiries: {
        Row: {
          admin_notes: string | null
          completed_at: string | null
          contacted_at: string | null
          contacted_by: string | null
          country_code: string
          course_slug: string
          course_title: string
          created_at: string | null
          email: string
          id: string
          inquiry_type: string
          name: string
          phone: string
          privacy_accepted: boolean
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          completed_at?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          country_code: string
          course_slug: string
          course_title: string
          created_at?: string | null
          email: string
          id?: string
          inquiry_type: string
          name: string
          phone: string
          privacy_accepted?: boolean
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          completed_at?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          country_code?: string
          course_slug?: string
          course_title?: string
          created_at?: string | null
          email?: string
          id?: string
          inquiry_type?: string
          name?: string
          phone?: string
          privacy_accepted?: boolean
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content_type: string | null
          course_slug: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free_preview: boolean | null
          lesson_number: number
          module_number: number
          title: string
          updated_at: string
          video_duration_seconds: number | null
          video_url: string | null
        }
        Insert: {
          content_type?: string | null
          course_slug: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          lesson_number: number
          module_number: number
          title: string
          updated_at?: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Update: {
          content_type?: string | null
          course_slug?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          lesson_number?: number
          module_number?: number
          title?: string
          updated_at?: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      discussion_replies: {
        Row: {
          author_id: string
          author_name: string
          content: string
          created_at: string
          id: string
          is_solution: boolean | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_solution?: boolean | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_solution?: boolean | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_threads: {
        Row: {
          author_id: string
          author_name: string
          content: string
          course_slug: string
          created_at: string
          id: string
          is_pinned: boolean | null
          is_resolved: boolean | null
          lesson_id: string | null
          module_number: number | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id: string
          author_name: string
          content: string
          course_slug: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          lesson_id?: string | null
          module_number?: number | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          course_slug?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          lesson_id?: string | null
          module_number?: number | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_threads_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      email_ab_variants: {
        Row: {
          created_at: string | null
          email_type: string
          id: string
          is_active: boolean | null
          preview_text: string | null
          subject_line: string
          variant_name: string
        }
        Insert: {
          created_at?: string | null
          email_type?: string
          id?: string
          is_active?: boolean | null
          preview_text?: string | null
          subject_line: string
          variant_name: string
        }
        Update: {
          created_at?: string | null
          email_type?: string
          id?: string
          is_active?: boolean | null
          preview_text?: string | null
          subject_line?: string
          variant_name?: string
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
          segment_id: string | null
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
          segment_id?: string | null
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
          segment_id?: string | null
          sent_at?: string
          subject?: string
          success_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "subscriber_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      email_engagement_tracking: {
        Row: {
          city: string | null
          clicked_at: string
          country: string | null
          country_code: string | null
          email: string
          email_type: string
          id: string
          ip_address: string | null
          latitude: number | null
          link_type: string
          longitude: number | null
          metadata: Json | null
          region: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          clicked_at?: string
          country?: string | null
          country_code?: string | null
          email: string
          email_type: string
          id?: string
          ip_address?: string | null
          latitude?: number | null
          link_type: string
          longitude?: number | null
          metadata?: Json | null
          region?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          clicked_at?: string
          country?: string | null
          country_code?: string | null
          email?: string
          email_type?: string
          id?: string
          ip_address?: string | null
          latitude?: number | null
          link_type?: string
          longitude?: number | null
          metadata?: Json | null
          region?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_notification_preferences: {
        Row: {
          created_at: string
          digest_time: number | null
          frequency: string
          id: string
          last_digest_sent_at: string | null
          mention_notifications: boolean | null
          reply_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_time?: number | null
          frequency?: string
          id?: string
          last_digest_sent_at?: string | null
          mention_notifications?: boolean | null
          reply_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_time?: number | null
          frequency?: string
          id?: string
          last_digest_sent_at?: string | null
          mention_notifications?: boolean | null
          reply_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_sends: {
        Row: {
          ab_variant_letter: string | null
          clicked_at: string | null
          conversation_id: string | null
          email: string
          id: string
          opened_at: string | null
          sent_at: string | null
          template_id: string | null
          tracking_id: string | null
          variant_id: string | null
        }
        Insert: {
          ab_variant_letter?: string | null
          clicked_at?: string | null
          conversation_id?: string | null
          email: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          template_id?: string | null
          tracking_id?: string | null
          variant_id?: string | null
        }
        Update: {
          ab_variant_letter?: string | null
          clicked_at?: string | null
          conversation_id?: string | null
          email?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          template_id?: string | null
          tracking_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_advisor_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "email_ab_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          ab_test_group_id: string | null
          ab_test_name: string | null
          auto_winner_paused: boolean | null
          campaign_type: string
          created_at: string
          created_by: string | null
          description: string | null
          html_content: string
          id: string
          is_ab_test: boolean | null
          is_active: boolean | null
          last_used_at: string | null
          name: string
          preview_text: string | null
          source_id: string | null
          source_type: string
          subject: string
          tags: string[] | null
          traffic_weight: number | null
          updated_at: string
          usage_count: number
          variant_letter: string | null
        }
        Insert: {
          ab_test_group_id?: string | null
          ab_test_name?: string | null
          auto_winner_paused?: boolean | null
          campaign_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content: string
          id?: string
          is_ab_test?: boolean | null
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          preview_text?: string | null
          source_id?: string | null
          source_type: string
          subject: string
          tags?: string[] | null
          traffic_weight?: number | null
          updated_at?: string
          usage_count?: number
          variant_letter?: string | null
        }
        Update: {
          ab_test_group_id?: string | null
          ab_test_name?: string | null
          auto_winner_paused?: boolean | null
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_content?: string
          id?: string
          is_ab_test?: boolean | null
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          preview_text?: string | null
          source_id?: string | null
          source_type?: string
          subject?: string
          tags?: string[] | null
          traffic_weight?: number | null
          updated_at?: string
          usage_count?: number
          variant_letter?: string | null
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
          {
            foreignKeyName: "engagement_events_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscriber_engagement_patterns"
            referencedColumns: ["subscriber_id"]
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
          installment_plan: Json | null
          payment_metadata: Json | null
          payment_method: string | null
          payment_provider_reference: string | null
          payment_status: string | null
          price: number
          stripe_session_id: string | null
        }
        Insert: {
          course_slug: string
          course_title: string
          created_at?: string
          customer_email: string
          id?: string
          installment_plan?: Json | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_provider_reference?: string | null
          payment_status?: string | null
          price: number
          stripe_session_id?: string | null
        }
        Update: {
          course_slug?: string
          course_title?: string
          created_at?: string
          customer_email?: string
          id?: string
          installment_plan?: Json | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_provider_reference?: string | null
          payment_status?: string | null
          price?: number
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      event_templates: {
        Row: {
          course_slug: string
          created_at: string
          day_of_week: number
          description: string | null
          duration_minutes: number
          event_type: string
          generate_weeks_ahead: number
          id: string
          is_active: boolean
          metadata: Json | null
          recurrence_pattern: string
          speaker_name: string | null
          speaker_role: string | null
          template_name: string
          time: string
          updated_at: string
        }
        Insert: {
          course_slug: string
          created_at?: string
          day_of_week: number
          description?: string | null
          duration_minutes?: number
          event_type: string
          generate_weeks_ahead?: number
          id?: string
          is_active?: boolean
          metadata?: Json | null
          recurrence_pattern?: string
          speaker_name?: string | null
          speaker_role?: string | null
          template_name: string
          time: string
          updated_at?: string
        }
        Update: {
          course_slug?: string
          created_at?: string
          day_of_week?: number
          description?: string | null
          duration_minutes?: number
          event_type?: string
          generate_weeks_ahead?: number
          id?: string
          is_active?: boolean
          metadata?: Json | null
          recurrence_pattern?: string
          speaker_name?: string | null
          speaker_role?: string | null
          template_name?: string
          time?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          archived_at: string | null
          cohort_number: number | null
          course_slug: string
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          image_url: string | null
          instructor_name: string | null
          is_featured: boolean | null
          location: string | null
          max_participants: number | null
          metadata: Json | null
          price: number | null
          registration_link: string | null
          start_date: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          cohort_number?: number | null
          course_slug: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          instructor_name?: string | null
          is_featured?: boolean | null
          location?: string | null
          max_participants?: number | null
          metadata?: Json | null
          price?: number | null
          registration_link?: string | null
          start_date: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          cohort_number?: number | null
          course_slug?: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          instructor_name?: string | null
          is_featured?: boolean | null
          location?: string | null
          max_participants?: number | null
          metadata?: Json | null
          price?: number | null
          registration_link?: string | null
          start_date?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exit_captures: {
        Row: {
          converted: boolean
          created_at: string
          email: string
          id: string
          offer_type: string
        }
        Insert: {
          converted?: boolean
          created_at?: string
          email: string
          id?: string
          offer_type: string
        }
        Update: {
          converted?: boolean
          created_at?: string
          email?: string
          id?: string
          offer_type?: string
        }
        Relationships: []
      }
      form_analytics: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          field_name: string | null
          form_name: string
          id: string
          metadata: Json | null
          session_id: string
          step_number: number | null
          step_title: string | null
          time_spent_ms: number | null
          user_email: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          field_name?: string | null
          form_name: string
          id?: string
          metadata?: Json | null
          session_id: string
          step_number?: number | null
          step_title?: string | null
          time_spent_ms?: number | null
          user_email?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          field_name?: string | null
          form_name?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          step_number?: number | null
          step_title?: string | null
          time_spent_ms?: number | null
          user_email?: string | null
        }
        Relationships: []
      }
      form_submission_audit_log: {
        Row: {
          action_type: string
          changed_by: string | null
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          submission_id: string
        }
        Insert: {
          action_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          submission_id: string
        }
        Update: {
          action_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submission_audit_log_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          created_at: string
          form_data: Json
          form_type: string
          id: string
          last_updated_at: string | null
          last_updated_by: string | null
          priority: string | null
          sla_deadline: string | null
          sla_status: string | null
          status: string | null
          submitted_at: string
          tags: string[] | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          created_at?: string
          form_data: Json
          form_type: string
          id?: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          priority?: string | null
          sla_deadline?: string | null
          sla_status?: string | null
          status?: string | null
          submitted_at?: string
          tags?: string[] | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          created_at?: string
          form_data?: Json
          form_type?: string
          id?: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          priority?: string | null
          sla_deadline?: string | null
          sla_status?: string | null
          status?: string | null
          submitted_at?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      inquiry_rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          inquiry_count: number | null
          last_attempt_at: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          inquiry_count?: number | null
          last_attempt_at?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          inquiry_count?: number | null
          last_attempt_at?: string | null
        }
        Relationships: []
      }
      integration_tokens: {
        Row: {
          academy_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          academy_user_id?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
        }
        Update: {
          academy_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: []
      }
      lead_magnet_downloads: {
        Row: {
          downloaded_at: string
          email: string
          id: string
          lead_magnet_id: string
          name: string | null
        }
        Insert: {
          downloaded_at?: string
          email: string
          id?: string
          lead_magnet_id: string
          name?: string | null
        }
        Update: {
          downloaded_at?: string
          email?: string
          id?: string
          lead_magnet_id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_magnet_downloads_lead_magnet_id_fkey"
            columns: ["lead_magnet_id"]
            isOneToOne: false
            referencedRelation: "lead_magnets"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_magnets: {
        Row: {
          active: boolean
          course_related: string | null
          created_at: string
          description: string
          downloads_count: number
          file_url: string | null
          id: string
          resource_type: string
          title: string
        }
        Insert: {
          active?: boolean
          course_related?: string | null
          created_at?: string
          description: string
          downloads_count?: number
          file_url?: string | null
          id?: string
          resource_type: string
          title: string
        }
        Update: {
          active?: boolean
          course_related?: string | null
          created_at?: string
          description?: string
          downloads_count?: number
          file_url?: string | null
          id?: string
          resource_type?: string
          title?: string
        }
        Relationships: []
      }
      lead_scores: {
        Row: {
          created_at: string
          email: string
          id: string
          last_activity: string
          name: string | null
          source: string | null
          status: string
          total_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_activity?: string
          name?: string | null
          source?: string | null
          status?: string
          total_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_activity?: string
          name?: string | null
          source?: string | null
          status?: string
          total_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      module_quizzes: {
        Row: {
          course_slug: string
          created_at: string
          description: string | null
          id: string
          module_number: number
          passing_score: number
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_slug: string
          created_at?: string
          description?: string | null
          id?: string
          module_number: number
          passing_score?: number
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_slug?: string
          created_at?: string
          description?: string | null
          id?: string
          module_number?: number
          passing_score?: number
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
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
          last_send_time_analysis: string | null
          metadata: Json | null
          name: string | null
          optimal_send_day: string | null
          optimal_send_hour: number | null
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
          last_send_time_analysis?: string | null
          metadata?: Json | null
          name?: string | null
          optimal_send_day?: string | null
          optimal_send_hour?: number | null
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
          last_send_time_analysis?: string | null
          metadata?: Json | null
          name?: string | null
          optimal_send_day?: string | null
          optimal_send_hour?: number | null
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
      notification_queue: {
        Row: {
          created_at: string | null
          data: Json | null
          email: string
          error_message: string | null
          id: string
          notification_type: string
          priority: string | null
          retry_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          email: string
          error_message?: string | null
          id?: string
          notification_type: string
          priority?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          email?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          priority?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          completed_at: string | null
          course_slug: string
          course_title: string
          created_at: string | null
          customer_email: string
          customer_name: string | null
          expires_at: string | null
          final_price: number
          id: string
          metadata: Json | null
          original_price: number
          payment_method: string
          payment_reference: string | null
          payment_status: string | null
          provider_session_id: string | null
          updated_at: string | null
          voucher_code: string | null
        }
        Insert: {
          completed_at?: string | null
          course_slug: string
          course_title: string
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          expires_at?: string | null
          final_price: number
          id?: string
          metadata?: Json | null
          original_price: number
          payment_method: string
          payment_reference?: string | null
          payment_status?: string | null
          provider_session_id?: string | null
          updated_at?: string | null
          voucher_code?: string | null
        }
        Update: {
          completed_at?: string | null
          course_slug?: string
          course_title?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          expires_at?: string | null
          final_price?: number
          id?: string
          metadata?: Json | null
          original_price?: number
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string | null
          provider_session_id?: string | null
          updated_at?: string | null
          voucher_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      queued_email_notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          notification_type: string
          sent: boolean | null
          subject: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notification_type: string
          sent?: boolean | null
          subject: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          notification_type?: string
          sent?: boolean | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string
          correct_answers: number
          id: string
          passed: boolean
          quiz_id: string
          score: number
          started_at: string
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string
          correct_answers: number
          id?: string
          passed: boolean
          quiz_id: string
          score: number
          started_at?: string
          time_taken_seconds?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          correct_answers?: number
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          started_at?: string
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "module_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: Json
          order_number: number
          points: number
          question_text: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          options: Json
          order_number: number
          points?: number
          question_text: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_number?: number
          points?: number
          question_text?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "module_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          answers: Json
          completed_at: string
          email: string | null
          id: string
          name: string | null
          recommended_courses: string[]
        }
        Insert: {
          answers: Json
          completed_at?: string
          email?: string | null
          id?: string
          name?: string | null
          recommended_courses: string[]
        }
        Update: {
          answers?: Json
          completed_at?: string
          email?: string | null
          id?: string
          name?: string | null
          recommended_courses?: string[]
        }
        Relationships: []
      }
      recovery_alert_history: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          admin_email: string
          alert_data: Json | null
          alert_type: string
          channel: string
          id: string
          metric_value: number
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          sent_at: string | null
          status: string | null
          threshold_value: number
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          admin_email: string
          alert_data?: Json | null
          alert_type: string
          channel: string
          id?: string
          metric_value: number
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sent_at?: string | null
          status?: string | null
          threshold_value: number
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          admin_email?: string
          alert_data?: Json | null
          alert_type?: string
          channel?: string
          id?: string
          metric_value?: number
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sent_at?: string | null
          status?: string | null
          threshold_value?: number
        }
        Relationships: []
      }
      recovery_alert_settings: {
        Row: {
          admin_email: string
          alert_cooldown_hours: number | null
          check_interval_hours: number | null
          created_at: string | null
          email_conversion_threshold: number | null
          email_roi_threshold: number | null
          enabled: boolean | null
          id: string
          overall_conversion_threshold: number | null
          overall_roi_threshold: number | null
          slack_enabled: boolean | null
          slack_webhook_url: string | null
          sms_conversion_threshold: number | null
          sms_roi_threshold: number | null
          updated_at: string | null
          whatsapp_conversion_threshold: number | null
          whatsapp_roi_threshold: number | null
        }
        Insert: {
          admin_email: string
          alert_cooldown_hours?: number | null
          check_interval_hours?: number | null
          created_at?: string | null
          email_conversion_threshold?: number | null
          email_roi_threshold?: number | null
          enabled?: boolean | null
          id?: string
          overall_conversion_threshold?: number | null
          overall_roi_threshold?: number | null
          slack_enabled?: boolean | null
          slack_webhook_url?: string | null
          sms_conversion_threshold?: number | null
          sms_roi_threshold?: number | null
          updated_at?: string | null
          whatsapp_conversion_threshold?: number | null
          whatsapp_roi_threshold?: number | null
        }
        Update: {
          admin_email?: string
          alert_cooldown_hours?: number | null
          check_interval_hours?: number | null
          created_at?: string | null
          email_conversion_threshold?: number | null
          email_roi_threshold?: number | null
          enabled?: boolean | null
          id?: string
          overall_conversion_threshold?: number | null
          overall_roi_threshold?: number | null
          slack_enabled?: boolean | null
          slack_webhook_url?: string | null
          sms_conversion_threshold?: number | null
          sms_roi_threshold?: number | null
          updated_at?: string | null
          whatsapp_conversion_threshold?: number | null
          whatsapp_roi_threshold?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referred_email: string
          referrer_email: string
          reward_given: boolean
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_email: string
          referrer_email: string
          reward_given?: boolean
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_email?: string
          referrer_email?: string
          reward_given?: boolean
          status?: string
        }
        Relationships: []
      }
      reply_likes: {
        Row: {
          created_at: string
          id: string
          reply_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reply_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reply_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      response_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          performed_by: string
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by: string
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string
          target_role?: Database["public"]["Enums"]["app_role"]
          target_user_id?: string
        }
        Relationships: []
      }
      scheduled_voucher_campaigns: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          id: string
          last_sent_at: string | null
          manual_emails: string[] | null
          message: string | null
          next_send_at: string | null
          recurrence_type: string
          rejection_reason: string | null
          scheduled_time: string
          segment_id: string | null
          status: string
          subject: string
          updated_at: string
          voucher_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_sent_at?: string | null
          manual_emails?: string[] | null
          message?: string | null
          next_send_at?: string | null
          recurrence_type?: string
          rejection_reason?: string | null
          scheduled_time: string
          segment_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          voucher_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_sent_at?: string | null
          manual_emails?: string[] | null
          message?: string | null
          next_send_at?: string | null
          recurrence_type?: string
          rejection_reason?: string | null
          scheduled_time?: string
          segment_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_voucher_campaigns_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "subscriber_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_voucher_campaigns_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_alerts: {
        Row: {
          alert_data: Json | null
          alert_type: string
          id: string
          sent_at: string
          sent_to: string
          submission_id: string
        }
        Insert: {
          alert_data?: Json | null
          alert_type: string
          id?: string
          sent_at?: string
          sent_to: string
          submission_id: string
        }
        Update: {
          alert_data?: Json | null
          alert_type?: string
          id?: string
          sent_at?: string
          sent_to?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_alerts_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
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
      thread_likes: {
        Row: {
          created_at: string
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_likes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_account_preferences: {
        Row: {
          course_access_notifications: boolean | null
          created_at: string | null
          email_receipts: boolean | null
          id: string
          marketing_emails: boolean | null
          payment_confirmations: boolean | null
          payment_reminders: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_access_notifications?: boolean | null
          created_at?: string | null
          email_receipts?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          payment_confirmations?: boolean | null
          payment_reminders?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_access_notifications?: boolean | null
          created_at?: string | null
          email_receipts?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          payment_confirmations?: boolean | null
          payment_reminders?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          email: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_behaviors: {
        Row: {
          behavior_data: Json | null
          behavior_type: string
          created_at: string
          email: string
          id: string
          score_value: number
        }
        Insert: {
          behavior_data?: Json | null
          behavior_type: string
          created_at?: string
          email: string
          id?: string
          score_value?: number
        }
        Update: {
          behavior_data?: Json | null
          behavior_type?: string
          created_at?: string
          email?: string
          id?: string
          score_value?: number
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          last_accessed_at: string | null
          lesson_id: string
          user_id: string
          video_progress_seconds: number | null
          video_watched_percentage: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id: string
          user_id: string
          video_progress_seconds?: number | null
          video_watched_percentage?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string
          user_id?: string
          video_progress_seconds?: number | null
          video_watched_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          reply_id: string | null
          thread_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          reply_id?: string | null
          thread_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          reply_id?: string | null
          thread_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
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
      voucher_distributions: {
        Row: {
          created_at: string
          distributed_by: string | null
          distribution_method: string
          id: string
          recipient_count: number
          segment_id: string | null
          voucher_id: string
        }
        Insert: {
          created_at?: string
          distributed_by?: string | null
          distribution_method: string
          id?: string
          recipient_count?: number
          segment_id?: string | null
          voucher_id: string
        }
        Update: {
          created_at?: string
          distributed_by?: string | null
          distribution_method?: string
          id?: string
          recipient_count?: number
          segment_id?: string | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_distributions_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "subscriber_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_distributions_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_usage: {
        Row: {
          course_slug: string
          discount_amount: number
          final_price: number
          id: string
          original_price: number
          stripe_session_id: string | null
          used_at: string
          user_email: string
          voucher_id: string
        }
        Insert: {
          course_slug: string
          discount_amount: number
          final_price: number
          id?: string
          original_price: number
          stripe_session_id?: string | null
          used_at?: string
          user_email: string
          voucher_id: string
        }
        Update: {
          course_slug?: string
          discount_amount?: number
          final_price?: number
          id?: string
          original_price?: number
          stripe_session_id?: string | null
          used_at?: string
          user_email?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_usage_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          applicable_courses: string[] | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_purchase_amount: number | null
          name: string
          per_user_limit: number | null
          updated_at: string
          usage_count: number
          usage_limit: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          applicable_courses?: string[] | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name: string
          per_user_limit?: number | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from: string
          valid_until: string
        }
        Update: {
          applicable_courses?: string[] | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name?: string
          per_user_limit?: number | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
    }
    Views: {
      assignee_workload: {
        Row: {
          active_count: number | null
          assigned_to: string | null
          assignee_email: string | null
          avg_resolution_hours: number | null
          overdue_count: number | null
          resolved_count: number | null
          total_assigned: number | null
        }
        Relationships: []
      }
      daily_submission_trends: {
        Row: {
          high_priority_count: number | null
          low_priority_count: number | null
          medium_priority_count: number | null
          overdue_count: number | null
          resolved_count: number | null
          submission_date: string | null
          total_submissions: number | null
        }
        Relationships: []
      }
      form_analytics_summary: {
        Row: {
          abandon_count: number | null
          avg_time_spent_ms: number | null
          complete_count: number | null
          error_count: number | null
          field_name: string | null
          form_name: string | null
          step_number: number | null
          step_title: string | null
          total_events: number | null
          unique_sessions: number | null
        }
        Relationships: []
      }
      form_type_distribution: {
        Row: {
          avg_resolution_hours: number | null
          form_type: string | null
          in_progress_count: number | null
          new_count: number | null
          resolved_count: number | null
          total_submissions: number | null
        }
        Relationships: []
      }
      role_descriptions: {
        Row: {
          color_scheme: string | null
          description: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      submission_metrics_by_assignee: {
        Row: {
          assigned_to: string | null
          avg_resolution_hours: number | null
          in_progress_count: number | null
          overdue_count: number | null
          resolved_count: number | null
          total_assigned: number | null
        }
        Relationships: []
      }
      submission_metrics_by_priority: {
        Row: {
          archived_count: number | null
          avg_resolution_hours: number | null
          overdue_count: number | null
          priority: string | null
          resolved_count: number | null
          sla_met_count: number | null
          total_submissions: number | null
        }
        Relationships: []
      }
      subscriber_engagement_patterns: {
        Row: {
          avg_open_day: number | null
          avg_open_hour: number | null
          email: string | null
          engagement_score: number | null
          last_open_at: string | null
          subscriber_id: string | null
          total_clicks: number | null
          total_emails_received: number | null
          total_opens: number | null
        }
        Relationships: []
      }
      tag_distribution: {
        Row: {
          avg_resolution_hours: number | null
          resolved_count: number | null
          tag: string | null
          tag_count: number | null
        }
        Relationships: []
      }
      template_performance: {
        Row: {
          ab_test_name: string | null
          campaign_type: string | null
          click_rate: number | null
          clicks_count: number | null
          is_ab_test: boolean | null
          open_rate: number | null
          opens_count: number | null
          sends_count: number | null
          tags: string[] | null
          template_id: string | null
          template_name: string | null
          variant_letter: string | null
        }
        Relationships: []
      }
      user_order_history: {
        Row: {
          course_slug: string | null
          course_title: string | null
          customer_email: string | null
          display_status: string | null
          expires_at: string | null
          id: string | null
          payment_metadata: Json | null
          payment_method: string | null
          payment_proof_urls: string[] | null
          payment_reference: string | null
          price: number | null
          purchase_date: string | null
          verified_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_expired_events: { Args: never; Returns: undefined }
      calculate_engagement_score: {
        Args: { subscriber_id: string }
        Returns: number
      }
      calculate_sla_deadline: {
        Args: { created_at: string; priority_level: string }
        Returns: string
      }
      calculate_sla_status: {
        Args: { current_status: string; deadline: string }
        Returns: string
      }
      can_view_template_performance: { Args: never; Returns: boolean }
      check_and_send_sla_alerts: { Args: never; Returns: undefined }
      check_team_sla_compliance: { Args: never; Returns: undefined }
      cleanup_old_events: { Args: never; Returns: Json }
      create_test_admin: {
        Args: { test_email?: string; test_password?: string }
        Returns: string
      }
      generate_certificate_number: { Args: never; Returns: string }
      generate_cohort_events:
        | {
            Args: {
              p_course_slug: string
              p_course_title: string
              p_months_ahead?: number
            }
            Returns: undefined
          }
        | {
            Args: { p_course_slug: string; p_months_ahead?: number }
            Returns: undefined
          }
      generate_weekly_events: { Args: never; Returns: Json }
      get_segment_count: { Args: { segment_id: string }; Returns: number }
      grant_admin_role: { Args: { user_email: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_date_excluded: { Args: { check_date: string }; Returns: boolean }
      is_enrolled_in_course: {
        Args: { p_course_slug: string; p_user_id: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_activity_type: string
          p_description?: string
          p_email: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: string
      }
      maintain_cohort_pipeline: { Args: never; Returns: Json }
      refresh_course_cohorts: {
        Args: { p_course_slug: string; p_months_ahead?: number }
        Returns: undefined
      }
      send_email_notification: {
        Args: {
          p_content: string
          p_metadata: Json
          p_notification_type: string
          p_subject: string
          p_user_id: string
        }
        Returns: undefined
      }
      set_config: {
        Args: { setting: string; value: string }
        Returns: undefined
      }
      update_all_engagement_scores: { Args: never; Returns: undefined }
      update_event_status: { Args: never; Returns: undefined }
      update_lead_score: {
        Args: { p_behavior: string; p_email: string; p_score_change: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "developer" | "support" | "marketer"
      discount_type: "percentage" | "fixed_amount"
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
      app_role: ["admin", "user", "developer", "support", "marketer"],
      discount_type: ["percentage", "fixed_amount"],
    },
  },
} as const
