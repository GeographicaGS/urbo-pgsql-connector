--
-- GUADALAJARA DEMO DATA
--
-- SQL DUMP: DATA for GUADALAJARA DEMO
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
guadalajara	Guadalajara	SRID=4326;POINT(-3.17819 40.6329)	14	guadalajara	TRUE
\.

--
-- SCOPES/ENTITIES DATA
--
COPY dashboard_scopesentities (id_scope, id_entity) FROM stdin;
guadalajara	MOBA
\.

--
-- CATEGORIES DATA
--
COPY dashboard_categories (id_category, category_name, category_colour) FROM stdin;
waste_ct	Residuos	3BB078
\.

--
-- ENTITIES DATA
--
COPY dashboard_entities (id_entity, entity_name, id_category, id_table, icon) FROM stdin;
MOBA	Contenedores de residuos	waste_ct	guadal_contenedores_definitivo	SM_contenedor_activo.svg
\.

--
-- VARIABLES DATA
--
COPY dashboard_variables (id_variable, id_entity, entity_field, var_name, var_units, var_thresholds, var_tempalarmvalue, var_tempalarmactive, var_agg) FROM stdin;
level	MOBA	level	Nivel de llenado	%	{0,80,100,150}	60	TRUE	{'AVG','MIN','MAX'}
s_class	MOBA	s_class	Clase de sensor	null	{null,null,null}	0	FALSE	{'NOAGG'}
sensorCode	MOBA	sensorCode	Código de sensor	null	{null,null,null}	0	FALSE	{'NOAGG'}
\.
COMMIT;
