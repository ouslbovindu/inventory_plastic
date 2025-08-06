/*
  # Remove user isolation - shared database

  1. Changes
    - Remove RLS policies that restrict data by user_id
    - Create new policies that allow all authenticated users to access all data
    - Keep user_id columns for audit purposes but don't restrict access
    - Allow all authenticated users full CRUD access to all records

  2. Security
    - All authenticated users can access all data
    - No user-specific restrictions
    - Shared database approach
*/

-- Drop existing restrictive RLS policies for inventory_items
DROP POLICY IF EXISTS "Users can view their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory items" ON inventory_items;

-- Drop existing restrictive RLS policies for assets
DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;

-- Drop existing restrictive RLS policies for productions
DROP POLICY IF EXISTS "Users can view their own productions" ON productions;
DROP POLICY IF EXISTS "Users can insert their own productions" ON productions;
DROP POLICY IF EXISTS "Users can update their own productions" ON productions;
DROP POLICY IF EXISTS "Users can delete their own productions" ON productions;

-- Create new shared access policies for inventory_items
CREATE POLICY "All authenticated users can view all inventory items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert inventory items"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update inventory items"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All authenticated users can delete inventory items"
  ON inventory_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create new shared access policies for assets
CREATE POLICY "All authenticated users can view all assets"
  ON assets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert assets"
  ON assets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update assets"
  ON assets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All authenticated users can delete assets"
  ON assets
  FOR DELETE
  TO authenticated
  USING (true);

-- Create new shared access policies for productions
CREATE POLICY "All authenticated users can view all productions"
  ON productions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert productions"
  ON productions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update productions"
  ON productions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All authenticated users can delete productions"
  ON productions
  FOR DELETE
  TO authenticated
  USING (true);