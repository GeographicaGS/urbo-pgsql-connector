--
-- DASHBOARD CATALOG TABLES
--
-- SQL DUMP: ENTITIES TABLE WITH DATA
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET search_path = public, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = false;

--
--ENTITIES TABLE
--
CREATE TABLE public.dashboard_entities
(
  id_entity character varying(255) NOT NULL,
  entity_name character varying(255),
  id_category character varying(255),
  id_table character varying(255),
  icon character varying(255),
  CONSTRAINT id_entity_pkey PRIMARY KEY (id_entity)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.dashboard_entities
  OWNER TO fiware_admin;

--
-- ENTITIES DATA
--
COPY dashboard_entities (id_entity, entity_name, id_category, id_table, icon) FROM stdin;
watering.sosteco.sensor	Riego	watering	riego	SM_humedad_activo.svg
watering.sosteco.watermetering	Contadores de agua	watering	contadores	SM_agua_activo.svg
watering.sosteco.weatherstation	Estación meteorológica	watering	meteoestac	SM_meteo_activo.svg
GINTUR_ACTIVITY_LOCALITY	Localidades turísticas	tourism	activity_locality	null
GINTUR_ACTIVITY_TYPE	Tipos de actividades turísticas	tourism	activity_type	null
\.
