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
      bookings: {
        Row: {
          admin_notes: string | null
          car_id: string | null
          confirmation_date: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          deposit_amount: number | null
          dropoff_location_id: string | null
          end_date: string
          id: string
          notes: string | null
          passengers: number | null
          payment_date: string | null
          payment_option: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          pickup_location_id: string | null
          remaining_balance: number | null
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at: string
          user_id: string | null
          with_driver: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          car_id?: string | null
          confirmation_date?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          deposit_amount?: number | null
          dropoff_location_id?: string | null
          end_date: string
          id?: string
          notes?: string | null
          passengers?: number | null
          payment_date?: string | null
          payment_option?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          pickup_location_id?: string | null
          remaining_balance?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at?: string
          user_id?: string | null
          with_driver?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          car_id?: string | null
          confirmation_date?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          deposit_amount?: number | null
          dropoff_location_id?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          passengers?: number | null
          payment_date?: string | null
          payment_option?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          pickup_location_id?: string | null
          remaining_balance?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string
          user_id?: string | null
          with_driver?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_dropoff_location_id_fkey"
            columns: ["dropoff_location_id"]
            isOneToOne: false
            referencedRelation: "pickup_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pickup_location_id_fkey"
            columns: ["pickup_location_id"]
            isOneToOne: false
            referencedRelation: "pickup_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      car_availability: {
        Row: {
          car_id: string
          date: string
          id: string
          is_available: boolean | null
          reason: string | null
        }
        Insert: {
          car_id: string
          date: string
          id?: string
          is_available?: boolean | null
          reason?: string | null
        }
        Update: {
          car_id?: string
          date?: string
          id?: string
          is_available?: boolean | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_availability_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          additional_fees: Json | null
          advance_booking_days: number | null
          brand: string
          category: Database["public"]["Enums"]["car_category"]
          created_at: string
          delivery_available: boolean | null
          engine_volume: string | null
          features: Json | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          gallery_images: string[] | null
          id: string
          is_active: boolean | null
          main_image: string | null
          model: string
          price_per_day: number
          price_with_driver: number | null
          seats: number
          transmission: Database["public"]["Enums"]["transmission_type"]
          updated_at: string
        }
        Insert: {
          additional_fees?: Json | null
          advance_booking_days?: number | null
          brand: string
          category: Database["public"]["Enums"]["car_category"]
          created_at?: string
          delivery_available?: boolean | null
          engine_volume?: string | null
          features?: Json | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          main_image?: string | null
          model: string
          price_per_day: number
          price_with_driver?: number | null
          seats?: number
          transmission?: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
        }
        Update: {
          additional_fees?: Json | null
          advance_booking_days?: number | null
          brand?: string
          category?: Database["public"]["Enums"]["car_category"]
          created_at?: string
          delivery_available?: boolean | null
          engine_volume?: string | null
          features?: Json | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          main_image?: string | null
          model?: string
          price_per_day?: number
          price_with_driver?: number | null
          seats?: number
          transmission?: Database["public"]["Enums"]["transmission_type"]
          updated_at?: string
        }
        Relationships: []
      }
      pickup_locations: {
        Row: {
          address: string
          car_id: string
          created_at: string
          fee: number | null
          id: string
          name: string
          working_hours: string | null
        }
        Insert: {
          address: string
          car_id: string
          created_at?: string
          fee?: number | null
          id?: string
          name: string
          working_hours?: string | null
        }
        Update: {
          address?: string
          car_id?: string
          created_at?: string
          fee?: number | null
          id?: string
          name?: string
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pickup_locations_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      car_category:
        | "economy"
        | "suv"
        | "luxury"
        | "minivan"
        | "sports"
        | "convertible"
        | "electric"
      fuel_type: "petrol" | "diesel" | "electric" | "hybrid"
      transmission_type: "manual" | "automatic"
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
      app_role: ["admin", "moderator", "user"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      car_category: [
        "economy",
        "suv",
        "luxury",
        "minivan",
        "sports",
        "convertible",
        "electric",
      ],
      fuel_type: ["petrol", "diesel", "electric", "hybrid"],
      transmission_type: ["manual", "automatic"],
    },
  },
} as const
