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
      comments: {
        Row: {
          created_at: string
          doodle_id: string | null
          id: string
          session_id: string
          story_id: string | null
          text: string
        }
        Insert: {
          created_at?: string
          doodle_id?: string | null
          id?: string
          session_id: string
          story_id?: string | null
          text: string
        }
        Update: {
          created_at?: string
          doodle_id?: string | null
          id?: string
          session_id?: string
          story_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_doodle_id_fkey"
            columns: ["doodle_id"]
            isOneToOne: false
            referencedRelation: "doodles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          details: string | null
          id: string
          reason: string
          resolved_at: string | null
          session_id: string
          status: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          resolved_at?: string | null
          session_id: string
          status?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          resolved_at?: string | null
          session_id?: string
          status?: string
        }
        Relationships: []
      }
      doodles: {
        Row: {
          created_at: string
          id: string
          image_url: string
          likes: number
          moderation_status: string | null
          prompt: string
          report_count: number | null
          reported: boolean | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          likes?: number
          moderation_status?: string | null
          prompt: string
          report_count?: number | null
          reported?: boolean | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          likes?: number
          moderation_status?: string | null
          prompt?: string
          report_count?: number | null
          reported?: boolean | null
          session_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          id: string
          is_animation: boolean
          likes: number
          moderation_status: string | null
          report_count: number | null
          reported: boolean | null
          session_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_animation?: boolean
          likes?: number
          moderation_status?: string | null
          report_count?: number | null
          reported?: boolean | null
          session_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_animation?: boolean
          likes?: number
          moderation_status?: string | null
          report_count?: number | null
          reported?: boolean | null
          session_id?: string
          title?: string
        }
        Relationships: []
      }
      story_frames: {
        Row: {
          created_at: string
          duration: number
          id: string
          image_url: string
          order: number
          story_id: string
        }
        Insert: {
          created_at?: string
          duration?: number
          id?: string
          image_url: string
          order: number
          story_id: string
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          image_url?: string
          order?: number
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_frames_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_report_count: {
        Args: { row_id: string; table_name: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
