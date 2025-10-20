/*
  # Update to Shared Inventory System

  1. Changes
    - Drop old user-specific RLS policies
    - Remove user_id columns from all tables
    - Create new shared RLS policies allowing all authenticated users to access all data
  
  2. Security
    - All authenticated users can view, add, edit, and delete shared inventory data
    - Row Level Security remains enabled for authentication requirement
*/

-- Drop old user-specific policies
DROP POLICY IF EXISTS "Users can manage their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can manage their own assets" ON assets;
DROP POLICY IF EXISTS "Users can manage their own productions" ON productions;

-- Remove user_id columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE inventory_items DROP COLUMN user_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE assets DROP COLUMN user_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE productions DROP COLUMN user_id;
  END IF;
END $$;

-- Create new shared policies for inventory_items
CREATE POLICY "Authenticated users can view shared inventory items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert shared inventory items"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update shared inventory items"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete shared inventory items"
  ON inventory_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create new shared policies for assets
CREATE POLICY "Authenticated users can view shared assets"
  ON assets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert shared assets"
  ON assets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update shared assets"
  ON assets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete shared assets"
  ON assets
  FOR DELETE
  TO authenticated
  USING (true);

-- Create new shared policies for productions
CREATE POLICY "Authenticated users can view shared productions"
  ON productions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert shared productions"
  ON productions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update shared productions"
  ON productions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete shared productions"
  ON productions
  FOR DELETE
  TO authenticated
  USING (true);