import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_URL = "https://mziqyqkmmmkccawzvojj.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aXF5cWttbW1rY2Nhd3p2b2pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE2NDM3NiwiZXhwIjoyMDkzNzQwMzc2fQ.9BNcOFSbnV3_GaJFYIXTSqcFIpqrFjnvmPhWobpwKhQ";

const url = process.env.VITE_SUPABASE_URL || DEFAULT_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_KEY;

const supabase = createClient(url, key);

async function runUpdate() {
  console.log("Updating training_certificates table structure in Supabase...");

  const sql = `
    -- 1. Alter training_certificates to add missing columns and adjust constraints
    DO $$ 
    BEGIN 
      -- Add certificate_number
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='certificate_number') THEN
        ALTER TABLE public.training_certificates ADD COLUMN certificate_number TEXT;
      END IF;

      -- Add certificate_config
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='certificate_config') THEN
        ALTER TABLE public.training_certificates ADD COLUMN certificate_config JSONB;
      END IF;

      -- Add updated_at
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='updated_at') THEN
        ALTER TABLE public.training_certificates ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
      END IF;

      -- Add created_at
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='created_at') THEN
        ALTER TABLE public.training_certificates ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
      END IF;
      
      -- Drop NOT NULL constraint from certificate_url
      ALTER TABLE public.training_certificates ALTER COLUMN certificate_url DROP NOT NULL;
    END $$;

    -- 2. Enable Row Level Security (RLS) and recreate highly resilient policies
    ALTER TABLE public.training_certificates ENABLE ROW LEVEL SECURITY;

    -- Clean up any existing restrictive policies on training_certificates
    DROP POLICY IF EXISTS "Users view own certificates" ON public.training_certificates;
    DROP POLICY IF EXISTS "Enable read access for everyone" ON public.training_certificates;
    DROP POLICY IF EXISTS "Enable all access for everyone" ON public.training_certificates;
    DROP POLICY IF EXISTS "Auth all training_certificates" ON public.training_certificates;

    -- Allow everyone to read certificates and template configurations
    CREATE POLICY "Enable read access for everyone" 
    ON public.training_certificates 
    FOR SELECT 
    USING (true);

    -- Allow everyone (authenticated & anonymous/guest) to insert and update certificates
    CREATE POLICY "Enable all access for everyone" 
    ON public.training_certificates 
    FOR ALL 
    TO public 
    USING (true) 
    WITH CHECK (true);
  `;

  const { error } = await supabase.rpc('execute_sql', { sql });

  if (error) {
    console.error("Failed to update schema via 'execute_sql':", error);
    
    // Try workaround 'run_sql' if execute_sql fails or doesn't exist
    const { error: error2 } = await supabase.rpc('run_sql', { sql });
    if (error2) {
      console.error("Failed to update schema via 'run_sql':", error2);
      console.log("Please check if the SQL script has syntax errors or check permissions.");
    } else {
      console.log("Successfully updated training_certificates schema via 'run_sql'.");
    }
  } else {
    console.log("Successfully updated training_certificates schema via 'execute_sql'.");
  }
}

runUpdate();
