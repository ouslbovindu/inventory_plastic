/*
  # Create Worker Accounts System

  1. New Tables
    - `worker_accounts` - Stores predefined worker credentials and permissions
  
  2. Worker Accounts Created
    - worker1 / pass123
    - worker2 / pass123  
    - worker3 / pass123
    - worker4 / pass123
    - worker5 / pass123
  
  3. Permissions
    - Only Quick Adjust access to materials and productions
    - No add, edit, delete capabilities
    - Access to both Site 1 and Site 2
    - No access to assets
  
  4. Security
    - Enable RLS on worker_accounts table
    - Passwords are stored as plain text for simplicity (in production, use proper hashing)
*/

-- Create worker accounts table
CREATE TABLE IF NOT EXISTS worker_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'worker' NOT NULL,
  permissions jsonb DEFAULT '{"materials": {"view": true, "adjust": true, "add": false, "edit": false, "delete": false}, "productions": {"view": true, "adjust": true, "add": false, "edit": false, "delete": false}, "assets": {"view": false, "adjust": false, "add": false, "edit": false, "delete": false}}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE worker_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for worker account authentication
CREATE POLICY "Allow worker account access"
  ON worker_accounts
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert 5 predefined worker accounts
INSERT INTO worker_accounts (username, password, role) VALUES
  ('worker1', 'pass123', 'worker'),
  ('worker2', 'pass123', 'worker'),
  ('worker3', 'pass123', 'worker'),
  ('worker4', 'pass123', 'worker'),
  ('worker5', 'pass123', 'worker')
ON CONFLICT (username) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_worker_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_worker_accounts_updated_at'
  ) THEN
    CREATE TRIGGER update_worker_accounts_updated_at
      BEFORE UPDATE ON worker_accounts
      FOR EACH ROW
      EXECUTE FUNCTION update_worker_accounts_updated_at();
  END IF;
END $$;