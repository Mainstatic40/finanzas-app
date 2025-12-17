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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          bank: string
          bank_id: string | null
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          cut_off_day: number
          holder_name: string | null
          id: string
          is_active: boolean | null
          last_four_digits: string | null
          name: string
          payment_due_day: number
          user_id: string
        }
        Insert: {
          bank: string
          bank_id?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          cut_off_day: number
          holder_name?: string | null
          id?: string
          is_active?: boolean | null
          last_four_digits?: string | null
          name: string
          payment_due_day: number
          user_id: string
        }
        Update: {
          bank?: string
          bank_id?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          cut_off_day?: number
          holder_name?: string | null
          id?: string
          is_active?: boolean | null
          last_four_digits?: string | null
          name?: string
          payment_due_day?: number
          user_id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          created_at: string | null
          credit_card_id: string | null
          current_balance: number
          end_date: string | null
          id: string
          institution: string
          interest_rate: number | null
          is_active: boolean | null
          monthly_payment: number
          name: string
          original_amount: number
          payment_day: number
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credit_card_id?: string | null
          current_balance: number
          end_date?: string | null
          id?: string
          institution: string
          interest_rate?: number | null
          is_active?: boolean | null
          monthly_payment: number
          name: string
          original_amount: number
          payment_day: number
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          credit_card_id?: string | null
          current_balance?: number
          end_date?: string | null
          id?: string
          institution?: string
          interest_rate?: number | null
          is_active?: boolean | null
          monthly_payment?: number
          name?: string
          original_amount?: number
          payment_day?: number
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      debit_cards: {
        Row: {
          bank: string
          bank_id: string | null
          created_at: string | null
          current_balance: number | null
          holder_name: string | null
          id: string
          is_active: boolean | null
          last_four_digits: string | null
          name: string
          user_id: string
        }
        Insert: {
          bank: string
          bank_id?: string | null
          created_at?: string | null
          current_balance?: number | null
          holder_name?: string | null
          id?: string
          is_active?: boolean | null
          last_four_digits?: string | null
          name: string
          user_id: string
        }
        Update: {
          bank?: string
          bank_id?: string | null
          created_at?: string | null
          current_balance?: number | null
          holder_name?: string | null
          id?: string
          is_active?: boolean | null
          last_four_digits?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          billing_day: number
          category_id: string | null
          created_at: string | null
          credit_card_id: string | null
          currency: string | null
          debit_card_id: string | null
          id: string
          is_active: boolean | null
          name: string
          next_billing_date: string
          provider: string | null
          subscription_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle: string
          billing_day: number
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          currency?: string | null
          debit_card_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          next_billing_date: string
          provider?: string | null
          subscription_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          billing_day?: number
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          currency?: string | null
          debit_card_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          next_billing_date?: string
          provider?: string | null
          subscription_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_debit_card_id_fkey"
            columns: ["debit_card_id"]
            isOneToOne: false
            referencedRelation: "debit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          credit_card_id: string | null
          credit_id: string | null
          date: string
          debit_card_id: string | null
          description: string | null
          id: string
          is_recurring: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          credit_id?: string | null
          date: string
          debit_card_id?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          credit_id?: string | null
          date?: string
          debit_card_id?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_debit_card_id_fkey"
            columns: ["debit_card_id"]
            isOneToOne: false
            referencedRelation: "debit_cards"
            referencedColumns: ["id"]
          },
        ]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
