--
-- DASHBOARD CATALOG TABLES
--
-- SQL DUMP: DATA for SCOPES AND SCOPES/ENTITIES
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
-- SCOPES DATA
--
COPY dashboard_scopes (id_scope, scope_name, geom, zoom, dbschema, devices_map) FROM stdin;
osuna	Osuna	SRID=4326;POINT(-5.12 37.25)	15	osuna	TRUE
andalucia	Andalucía	SRID=4326;POINT(-5.11 37.34)	9	andalucia	FALSE
\.

COPY dashboard_scopesentities (id_scope, id_entity) FROM stdin;
andalucia	GINTUR_ACTIVITY_LOCALITY
andalucia	GINTUR_ACTIVITY_TYPE
osuna	watering.sosteco.sensor
osuna	watering.sosteco.watermetering
osuna	watering.sosteco.weatherstation
\.
