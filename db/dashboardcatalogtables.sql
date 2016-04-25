--
-- DASHBOARD CATALOG TABLES
--
-- TRANSACTION TO CREATE DASHBOARD CATALOG TABLES
--

BEGIN;
\i db/scopes.sql
\i db/categories.sql
\i db/entities.sql
\i db/variables.sql
\i db/scopes_entities.sql
COMMIT;
