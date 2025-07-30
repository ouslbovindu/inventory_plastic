/*
  # Create Inventory Management System

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `item_name` (text, required)
      - `type` (text, optional - virgin, recycled, master, special added)
      - `price` (decimal, default 0)
      - `stock` (decimal, default 0)
      - `status` (text, default 'in stock')
      - `repurchase_margin` (decimal, default 0)
      - `note` (text, optional)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `inventory_items` table
    - Add policies for authenticated users to manage their own inventory items
*/

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  type text DEFAULT '',
  price decimal(10,2) DEFAULT 0,
  stock decimal(10,2) DEFAULT 0,
  status text DEFAULT 'in stock',
  repurchase_margin decimal(10,2) DEFAULT 0,
  note text DEFAULT '',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS inventory_items_user_id_idx ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS inventory_items_status_idx ON inventory_items(status);
CREATE INDEX IF NOT EXISTS inventory_items_created_at_idx ON inventory_items(created_at DESC);