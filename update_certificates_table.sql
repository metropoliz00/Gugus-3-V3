-- ====================================================================
-- SQL MIGRATION FOR CERTIFICATE EDITOR (training_certificates)
-- ====================================================================
-- This script alters the training_certificates table to support saving
-- certificate templates (TEMPLATE_CONFIG) and individual certificates
-- for teachers and guests.
--
-- INSTRUCTIONS:
-- 1. Copy the entire contents of this file.
-- 2. Go to your Supabase Dashboard -> SQL Editor.
-- 3. Paste and run this script.
-- ====================================================================

-- 1. Alter the training_certificates table to add missing columns and adjust constraints
DO $$ 
BEGIN 
  -- Add certificate_number column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='certificate_number') THEN
    ALTER TABLE public.training_certificates ADD COLUMN certificate_number TEXT;
  END IF;

  -- Add certificate_config column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='certificate_config') THEN
    ALTER TABLE public.training_certificates ADD COLUMN certificate_config JSONB;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='updated_at') THEN
    ALTER TABLE public.training_certificates ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='created_at') THEN
    ALTER TABLE public.training_certificates ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
  END IF;
  
  -- Add guest_account_id column if it doesn't exist (to support guest certificates)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='guest_account_id') THEN
    ALTER TABLE public.training_certificates ADD COLUMN guest_account_id UUID REFERENCES public.guest_accounts(id) ON DELETE SET NULL;
  END IF;

  -- Drop NOT NULL constraint on certificate_url
  -- This is required because template configurations do not have a physical certificate PDF file URL
  ALTER TABLE public.training_certificates ALTER COLUMN certificate_url DROP NOT NULL;

END $$;

-- 2. Configure Row Level Security (RLS) and recreate highly resilient policies
ALTER TABLE public.training_certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users view own certificates" ON public.training_certificates;
DROP POLICY IF EXISTS "Enable read access for everyone" ON public.training_certificates;
DROP POLICY IF EXISTS "Enable all access for everyone" ON public.training_certificates;
DROP POLICY IF EXISTS "Auth all training_certificates" ON public.training_certificates;

-- Policy 1: Allow everyone (authenticated users, guests, and public visitors) to view certificates and template configurations
CREATE POLICY "Enable read access for everyone" 
ON public.training_certificates 
FOR SELECT 
USING (true);

-- Policy 2: Allow everyone (authenticated teachers, admins, and guests) to insert and update certificates
CREATE POLICY "Enable all access for everyone" 
ON public.training_certificates 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- ====================================================================
-- Verification Query:
-- Run this query to verify columns:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'training_certificates';
-- ====================================================================
