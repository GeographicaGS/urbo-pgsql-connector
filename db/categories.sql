--
-- DASHBOARD CATALOG TABLES
--
-- SQL DUMP: CATEGORIES TABLE WITH DATA
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
--CATEGORIES TABLE
--
CREATE TABLE public.dashboard_categories
(
  id_category character varying(255) NOT NULL,
  category_name character varying(255),
  category_colour character varying(255),
  CONSTRAINT id_category_pkey PRIMARY KEY (id_category)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.dashboard_categories
  OWNER TO fiware_admin;

--
-- CATEGORIES DATA
--
COPY dashboard_categories (id_category, category_name, category_colour) FROM stdin;
energy	Energía	33cc99
waste	Residuos	004d00
watering	Riego	00d5e7
tourism	Turismo	77773c
\.
