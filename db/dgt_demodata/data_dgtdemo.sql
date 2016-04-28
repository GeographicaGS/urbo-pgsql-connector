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
dgt	Dirección General de Tráfico (DGT)	SRID=4326;POINT(-3.5 40.5)	10	dgt	TRUE
\.

--
-- SCOPES/ENTITIES DATA
--
COPY dashboard_scopesentities (id_scope, id_entity) FROM stdin;
dgt	dgt30.vehiculo
\.

--
-- CATEGORIES DATA
--
COPY dashboard_categories (id_category, category_name, category_colour) FROM stdin;
traffic	Tráfico	0062b4
\.

--
-- ENTITIES DATA
--
COPY dashboard_entities (id_entity, entity_name, id_category, id_table, icon) FROM stdin;
dgt30.vehiculo	DGT vehículo	traffic	dgt_vehiculo	SC_vehiculo_activo.svg
\.

--
-- VARIABLES DATA
--
COPY dashboard_variables (id_variable, id_entity, entity_field, var_name, var_units, var_thresholds, var_tempalarmvalue, var_tempalarmactive) FROM stdin;
nivel_alerta	dgt30.vehiculo	nivel_alerta	Nivel de alerta	null	{0,1,2}	0	FALSE
ecall	dgt30.vehiculo	ecall	Sistema eCall	null	{0,1,2}	0	FALSE
texto_alerta	dgt30.vehiculo	texto_alerta	Mensaje de alerta	null	{0,1,2}	0	FALSE
velocidad	dgt30.vehiculo	velocidad	Velocidad	km/h	{0,50,120}	0	FALSE
\.
COMMIT;
