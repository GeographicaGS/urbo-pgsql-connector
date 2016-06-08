\set dbname fiware
\set password fiware
\set owner fiware_admin

\ir createdb.sql
\c :dbname

BEGIN;
\ir createtables.sql
COMMIT;
