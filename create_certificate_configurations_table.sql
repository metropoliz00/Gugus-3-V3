-- ====================================================================
-- SQL MIGRATION: DEDICATED CERTIFICATE CONFIGURATIONS TABLE
-- ====================================================================
-- Script ini membuat tabel SQL mandiri `certificate_configurations` 
-- khusus untuk menyimpan konfigurasi desain & tata letak sertifikat.
-- Dengan tabel khusus ini, konfigurasi sertifikat tidak lagi bercampur 
-- ke dalam JSON site_settings, sehingga database lebih ringan dan bersih.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.certificate_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id TEXT UNIQUE, -- NULL / 'default' atau ID kegiatan (training_id)
  config_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indeks untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_certificate_configurations_training_id 
ON public.certificate_configurations (training_id);

-- Kebijakan Keamanan (RLS)
ALTER TABLE public.certificate_configurations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for everyone" ON public.certificate_configurations;
DROP POLICY IF EXISTS "Enable all access for everyone" ON public.certificate_configurations;

CREATE POLICY "Enable read access for everyone" 
ON public.certificate_configurations FOR SELECT USING (true);

CREATE POLICY "Enable all access for everyone" 
ON public.certificate_configurations FOR ALL TO public USING (true) WITH CHECK (true);
