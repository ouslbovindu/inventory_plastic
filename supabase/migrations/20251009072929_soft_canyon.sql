/*
  # Create inventory management system schema

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `item_name` (text)
      - `type` (text)
      - `price` (numeric, default 0)
      - `stock` (integer, default 0)
      - `status` (text, default 'in stock')
      - `repurchase_margin` (integer, default 0)
      - `note` (text, default '')
      - `user_id` (uuid, references auth.users)
      - `site_location` (text, default 'Site 1')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `assets`
      - `id` (uuid, primary key)
      - `item_name` (text)
      - `price` (numeric, default 0)
      - `quantity` (text, default '')
      - `quantity_numeric` (numeric, default 0)
      - `purchased_date` (date)
      - `note` (text, default '')
      - `user_id` (uuid, references auth.users)
      - `site_location` (text, default 'Site 1')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `productions`
      - `id` (uuid, primary key)
      - `item_name` (text)
      - `quantity` (text, default '')
      - `quantity_numeric` (numeric, default 0)
      - `client` (text)
      - `note` (text, default '')
      - `user_id` (uuid, references auth.users)
      - `site_location` (text, default 'Site 1')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `worker_accounts`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password` (text)
      - `role` (text, default 'worker')
      - `permissions` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for worker accounts
*/

-- Create inventory_items table
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name text NOT NULL,
    type text DEFAULT '',
    price numeric DEFAULT 0,
    stock integer DEFAULT 0,
    status text DEFAULT 'in stock',
    repurchase_margin integer DEFAULT 0,
    note text DEFAULT '',
    user_id uuid,
    site_location text DEFAULT 'Site 1',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_user_id_fkey'
  ) THEN
    ALTER TABLE inventory_items
      ADD CONSTRAINT inventory_items_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create assets table
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name text NOT NULL,
    price numeric DEFAULT 0,
    quantity text DEFAULT '',
    quantity_numeric numeric DEFAULT 0,
    purchased_date date,
    note text DEFAULT '',
    user_id uuid,
    site_location text DEFAULT 'Site 1',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assets_user_id_fkey'
  ) THEN
    ALTER TABLE assets
      ADD CONSTRAINT assets_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create productions table
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS productions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name text NOT NULL,
    quantity text DEFAULT '',
    quantity_numeric numeric DEFAULT 0,
    client text NOT NULL,
    note text DEFAULT '',
    user_id uuid,
    site_location text DEFAULT 'Site 1',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'productions_user_id_fkey'
  ) THEN
    ALTER TABLE productions
      ADD CONSTRAINT productions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create worker_accounts table
CREATE TABLE IF NOT EXISTS worker_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'worker',
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Users can manage their own inventory items'
  ) THEN
    CREATE POLICY "Users can manage their own inventory items"
      ON inventory_items
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for assets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Users can manage their own assets'
  ) THEN
    CREATE POLICY "Users can manage their own assets"
      ON assets
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for productions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'productions' AND policyname = 'Users can manage their own productions'
  ) THEN
    CREATE POLICY "Users can manage their own productions"
      ON productions
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for worker_accounts (only accessible by service role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'worker_accounts' AND policyname = 'Service role can manage worker accounts'
  ) THEN
    CREATE POLICY "Service role can manage worker accounts"
      ON worker_accounts
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_inventory_items_updated_at'
  ) THEN
    CREATE TRIGGER update_inventory_items_updated_at
      BEFORE UPDATE ON inventory_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_assets_updated_at'
  ) THEN
    CREATE TRIGGER update_assets_updated_at
      BEFORE UPDATE ON assets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_productions_updated_at'
  ) THEN
    CREATE TRIGGER update_productions_updated_at
      BEFORE UPDATE ON productions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_worker_accounts_updated_at'
  ) THEN
    CREATE TRIGGER update_worker_accounts_updated_at
      BEFORE UPDATE ON worker_accounts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;