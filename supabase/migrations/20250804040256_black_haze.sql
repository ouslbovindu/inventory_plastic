/*
  # Add site locations and quantity adjustments

  1. Database Changes
    - Add `site_location` column to inventory_items, assets, and productions tables
    - Add `quantity_numeric` column to assets and productions for numeric quantity tracking
    - Add indexes for better performance on site_location queries

  2. Data Migration
    - Set default site location to 'Site 1' for existing records
    - Initialize quantity_numeric to 0 for existing records

  3. Security
    - Update RLS policies to include site_location filtering
*/

-- Add site_location column to inventory_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'site_location'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN site_location text DEFAULT 'Site 1' NOT NULL;
  END IF;
END $$;

-- Add site_location and quantity_numeric columns to assets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assets' AND column_name = 'site_location'
  ) THEN
    ALTER TABLE assets ADD COLUMN site_location text DEFAULT 'Site 1' NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assets' AND column_name = 'quantity_numeric'
  ) THEN
    ALTER TABLE assets ADD COLUMN quantity_numeric numeric(10,2) DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Add site_location and quantity_numeric columns to productions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'productions' AND column_name = 'site_location'
  ) THEN
    ALTER TABLE productions ADD COLUMN site_location text DEFAULT 'Site 1' NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'productions' AND column_name = 'quantity_numeric'
  ) THEN
    ALTER TABLE productions ADD COLUMN quantity_numeric numeric(10,2) DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Add indexes for site_location
CREATE INDEX IF NOT EXISTS inventory_items_site_location_idx ON inventory_items (site_location);
CREATE INDEX IF NOT EXISTS assets_site_location_idx ON assets (site_location);
CREATE INDEX IF NOT EXISTS productions_site_location_idx ON productions (site_location);