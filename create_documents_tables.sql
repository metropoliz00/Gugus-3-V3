-- Create separate document tables for KKG and Gugus if needed
CREATE TABLE IF NOT EXISTS kkg_documents (
  id INT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO kkg_documents (id, content)
VALUES (1, '[]')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS gugus_documents (
  id INT PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gugus_documents (id, content)
VALUES (1, '[]')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE kkg_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read kkg_documents" ON kkg_documents;
CREATE POLICY "Allow public read kkg_documents" ON kkg_documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role update kkg_documents" ON kkg_documents;
CREATE POLICY "Allow service role update kkg_documents" ON kkg_documents FOR ALL USING (true);

ALTER TABLE gugus_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read gugus_documents" ON gugus_documents;
CREATE POLICY "Allow public read gugus_documents" ON gugus_documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role update gugus_documents" ON gugus_documents;
CREATE POLICY "Allow service role update gugus_documents" ON gugus_documents FOR ALL USING (true);
