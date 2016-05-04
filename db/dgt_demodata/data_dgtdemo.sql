--
-- DGT DEMO DATA
--
-- SQL DUMP: DATA for DGT DEMO
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


BEGIN;
--
-- SCOPES DATA
--
COPY dashboard_scopes (id_scope, scope_name, geom, zoom, dbschema, devices_map) FROM stdin;
dgt	Dirección General de Tráfico (DGT)	SRID=4326;POINT(-5.11 37.34)	6	dgt	TRUE
\.

--
-- SCOPES/ENTITIES DATA
--
COPY dashboard_scopesentities (id_scope, id_entity) FROM stdin;
dgt	DGT_SENSORS
\.

--
-- CATEGORIES DATA
--
COPY dashboard_categories (id_category, category_name, category_colour) FROM stdin;
traffic	Tráfico	33cc99
\.

--
-- ENTITIES DATA
--
COPY dashboard_entities (id_entity, entity_name, id_category, id_table, icon) FROM stdin;
DGT_SENSORS	DGT Accidentes	traffic	dgt_sensors	dgt_sensors.svg
\.

--
-- VARIABLES DATA
--
COPY dashboard_variables (id_variable, id_entity, entity_field, var_name, var_units, var_thresholds, var_tempalarmvalue, var_tempalarmactive) FROM stdin;
level	DGT_SENSORS	level	Nivel	m	{0,100,150}	60	TRUE
alarm	DGT_SENSORS	alarm	Alarma	m	{0,100,150}	60	TRUE
\.
COMMIT;
