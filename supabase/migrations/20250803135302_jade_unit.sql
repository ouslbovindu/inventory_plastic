/*
  # Add Assets and Productions Tables

  1. New Tables
    - `assets`
      - `id` (uuid, primary key)
      - `item_name` (text, required)
      - `price` (numeric, default 0)
      - `quantity` (text, for flexible quantity descriptions)
      - `purchased_date` (date)
      - `note` (text, optional)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `productions`
      - `id` (uuid, primary key)
      - `item_name` (text, required)
      - `quantity` (text, for flexible quantity descriptions)
      - `client` (text, required)
      - `note` (text, optional)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add indexes for performance on user_id and created_at columns
*/

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  quantity text DEFAULT '',
  purchased_date date,
  note text DEFAULT '',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create productions table
CREATE TABLE IF NOT EXISTS productions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  quantity text DEFAULT '',
  client text NOT NULL,
  note text DEFAULT '',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE assets ADD CONSTRAINT assets_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE productions ADD CONSTRAINT productions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets
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

-- Create RLS policies for productions
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS assets_user_id_idx ON assets (user_id);
CREATE INDEX IF NOT EXISTS assets_created_at_idx ON assets (created_at DESC);
CREATE INDEX IF NOT EXISTS productions_user_id_idx ON productions (user_id);
CREATE INDEX IF NOT EXISTS productions_created_at_idx ON productions (created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productions_updated_at
  BEFORE UPDATE ON productions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();