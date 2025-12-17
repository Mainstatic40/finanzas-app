export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          type: "income" | "expense";
          icon: string | null;
          color: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "income" | "expense";
          icon?: string | null;
          color?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "income" | "expense";
          icon?: string | null;
          color?: string | null;
          user_id?: string;
          created_at?: string;
        };
      };
      credit_cards: {
        Row: {
          id: string;
          name: string;
          bank: string;
          last_four_digits: string | null;
          credit_limit: number | null;
          current_balance: number | null;
          cut_off_day: number;
          payment_due_day: number;
          is_active: boolean | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bank: string;
          last_four_digits?: string | null;
          credit_limit?: number | null;
          current_balance?: number | null;
          cut_off_day: number;
          payment_due_day: number;
          is_active?: boolean | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bank?: string;
          last_four_digits?: string | null;
          credit_limit?: number | null;
          current_balance?: number | null;
          cut_off_day?: number;
          payment_due_day?: number;
          is_active?: boolean | null;
          user_id?: string;
          created_at?: string;
        };
      };
      credits: {
        Row: {
          id: string;
          name: string;
          institution: string;
          original_amount: number;
          current_balance: number;
          monthly_payment: number;
          interest_rate: number | null;
          payment_day: number;
          start_date: string;
          end_date: string | null;
          credit_card_id: string | null;
          is_active: boolean | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          institution: string;
          original_amount: number;
          current_balance: number;
          monthly_payment: number;
          interest_rate?: number | null;
          payment_day: number;
          start_date: string;
          end_date?: string | null;
          credit_card_id?: string | null;
          is_active?: boolean | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          institution?: string;
          original_amount?: number;
          current_balance?: number;
          monthly_payment?: number;
          interest_rate?: number | null;
          payment_day?: number;
          start_date?: string;
          end_date?: string | null;
          credit_card_id?: string | null;
          is_active?: boolean | null;
          user_id?: string;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          type: "income" | "expense";
          amount: number;
          description: string | null;
          date: string;
          category_id: string | null;
          credit_card_id: string | null;
          credit_id: string | null;
          is_recurring: boolean | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: "income" | "expense";
          amount: number;
          description?: string | null;
          date: string;
          category_id?: string | null;
          credit_card_id?: string | null;
          credit_id?: string | null;
          is_recurring?: boolean | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: "income" | "expense";
          amount?: number;
          description?: string | null;
          date?: string;
          category_id?: string | null;
          credit_card_id?: string | null;
          credit_id?: string | null;
          is_recurring?: boolean | null;
          user_id?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          name: string;
          amount: number;
          billing_cycle: "monthly" | "yearly" | "weekly";
          next_billing_date: string;
          category_id: string | null;
          credit_card_id: string | null;
          is_active: boolean | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          amount: number;
          billing_cycle: "monthly" | "yearly" | "weekly";
          next_billing_date: string;
          category_id?: string | null;
          credit_card_id?: string | null;
          is_active?: boolean | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          amount?: number;
          billing_cycle?: "monthly" | "yearly" | "weekly";
          next_billing_date?: string;
          category_id?: string | null;
          credit_card_id?: string | null;
          is_active?: boolean | null;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper type to get table row types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
