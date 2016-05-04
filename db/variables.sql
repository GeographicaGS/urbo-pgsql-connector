--
-- DASHBOARD CATALOG TABLES
--
-- SQL DUMP: VARIABLES TABLE WITH DATA
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
--VARIABLES BASE TABLE
--
CREATE TABLE public.dashboard_variables
(
  id_variable character varying(255) NOT NULL,
  id_entity character varying(255),
  entity_field character varying(255),
  var_name character varying(255),
  var_units character varying(255),
  var_thresholds double precision ARRAY[3],
  var_tempalarmvalue integer,
  var_tempalarmactive boolean,
  var_agg character varying ARRAY,
  CONSTRAINT id_variable_pkey PRIMARY KEY (id_variable)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.dashboard_variables
  OWNER TO fiware_admin;

--
-- VARIABLES DATA
--
COPY dashboard_variables (id_variable, id_entity, entity_field, var_name, var_units, var_thresholds, var_tempalarmvalue, var_tempalarmactive, var_agg) FROM stdin;
wm_waterconsumption	watering.sosteco.watermetering	l	Consumo de agua	l	{0,100,150}	60	TRUE	{'SUM','AVG','MIN','MAX'}
wt_soilhumidity	watering.sosteco.sensor	h	Humedad del suelo	cb	{0,30,80}	30	TRUE	{'AVG','MIN','MAX'}
wt_pressure	watering.sosteco.sensor	p	Presión	cb	{0,30,80}	30	TRUE	{'AVG','MIN','MAX'}
wt_solaradiat	watering.sosteco.sensor	s	Radiación solar	W/m2	{0,0.4,0.8}	60	FALSE	{'AVG','MIN','MAX'}
wt_temperature	watering.sosteco.sensor	t	Temperatura	°C	{-50,30,38}	60	TRUE	{'AVG','MIN','MAX'}
mt_winddir	watering.sosteco.weatherstation	winddir	Dirección del viento	null	{null,null,null}	30	TRUE	{'MAX','MIN'}
mt_windvel	watering.sosteco.weatherstation	windvel	Velocidad del viento	km/h	{0,39,62}	30	TRUE	{'AVG','MIN','MAX'}
mt_pluvio	watering.sosteco.weatherstation	pluvio	Pluviometría	mm	{0,15,30}	60	TRUE	{'SUM','AVG','MIN','MAX'}
tu_activlocality	GINTUR_ACTIVITY_LOCALITY	activities	Oferta de actividades turísticas por localidad	null	{null,null,null}	0	FALSE	{'SUM','AVG','MIN','MAX'}
tu_demandlocality	GINTUR_ACTIVITY_LOCALITY	demand	Demanda de actividades turísticas por localidad	null	{null,null,null}	0	FALSE	{'SUM','AVG','MIN','MAX'}
tu_activtypes	GINTUR_ACTIVITY_TYPES	activities	Oferta de actividades turísticas por tipo	null	{null,null,null}	0	FALSE	{'SUM','AVG','MIN','MAX'}
tu_demandtypes	GINTUR_ACTIVITY_TYPES	demand	Demanda de actividades turísticas por tipo	null	{null,null,null}	0	FALSE	{'SUM','AVG','MIN','MAX'}
\.
