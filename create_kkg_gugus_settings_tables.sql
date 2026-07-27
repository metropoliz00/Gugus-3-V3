-- Create kkg_settings table for KKG data
CREATE TABLE IF NOT EXISTS kkg_settings (
  id INT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO kkg_settings (id, content)
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;

-- Create gugus_settings table for Gugus data
CREATE TABLE IF NOT EXISTS gugus_settings (
  id INT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gugus_settings (id, content)
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS and policies
ALTER TABLE kkg_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read kkg_settings" ON kkg_settings;
CREATE POLICY "Allow public read kkg_settings" ON kkg_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role update kkg_settings" ON kkg_settings;
CREATE POLICY "Allow service role update kkg_settings" ON kkg_settings FOR ALL USING (true);

ALTER TABLE gugus_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read gugus_settings" ON gugus_settings;
CREATE POLICY "Allow public read gugus_settings" ON gugus_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role update gugus_settings" ON gugus_settings;
CREATE POLICY "Allow service role update gugus_settings" ON gugus_settings FOR ALL USING (true);
