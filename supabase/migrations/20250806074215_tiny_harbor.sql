/*
  # Fix User Data Isolation

  1. Database Changes
    - Create users table for proper user management
    - Update RLS policies to ensure users only see their own data
    - Add proper foreign key constraints
    - Create indexes for performance

  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated users only
    - Ensure data isolation between users
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger for users updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update inventory_items table constraints and policies
DO $$
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'inventory_items_user_id_fkey'
  ) THEN
    ALTER TABLE inventory_items 
    ADD CONSTRAINT inventory_items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory items" ON inventory_items;

-- Create new RLS policies for inventory_items
CREATE POLICY "Users can view their own inventory items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory items"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items"
  ON inventory_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update assets table constraints and policies
DO $$
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'assets_user_id_fkey'
  ) THEN
    ALTER TABLE assets 
    ADD CONSTRAINT assets_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;

-- Create new RLS policies for assets
CREATE POLICY "Users can view their own assets"
  ON assets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
  ON assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON assets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON assets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update productions table constraints and policies
DO $$
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'productions_user_id_fkey'
  ) THEN
    ALTER TABLE productions 
    ADD CONSTRAINT productions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view their own productions" ON productions;
DROP POLICY IF EXISTS "Users can insert their own productions" ON productions;
DROP POLICY IF EXISTS "Users can update their own productions" ON productions;
DROP POLICY IF EXISTS "Users can delete their own productions" ON productions;

-- Create new RLS policies for productions
CREATE POLICY "Users can view their own productions"
  ON productions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own productions"
  ON productions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productions"
  ON productions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own productions"
  ON productions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS inventory_items_user_id_site_idx ON inventory_items(user_id, site_location);
CREATE INDEX IF NOT EXISTS assets_user_id_site_idx ON assets(user_id, site_location);
CREATE INDEX IF NOT EXISTS productions_user_id_site_idx ON productions(user_id, site_location);