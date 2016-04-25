--
-- DASHBOARD CATALOG TABLES
--
-- SQL DUMP: SCOPES TABLE
--

CREATE TABLE public.dashboard_scopes
(
  id_scope character varying(255) NOT NULL,
  scope_name character varying(255),
  geom geometry(Point,4326),
  zoom smallint,
  dbschema character varying(255),
  devices_map boolean default TRUE,
  CONSTRAINT id_scope_pkey PRIMARY KEY (id_scope)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.dashboard_scopes
  OWNER TO fiware_admin;

CREATE INDEX idx_scope_geom
  ON public.dashboard_scopes
  USING gist(geom);
