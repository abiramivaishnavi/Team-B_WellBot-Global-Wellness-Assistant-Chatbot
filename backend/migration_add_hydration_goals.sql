-- Migration: Add hydration and goals columns to daily_check_ins
BEGIN;

-- Add hydration_glasses column
ALTER TABLE public.daily_check_ins 
ADD COLUMN IF NOT EXISTS hydration_glasses INTEGER DEFAULT 0;

-- Add goals_json column
ALTER TABLE public.daily_check_ins 
ADD COLUMN IF NOT EXISTS goals_json JSONB DEFAULT '[]';

COMMIT;

-- Verify changes
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'daily_check_ins';
