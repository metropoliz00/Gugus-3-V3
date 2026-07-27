SELECT pol.polname, pol.polcmd, pol.polroles, pol.polqual, pol.polwithcheck
FROM pg_policy pol
JOIN pg_class tbl ON pol.polrelid = tbl.oid
WHERE tbl.relname IN ('kkg_programs', 'gugus_programs');
