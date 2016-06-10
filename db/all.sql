\set dbname urbo
\set password urbo
\set owner urbo_admin

\ir createdb.sql
\c :dbname

BEGIN;
\ir createtables.sql
COMMIT;
