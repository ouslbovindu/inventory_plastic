import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please connect to Supabase.');
}

// Create a dummy client if environment variables are missing
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export type Database = {
  public: {
    Tables: {
      inventory_items: {
        Row: {
          id: string;
          item_name: string;
          type: string;
          price: number;
          stock: number;
          status: string;
          repurchase_margin: number;
          note: string;
          user_id: string;
          site_location: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_name: string;
          type?: string;
          price?: number;
          stock?: number;
          status?: string;
          repurchase_margin?: number;
          note?: string;
          user_id: string;
          site_location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_name?: string;
          type?: string;
          price?: number;
          stock?: number;
          status?: string;
          repurchase_margin?: number;
          note?: string;
          user_id?: string;
          site_location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          item_name: string;
          price: number;
          quantity: string;
          quantity_numeric: number;
          purchased_date: string | null;
          note: string;
          user_id: string;
          site_location: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_name: string;
          price?: number;
          quantity?: string;
          quantity_numeric?: number;
          purchased_date?: string | null;
          note?: string;
          user_id: string;
          site_location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_name?: string;
          price?: number;
          quantity?: string;
          quantity_numeric?: number;
          purchased_date?: string | null;
          note?: string;
          user_id?: string;
          site_location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      productions: {
        Row: {
          id: string;
          item_name: string;
          quantity: string;
          quantity_numeric: number;
          client: string;
          note: string;
          user_id: string;
          site_location: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_name: string;
          quantity?: string;
          quantity_numeric?: number;
          client: string;
          note?: string;
          user_id: string;
          site_location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_name?: string;
          quantity?: string;
          quantity_numeric?: number;
          client?: string;
          note?: string;
          user_id?: string;
          site_location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      worker_accounts: {
        Row: {
          id: string;
          username: string;
          password: string;
          role: string;
          permissions: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password: string;
          role?: string;
          permissions?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          role?: string;
          permissions?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};