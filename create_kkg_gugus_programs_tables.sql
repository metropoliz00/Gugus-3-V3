-- Create separate program tables for KKG and Gugus
CREATE TABLE IF NOT EXISTS kkg_programs (
  id INT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO kkg_programs (id, content)
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS gugus_programs (
  id INT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gugus_programs (id, content)
VALUES (1, '[]')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE kkg_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read kkg_programs" ON kkg_programs;
CREATE POLICY "Allow public read kkg_programs" ON kkg_programs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role update kkg_programs" ON kkg_programs;
CREATE POLICY "Allow service role update kkg_programs" ON kkg_programs FOR ALL USING (true);

ALTER TABLE gugus_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read gugus_programs" ON gugus_programs;
CREATE POLICY "Allow public read gugus_programs" ON gugus_programs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role update gugus_programs" ON gugus_programs;
CREATE POLICY "Allow service role update gugus_programs" ON gugus_programs FOR ALL USING (true);
