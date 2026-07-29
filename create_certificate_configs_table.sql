-- ====================================================================
-- SQL MIGRATION: KONFIGURASI SERTIFIKAT TERPISAH (1 JSON PER DESAIN)
-- ====================================================================
-- Script ini memastikan tabel `training_certificates` dikonfigurasi 
-- untuk menyimpan setiap desain/konfigurasi sertifikat secara terpisah
-- sebagai 1 baris JSON tersendiri (tidak menumpuk di site_settings).
--
-- CARA PENGGUNAAN DI SUPABASE:
-- 1. Buka Supabase Dashboard -> SQL Editor
-- 2. Paste dan jalankan query berikut.
-- ====================================================================

-- 1. Tambahkan kolom pendukung jika belum ada
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='certificate_number') THEN
    ALTER TABLE public.training_certificates ADD COLUMN certificate_number TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='certificate_config') THEN
    ALTER TABLE public.training_certificates ADD COLUMN certificate_config JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='updated_at') THEN
    ALTER TABLE public.training_certificates ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='training_certificates' AND column_name='created_at') THEN
    ALTER TABLE public.training_certificates ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
  END IF;

  ALTER TABLE public.training_certificates ALTER COLUMN certificate_url DROP NOT NULL;
END $$;

-- 2. Buat index agar pencarian konfigurasi per kegiatan/training sangat cepat
CREATE INDEX IF NOT EXISTS idx_training_certificates_template 
ON public.training_certificates (training_id, certificate_number);

-- 3. Kebijakan Keamanan (RLS)
ALTER TABLE public.training_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for everyone" ON public.training_certificates;
DROP POLICY IF EXISTS "Enable all access for everyone" ON public.training_certificates;

CREATE POLICY "Enable read access for everyone" 
ON public.training_certificates FOR SELECT USING (true);

CREATE POLICY "Enable all access for everyone" 
ON public.training_certificates FOR ALL TO public USING (true) WITH CHECK (true);
