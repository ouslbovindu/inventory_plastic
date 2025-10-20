/*
  # Create shared inventory management system schema

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
    - Add policies for all authenticated users to access shared inventory
    - All users can view and manage the same inventory
*/

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  type text DEFAULT '',
  price numeric DEFAULT 0,
  stock integer DEFAULT 0,
  status text DEFAULT 'in stock',
  repurchase_margin integer DEFAULT 0,
  note text DEFAULT '',
  site_location text DEFAULT 'Site 1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  price numeric DEFAULT 0,
  quantity text DEFAULT '',
  quantity_numeric numeric DEFAULT 0,
  purchased_date date,
  note text DEFAULT '',
  site_location text DEFAULT 'Site 1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create productions table
CREATE TABLE IF NOT EXISTS productions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  quantity text DEFAULT '',
  quantity_numeric numeric DEFAULT 0,
  client text NOT NULL,
  note text DEFAULT '',
  site_location text DEFAULT 'Site 1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

-- Create policies for inventory_items (shared access for all authenticated users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Authenticated users can view shared inventory items'
  ) THEN
    CREATE POLICY "Authenticated users can view shared inventory items"
      ON inventory_items
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Authenticated users can insert shared inventory items'
  ) THEN
    CREATE POLICY "Authenticated users can insert shared inventory items"
      ON inventory_items
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Authenticated users can update shared inventory items'
  ) THEN
    CREATE POLICY "Authenticated users can update shared inventory items"
      ON inventory_items
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Authenticated users can delete shared inventory items'
  ) THEN
    CREATE POLICY "Authenticated users can delete shared inventory items"
      ON inventory_items
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create policies for assets (shared access for all authenticated users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Authenticated users can view shared assets'
  ) THEN
    CREATE POLICY "Authenticated users can view shared assets"
      ON assets
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Authenticated users can insert shared assets'
  ) THEN
    CREATE POLICY "Authenticated users can insert shared assets"
      ON assets
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Authenticated users can update shared assets'
  ) THEN
    CREATE POLICY "Authenticated users can update shared assets"
      ON assets
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Authenticated users can delete shared assets'
  ) THEN
    CREATE POLICY "Authenticated users can delete shared assets"
      ON assets
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create policies for productions (shared access for all authenticated users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'productions' AND policyname = 'Authenticated users can view shared productions'
  ) THEN
    CREATE POLICY "Authenticated users can view shared productions"
      ON productions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'productions' AND policyname = 'Authenticated users can insert shared productions'
  ) THEN
    CREATE POLICY "Authenticated users can insert shared productions"
      ON productions
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'productions' AND policyname = 'Authenticated users can update shared productions'
  ) THEN
    CREATE POLICY "Authenticated users can update shared productions"
      ON productions
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'productions' AND policyname = 'Authenticated users can delete shared productions'
  ) THEN
    CREATE POLICY "Authenticated users can delete shared productions"
      ON productions
      FOR DELETE
      TO authenticated
      USING (true);
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