--
-- DASHBOARD CATALOG TABLES
--
-- SQL DUMP: SCOPES/ENTITIES TABLE
--

CREATE TABLE public.dashboard_scopesentities
(
  id_scope character varying(255),
  id_entity character varying(255)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.dashboard_scopesentities
  OWNER TO fiware_admin;
